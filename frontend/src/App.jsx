import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Smart redirect helper for generic routes like /rent, /dashboard, etc.
const RoleRedirect = ({ adminTo, studentTo }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to={adminTo} replace />;
  return <Navigate to={studentTo} replace />;
};

// Landing page route: only shown when user is NOT logged in.
// If logged in, redirects directly to their dashboard.
const LandingRoute = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }
  return <Home />;
};

// Login / Signup route: if already logged in, redirects directly to dashboard.
const AuthRoute = ({ defaultTab = 'login' }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }
  return defaultTab === 'register' ? <Register /> : <Login />;
};

// Public pages
import { Home } from './pages/Home';
import { Branches } from './pages/Branches';
import { Facilities } from './pages/Facilities';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Student pages
import { StudentDashboard } from './pages/student/Dashboard';
import { StudentRent } from './pages/student/Rent';
import { StudentElectricity } from './pages/student/Electricity';
import { StudentAutoPoll } from './pages/student/AutoPoll';
import { StudentCanteen } from './pages/student/Canteen';
import { StudentTickets } from './pages/student/Tickets';
import { StudentMenu } from './pages/student/Menu';

// Admin pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminBranches } from './pages/admin/Branches';
import { AdminRooms } from './pages/admin/Rooms';
import { AdminStudents } from './pages/admin/Students';
import { AdminRent } from './pages/admin/Rent';
import { AdminElectricity } from './pages/admin/Electricity';
import { AdminAutoPoll } from './pages/admin/AutoPoll';
import { AdminAnnouncements } from './pages/admin/Announcements';
import { AdminMenu } from './pages/admin/Menu';
import { AdminEnquiries } from './pages/admin/Enquiries';
import { AdminCanteenOrders } from './pages/admin/CanteenOrders';
import { AdminTickets } from './pages/admin/Tickets';

// MainLayout handles proper padding when fixed floating navbar is active:
// Home page has full edge-to-edge background from y=0; other pages have safe top padding.
const MainLayout = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/home';
  return (
    <main className={`flex-1 ${isHomePage ? '' : 'pt-20 sm:pt-24'}`}>
      {children}
    </main>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gray-50/50 text-gray-900 font-sans">
          <Navbar />
          <MainLayout>
            <Routes>
              {/* Public Landing & Guest Routes */}
              <Route path="/" element={<LandingRoute />} />
              <Route path="/home" element={<LandingRoute />} />
              <Route path="/branches" element={<Branches />} />
              <Route path="/facilities" element={<Facilities />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<AuthRoute defaultTab="login" />} />
              <Route path="/signin" element={<AuthRoute defaultTab="login" />} />
              <Route path="/auth" element={<AuthRoute defaultTab="login" />} />
              <Route path="/register" element={<AuthRoute defaultTab="register" />} />
              <Route path="/signup" element={<AuthRoute defaultTab="register" />} />

              {/* Smart Role-based Redirects */}
              <Route path="/dashboard" element={<RoleRedirect adminTo="/admin/dashboard" studentTo="/student/dashboard" />} />
              <Route path="/rent" element={<RoleRedirect adminTo="/admin/rent" studentTo="/student/rent" />} />
              <Route path="/electricity" element={<RoleRedirect adminTo="/admin/electricity" studentTo="/student/electricity" />} />
              <Route path="/poll" element={<RoleRedirect adminTo="/admin/polls" studentTo="/student/poll" />} />
              <Route path="/polls" element={<RoleRedirect adminTo="/admin/polls" studentTo="/student/poll" />} />
              <Route path="/canteen" element={<RoleRedirect adminTo="/admin/canteen-orders" studentTo="/student/canteen" />} />
              <Route path="/canteen-orders" element={<RoleRedirect adminTo="/admin/canteen-orders" studentTo="/student/canteen" />} />
              <Route path="/tickets" element={<RoleRedirect adminTo="/admin/tickets" studentTo="/student/tickets" />} />
              <Route path="/menu" element={<RoleRedirect adminTo="/admin/menu" studentTo="/student/menu" />} />

              {/* Student Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']} />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/rent" element={<StudentRent />} />
                <Route path="/student/electricity" element={<StudentElectricity />} />
                <Route path="/student/poll" element={<StudentAutoPoll />} />
                <Route path="/student/canteen" element={<StudentCanteen />} />
                <Route path="/student/menu" element={<StudentMenu />} />
                <Route path="/student/tickets" element={<StudentTickets />} />
              </Route>

              {/* Admin Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/branches" element={<AdminBranches />} />
                <Route path="/admin/rooms" element={<AdminRooms />} />
                <Route path="/admin/students" element={<AdminStudents />} />
                <Route path="/admin/rent" element={<AdminRent />} />
                <Route path="/admin/electricity" element={<AdminElectricity />} />
                <Route path="/admin/polls" element={<AdminAutoPoll />} />
                <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                <Route path="/admin/menu" element={<AdminMenu />} />
                <Route path="/admin/canteen-orders" element={<AdminCanteenOrders />} />
                <Route path="/admin/tickets" element={<AdminTickets />} />
                <Route path="/admin/enquiries" element={<AdminEnquiries />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
          <Footer />
        </div>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
