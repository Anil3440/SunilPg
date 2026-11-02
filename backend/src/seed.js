require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const Branch = require('./models/Branch');
const Room = require('./models/Room');
const RentRecord = require('./models/RentRecord');
const ElectricityBill = require('./models/ElectricityBill');
const Announcement = require('./models/Announcement');
const MenuItem = require('./models/MenuItem');
const AutoPoll = require('./models/AutoPoll');
const PollVote = require('./models/PollVote');
const CanteenOrder = require('./models/CanteenOrder');
const Ticket = require('./models/Ticket');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Branch.deleteMany({}),
    Room.deleteMany({}),
    RentRecord.deleteMany({}),
    ElectricityBill.deleteMany({}),
    Announcement.deleteMany({}),
    MenuItem.deleteMany({}),
    AutoPoll.deleteMany({}),
    PollVote.deleteMany({}),
    CanteenOrder.deleteMany({}),
    Ticket.deleteMany({}),
  ]);

  // ── Branches ─────────────────────────────────────────────────────────────────
  const [branch1, branch2] = await Branch.insertMany([
    {
      name: 'Sunil PG – Koramangala',
      address: '12, 4th Block, Koramangala, Bengaluru – 560034',
      description: 'Located in the heart of Koramangala with easy access to colleges, metro, and tech parks.',
      imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
      rentRange: '₹6,000 – ₹9,000',
    },
    {
      name: 'Sunil PG – HSR Layout',
      address: '7th Sector, HSR Layout, Bengaluru – 560102',
      description: 'Premium accommodation near HSR with gym, park, canteen, and daily college auto-ride facility.',
      imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      rentRange: '₹7,000 – ₹11,000',
    },
  ]);

  // ── Rooms ─────────────────────────────────────────────────────────────────────
  const rooms = await Room.insertMany([
    { branch: branch1._id, roomNumber: '101', capacity: 1, monthlyRent: 6500, floor: '1', type: 'SINGLE' },
    { branch: branch1._id, roomNumber: '102', capacity: 2, monthlyRent: 5000, floor: '1', type: 'DOUBLE' },
    { branch: branch1._id, roomNumber: '201', capacity: 1, monthlyRent: 7500, floor: '2', type: 'SINGLE' },
    { branch: branch2._id, roomNumber: 'A01', capacity: 1, monthlyRent: 8000, floor: '1', type: 'SINGLE' },
    { branch: branch2._id, roomNumber: 'A02', capacity: 2, monthlyRent: 7000, floor: '1', type: 'DOUBLE' },
  ]);

  // ── Admin ─────────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
  const admin = await User.create({
    name: 'Sunil (Owner / Admin)',
    email: process.env.ADMIN_EMAIL || 'admin@sunilpg.com',
    phone: '9876543210',
    passwordHash: adminHash,
    role: 'ADMIN',
    active: true,
  });

  // ── Students ──────────────────────────────────────────────────────────────────
  const studentHash = await bcrypt.hash('student123', 12);
  const [s1, s2, s3] = await User.insertMany([
    {
      name: 'Arjun Sharma',
      email: 'arjun@student.com',
      phone: '9000000001',
      passwordHash: studentHash,
      role: 'STUDENT',
      branch: branch1._id,
      room: rooms[0]._id,
      active: true,
    },
    {
      name: 'Priya Nair',
      email: 'priya@student.com',
      phone: '9000000002',
      passwordHash: studentHash,
      role: 'STUDENT',
      branch: branch1._id,
      room: rooms[1]._id,
      active: true,
    },
    {
      name: 'Rahul Verma',
      email: 'rahul@student.com',
      phone: '9000000003',
      passwordHash: studentHash,
      role: 'STUDENT',
      branch: branch2._id,
      room: rooms[3]._id,
      active: true,
    },
  ]);

  // ── Rent Records ──────────────────────────────────────────────────────────────
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const dueDate = new Date(year, month - 1, 5);

  await RentRecord.insertMany([
    { student: s1._id, month, year, amount: rooms[0].monthlyRent, dueDate, status: 'PENDING' },
    { student: s2._id, month, year, amount: rooms[1].monthlyRent, dueDate, status: 'PAID', paidAt: new Date() },
    { student: s3._id, month, year, amount: rooms[3].monthlyRent, dueDate, status: 'PENDING' },
  ]);

  // ── Electricity Bills ─────────────────────────────────────────────────────────
  await ElectricityBill.insertMany([
    { room: rooms[0]._id, student: s1._id, month, year, units: 85, amount: 680, dueDate, status: 'PENDING' },
    { room: rooms[1]._id, student: s2._id, month, year, units: 60, amount: 480, dueDate, status: 'PAID', paidAt: new Date() },
    { room: rooms[3]._id, student: s3._id, month, year, units: 95, amount: 760, dueDate, status: 'PENDING' },
  ]);

  // ── Announcements ─────────────────────────────────────────────────────────────
  await Announcement.insertMany([
    {
      title: '🎉 Welcome to Sunil PG Digital Portal!',
      message: 'Pay monthly rent & electricity bills, order snacks from canteen, vote in morning/return auto rides, and raise maintenance tickets directly here.',
      branch: null,
      pinned: true,
      createdBy: admin._id,
    },
    {
      title: 'Water tank deep cleaning this Saturday',
      message: 'Overhead water tanks will be sanitized from 10:00 AM to 1:00 PM. Please store drinking water in advance.',
      branch: branch1._id,
      pinned: false,
      createdBy: admin._id,
    },
    {
      title: 'High-speed 500 Mbps Wi-Fi Router Upgraded',
      message: 'New Wi-Fi access points installed on 1st & 2nd floors. Connect to "SunilPG_5G" (Password on notice board).',
      branch: branch2._id,
      pinned: false,
      createdBy: admin._id,
    },
  ]);

  // ── Canteen Menu & Orderable Food Items ─────────────────────────────────────────
  const today = now.toISOString().split('T')[0];
  for (const branch of [branch1, branch2]) {
    await MenuItem.insertMany([
      {
        branch: branch._id,
        date: today,
        mealType: 'BREAKFAST',
        items: ['Masala Dosa with Chutney', 'Idli Vada Sambar', 'Poha', 'Tea / Filter Coffee'],
        detailedItems: [
          { name: 'Masala Dosa Plate', price: 0, isAvailable: true, category: 'BREAKFAST' },
          { name: 'Idli Vada Combo', price: 0, isAvailable: true, category: 'BREAKFAST' },
          { name: 'Extra Boiled Egg (2 pcs)', price: 20, isAvailable: true, category: 'BREAKFAST' },
          { name: 'Hot Filter Coffee', price: 15, isAvailable: true, category: 'BEVERAGES' },
        ],
      },
      {
        branch: branch._id,
        date: today,
        mealType: 'LUNCH',
        items: ['Basmati Rice', 'Dal Tadka', 'Paneer Butter Masala', 'Phulka Roti (3)', 'Curd', 'Salad'],
        detailedItems: [
          { name: 'Hostel Regular Lunch Thali', price: 0, isAvailable: true, category: 'LUNCH' },
          { name: 'Special Chicken Curry (Extra bowl)', price: 90, isAvailable: true, category: 'LUNCH' },
          { name: 'Sweet Gulab Jamun (2 pcs)', price: 30, isAvailable: true, category: 'LUNCH' },
          { name: 'Fresh Sweet Lassi', price: 35, isAvailable: true, category: 'BEVERAGES' },
        ],
      },
      {
        branch: branch._id,
        date: today,
        mealType: 'DINNER',
        items: ['Jeera Rice', 'Egg Curry / Mixed Veg Korma', 'Soft Chapati', 'Dal Fry', 'Pickle'],
        detailedItems: [
          { name: 'Hostel Regular Dinner Thali', price: 0, isAvailable: true, category: 'DINNER' },
          { name: 'Egg Bhurji Plate', price: 50, isAvailable: true, category: 'DINNER' },
          { name: 'Cold Milk with Bournvita', price: 25, isAvailable: true, category: 'BEVERAGES' },
        ],
      },
      {
        branch: branch._id,
        date: today,
        mealType: 'SNACKS',
        items: ['Samosa (2 pcs)', 'Veg Maggi Noodles', 'Cheese Grilled Sandwich', 'Cold Coffee'],
        detailedItems: [
          { name: 'Crispy Veg Samosa (2 pcs)', price: 30, isAvailable: true, category: 'SNACKS' },
          { name: 'Classic Butter Maggi', price: 40, isAvailable: true, category: 'SNACKS' },
          { name: 'Cheese Grilled Sandwich', price: 60, isAvailable: true, category: 'SNACKS' },
          { name: 'Chilled Cold Coffee', price: 45, isAvailable: true, category: 'BEVERAGES' },
        ],
      },
    ]);
  }

  // ── Auto Polls (Morning & Return from/to College) ──────────────────────────────
  for (const branch of [branch1, branch2]) {
    const poll = await AutoPoll.create({
      branch: branch._id,
      date: today,
      morningCutoffTime: '21:00', // 9:00 PM cutoff
      returnCutoffTime: '14:00',  // 2:00 PM cutoff for return
      morningPickupTime: '08:30 AM',
      returnPickupTime: '04:30 PM',
      question: 'College Auto Transport Service for Tomorrow',
    });

    // Seed votes
    await PollVote.create({
      poll: poll._id,
      student: s1._id,
      morningVote: true,
      morningVotedAt: new Date(),
      returnVote: true,
      returnVotedAt: new Date(),
    });

    await PollVote.create({
      poll: poll._id,
      student: s2._id,
      morningVote: true,
      morningVotedAt: new Date(),
      returnVote: false,
      returnVotedAt: new Date(),
    });
  }

  // ── Canteen Orders ────────────────────────────────────────────────────────────
  await CanteenOrder.create({
    student: s1._id,
    branch: branch1._id,
    room: rooms[0]._id,
    items: [
      { name: 'Classic Butter Maggi', price: 40, quantity: 1 },
      { name: 'Chilled Cold Coffee', price: 45, quantity: 1 },
    ],
    totalAmount: 85,
    deliveryType: 'ROOM_DELIVERY',
    paymentMethod: 'PAY_AT_COUNTER',
    paymentStatus: 'PENDING',
    orderStatus: 'PREPARING',
    specialInstructions: 'Make Maggi spicy with green chilies.',
  });

  // ── Tickets for Problems and Queries ──────────────────────────────────────────
  const ticket1 = await Ticket.create({
    student: s1._id,
    branch: branch1._id,
    room: rooms[0]._id,
    category: 'PLUMBING',
    priority: 'HIGH',
    title: 'Bathroom tap leaking continuously',
    description: 'The washbasin tap in room 101 has a loose gasket and is continuously dripping water.',
    status: 'IN_PROGRESS',
    adminResponse: 'Plumber has been notified and will visit room 101 today at 2 PM.',
    comments: [
      {
        sender: s1._id,
        senderName: 'Arjun Sharma',
        senderRole: 'STUDENT',
        message: 'The sound of the dripping tap is disturbing at night. Please fix.',
        createdAt: new Date(Date.now() - 3 * 3600 * 1000),
      },
      {
        sender: admin._id,
        senderName: 'Sunil (Admin)',
        senderRole: 'ADMIN',
        message: 'Understood Arjun, plumber Ramesh is assigned with replacement washers.',
        createdAt: new Date(Date.now() - 1 * 3600 * 1000),
      },
    ],
  });

  await Ticket.create({
    student: s2._id,
    branch: branch1._id,
    room: rooms[1]._id,
    category: 'WIFI_INTERNET',
    priority: 'MEDIUM',
    title: 'Wi-Fi connection fluctuating on 1st floor',
    description: 'Signal strength drops frequently during evening study hours between 8 PM and 10 PM.',
    status: 'OPEN',
    comments: [],
  });

  console.log('\n✅ Enhanced Seed complete!\n');
  console.log('─────────────────────────────────────────');
  console.log('  Admin login:   admin@sunilpg.com / admin123');
  console.log('  Student 1:     arjun@student.com / student123 (Room 101, Due rent & bill, Active order & ticket)');
  console.log('  Student 2:     priya@student.com / student123 (Room 102, Paid rent, Open Wi-Fi ticket)');
  console.log('  Student 3:     rahul@student.com / student123 (Room A01 HSR, Due rent)');
  console.log('─────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
