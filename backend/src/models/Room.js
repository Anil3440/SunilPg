const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    roomNumber: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, default: 1 },
    monthlyRent: { type: Number, required: true },
    floor: { type: String, default: '' },
    type: { type: String, enum: ['SINGLE', 'DOUBLE', 'TRIPLE'], default: 'SINGLE' },
  },
  { timestamps: true }
);

roomSchema.index({ branch: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);

