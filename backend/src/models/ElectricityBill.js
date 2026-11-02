const mongoose = require('mongoose');

const electricityBillSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    units: { type: Number, default: 0 },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'PAID', 'OVERDUE'], default: 'PENDING' },
    dueDate: { type: Date, required: true },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

electricityBillSchema.index({ student: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('ElectricityBill', electricityBillSchema);

