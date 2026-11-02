require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const branchRoutes = require('./routes/branches');
const roomRoutes = require('./routes/rooms');
const studentRoutes = require('./routes/students');
const rentRoutes = require('./routes/rent');
const electricityRoutes = require('./routes/electricity');
const pollRoutes = require('./routes/poll');
const announcementRoutes = require('./routes/announcements');
const menuRoutes = require('./routes/menu');
const enquiryRoutes = require('./routes/enquiries');
const dashboardRoutes = require('./routes/dashboard');
const canteenOrderRoutes = require('./routes/canteenOrders');
const ticketRoutes = require('./routes/tickets');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/rent', rentRoutes);
app.use('/api/electricity', electricityRoutes);
app.use('/api/poll', pollRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/canteen-orders', canteenOrderRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Central error handler
app.use(errorHandler);

module.exports = app;
