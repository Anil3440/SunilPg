const express = require('express');
const { adminDashboard, studentDashboard } = require('../controllers/dashboardController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/admin', authenticate, requireRole('ADMIN'), adminDashboard);
router.get('/student', authenticate, requireRole('STUDENT'), studentDashboard);

module.exports = router;

