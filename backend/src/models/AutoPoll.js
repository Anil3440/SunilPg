const mongoose = require('mongoose');

const autoPollSchema = new mongoose.Schema(
  {
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    morningCutoffTime: { type: String, default: '21:00' }, // Cutoff for morning ride (e.g. 21:00 day before or 07:30 AM)
    returnCutoffTime: { type: String, default: '14:00' },  // Cutoff for return ride from college (e.g. 14:00 / 2:00 PM)
    morningPickupTime: { type: String, default: '08:30 AM' }, // PG to College pickup
    returnPickupTime: { type: String, default: '04:30 PM' },  // College to PG return pickup
    question: { type: String, default: 'Daily College Auto Transport' },
  },
  { timestamps: true }
);

autoPollSchema.index({ branch: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AutoPoll', autoPollSchema);
