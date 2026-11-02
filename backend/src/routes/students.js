const express = require('express');
const { getAll, getOne, create, update, remove } = require('../controllers/studentController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, requireRole('ADMIN'), getAll);
router.get('/:id', authenticate, requireRole('ADMIN'), getOne);
router.post('/', authenticate, requireRole('ADMIN'), create);
router.put('/:id', authenticate, requireRole('ADMIN'), update);
router.delete('/:id', authenticate, requireRole('ADMIN'), remove);

module.exports = router;

