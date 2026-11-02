const express = require('express');
const {
  createTicket,
  getMyTickets,
  getAllTickets,
  addComment,
  updateStatus,
} = require('../controllers/ticketController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, requireRole('STUDENT'), createTicket);
router.get('/my', authenticate, requireRole('STUDENT'), getMyTickets);
router.get('/', authenticate, requireRole('ADMIN'), getAllTickets);
router.post('/:id/comments', authenticate, addComment);
router.patch('/:id/status', authenticate, requireRole('ADMIN'), updateStatus);

module.exports = router;

