const express = require('express');
const { getMenu, getWeekMenu, upsertMenu, remove } = require('../controllers/menuController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getMenu);
router.get('/week', authenticate, getWeekMenu);
router.post('/', authenticate, requireRole('ADMIN'), upsertMenu);
router.delete('/:id', authenticate, requireRole('ADMIN'), remove);

module.exports = router;

