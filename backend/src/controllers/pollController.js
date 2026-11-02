const AutoPoll = require('../models/AutoPoll');
const PollVote = require('../models/PollVote');
const Branch = require('../models/Branch');
const { getTodayString, isPastCutoff } = require('../utils/helpers');

// GET /api/poll/today — load active auto poll
const getToday = async (req, res, next) => {
  try {
    const today = getTodayString();
    const branchId = req.user?.branch?._id || req.user?.branch;
    const requestedDate = req.query.date;

    let poll = null;

    if (requestedDate) {
      // 1. If date requested, first try student's branch for that date
      if (branchId) {
        poll = await AutoPoll.findOne({ date: requestedDate, branch: branchId }).populate('branch', 'name');
      }
      // 2. If query specifies branch
      if (!poll && req.query.branch) {
        poll = await AutoPoll.findOne({ date: requestedDate, branch: req.query.branch }).populate('branch', 'name');
      }
      // 3. Fallback: Any poll matching requested date
      if (!poll) {
        poll = await AutoPoll.findOne({ date: requestedDate }).populate('branch', 'name');
      }
    } else {
      // Step 1: Look for poll scheduled for today (student's branch)
      if (branchId) {
        poll = await AutoPoll.findOne({ date: today, branch: branchId }).populate('branch', 'name');
      }
      // Step 2: Look for poll scheduled for today (any branch)
      if (!poll) {
        poll = await AutoPoll.findOne({ date: today }).populate('branch', 'name');
      }

      // Step 3: Look for upcoming poll (tomorrow or later) for student's branch
      if (!poll && branchId) {
        poll = await AutoPoll.findOne({ date: { $gte: today }, branch: branchId }).sort({ date: 1 }).populate('branch', 'name');
      }

      // Step 4: Look for upcoming poll for ANY branch
      if (!poll) {
        poll = await AutoPoll.findOne({ date: { $gte: today } }).sort({ date: 1 }).populate('branch', 'name');
      }

      // Step 5: Fall back to most recent poll for student's branch
      if (!poll && branchId) {
        poll = await AutoPoll.findOne({ branch: branchId }).sort({ date: -1 }).populate('branch', 'name');
      }

      // Step 6: Fall back to most recent poll in the whole system
      if (!poll) {
        poll = await AutoPoll.findOne().sort({ date: -1 }).populate('branch', 'name');
      }
    }

    if (!poll) return res.json({ success: true, data: null });

    // For students, attach their own vote and cutoff status
    if (req.user.role === 'STUDENT') {
      const vote = await PollVote.findOne({ poll: poll._id, student: req.user._id });
      return res.json({
        success: true,
        data: {
          poll,
          myVote: vote,
          morningCutoffPassed: isPastCutoff(poll.morningCutoffTime, poll.date),
          returnCutoffPassed: isPastCutoff(poll.returnCutoffTime, poll.date),
        },
      });
    }

    // For admin, return all polls for this date
    const allPolls = await AutoPoll.find({ date: poll.date }).populate('branch', 'name');
    res.json({ success: true, data: allPolls });
  } catch (err) {
    next(err);
  }
};

// POST /api/poll/vote
const vote = async (req, res, next) => {
  try {
    const { tripType, willTakeAuto, morningVote, returnVote, pollId } = req.body;
    const branchId = req.user?.branch?._id || req.user?.branch;
    const today = getTodayString();

    let poll = null;
    if (pollId) {
      poll = await AutoPoll.findById(pollId);
    }

    if (!poll && branchId) {
      poll = await AutoPoll.findOne({ branch: branchId, date: today });
      if (!poll) {
        poll = await AutoPoll.findOne({ branch: branchId, date: { $gte: today } }).sort({ date: 1 });
      }
      if (!poll) {
        poll = await AutoPoll.findOne({ branch: branchId }).sort({ date: -1 });
      }
    }

    if (!poll) {
      poll = await AutoPoll.findOne({ date: today });
      if (!poll) {
        poll = await AutoPoll.findOne({ date: { $gte: today } }).sort({ date: 1 });
      }
      if (!poll) {
        poll = await AutoPoll.findOne().sort({ date: -1 });
      }
    }

    if (!poll) return res.status(404).json({ success: false, message: 'No active poll scheduled' });

    let existingVote = await PollVote.findOne({ poll: poll._id, student: req.user._id });
    if (!existingVote) {
      existingVote = new PollVote({ poll: poll._id, student: req.user._id });
    }

    // Process specific tripType
    if (tripType === 'MORNING') {
      existingVote.morningVote = willTakeAuto;
      existingVote.morningVotedAt = new Date();
    } else if (tripType === 'RETURN') {
      existingVote.returnVote = willTakeAuto;
      existingVote.returnVotedAt = new Date();
    } else {
      if (morningVote !== undefined) {
        existingVote.morningVote = morningVote;
        existingVote.morningVotedAt = new Date();
      }
      if (returnVote !== undefined) {
        existingVote.returnVote = returnVote;
        existingVote.returnVotedAt = new Date();
      }
    }

    await existingVote.save();
    res.json({ success: true, message: 'Vote recorded successfully', data: existingVote });
  } catch (err) {
    next(err);
  }
};

// GET /api/poll/summary — admin
const getSummary = async (req, res, next) => {
  try {
    const date = req.query.date || getTodayString();
    const filter = { date };
    if (req.query.branch) filter.branch = req.query.branch;

    const polls = await AutoPoll.find(filter).populate('branch', 'name');
    const result = [];

    for (const poll of polls) {
      const morningYes = await PollVote.countDocuments({ poll: poll._id, morningVote: true });
      const morningNo = await PollVote.countDocuments({ poll: poll._id, morningVote: false });
      const morningVoters = await PollVote.find({ poll: poll._id, morningVote: true })
        .populate('student', 'name phone room')
        .populate({ path: 'student', populate: { path: 'room', select: 'roomNumber' } });

      const returnYes = await PollVote.countDocuments({ poll: poll._id, returnVote: true });
      const returnNo = await PollVote.countDocuments({ poll: poll._id, returnVote: false });
      const returnVoters = await PollVote.find({ poll: poll._id, returnVote: true })
        .populate('student', 'name phone room')
        .populate({ path: 'student', populate: { path: 'room', select: 'roomNumber' } });

      const morningVoterList = morningVoters.map((v) => ({
        name: v.student?.name || 'Student',
        phone: v.student?.phone || '',
        room: v.student?.room?.roomNumber || '',
      }));

      const returnVoterList = returnVoters.map((v) => ({
        name: v.student?.name || 'Student',
        phone: v.student?.phone || '',
        room: v.student?.room?.roomNumber || '',
      }));

      result.push({
        poll,
        yes: morningYes,
        no: morningNo,
        voters: morningVoterList,
        morning: {
          yes: morningYes,
          no: morningNo,
          cutoffTime: poll.morningCutoffTime || '21:00',
          pickupTime: poll.morningPickupTime || '08:30 AM',
          voters: morningVoterList,
        },
        returnTrip: {
          yes: returnYes,
          no: returnNo,
          cutoffTime: poll.returnCutoffTime || '14:00',
          pickupTime: poll.returnPickupTime || '04:30 PM',
          voters: returnVoterList,
        },
      });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// POST /api/poll — admin create/update
const createPoll = async (req, res, next) => {
  try {
    const {
      branchId,
      date,
      morningCutoffTime,
      returnCutoffTime,
      morningPickupTime,
      returnPickupTime,
      question,
      cutoffTime,
    } = req.body;

    const pollDate = date || getTodayString();
    const mCutoff = morningCutoffTime || cutoffTime || '21:00';
    const rCutoff = returnCutoffTime || '14:00';
    const mPickup = morningPickupTime || '08:30 AM';
    const rPickup = returnPickupTime || '04:30 PM';
    const qText = question || 'Daily College Auto Transport';

    if (!branchId || branchId === 'ALL') {
      const branches = await Branch.find();
      if (!branches.length) {
        return res.status(400).json({ success: false, message: 'No branches found to configure poll' });
      }

      const results = [];
      for (const b of branches) {
        const p = await AutoPoll.findOneAndUpdate(
          { branch: b._id, date: pollDate },
          {
            branch: b._id,
            date: pollDate,
            morningCutoffTime: mCutoff,
            returnCutoffTime: rCutoff,
            morningPickupTime: mPickup,
            returnPickupTime: rPickup,
            question: qText,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        ).populate('branch', 'name');
        results.push(p);
      }

      return res.json({
        success: true,
        message: `Auto poll scheduled for all ${results.length} branches on ${pollDate}`,
        data: results[0],
        allPolls: results,
      });
    }

    const poll = await AutoPoll.findOneAndUpdate(
      { branch: branchId, date: pollDate },
      {
        branch: branchId,
        date: pollDate,
        morningCutoffTime: mCutoff,
        returnCutoffTime: rCutoff,
        morningPickupTime: mPickup,
        returnPickupTime: rPickup,
        question: qText,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('branch', 'name');

    res.json({
      success: true,
      message: `Auto poll scheduled successfully for ${poll.branch?.name || 'branch'}`,
      data: poll,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/poll/:id — admin remove poll
const deletePoll = async (req, res, next) => {
  try {
    await AutoPoll.findByIdAndDelete(req.params.id);
    await PollVote.deleteMany({ poll: req.params.id });
    res.json({ success: true, message: 'Poll removed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getToday, vote, getSummary, createPoll, deletePoll };
