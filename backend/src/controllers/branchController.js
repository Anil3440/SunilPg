const Branch = require('../models/Branch');

const getAll = async (req, res, next) => {
  try {
    const branches = await Branch.find().sort({ name: 1 });
    res.json({ success: true, data: branches });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.json({ success: true, data: branch });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const branch = await Branch.create(req.body);
    res.status(201).json({ success: true, data: branch });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.json({ success: true, data: branch });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await Branch.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Branch deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove };

