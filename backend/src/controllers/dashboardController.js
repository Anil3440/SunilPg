const User = require('../models/User');
const RentRecord = require('../models/RentRecord');
const ElectricityBill = require('../models/ElectricityBill');
const Payment = require('../models/Payment');
const AutoPoll = require('../models/AutoPoll');
const PollVote = require('../models/PollVote');
const Ticket = require('../models/Ticket');
const CanteenOrder = require('../models/CanteenOrder');
const MenuItem = require('../models/MenuItem');
const ContactSetting = require('../models/ContactSetting');
const { getMonthYear, getTodayString, isPastCutoff } = require('../utils/helpers');

// GET /api/dashboard/student
const studentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const branchId = req.user.branch?._id || req.user.branch;
    const today = getTodayString();

    // 1. Rent dues & records
    const rentRecords = await RentRecord.find({ student: studentId }).sort({ year: -1, month: -1 });
    const pendingRents = rentRecords.filter((r) => r.status === 'PENDING' || r.status === 'OVERDUE');
    const totalRentDue = pendingRents.reduce((sum, r) => sum + r.amount, 0);

    // 2. Electricity dues & records
    const elecBills = await ElectricityBill.find({ student: studentId }).sort({ year: -1, month: -1 });
    const pendingElec = elecBills.filter((b) => b.status === 'PENDING' || b.status === 'OVERDUE');
    const totalElecDue = pendingElec.reduce((sum, b) => sum + b.amount, 0);

    // 3. Today's or Upcoming Auto Poll
    let pollInfo = null;
    let poll = null;
    if (branchId) {
      poll = await AutoPoll.findOne({ branch: branchId, date: today }).populate('branch', 'name');
      if (!poll) {
        poll = await AutoPoll.findOne({ branch: branchId, date: { $gte: today } }).sort({ date: 1 }).populate('branch', 'name');
      }
      if (!poll) {
        poll = await AutoPoll.findOne({ branch: branchId }).sort({ date: -1 }).populate('branch', 'name');
      }
    }
    if (!poll) {
      poll = await AutoPoll.findOne({ date: today }).populate('branch', 'name');
      if (!poll) {
        poll = await AutoPoll.findOne({ date: { $gte: today } }).sort({ date: 1 }).populate('branch', 'name');
      }
      if (!poll) {
        poll = await AutoPoll.findOne().sort({ date: -1 }).populate('branch', 'name');
      }
    }

    if (poll) {
      const myVote = await PollVote.findOne({ poll: poll._id, student: studentId });
      pollInfo = {
        poll,
        myVote,
        morningCutoffPassed: isPastCutoff(poll.morningCutoffTime, poll.date),
        returnCutoffPassed: isPastCutoff(poll.returnCutoffTime, poll.date),
      };
    }

    // 4. Open tickets
    const activeTickets = await Ticket.find({
      student: studentId,
      status: { $in: ['OPEN', 'IN_PROGRESS'] },
    }).sort({ createdAt: -1 });

    // 5. Recent Canteen Orders
    const recentOrders = await CanteenOrder.find({ student: studentId })
      .sort({ createdAt: -1 })
      .limit(3);

    // 6. Actionable Reminders engine
    const reminders = [];

    // Rent Reminder
    if (pendingRents.length > 0) {
      const oldestPending = pendingRents[pendingRents.length - 1];
      const isOverdue = new Date(oldestPending.dueDate) < new Date();
      reminders.push({
        id: 'rent-due',
        type: isOverdue ? 'DANGER' : 'WARNING',
        title: isOverdue ? '⚠️ Rent Payment Overdue!' : '📅 Monthly Rent Due',
        message: `₹${oldestPending.amount.toLocaleString('en-IN')} due for ${oldestPending.month}/${oldestPending.year}. Due date: ${new Date(oldestPending.dueDate).toLocaleDateString()}.`,
        actionLabel: 'Pay Rent Now',
        actionLink: '/student/rent',
      });
    }

    // Electricity Reminder
    if (pendingElec.length > 0) {
      const oldestElec = pendingElec[0];
      reminders.push({
        id: 'elec-due',
        type: 'WARNING',
        title: '⚡ Electricity Bill Due',
        message: `₹${oldestElec.amount.toLocaleString('en-IN')} for ${oldestElec.units} units (${oldestElec.month}/${oldestElec.year}).`,
        actionLabel: 'Pay Electricity',
        actionLink: '/student/electricity',
      });
    }

    // Poll voting reminder
    if (pollInfo?.poll) {
      const vote = pollInfo.myVote;
      const morningMissing = vote?.morningVote === null || vote?.morningVote === undefined;
      const returnMissing = vote?.returnVote === null || vote?.returnVote === undefined;

      if (morningMissing || returnMissing) {
        reminders.push({
          id: 'poll-vote',
          type: 'INFO',
          title: '🚖 College Auto Poll Open',
          message: `Please confirm your morning & return rides for tomorrow before cutoff (${pollInfo.poll.morningCutoffTime}).`,
          actionLabel: 'Vote Ride Now',
          actionLink: '/student/poll',
        });
      }
    }

    // Ticket resolution reminder
    const resolvedRecently = await Ticket.findOne({
      student: studentId,
      status: 'RESOLVED',
      resolvedAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }, // last 48h
    });
    if (resolvedRecently) {
      reminders.push({
        id: 'ticket-resolved',
        type: 'SUCCESS',
        title: '✅ Ticket Resolved',
        message: `Your ticket "${resolvedRecently.title}" was marked resolved by warden: "${resolvedRecently.adminResponse || 'Resolved'}"`,
        actionLabel: 'View Ticket',
        actionLink: '/student/tickets',
      });
    }

    // 7. Contact Details (Warden / Helpline)
    let contact = await ContactSetting.findOne();
    if (!contact) {
      contact = await ContactSetting.create({});
    }

    res.json({
      success: true,
      data: {
        dues: {
          totalRentDue,
          totalElecDue,
          totalDue: totalRentDue + totalElecDue,
          pendingRentCount: pendingRents.length,
          pendingElecCount: pendingElec.length,
        },
        latestRent: rentRecords[0] || null,
        latestElec: elecBills[0] || null,
        poll: pollInfo,
        morningCutoffPassed: pollInfo?.morningCutoffPassed || false,
        returnCutoffPassed: pollInfo?.returnCutoffPassed || false,
        activeTickets,
        recentOrders,
        reminders,
        contactDetails: contact,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/admin
const adminDashboard = async (req, res, next) => {
  try {
    const { month, year } = getMonthYear();
    const totalStudents = await User.countDocuments({ role: 'STUDENT', active: true });

    const rentPaid = await RentRecord.aggregate([
      { $match: { status: 'PAID', month, year } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const rentCollected = rentPaid[0]?.total || 0;

    const pendingRent = await RentRecord.countDocuments({
      status: { $in: ['PENDING', 'OVERDUE'] },
      month,
      year,
    });

    const today = getTodayString();
    const todayMenus = await MenuItem.find({ date: today }).populate('branch', 'name');

    // Auto Poll Sync for Tomorrow / Upcoming active poll
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Priority: Tomorrow's poll -> Upcoming polls (>= today) -> Today's poll -> Latest poll
    let polls = await AutoPoll.find({ date: tomorrowStr });
    let pollDate = tomorrowStr;
    let pollTitle = 'Tomorrow';

    if (!polls.length) {
      const upcoming = await AutoPoll.find({ date: { $gte: today } }).sort({ date: 1 });
      if (upcoming.length) {
        pollDate = upcoming[0].date;
        pollTitle = pollDate === tomorrowStr ? 'Tomorrow' : pollDate === today ? 'Today' : pollDate;
        polls = upcoming.filter((p) => p.date === pollDate);
      }
    }

    if (!polls.length) {
      polls = await AutoPoll.find({ date: today });
      pollDate = today;
      pollTitle = 'Today';
    }

    if (!polls.length) {
      const latest = await AutoPoll.findOne().sort({ date: -1 });
      if (latest) {
        pollDate = latest.date;
        pollTitle = pollDate === tomorrowStr ? 'Tomorrow' : pollDate === today ? 'Today' : pollDate;
        polls = await AutoPoll.find({ date: pollDate });
      }
    }

    let morningAutoCount = 0;
    let returnAutoCount = 0;
    let morningNoCount = 0;
    let returnNoCount = 0;
    let totalVotersCount = 0;

    for (const poll of polls) {
      const mYes = await PollVote.countDocuments({ poll: poll._id, morningVote: true });
      const rYes = await PollVote.countDocuments({ poll: poll._id, returnVote: true });
      const mNo = await PollVote.countDocuments({ poll: poll._id, morningVote: false });
      const rNo = await PollVote.countDocuments({ poll: poll._id, returnVote: false });
      const pollTotal = await PollVote.countDocuments({ poll: poll._id });

      morningAutoCount += mYes;
      returnAutoCount += rYes;
      morningNoCount += mNo;
      returnNoCount += rNo;
      totalVotersCount += pollTotal;
    }

    const openTicketsCount = await Ticket.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } });
    const pendingOrdersCount = await CanteenOrder.countDocuments({
      orderStatus: { $in: ['RECEIVED', 'PREPARING'] },
    });

    let contact = await ContactSetting.findOne();
    if (!contact) {
      contact = await ContactSetting.create({});
    }

    res.json({
      success: true,
      data: {
        totalStudents,
        rentCollected,
        pendingRent,
        morningAutoCount,
        returnAutoCount,
        morningNoCount,
        returnNoCount,
        autoYesCount: morningAutoCount + returnAutoCount,
        totalVotersCount,
        pollDate,
        pollTitle,
        openTicketsCount,
        pendingOrdersCount,
        month,
        year,
        todayMenu: todayMenus,
        contactDetails: contact,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { adminDashboard, studentDashboard };
