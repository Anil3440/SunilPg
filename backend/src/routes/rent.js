const express = require('express');
const {
  getMyRent,
  getAll,
  createRecord,
  deleteRecord,
  generateRent,
  initiatePayment,
  confirmPayment,
  updateStatus,
} = require('../controllers/rentController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Student routes
router.get('/my', authenticate, requireRole('STUDENT'), getMyRent);
router.post('/:id/initiate-payment', authenticate, requireRole('STUDENT'), initiatePayment);
router.post('/:id/confirm-payment', authenticate, requireRole('STUDENT'), confirmPayment);

// Admin routes
router.get('/', authenticate, requireRole('ADMIN'), getAll);
router.post('/', authenticate, requireRole('ADMIN'), createRecord);
router.post('/generate', authenticate, requireRole('ADMIN'), generateRent);
router.patch('/:id/status', authenticate, requireRole('ADMIN'), updateStatus);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteRecord);

module.exports = router;
