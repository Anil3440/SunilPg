import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  DoorClosed, 
  Users, 
  DollarSign, 
  Zap, 
  Car, 
  Bell, 
  Utensils, 
  ShoppingBag,
  LifeBuoy,
  MessageSquare,
  ChevronDown,
  Layers,
  X,
  ArrowRight,
  Shield
} from 'lucide-react';

const ADMIN_GROUPS = [
  {
    id: 'billing',
    title: 'Billing & Dues',
    icon: DollarSign,
    color: 'text-emerald-600 bg-emerald-50',
    items: [
      { to: '/admin/rent', label: 'Rent Invoices', desc: 'Generate & track student monthly rents', icon: DollarSign },
      { to: '/admin/electricity', label: 'Electricity Bills', desc: 'Unit meter readings & bill status', icon: Zap },
    ],
  },
  {
    id: 'operations',
    title: 'Daily Services',
    icon: Car,
    color: 'text-purple-600 bg-purple-50',
    items: [
      { to: '/admin/polls', label: 'College Auto Polls', desc: 'Morning & return ride passenger lists', icon: Car },
      { to: '/admin/canteen-orders', label: 'Canteen Orders', desc: 'Live kitchen food & snack orders', icon: ShoppingBag },
      { to: '/admin/menu', label: 'Daily Food Menu', desc: 'Breakfast, lunch, snacks & dinner timetable', icon: Utensils },
    ],
  },
  {
    id: 'support',
    title: 'Helpdesk & Notices',
    icon: LifeBuoy,
    color: 'text-rose-600 bg-rose-50',
    items: [
      { to: '/admin/tickets', label: 'Complaints & Tickets', desc: 'Resident issues & maintenance requests', icon: LifeBuoy },
      { to: '/admin/announcements', label: 'Notice Announcements', desc: 'Broadcast notices to resident feeds', icon: Bell },
      { to: '/admin/enquiries', label: 'Visitor Enquiries', desc: 'Prospect room admission leads', icon: MessageSquare },
    ],
  },
  {
    id: 'infrastructure',
    title: 'Hostel & Rooms',
    icon: Building2,
    color: 'text-blue-600 bg-blue-50',
    items: [
      { to: '/admin/students', label: 'Student Directory', desc: 'Active resident roster & records', icon: Users },
      { to: '/admin/rooms', label: 'Rooms & Beds', desc: 'Room capacities, tariffs & occupancy', icon: DoorClosed },
      { to: '/admin/branches', label: 'PG Branches', desc: 'Multi-branch locations & properties', icon: Building2 },
    ],
  },
];

export const AdminNav = () => {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const navRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close drawer and dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  // Identify which group the current route belongs to
  const currentGroup = ADMIN_GROUPS.find((group) =>
    group.items.some((item) => location.pathname === item.to)
  );

  // Identify current active item
  let currentActiveItem = null;
  if (location.pathname === '/admin/dashboard') {
    currentActiveItem = { label: 'Admin Overview', icon: LayoutDashboard };
  } else {
    for (const group of ADMIN_GROUPS) {
      const match = group.items.find((item) => item.to === location.pathname);
      if (match) {
        currentActiveItem = match;
        break;
      }
    }
  }

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  return (
    <div ref={navRef} className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13">
          
          {/* Desktop Navigation Groups */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            {/* Overview / Dashboard */}
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </NavLink>

            {/* Categorized Dropdowns */}
            {ADMIN_GROUPS.map((group) => {
              const isGroupActive = currentGroup?.id === group.id;
              const isOpen = activeDropdown === group.id;
              const GroupIcon = group.icon;

              return (
                <div key={group.id} className="relative">
                  <button
                    onClick={() => toggleDropdown(group.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                      isGroupActive
                        ? 'bg-primary-50 text-primary-700 border border-primary-200/80 shadow-2xs'
                        : isOpen
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <GroupIcon className="w-3.5 h-3.5" />
                    <span>{group.title}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3.5 py-1.5 border-b border-gray-100 mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                          {group.title} Modules
                        </span>
                      </div>
                      <div className="p-1.5 space-y-1">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isItemActive = location.pathname === item.to;

                          return (
                            <Link
                              key={item.to}
                              to={item.to}
                              className={`flex items-start gap-2.5 p-2 rounded-xl transition ${
                                isItemActive
                                  ? 'bg-primary-50 text-primary-800 font-bold border border-primary-100'
                                  : 'hover:bg-gray-50 text-gray-800'
                              }`}
                            >
                              <div className={`p-1.5 rounded-lg mt-0.5 ${isItemActive ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                <ItemIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold leading-tight">{item.label}</div>
                                <div className="text-[11px] text-gray-400 truncate mt-0.5">{item.desc}</div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Right Side: Active module breadcrumb & All Tools Drawer trigger */}
          <div className="hidden md:flex items-center space-x-3">
            {currentActiveItem && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold text-gray-700">{currentActiveItem.label}</span>
              </div>
            )}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="btn btn-outline text-xs py-1.5 px-2.5 flex items-center gap-1 text-gray-700 hover:text-gray-900 font-bold"
              title="View all 12 modules"
            >
              <Layers className="w-3.5 h-3.5 text-primary-600" />
              <span>All Modules</span>
            </button>
          </div>

          {/* Mobile Bar View (Clean & Compact with Zero Horizontal Scroll) */}
          <div className="flex md:hidden items-center justify-between w-full py-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary-50 text-primary-700 rounded-lg">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Admin Panel</span>
                <span className="text-xs font-extrabold text-gray-900 block truncate max-w-[170px]">
                  {currentActiveItem?.label || 'Overview'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="btn bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs py-1.5 px-3 flex items-center gap-1.5 font-bold border border-primary-200"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Switch Module (12)</span>
            </button>
          </div>

        </div>
      </div>

      {/* Slide-out / Modal Drawer: All 12 Modules (Mobile + Desktop quick overview) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Admin Management Modules</h3>
                  <p className="text-xs text-gray-500">Quickly navigate to any Sunil PG control department</p>
                </div>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Overview Link */}
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileDrawerOpen(false)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                location.pathname === '/admin/dashboard'
                  ? 'bg-primary-50 border-primary-200 text-primary-900'
                  : 'bg-gray-50/70 border-gray-100 hover:bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-600 text-white rounded-xl">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">Admin Control Center Overview</div>
                  <div className="text-xs text-gray-500">High-level statistics, daily summary, and live status</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>

            {/* Categorized Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ADMIN_GROUPS.map((group) => {
                const GroupIcon = group.icon;

                return (
                  <div key={group.id} className="p-4 bg-gray-50/60 rounded-2xl border border-gray-100 space-y-2.5">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-gray-200/60">
                      <div className={`p-1.5 rounded-lg ${group.color}`}>
                        <GroupIcon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                        {group.title}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isItemActive = location.pathname === item.to;

                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setMobileDrawerOpen(false)}
                            className={`flex items-center justify-between p-2 rounded-xl text-xs transition ${
                              isItemActive
                                ? 'bg-white font-extrabold text-primary-700 shadow-2xs border border-primary-200'
                                : 'text-gray-700 hover:bg-white hover:text-gray-900 font-semibold'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <ItemIcon className={`w-3.5 h-3.5 ${isItemActive ? 'text-primary-600' : 'text-gray-400'}`} />
                              <span className="truncate">{item.label}</span>
                            </div>
                            {isItemActive && (
                              <span className="text-[10px] bg-primary-100 text-primary-800 px-1.5 py-0.5 rounded-full font-bold">
                                Active
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
