const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, default: '' },
    rentRange: { type: String, default: '' }, // e.g. "₹5000 - ₹8000"
  },
  { timestamps: true }
);

module.exports = mongoose.model('Branch', branchSchema);

