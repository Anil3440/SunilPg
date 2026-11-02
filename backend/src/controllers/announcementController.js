const Announcement = require('../models/Announcement');

// GET /api/announcements
const getAll = async (req, res, next) => {
  try {
    const filter = {};
    // Students see announcements for their branch or all branches (null)
    if (req.user.role === 'STUDENT') {
      filter.$or = [{ branch: null }, { branch: req.user.branch }];
    }
    if (req.query.branch) filter.branch = req.query.branch;
    const announcements = await Announcement.find(filter)
      .populate('branch', 'name')
      .populate('createdBy', 'name')
      .sort({ pinned: -1, createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (err) { next(err); }
};

// POST /api/announcements — admin
const create = async (req, res, next) => {
  try {
    const { title, message, branch, pinned } = req.body;
    const ann = await Announcement.create({
      title, message,
      branch: branch || null,
      pinned: pinned || false,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: ann });
  } catch (err) { next(err); }
};

// PUT /api/announcements/:id — admin
const update = async (req, res, next) => {
  try {
    const ann = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, data: ann });
  } catch (err) { next(err); }
};

// DELETE /api/announcements/:id — admin
const remove = async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAll, create, update, remove };

