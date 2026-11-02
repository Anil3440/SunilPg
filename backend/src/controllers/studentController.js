const bcrypt = require('bcryptjs');
const User = require('../models/User');

const getAll = async (req, res, next) => {
  try {
    const filter = { role: 'STUDENT' };
    if (req.query.branch) filter.branch = req.query.branch;
    const students = await User.find(filter)
      .populate('branch', 'name')
      .populate('room', 'roomNumber monthlyRent')
      .sort({ name: 1 });
    res.json({ success: true, data: students });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id)
      .populate('branch')
      .populate('room');
    if (!student || student.role !== 'STUDENT') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { name, email, phone, password, branch, room } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password || 'student123', 12);
    const student = await User.create({ name, email, phone, passwordHash, role: 'STUDENT', branch, room });
    res.status(201).json({ success: true, data: student });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    if (req.body.password) {
      req.body.passwordHash = await bcrypt.hash(req.body.password, 12);
      delete req.body.password;
    }
    const student = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate('branch', 'name').populate('room', 'roomNumber');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ success: true, message: 'Student deactivated' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove };

