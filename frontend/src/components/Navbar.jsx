import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, 
  X, 
  Shield, 
  User, 
  LogOut, 
  DollarSign, 
  Zap, 
  Car, 
  Utensils, 
  LifeBuoy,
  LayoutDashboard,
  Sparkles
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;
  const brandHomeLink = !user ? '/' : user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-3 sm:px-5 lg:px-8 pt-2.5 sm:pt-3.5 pointer-events-none transition-all duration-300">
      {/* Floating Glassmorphic Pill Dock */}
      <nav 
        className={`max-w-7xl mx-auto rounded-2xl sm:rounded-full transition-all duration-300 pointer-events-auto px-4 sm:px-6 py-2 ${
          scrolled ? 'glass-nav-scrolled shadow-xl' : 'glass-nav shadow-lg'
        }`}
      >
        <div className="flex justify-between items-center h-12 sm:h-13">
          {/* Brand Logo with Rounded Glass Glow */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to={brandHomeLink} className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 via-amber-500 to-primary-600 rounded-full blur-xs opacity-75 group-hover:opacity-100 transition duration-300" />
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 text-white font-black text-sm tracking-wider flex items-center justify-center shadow-md border border-white/50 group-hover:scale-105 transition-transform">
                  HL
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-gray-900 leading-tight">
                  HappyLiving<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-amber-500">PG</span>
                </span>
                <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase -mt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Sunil PG & Flats
                </span>
              </div>
            </Link>

            {/* Public Links with Rounded Glass Capsule Dock (Guest Only) */}
            {!user && (
              <div className="hidden lg:flex items-center space-x-1 text-xs font-bold p-1 bg-black/5 backdrop-blur-md rounded-full border border-white/60 shadow-inner ml-2">
                <Link 
                  to="/" 
                  className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                    isActive('/') 
                      ? 'bg-white text-primary-700 shadow-sm border border-gray-200/50' 
                      : 'text-gray-600 hover:text-gray-950 hover:bg-white/50'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/branches" 
                  className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                    isActive('/branches') 
                      ? 'bg-white text-primary-700 shadow-sm border border-gray-200/50' 
                      : 'text-gray-600 hover:text-gray-950 hover:bg-white/50'
                  }`}
                >
                  Branches
                </Link>
                <Link 
                  to="/facilities" 
                  className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                    isActive('/facilities') 
                      ? 'bg-white text-primary-700 shadow-sm border border-gray-200/50' 
                      : 'text-gray-600 hover:text-gray-950 hover:bg-white/50'
                  }`}
                >
                  Facilities
                </Link>
                <Link 
                  to="/contact" 
                  className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                    isActive('/contact') 
                      ? 'bg-white text-primary-700 shadow-sm border border-gray-200/50' 
                      : 'text-gray-600 hover:text-gray-950 hover:bg-white/50'
                  }`}
                >
                  Contact
                </Link>
              </div>
            )}
          </div>

          {/* Student Center Quick Navigation Glass Capsule */}
          {user && user.role === 'STUDENT' && (
            <div className="hidden md:flex items-center space-x-1 text-xs font-bold p-1 bg-black/5 backdrop-blur-md rounded-full border border-white/60 shadow-inner">
              <Link 
                to="/student/dashboard" 
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
                  isActive('/student/dashboard') 
                    ? 'bg-white text-primary-700 shadow-sm border border-gray-200/60' 
                    : 'text-gray-600 hover:text-gray-950 hover:bg-white/60'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-primary-600" /> Dashboard
              </Link>
              <Link 
                to="/student/rent" 
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
                  isActive('/student/rent') 
                    ? 'bg-white text-primary-700 shadow-sm border border-gray-200/60' 
                    : 'text-gray-600 hover:text-gray-950 hover:bg-white/60'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-blue-600" /> Rent
              </Link>
              <Link 
                to="/student/electricity" 
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
                  isActive('/student/electricity') 
                    ? 'bg-white text-primary-700 shadow-sm border border-gray-200/60' 
                    : 'text-gray-600 hover:text-gray-950 hover:bg-white/60'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Electricity
              </Link>
              <Link 
                to="/student/poll" 
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
                  isActive('/student/poll') 
                    ? 'bg-white text-primary-700 shadow-sm border border-gray-200/60' 
                    : 'text-gray-600 hover:text-gray-950 hover:bg-white/60'
                }`}
              >
                <Car className="w-3.5 h-3.5 text-purple-600" /> Auto Poll
              </Link>
              <Link 
                to="/student/canteen" 
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
                  isActive('/student/canteen') 
                    ? 'bg-white text-primary-700 shadow-sm border border-gray-200/60' 
                    : 'text-gray-600 hover:text-gray-950 hover:bg-white/60'
                }`}
              >
                <Utensils className="w-3.5 h-3.5 text-emerald-600" /> Canteen
              </Link>
              <Link 
                to="/student/tickets" 
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
                  isActive('/student/tickets') 
                    ? 'bg-white text-primary-700 shadow-sm border border-gray-200/60' 
                    : 'text-gray-600 hover:text-gray-950 hover:bg-white/60'
                }`}
              >
                <LifeBuoy className="w-3.5 h-3.5 text-rose-500" /> Support
              </Link>
            </div>
          )}

          {/* Desktop Right Navigation / User Profiles */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {user ? (
              <div className="flex items-center space-x-2.5 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/60 shadow-xs">
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 rounded-full shadow-xs transition"
                  >
                    <Shield className="w-3.5 h-3.5" /> Admin Hub
                  </Link>
                )}
                <div className="text-right">
                  <p className="text-xs font-extrabold text-gray-800 leading-none">{user.name}</p>
                  <p className="text-[10px] font-bold text-primary-600 tracking-wider uppercase mt-0.5">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-full hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="px-5 py-2 text-xs font-bold text-gray-700 bg-white/90 hover:bg-white hover:text-primary-700 backdrop-blur-md border border-gray-200/80 rounded-full shadow-xs hover:shadow-md transition-all whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="px-5 py-2 text-xs font-black text-white bg-gradient-to-r from-primary-600 via-primary-700 to-amber-500 hover:from-primary-700 hover:to-amber-600 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 border border-white/20 whitespace-nowrap"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-gray-700 hover:bg-white/80 backdrop-blur-md border border-white/60 shadow-xs focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown with Rounder Corners & Floating Glass Island */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-7xl mx-auto mt-2 rounded-3xl glass-nav-scrolled p-5 pointer-events-auto border border-white/80 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {user && user.role === 'STUDENT' && (
            <div className="bg-primary-50/70 backdrop-blur-sm rounded-2xl p-3 border border-primary-100 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary-700 px-2 block mb-1">
                Student Menu
              </span>
              <Link to="/student/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-primary-100/60 rounded-xl transition">
                <LayoutDashboard className="w-4 h-4 text-primary-600" /> Dashboard
              </Link>
              <Link to="/student/rent" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-primary-100/60 rounded-xl transition">
                <DollarSign className="w-4 h-4 text-blue-600" /> Pay Rent Invoices
              </Link>
              <Link to="/student/electricity" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-primary-100/60 rounded-xl transition">
                <Zap className="w-4 h-4 text-amber-500" /> Pay Electricity Bills
              </Link>
              <Link to="/student/poll" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-primary-100/60 rounded-xl transition">
                <Car className="w-4 h-4 text-purple-600" /> Morning & Return Auto Poll
              </Link>
              <Link to="/student/canteen" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-primary-100/60 rounded-xl transition">
                <Utensils className="w-4 h-4 text-emerald-600" /> Canteen Menu & Order Food
              </Link>
              <Link to="/student/tickets" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-primary-100/60 rounded-xl transition">
                <LifeBuoy className="w-4 h-4 text-rose-500" /> Raise Problems & Queries
              </Link>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm font-bold">
            {!user && <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-2xl hover:bg-gray-100/70 text-gray-700 text-center">Home</Link>}
            <Link to="/branches" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-2xl hover:bg-gray-100/70 text-gray-700 text-center">Branches</Link>
            <Link to="/facilities" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-2xl hover:bg-gray-100/70 text-gray-700 text-center">Facilities</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-2xl hover:bg-gray-100/70 text-gray-700 text-center">Contact</Link>
          </div>

          <div className="pt-3 border-t border-gray-100">
            {user ? (
              <div className="space-y-2">
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-primary-600 shadow-md"
                  >
                    <Shield className="w-4 h-4" /> Go to Admin Control Center
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-4 h-4" /> Logout ({user.name})
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-outline text-center rounded-full py-2.5">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary text-center rounded-full py-2.5 bg-gradient-to-r from-primary-600 to-amber-500">
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
