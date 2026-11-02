const Ticket = require('../models/Ticket');

// POST /api/tickets — student raises ticket
const createTicket = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const ticket = await Ticket.create({
      student: req.user._id,
      branch: req.user.branch,
      room: req.user.room,
      category: category || 'GENERAL_QUERY',
      priority: priority || 'MEDIUM',
      title,
      description,
      status: 'OPEN',
    });

    const populated = await Ticket.findById(ticket._id)
      .populate('branch', 'name')
      .populate('room', 'roomNumber');

    // Emit live event to admin if listening
    const io = req.app.get('io');
    if (io) {
      io.emit('new_ticket_created', populated);
    }

    res.status(201).json({
      success: true,
      message: 'Support ticket raised successfully. PG warden/management will assist you shortly.',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/tickets/my — student's tickets
const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ student: req.user._id })
      .populate('branch', 'name')
      .populate('room', 'roomNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
};

// GET /api/tickets — admin list all tickets
const getAllTickets = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.branch) filter.branch = req.query.branch;

    const tickets = await Ticket.find(filter)
      .populate('student', 'name email phone')
      .populate('branch', 'name')
      .populate('room', 'roomNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
};

// POST /api/tickets/:id/comments — add a reply/comment (student or admin)
const addComment = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    // Authorization check: handles both populated object and raw ObjectId
    const ticketStudentId = ticket.student?._id
      ? ticket.student._id.toString()
      : ticket.student.toString();

    if (req.user.role === 'STUDENT' && ticketStudentId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this ticket' });
    }

    const newComment = {
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message: message.trim(),
      createdAt: new Date(),
    };

    ticket.comments.push(newComment);

    // If admin replies, update adminResponse summary
    if (req.user.role === 'ADMIN') {
      ticket.adminResponse = message.trim();
      if (ticket.status === 'OPEN') ticket.status = 'IN_PROGRESS';
    }

    await ticket.save();

    const savedComment = ticket.comments[ticket.comments.length - 1];

    // Broadcast live to all connected clients in the ticket room via Socket.io
    const io = req.app.get('io');
    if (io) {
      const roomName = `ticket_${ticket._id.toString()}`;
      io.to(roomName).emit('new_comment', {
        ticketId: ticket._id.toString(),
        comment: savedComment,
        adminResponse: ticket.adminResponse,
        status: ticket.status,
      });
    }

    res.json({ success: true, message: 'Reply sent', data: ticket });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tickets/:id/status — admin updates ticket status
const updateStatus = async (req, res, next) => {
  try {
    const { status, adminResponse } = req.body;
    const updates = {};
    if (status) {
      updates.status = status;
      if (status === 'RESOLVED' || status === 'CLOSED') {
        updates.resolvedAt = new Date();
      }
    }
    if (adminResponse) updates.adminResponse = adminResponse;

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('student', 'name email phone')
      .populate('branch', 'name')
      .populate('room', 'roomNumber');

    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    // Broadcast status change live via Socket.io
    const io = req.app.get('io');
    if (io) {
      const roomName = `ticket_${ticket._id.toString()}`;
      io.to(roomName).emit('ticket_status_updated', {
        ticketId: ticket._id.toString(),
        status: ticket.status,
        adminResponse: ticket.adminResponse,
        resolvedAt: ticket.resolvedAt,
      });
    }

    res.json({ success: true, message: 'Ticket status updated', data: ticket });
  } catch (err) {
    next(err);
  }
};

module.exports = { createTicket, getMyTickets, getAllTickets, addComment, updateStatus };
