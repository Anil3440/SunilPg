const express = require('express');
const { create, getAll, updateStatus } = require('../controllers/enquiryController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', create); // public
router.get('/', authenticate, requireRole('ADMIN'), getAll);
router.patch('/:id', authenticate, requireRole('ADMIN'), updateStatus);

module.exports = router;

