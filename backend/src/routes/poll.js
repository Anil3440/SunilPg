const express = require('express');
const { getToday, vote, getSummary, createPoll, deletePoll } = require('../controllers/pollController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/today', authenticate, getToday);
router.post('/vote', authenticate, requireRole('STUDENT'), vote);
router.get('/summary', authenticate, requireRole('ADMIN'), getSummary);
router.post('/', authenticate, requireRole('ADMIN'), createPoll);
router.delete('/:id', authenticate, requireRole('ADMIN'), deletePoll);

module.exports = router;
