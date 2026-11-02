const express = require('express');
const { getAll, create, update, remove } = require('../controllers/announcementController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getAll);
router.post('/', authenticate, requireRole('ADMIN'), create);
router.put('/:id', authenticate, requireRole('ADMIN'), update);
router.delete('/:id', authenticate, requireRole('ADMIN'), remove);

module.exports = router;

