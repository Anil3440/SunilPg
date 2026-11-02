const express = require('express');
const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/canteenOrderController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, requireRole('STUDENT'), placeOrder);
router.get('/my', authenticate, requireRole('STUDENT'), getMyOrders);
router.get('/', authenticate, requireRole('ADMIN'), getAllOrders);
router.patch('/:id/status', authenticate, requireRole('ADMIN'), updateOrderStatus);

module.exports = router;

