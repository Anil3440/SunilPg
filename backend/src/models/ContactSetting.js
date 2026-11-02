const mongoose = require('mongoose');

const contactSettingSchema = new mongoose.Schema(
  {
    wardenName: {
      type: String,
      default: 'Sunil Kumar (Chief Warden & Owner)',
      trim: true,
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
      trim: true,
    },
    emergencyPhone: {
      type: String,
      default: '+91 98765 43211',
      trim: true,
    },
    whatsapp: {
      type: String,
      default: '9876543210',
      trim: true,
    },
    email: {
      type: String,
      default: 'warden@sunilpg.com',
      trim: true,
    },
    officeHours: {
      type: String,
      default: '08:00 AM – 10:30 PM (Daily)',
      trim: true,
    },
    address: {
      type: String,
      default: 'Main Office Desk, Ground Floor, Sunil PG',
      trim: true,
    },
    notice: {
      type: String,
      default: 'For late night emergency entry, medical help, or maintenance urgent assistance, call the night helpline directly.',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactSetting', contactSettingSchema);

