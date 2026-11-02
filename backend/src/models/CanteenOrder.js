const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const canteenOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    deliveryType: { 
      type: String, 
      enum: ['ROOM_DELIVERY', 'CANTEEN_PICKUP'], 
      default: 'ROOM_DELIVERY' 
    },
    paymentMethod: { 
      type: String, 
      enum: ['ONLINE', 'PAY_AT_COUNTER', 'ADDED_TO_BILL'], 
      default: 'PAY_AT_COUNTER' 
    },
    paymentStatus: { 
      type: String, 
      enum: ['PENDING', 'PAID'], 
      default: 'PENDING' 
    },
    orderStatus: { 
      type: String, 
      enum: ['RECEIVED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'], 
      default: 'RECEIVED' 
    },
    specialInstructions: { type: String, default: '' },
  },
  { timestamps: true }
);

canteenOrderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  }
  next();
});

module.exports = mongoose.model('CanteenOrder', canteenOrderSchema);

