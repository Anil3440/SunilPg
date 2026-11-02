# Sunil PG Management Website (Full-Stack Portal)

A complete, feature-rich web portal built for multi-branch PG owners and student residents.

---

## 🌟 What's New & Included

### 1. Functional Student Dashboard
- **Residency Status**: Displays assigned branch and room number.
- **Dues Breakdown**: Total consolidated outstanding dues, rent invoices due, and electricity consumption dues.
- **Proactive Reminders Engine**: Smart alert banners for upcoming/overdue rent, unpaid electricity bills, and auto poll cutoff countdowns.
- **Direct Pay Shortcuts**: 1-click checkout modal directly from the dashboard.
- **Today's College Auto Poll**: Live voting for both morning and return rides.
- **Canteen Menu & Quick Order**: View today's mess menu with shortcut to order snacks.
- **Recent Support Tickets**: Live status of open complaints and warden replies.

### 2. Rent Portal (`/student/rent`)
- View pending rent invoices with amounts and due dates.
- Instant online checkout modal (Mock payment mode or test-mode Razorpay).
- Payment history log with status badges (`PENDING`, `PAID`, `OVERDUE`).
- Printable and downloadable payment receipt preview.

### 3. Electricity Billing Portal (`/student/electricity`)
- Monthly room sub-meter readings and units consumed (kWh).
- Clear breakdown of calculated consumption dues.
- 1-click online payment with instant status update.
- Printable electricity bill receipt.

### 4. College Auto Transport Poll (`/student/poll`)
- **Dual Trip Voting**:
  - **Trip 1 (Morning Drop)**: PG ➔ College (08:30 AM pickup, with cutoff time).
  - **Trip 2 (Evening Return)**: College ➔ PG (04:30 PM pickup, with cutoff time).
- One-click Yes/No toggling before cutoff time.
- Status feedback on driver scheduling.

### 5. Canteen Menu & Online Food Ordering (`/student/canteen`)
- **Today's Included Food Menu**: Breakfast, Lunch, Dinner timetable.
- **Order Food & Snacks Online**: Maggi noodles, samosas, cheese grilled sandwiches, cold coffee, chicken curry, eggs, and lassi.
- **Interactive Food Cart**: Add, remove, update quantities, and calculate total.
- **Delivery Preferences**: Choose between **Room Delivery** or **Canteen Pickup**.
- **Payment Method**: Pay at Canteen Counter / Cash on Delivery, Online, or Add to Monthly Bill.
- **Special Cooking Instructions**: e.g., "Make Maggi spicy", "less sugar".
- **My Active Orders Tracker**: Live status tracking (`RECEIVED` ➔ `PREPARING` ➔ `READY` ➔ `DELIVERED`).

### 6. Problems, Complaints & Queries Helpdesk (`/student/tickets`)
- **Raise New Ticket**:
  - **Categories**: Room Maintenance, Plumbing, Electrical, Wi-Fi & Internet, Food/Canteen, Cleaning/Sanitation, Rent Billing, General Query.
  - **Priority Levels**: Low, Medium, High, Urgent.
- **Live Conversation Thread**: Chat and follow up directly on the ticket.
- **Official Warden Responses**: See notes and solutions provided by the hostel management.
- **Status Filter**: View Active/In Progress vs Resolved tickets.

### 7. Admin Control Center
- **Overview Metrics**: Total students, rent collected, pending invoices, auto headcounts, active complaints count, and pending kitchen orders.
- **Rent & Electricity Management**: 1-click rent generator, bill creator, and manual status updates.
- **Canteen Orders Kitchen Monitor (`/admin/canteen-orders`)**: Track food preparation and mark orders `PREPARING`, `READY`, or `DELIVERED`.
- **Complaints & Helpdesk (`/admin/tickets`)**: View student problems, reply in chat, and mark issues `RESOLVED`.
- **Auto Headcount Summary (`/admin/polls`)**: Morning & Return passenger headcounts and passenger names.
- **Announcements & Canteen Menu**: Real-time broadcasts and menu editor.

---

## ⚡ Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds demo branches, rooms, students, bills, menu, orders & tickets
npm run dev      # Starts server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite React dev server on http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role | Email | Password | What to test |
|---|---|---|---|
| **Student 1** | `arjun@student.com` | `student123` | Room 101: Pending rent & electricity dues, active Maggi order, open plumbing ticket |
| **Student 2** | `priya@student.com` | `student123` | Room 102: Paid rent, open Wi-Fi ticket |
| **Student 3** | `rahul@student.com` | `student123` | Room A01 (HSR Layout): Pending dues |
| **Admin (Owner)** | `admin@sunilpg.com` | `admin123` | Full control center, kitchen orders monitor, and ticket responder |
