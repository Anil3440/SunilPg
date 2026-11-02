const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticate, requireRole } = require('../middleware/auth');

// Any authenticated user can view contact details
router.get('/', authenticate, contactController.getContact);

// Admin can update contact details
router.put('/', authenticate, requireRole('ADMIN'), contactController.updateContact);

module.exports = router;

