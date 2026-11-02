const RentRecord = require('../models/RentRecord');
const Payment = require('../models/Payment');
const User = require('../models/User');
const paymentService = require('../services/paymentService');
const { getMonthYear } = require('../utils/helpers');

// GET /api/rent/my — student's own records
const getMyRent = async (req, res, next) => {
  try {
    const records = await RentRecord.find({ student: req.user._id }).sort({ year: -1, month: -1 });
    res.json({ success: true, data: records });
  } catch (err) { next(err); }
};

// GET /api/rent — admin: all records with optional filters
const getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.student) filter.student = req.query.student;
    if (req.query.month) filter.month = Number(req.query.month);
    if (req.query.year) filter.year = Number(req.query.year);
    if (req.query.status) filter.status = req.query.status;
    const records = await RentRecord.find(filter)
      .populate({
        path: 'student',
        select: 'name email phone room branch',
        populate: [
          { path: 'room', select: 'roomNumber monthlyRent' },
          { path: 'branch', select: 'name' },
        ],
      })
      .sort({ year: -1, month: -1 });
    res.json({ success: true, data: records });
  } catch (err) { next(err); }
};

// POST /api/rent — admin: create single rent invoice for a student
const createRecord = async (req, res, next) => {
  try {
    const { studentId, student, month, year, amount, dueDate, status } = req.body;
    const targetStudentId = studentId || student;

    if (!targetStudentId) {
      return res.status(400).json({ success: false, message: 'Please select a student' });
    }

    const m = Number(month) || getMonthYear().month;
    const y = Number(year) || getMonthYear().year;
    const rentAmount = Number(amount);

    if (!rentAmount || rentAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid rent amount in ₹ is required' });
    }

    const defaultDueDate = new Date(y, m - 1, 5);
    const parsedDueDate = dueDate ? new Date(dueDate) : defaultDueDate;

    // Check if record already exists for this student, month, year
    const existing = await RentRecord.findOne({ student: targetStudentId, month: m, year: y });
    if (existing) {
      existing.amount = rentAmount;
      existing.dueDate = parsedDueDate;
      if (status) existing.status = status;
      if (status === 'PAID' && !existing.paidAt) existing.paidAt = new Date();
      await existing.save();
      const populated = await RentRecord.findById(existing._id).populate({
        path: 'student',
        select: 'name email phone room branch',
        populate: [
          { path: 'room', select: 'roomNumber monthlyRent' },
          { path: 'branch', select: 'name' },
        ],
      });
      return res.json({
        success: true,
        message: `Updated existing rent invoice for ${m}/${y}`,
        data: populated,
      });
    }

    const record = await RentRecord.create({
      student: targetStudentId,
      month: m,
      year: y,
      amount: rentAmount,
      dueDate: parsedDueDate,
      status: status || 'PENDING',
      paidAt: status === 'PAID' ? new Date() : null,
    });

    const populated = await RentRecord.findById(record._id).populate({
      path: 'student',
      select: 'name email phone room branch',
      populate: [
        { path: 'room', select: 'roomNumber monthlyRent' },
        { path: 'branch', select: 'name' },
      ],
    });
    res.status(201).json({
      success: true,
      message: 'Rent invoice created successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/rent/:id — admin: remove rent invoice
const deleteRecord = async (req, res, next) => {
  try {
    const record = await RentRecord.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Rent record not found' });
    }
    await Payment.deleteMany({ referenceId: req.params.id, type: 'RENT' });
    res.json({ success: true, message: 'Rent invoice deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/rent/generate — admin: create rent records for a given month/year
const generateRent = async (req, res, next) => {
  try {
    const { month, year, defaultAmount, branchId, overwrite } = req.body;
    const m = Number(month) || getMonthYear().month;
    const y = Number(year) || getMonthYear().year;
    const fallbackAmount = Number(defaultAmount) || 6500;

    const studentFilter = { role: 'STUDENT', active: true };
    if (branchId && branchId !== 'ALL') {
      studentFilter.branch = branchId;
    }

    const students = await User.find(studentFilter).populate('room').populate('branch', 'name');
    if (!students.length) {
      return res.json({
        success: true,
        message: 'No active students found to generate rent for',
        createdCount: 0,
        skippedCount: 0,
        data: [],
      });
    }

    const results = [];
    let skippedCount = 0;

    for (const student of students) {
      const amount = student.room?.monthlyRent || fallbackAmount;
      const dueDate = new Date(y, m - 1, 5); // due on 5th

      try {
        const existing = await RentRecord.findOne({ student: student._id, month: m, year: y });
        if (existing) {
          if (overwrite) {
            existing.amount = amount;
            existing.dueDate = dueDate;
            await existing.save();
            results.push(existing);
          } else {
            skippedCount++;
          }
          continue;
        }

        const record = await RentRecord.create({
          student: student._id,
          month: m,
          year: y,
          amount,
          dueDate,
          status: 'PENDING',
        });
        results.push(record);
      } catch (e) {
        if (e.code === 11000) {
          skippedCount++;
        } else {
          throw e;
        }
      }
    }

    res.json({
      success: true,
      message: `Generated ${results.length} rent invoice(s) for ${m}/${y}${skippedCount > 0 ? ` (${skippedCount} already existed)` : ''}`,
      createdCount: results.length,
      skippedCount,
      data: results,
    });
  } catch (err) { next(err); }
};

// POST /api/rent/:id/initiate-payment — student: create Razorpay order
const initiatePayment = async (req, res, next) => {
  try {
    const record = await RentRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    if (record.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your record' });
    }
    if (record.status === 'PAID') {
      return res.status(400).json({ success: false, message: 'Already paid' });
    }

    const receipt = `rent_${record._id}_${Date.now()}`;
    const order = await paymentService.createOrder(record.amount, receipt);

    const payment = await Payment.create({
      student: req.user._id,
      type: 'RENT',
      referenceId: record._id,
      amount: record.amount,
      gatewayOrderId: order.id,
      status: 'PENDING',
      isMock: order.isMock || false,
    });

    res.json({ success: true, order, paymentId: payment._id, isMock: paymentService.isMock() });
  } catch (err) { next(err); }
};

// POST /api/rent/:id/confirm-payment — student: verify + mark paid
const confirmPayment = async (req, res, next) => {
  try {
    const { gatewayPaymentId, gatewayOrderId, signature } = req.body;
    const record = await RentRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    const valid = paymentService.verifyPayment(gatewayOrderId, gatewayPaymentId, signature);
    if (!valid) return res.status(400).json({ success: false, message: 'Payment verification failed' });

    record.status = 'PAID';
    record.paidAt = new Date();
    await record.save();

    await Payment.findOneAndUpdate(
      { referenceId: record._id, type: 'RENT' },
      { gatewayPaymentId, status: 'SUCCESS', paidAt: new Date() }
    );

    res.json({ success: true, message: 'Rent payment confirmed', data: record });
  } catch (err) { next(err); }
};

// PATCH /api/rent/:id/status — admin: manually update status
const updateStatus = async (req, res, next) => {
  try {
    const record = await RentRecord.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    );
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

module.exports = {
  getMyRent,
  getAll,
  createRecord,
  deleteRecord,
  generateRent,
  initiatePayment,
  confirmPayment,
  updateStatus,
};
