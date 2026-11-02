require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { startRentCron } = require('./jobs/rentCron');

const PORT = process.env.PORT || 5000;

// Global process error handlers to prevent unhandled crashes
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message, err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

const start = async () => {
  // 1. Connect database with automatic retry
  await connectDB();

  // 2. Start scheduled jobs
  try {
    startRentCron();
  } catch (err) {
    console.warn('⚠️ Could not start rent cron:', err.message);
  }

  // 3. Create HTTP & Socket.io server
  const server = http.createServer(app);
  const io = initSocket(server);
  app.set('io', io);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use by another process.`);
      console.error(`👉 Close the process using port ${PORT} or run: npx kill-port ${PORT}`);
    } else {
      console.error('❌ Server startup error:', err);
    }
  });

  server.listen(PORT, () => {
    console.log(`🚀 Server & Socket.io running on http://localhost:${PORT}`);
  });
};

start();
