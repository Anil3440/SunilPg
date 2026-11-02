const mongoose = require('mongoose');

const rentRecordSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'PAID', 'OVERDUE'], default: 'PENDING' },
    dueDate: { type: Date, required: true },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

rentRecordSchema.index({ student: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('RentRecord', rentRecordSchema);

