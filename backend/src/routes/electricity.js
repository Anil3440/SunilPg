const express = require('express');
const {
  getMy, getAll, createBill, initiatePayment, confirmPayment, remove,
} = require('../controllers/electricityController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/my', authenticate, requireRole('STUDENT'), getMy);
router.get('/', authenticate, requireRole('ADMIN'), getAll);
router.post('/', authenticate, requireRole('ADMIN'), createBill);
router.post('/:id/initiate-payment', authenticate, requireRole('STUDENT'), initiatePayment);
router.post('/:id/confirm-payment', authenticate, requireRole('STUDENT'), confirmPayment);
router.delete('/:id', authenticate, requireRole('ADMIN'), remove);

module.exports = router;

