const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const Branch = require('../models/Branch');
const { getTodayString } = require('../utils/helpers');

// GET /api/menu — today's menu (or by date / branch)
const getMenu = async (req, res, next) => {
  try {
    const date = req.query.date || getTodayString();
    const filter = { date };

    if (req.user && req.user.role === 'STUDENT' && req.user.branch) {
      filter.branch = req.user.branch;
    } else if (req.query.branch && req.query.branch !== 'ALL' && mongoose.Types.ObjectId.isValid(req.query.branch)) {
      filter.branch = req.query.branch;
    }

    const menu = await MenuItem.find(filter)
      .populate('branch', 'name')
      .sort({ mealType: 1 });
    res.json({ success: true, data: menu });
  } catch (err) { next(err); }
};

// GET /api/menu/week
const getWeekMenu = async (req, res, next) => {
  try {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const filter = { date: { $in: dates } };
    if (req.user && req.user.role === 'STUDENT' && req.user.branch) {
      filter.branch = req.user.branch;
    } else if (req.query.branch && req.query.branch !== 'ALL' && mongoose.Types.ObjectId.isValid(req.query.branch)) {
      filter.branch = req.query.branch;
    }

    const menu = await MenuItem.find(filter)
      .populate('branch', 'name')
      .sort({ date: 1, mealType: 1 });
    res.json({ success: true, data: menu, dates });
  } catch (err) { next(err); }
};

// POST /api/menu — admin: upsert a meal
const upsertMenu = async (req, res, next) => {
  try {
    let { branch, date, mealType, items, detailedItems } = req.body;
    date = date || getTodayString();
    mealType = (mealType || 'BREAKFAST').toUpperCase();

    // Clean items array
    let cleanItems = [];
    if (Array.isArray(items)) {
      cleanItems = items.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof items === 'string') {
      cleanItems = items.split(',').map((s) => s.trim()).filter(Boolean);
    }

    // Resolve target branches
    let targetBranchIds = [];
    if (!branch || branch === 'ALL') {
      const allBranches = await Branch.find({});
      if (allBranches.length > 0) {
        targetBranchIds = allBranches.map((b) => b._id);
      }
    } else if (mongoose.Types.ObjectId.isValid(branch)) {
      targetBranchIds = [branch];
    } else {
      const firstBranch = await Branch.findOne();
      if (firstBranch) targetBranchIds = [firstBranch._id];
    }

    if (targetBranchIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please create a branch first before setting menu' });
    }

    // Prepare detailed items if not explicitly provided
    const cleanDetailedItems = Array.isArray(detailedItems) && detailedItems.length > 0
      ? detailedItems
      : cleanItems.map((name) => ({
          name,
          price: 0,
          isAvailable: true,
          category: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS', 'BEVERAGES'].includes(mealType) ? mealType : 'SNACKS',
        }));

    const results = [];
    for (const bId of targetBranchIds) {
      const item = await MenuItem.findOneAndUpdate(
        { branch: bId, date, mealType },
        {
          $set: {
            branch: bId,
            date,
            mealType,
            items: cleanItems,
            detailedItems: cleanDetailedItems,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).populate('branch', 'name');
      results.push(item);
    }

    res.json({
      success: true,
      message: `${mealType} menu saved successfully for ${results.length} branch(es)!`,
      data: results.length === 1 ? results[0] : results,
    });
  } catch (err) { next(err); }
};

// DELETE /api/menu/:id — admin
const remove = async (req, res, next) => {
  try {
    if (req.params.id && req.params.id !== 'by-type') {
      await MenuItem.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: 'Menu item deleted successfully' });
    }

    const { branch, date, mealType } = req.query;
    const filter = {};
    if (date) filter.date = date;
    if (mealType) filter.mealType = mealType;
    if (branch && branch !== 'ALL' && mongoose.Types.ObjectId.isValid(branch)) {
      filter.branch = branch;
    }

    await MenuItem.deleteMany(filter);
    res.json({ success: true, message: 'Menu item(s) deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = { getMenu, getWeekMenu, upsertMenu, remove };

