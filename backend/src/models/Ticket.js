const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ['ADMIN', 'STUDENT'], required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, unique: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
    category: {
      type: String,
      enum: [
        'ROOM_MAINTENANCE',
        'PLUMBING',
        'ELECTRICAL',
        'WIFI_INTERNET',
        'FOOD_CANTEEN',
        'CLEANING_HYGIENE',
        'RENT_BILLING',
        'GENERAL_QUERY',
        'OTHER',
      ],
      default: 'GENERAL_QUERY',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
    },
    adminResponse: { type: String, default: '' },
    comments: [commentSchema],
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ticketSchema.pre('save', function (next) {
  if (!this.ticketNumber) {
    this.ticketNumber = `TCK-${Date.now().toString().slice(-5)}${Math.floor(10 + Math.random() * 90)}`;
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);

