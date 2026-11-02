const ElectricityBill = require('../models/ElectricityBill');
const Payment = require('../models/Payment');
const paymentService = require('../services/paymentService');

// GET /api/electricity/my
const getMy = async (req, res, next) => {
  try {
    const bills = await ElectricityBill.find({ student: req.user._id }).sort({ year: -1, month: -1 });
    res.json({ success: true, data: bills });
  } catch (err) { next(err); }
};

// GET /api/electricity — admin
const getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.student) filter.student = req.query.student;
    if (req.query.room) filter.room = req.query.room;
    if (req.query.month) filter.month = Number(req.query.month);
    if (req.query.year) filter.year = Number(req.query.year);
    const bills = await ElectricityBill.find(filter)
      .populate('student', 'name email')
      .populate('room', 'roomNumber')
      .sort({ year: -1, month: -1 });
    res.json({ success: true, data: bills });
  } catch (err) { next(err); }
};

// POST /api/electricity — admin: create bill
const createBill = async (req, res, next) => {
  try {
    const { room, student, month, year, units, amount, dueDate } = req.body;
    const bill = await ElectricityBill.create({ room, student, month, year, units, amount, dueDate });
    res.status(201).json({ success: true, data: bill });
  } catch (err) { next(err); }
};

// POST /api/electricity/:id/initiate-payment
const initiatePayment = async (req, res, next) => {
  try {
    const bill = await ElectricityBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    if (bill.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your bill' });
    }
    if (bill.status === 'PAID') return res.status(400).json({ success: false, message: 'Already paid' });

    const receipt = `elec_${bill._id}_${Date.now()}`;
    const order = await paymentService.createOrder(bill.amount, receipt);

    const payment = await Payment.create({
      student: req.user._id,
      type: 'ELECTRICITY',
      referenceId: bill._id,
      amount: bill.amount,
      gatewayOrderId: order.id,
      status: 'PENDING',
      isMock: order.isMock || false,
    });

    res.json({ success: true, order, paymentId: payment._id, isMock: paymentService.isMock() });
  } catch (err) { next(err); }
};

// POST /api/electricity/:id/confirm-payment
const confirmPayment = async (req, res, next) => {
  try {
    const { gatewayPaymentId, gatewayOrderId, signature } = req.body;
    const bill = await ElectricityBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    const valid = paymentService.verifyPayment(gatewayOrderId, gatewayPaymentId, signature);
    if (!valid) return res.status(400).json({ success: false, message: 'Payment verification failed' });

    bill.status = 'PAID';
    bill.paidAt = new Date();
    await bill.save();

    await Payment.findOneAndUpdate(
      { referenceId: bill._id, type: 'ELECTRICITY' },
      { gatewayPaymentId, status: 'SUCCESS', paidAt: new Date() }
    );

    res.json({ success: true, message: 'Electricity bill payment confirmed', data: bill });
  } catch (err) { next(err); }
};

// DELETE /api/electricity/:id — admin
const remove = async (req, res, next) => {
  try {
    await ElectricityBill.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Bill deleted' });
  } catch (err) { next(err); }
};

module.exports = { getMy, getAll, createBill, initiatePayment, confirmPayment, remove };

