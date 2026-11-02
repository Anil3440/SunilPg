const CanteenOrder = require('../models/CanteenOrder');
const MenuItem = require('../models/MenuItem');
const { getTodayString } = require('../utils/helpers');

// POST /api/canteen-orders — student places order
const placeOrder = async (req, res, next) => {
  try {
    const { items, deliveryType, paymentMethod, specialInstructions } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    const totalAmount = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

    const order = await CanteenOrder.create({
      student: req.user._id,
      branch: req.user.branch,
      room: req.user.room,
      items,
      totalAmount,
      deliveryType: deliveryType || 'ROOM_DELIVERY',
      paymentMethod: paymentMethod || 'PAY_AT_COUNTER',
      paymentStatus: paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING',
      specialInstructions: specialInstructions || '',
      orderStatus: 'RECEIVED',
    });

    const populated = await CanteenOrder.findById(order._id)
      .populate('branch', 'name')
      .populate('room', 'roomNumber');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Canteen is preparing your food.',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/canteen-orders/my — student order history
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await CanteenOrder.find({ student: req.user._id })
      .populate('branch', 'name')
      .populate('room', 'roomNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/canteen-orders — admin list orders
const getAllOrders = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.branch) filter.branch = req.query.branch;
    if (req.query.status) filter.orderStatus = req.query.status;

    const orders = await CanteenOrder.find(filter)
      .populate('student', 'name email phone')
      .populate('branch', 'name')
      .populate('room', 'roomNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/canteen-orders/:id/status — admin updates order status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const updates = {};
    if (orderStatus) updates.orderStatus = orderStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    const order = await CanteenOrder.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('student', 'name phone')
      .populate('room', 'roomNumber');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (err) {
    next(err);
  }
};

module.exports = { placeOrder, getMyOrders, getAllOrders, updateOrderStatus };

