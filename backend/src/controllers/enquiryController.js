const Enquiry = require('../models/Enquiry');

// POST /api/enquiries — public
const create = async (req, res, next) => {
  try {
    const { name, phone, email, message } = req.body;
    const enquiry = await Enquiry.create({ name, phone, email, message });
    res.status(201).json({ success: true, data: enquiry, message: 'Enquiry submitted!' });
  } catch (err) { next(err); }
};

// GET /api/enquiries — admin
const getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const enquiries = await Enquiry.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: enquiries });
  } catch (err) { next(err); }
};

// PATCH /api/enquiries/:id — admin: update status
const updateStatus = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json({ success: true, data: enquiry });
  } catch (err) { next(err); }
};

module.exports = { create, getAll, updateStatus };

