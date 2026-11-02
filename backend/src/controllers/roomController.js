const Room = require('../models/Room');

const getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.branch) filter.branch = req.query.branch;
    const rooms = await Room.find(filter).populate('branch', 'name').sort({ roomNumber: 1 });
    res.json({ success: true, data: rooms });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('branch');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, data: room });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate('branch', 'name');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, data: room });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Room deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove };

