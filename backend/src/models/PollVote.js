const mongoose = require('mongoose');

const pollVoteSchema = new mongoose.Schema(
  {
    poll: { type: mongoose.Schema.Types.ObjectId, ref: 'AutoPoll', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Morning trip: PG -> College
    morningVote: { type: Boolean, default: null }, // true = Yes, false = No, null = Not voted
    morningVotedAt: { type: Date, default: null },
    // Return trip: College -> PG
    returnVote: { type: Boolean, default: null },  // true = Yes, false = No, null = Not voted
    returnVotedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

pollVoteSchema.index({ poll: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('PollVote', pollVoteSchema);
