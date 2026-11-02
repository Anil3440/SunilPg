const { Server } = require('socket.io');
const Ticket = require('../models/Ticket');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join a specific ticket room for live chatting
    socket.on('join_ticket', ({ ticketId }) => {
      if (ticketId) {
        socket.join(`ticket_${ticketId}`);
        console.log(`👤 Socket ${socket.id} joined room: ticket_${ticketId}`);
      }
    });

    // Leave a specific ticket room
    socket.on('leave_ticket', ({ ticketId }) => {
      if (ticketId) {
        socket.leave(`ticket_${ticketId}`);
        console.log(`🚪 Socket ${socket.id} left room: ticket_${ticketId}`);
      }
    });

    // Direct socket-based message sending
    socket.on('send_comment', async ({ ticketId, senderId, senderName, senderRole, message }) => {
      try {
        if (!ticketId || !message || !message.trim()) return;

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return;

        const comment = {
          sender: senderId,
          senderName: senderName || 'User',
          senderRole: senderRole || 'STUDENT',
          message: message.trim(),
          createdAt: new Date(),
        };

        ticket.comments.push(comment);

        if (senderRole === 'ADMIN') {
          ticket.adminResponse = message.trim();
          if (ticket.status === 'OPEN') ticket.status = 'IN_PROGRESS';
        }

        await ticket.save();

        // Broadcast to all clients in the ticket room
        io.to(`ticket_${ticketId}`).emit('new_comment', {
          ticketId,
          comment,
          adminResponse: ticket.adminResponse,
          status: ticket.status,
        });
      } catch (err) {
        console.error('Socket send_comment error:', err.message);
      }
    });

    socket.on('error', (err) => {
      console.warn(`⚠️ Socket error (${socket.id}):`, err.message);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => io;

module.exports = { initSocket, getIO };

