const express = require('express');
const { getAll, getOne, create, update, remove } = require('../controllers/branchController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', authenticate, requireRole('ADMIN'), create);
router.put('/:id', authenticate, requireRole('ADMIN'), update);
router.delete('/:id', authenticate, requireRole('ADMIN'), remove);

module.exports = router;

