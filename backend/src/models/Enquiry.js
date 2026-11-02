const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['NEW', 'READ', 'REPLIED'], default: 'NEW' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);

