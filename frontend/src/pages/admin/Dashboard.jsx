import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, rentApi, contactApi, menuApi, branchApi } from '../../api';
import { AdminNav } from '../../components/AdminNav';
import { 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Car, 
  PlusCircle, 
  ArrowUpRight, 
  Sparkles,
  ShoppingBag,
  LifeBuoy,
  Phone,
  PhoneCall,
  MessageSquare,
  Mail,
  MapPin,
  ShieldAlert,
  Edit3,
  X,
  Clock,
  CheckCircle2,
  Utensils,
  Coffee,
  Plus,
  Building2,
  DoorClosed,
  Bell
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Menu modal state
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);
  const [branches, setBranches] = useState([]);
  const [menuForm, setMenuForm] = useState({
    mealType: 'BREAKFAST',
    branch: 'ALL',
    date: new Date().toISOString().split('T')[0],
    itemsStr: '',
  });

  // Contact details modal state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    wardenName: 'Sunil Kumar (Chief Warden & Owner)',
    phone: '+91 98765 43210',
    emergencyPhone: '+91 98765 43211',
    whatsapp: '9876543210',
    email: 'warden@sunilpg.com',
    officeHours: '08:00 AM – 10:30 PM (Daily)',
    address: 'Main Office Desk, Ground Floor, Sunil PG',
    notice: 'For late night emergency entry, medical help, or urgent assistance, call the night helpline directly.',
  });

  const loadStats = async () => {
    try {
      const [res, branchRes] = await Promise.all([
        dashboardApi.admin(),
        branchApi.getAll(),
      ]);
      if (res.data.success) {
        setStats(res.data.data);
        if (res.data.data.contactDetails) {
          setContactForm(res.data.data.contactDetails);
        }
      }
      if (branchRes.data.success) {
        setBranches(branchRes.data.data);
      }
    } catch (err) {
      toast.error('Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMenuModal = (mealType = 'BREAKFAST', existingItems = []) => {
    let currentItemsStr = '';
    if (existingItems && existingItems.length > 0) {
      currentItemsStr = existingItems.join(', ');
    } else if (stats?.todayMenu) {
      const match = stats.todayMenu.find((m) => m.mealType === mealType);
      if (match && match.items) currentItemsStr = match.items.join(', ');
    }

    setMenuForm({
      mealType,
      branch: 'ALL',
      date: new Date().toISOString().split('T')[0],
      itemsStr: currentItemsStr,
    });
    setMenuModalOpen(true);
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    setSavingMenu(true);
    try {
      const items = menuForm.itemsStr.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await menuApi.upsert({
        branch: menuForm.branch,
        date: menuForm.date,
        mealType: menuForm.mealType,
        items,
      });
      toast.success(res.data?.message || `${menuForm.mealType} menu updated successfully!`);
      setMenuModalOpen(false);
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update menu');
    } finally {
      setSavingMenu(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleGenerateRent = async () => {
    if (!window.confirm('Generate rent records for all active students for this month?')) return;
    setGenerating(true);
    try {
      const res = await rentApi.generate({ defaultAmount: 6500 });
      toast.success(res.data.message || 'Rent generated successfully');
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rent generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setSavingContact(true);
    try {
      const res = await contactApi.update(contactForm);
      if (res.data.success) {
        toast.success(res.data.message || 'Contact details updated successfully!');
        setContactModalOpen(false);
        loadStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update contact details');
    } finally {
      setSavingContact(false);
    }
  };

  const currentContact = stats?.contactDetails || contactForm;

  return (
    <div>
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Admin Control Center</h1>
            <p className="text-sm text-gray-500 mt-1">
              Multi-branch overview and management for Sunil PG
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenMenuModal('BREAKFAST')}
              className="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs flex items-center gap-1.5"
            >
              <Utensils className="w-4 h-4" /> Edit Today's Menu
            </button>
            <button
              onClick={() => {
                if (stats?.contactDetails) setContactForm(stats.contactDetails);
                setContactModalOpen(true);
              }}
              className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs flex items-center gap-1.5"
            >
              <PhoneCall className="w-4 h-4" /> Edit Contact Details
            </button>
            <Link
              to="/admin/polls"
              className="btn bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs flex items-center gap-1.5"
            >
              <Car className="w-4 h-4" /> Setup Auto Poll
            </Link>
            <button
              onClick={handleGenerateRent}
              disabled={generating}
              className="btn btn-primary font-bold shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? 'Generating...' : 'Generate Monthly Rent'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold uppercase text-gray-500">Active Students</span>
                    <h3 className="text-3xl font-extrabold text-gray-900 mt-1">
                      {stats?.totalStudents || 0}
                    </h3>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
                <Link
                  to="/admin/students"
                  className="mt-4 flex items-center text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  Manage Students <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </div>

              <div className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold uppercase text-gray-500">Rent Collected ({stats?.month}/{stats?.year})</span>
                    <h3 className="text-3xl font-extrabold text-green-600 mt-1">
                      ₹{(stats?.rentCollected || 0).toLocaleString('en-IN')}
                    </h3>
                  </div>
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
                <Link
                  to="/admin/rent"
                  className="mt-4 flex items-center text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  View Collections <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </div>

              <div className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold uppercase text-gray-500">Pending Dues</span>
                    <h3 className="text-3xl font-extrabold text-amber-600 mt-1">
                      {stats?.pendingRent || 0} Records
                    </h3>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
                <Link
                  to="/admin/rent?status=PENDING"
                  className="mt-4 flex items-center text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  Review Pending <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </div>

              <div className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold uppercase text-gray-500">
                      Auto Rides ({stats?.pollTitle || 'Tomorrow'})
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h3 className="text-3xl font-extrabold text-purple-600">
                        {stats?.autoYesCount !== undefined ? stats.autoYesCount : ((stats?.morningAutoCount || 0) + (stats?.returnAutoCount || 0))}
                      </h3>
                      <span className="text-xs font-medium text-gray-500">Total Yes</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      🌅 {stats?.morningAutoCount || 0} Morning • 🌇 {stats?.returnAutoCount || 0} Return
                    </div>
                    {stats?.pollDate && (
                      <div className="text-[10px] text-gray-400 font-medium mt-1">
                        Date: {stats.pollDate}
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <Car className="w-6 h-6" />
                  </div>
                </div>
                <Link
                  to="/admin/polls"
                  className="mt-4 flex items-center text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  See Passenger Lists <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </div>
            </div>

            {/* Today's Canteen & Daily Mess Menu */}
            <div className="card p-6 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/20 border border-emerald-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900">
                        Today's Canteen & Food Menu
                      </h2>
                      <span className="badge-success text-[10px] py-0.5 font-bold">
                        Live on Student Portal
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Configure today's meals for hostel residents & daily canteen orders.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Link
                    to="/admin/menu"
                    className="btn btn-outline text-xs py-2 px-3 flex items-center gap-1 font-bold"
                  >
                    Weekly Timetable <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleOpenMenuModal('BREAKFAST')}
                    className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 px-4 flex items-center gap-1.5 font-bold shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add / Edit Menu
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { key: 'BREAKFAST', title: '🌅 Breakfast', time: '07:30 AM – 10:00 AM' },
                  { key: 'LUNCH', title: '🍛 Lunch', time: '12:30 PM – 02:30 PM' },
                  { key: 'SNACKS', title: '☕ Snacks & Tea', time: '05:00 PM – 06:30 PM' },
                  { key: 'DINNER', title: '🌙 Dinner', time: '08:00 PM – 10:00 PM' },
                ].map((meal) => {
                  const menuObj = stats?.todayMenu?.find((m) => m.mealType === meal.key);
                  const items = menuObj?.items || [];

                  return (
                    <div
                      key={meal.key}
                      className="p-4 bg-white rounded-2xl border border-gray-100 flex flex-col justify-between hover:border-emerald-200 transition shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-900">{meal.title}</span>
                          <button
                            onClick={() => handleOpenMenuModal(meal.key, items)}
                            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg transition"
                          >
                            {items.length > 0 ? 'Edit' : '+ Add'}
                          </button>
                        </div>
                        <span className="text-[10px] text-gray-400 block mt-1">{meal.time}</span>

                        <div className="mt-3">
                          {items.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {items.map((dish, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-gray-50 text-gray-800 px-2 py-1 rounded-lg border border-gray-100 font-medium"
                                >
                                  {dish}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic py-2">
                              No menu set yet. Click "+ Add" to set dishes.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Warden & Emergency Contact Card (Live on Student Portal) */}
            <div className="card p-6 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 border border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900">
                        Warden Contact Details
                      </h2>
                      <span className="badge-success text-[10px] py-0.5 font-bold">
                        Displayed on Student Dashboard
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Students use these numbers for regular inquiries, 24/7 night emergencies, and WhatsApp chats.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setContactForm(currentContact);
                    setContactModalOpen(true);
                  }}
                  className="btn btn-outline text-xs py-2 px-4 flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" /> Edit Contact Details
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 bg-white rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Warden Name</span>
                  <span className="text-sm font-bold text-gray-900 mt-0.5 block">{currentContact.wardenName}</span>
                  <span className="text-[11px] text-gray-500 mt-1 block flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-500" /> {currentContact.officeHours}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Primary Phone</span>
                  <span className="text-sm font-bold text-blue-600 mt-0.5 block">{currentContact.phone}</span>
                  <span className="text-[11px] text-gray-500 mt-1 block flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-500" /> {currentContact.address}
                  </span>
                </div>

                <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200">
                  <span className="text-[10px] text-rose-600 block font-bold uppercase tracking-wider">🚨 24/7 Night Line</span>
                  <span className="text-sm font-bold text-rose-900 mt-0.5 block">{currentContact.emergencyPhone}</span>
                  <span className="text-[11px] text-rose-700 mt-1 block">For late night entry & urgent medical care</span>
                </div>

                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-600 block font-bold uppercase tracking-wider">WhatsApp & Email</span>
                  <span className="text-sm font-bold text-emerald-900 mt-0.5 block">{currentContact.whatsapp}</span>
                  <span className="text-[11px] text-gray-500 mt-1 block truncate">{currentContact.email}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Management Hub</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <Link to="/admin/polls" className="p-4 bg-purple-50/60 hover:bg-purple-100/70 border border-purple-100 rounded-xl text-center group transition">
                  <Car className="w-5 h-5 text-purple-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-gray-900 block">Auto Polls</span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">Setup daily rides & headcounts</span>
                </Link>

                <Link to="/admin/canteen-orders" className="p-4 bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-100 rounded-xl text-center group transition">
                  <ShoppingBag className="w-5 h-5 text-emerald-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-gray-900 block">Canteen</span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">Kitchen orders & dishes</span>
                </Link>

                <Link to="/admin/tickets" className="p-4 bg-rose-50/60 hover:bg-rose-100/70 border border-rose-100 rounded-xl text-center group transition">
                  <LifeBuoy className="w-5 h-5 text-rose-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-gray-900 block">Tickets</span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">Live resident complaints</span>
                </Link>

                <Link to="/admin/branches" className="p-4 bg-blue-50/60 hover:bg-blue-100/70 border border-blue-100 rounded-xl text-center group transition">
                  <Building2 className="w-5 h-5 text-blue-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-gray-900 block">Branches</span>
                  <span className="text-[11px] text-gray-500 mt-0.5 block">Edit branch properties</span>
                </Link>

                <Link to="/admin/rooms" className="p-4 bg-amber-50/60 hover:bg-amber-100/70 border border-amber-100 rounded-xl text-center group transition">
                  <DoorClosed className="w-5 h-5 text-amber-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-gray-900 block">Rooms</span>
                  <span className="text-[11px] text-gray-500 mt-0.5 block">Configure rents & capacity</span>
                </Link>

                <Link to="/admin/announcements" className="p-4 bg-indigo-50/60 hover:bg-indigo-100/70 border border-indigo-100 rounded-xl text-center group transition">
                  <Bell className="w-5 h-5 text-indigo-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-gray-900 block">Notices</span>
                  <span className="text-[11px] text-gray-500 mt-0.5 block">Broadcast announcements</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Contact Details Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Edit Warden & Contact Info</h3>
                  <p className="text-xs text-gray-500">
                    These contact details are shown on all student resident dashboards
                  </p>
                </div>
              </div>
              <button
                onClick={() => setContactModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4">
              <div>
                <label className="label">Warden / Owner Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunil Kumar (PG Owner & Chief Warden)"
                  className="input"
                  value={contactForm.wardenName}
                  onChange={(e) => setContactForm({ ...contactForm, wardenName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Primary Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    className="input"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">🚨 24/7 Emergency Night Line *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43211"
                    className="input font-semibold text-rose-700"
                    value={contactForm.emergencyPhone}
                    onChange={(e) => setContactForm({ ...contactForm, emergencyPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">WhatsApp Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="9876543210"
                    className="input"
                    value={contactForm.whatsapp}
                    onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Support Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="warden@sunilpg.com"
                    className="input"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Office Desk Hours</label>
                <input
                  type="text"
                  placeholder="e.g. 08:00 AM – 10:30 PM (Daily)"
                  className="input"
                  value={contactForm.officeHours}
                  onChange={(e) => setContactForm({ ...contactForm, officeHours: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Helpdesk Location / Office Desk Address</label>
                <input
                  type="text"
                  placeholder="e.g. Ground Floor Warden Office, Sunil PG"
                  className="input"
                  value={contactForm.address}
                  onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Emergency / Security Notice for Students</label>
                <textarea
                  rows="2"
                  placeholder="Instructions for students regarding night curfew, medical emergencies, etc."
                  className="input"
                  value={contactForm.notice}
                  onChange={(e) => setContactForm({ ...contactForm, notice: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setContactModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingContact}
                  className="btn btn-primary font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {savingContact ? 'Saving...' : 'Save & Publish to Students'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Daily Menu Modal */}
      {menuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in zoom-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Update Daily Menu</h3>
                  <p className="text-xs text-gray-500">Live for student dashboard & canteen ordering</p>
                </div>
              </div>
              <button
                onClick={() => setMenuModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenu} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Meal Type *
                  </label>
                  <select
                    value={menuForm.mealType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      const match = stats?.todayMenu?.find((m) => m.mealType === newType);
                      setMenuForm({
                        ...menuForm,
                        mealType: newType,
                        itemsStr: match?.items ? match.items.join(', ') : '',
                      });
                    }}
                    className="input w-full text-sm"
                  >
                    <option value="BREAKFAST">🌅 Breakfast</option>
                    <option value="LUNCH">🍛 Lunch</option>
                    <option value="SNACKS">☕ Snacks & High Tea</option>
                    <option value="DINNER">🌙 Dinner</option>
                    <option value="BEVERAGES">🥤 Beverages / Extras</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={menuForm.date}
                    onChange={(e) => setMenuForm({ ...menuForm, date: e.target.value })}
                    className="input w-full text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Target Branch *
                </label>
                <select
                  value={menuForm.branch}
                  onChange={(e) => setMenuForm({ ...menuForm, branch: e.target.value })}
                  className="input w-full text-sm"
                >
                  <option value="ALL">Apply to All Branches ({branches.length > 0 ? `${branches.length} branches` : 'All'})</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Dishes / Food Items (comma-separated) *
                  </label>
                  <span className="text-[11px] text-gray-400">e.g. Dosa, Sambhar, Chutney</span>
                </div>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Masala Dosa, Sambhar, Coconut Chutney, Filter Coffee"
                  className="input w-full text-sm"
                  value={menuForm.itemsStr}
                  onChange={(e) => setMenuForm({ ...menuForm, itemsStr: e.target.value })}
                />
              </div>

              {/* Quick preset suggestions */}
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Quick Presets (Click to insert):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {menuForm.mealType === 'BREAKFAST' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setMenuForm({ ...menuForm, itemsStr: 'Masala Dosa, Sambhar, Coconut Chutney, Filter Coffee' })}
                        className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                      >
                        + Dosa & Sambhar
                      </button>
                      <button
                        type="button"
                        onClick={() => setMenuForm({ ...menuForm, itemsStr: 'Aloo Paratha, Curd, Mixed Pickle, Masala Chai' })}
                        className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                      >
                        + Aloo Paratha & Chai
                      </button>
                      <button
                        type="button"
                        onClick={() => setMenuForm({ ...menuForm, itemsStr: 'Poha with Roasted Peanuts, Sev, Jalebi, Tea' })}
                        className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                      >
                        + Poha & Jalebi
                      </button>
                      <button
                        type="button"
                        onClick={() => setMenuForm({ ...menuForm, itemsStr: 'Idli, Medu Vada, Coconut Chutney, Sambhar, Filter Coffee' })}
                        className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                      >
                        + Idli Vada
                      </button>
                    </>
                  )}
                  {menuForm.mealType === 'LUNCH' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setMenuForm({ ...menuForm, itemsStr: 'Dal Tadka, Steamed Basmati Rice, Paneer Butter Masala, Fresh Roti, Salad' })}
                        className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                      >
                        + Paneer & Dal Tadka
                      </button>
                      <button
                        type="button"
                        onClick={() => setMenuForm({ ...menuForm, itemsStr: 'Rajma Masala, Jeera Rice, Boondi Raita, Mixed Veg, Gulab Jamun' })}
                        className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                      >
                        + Rajma Chawal Special
                      </button>
                      <button
                        type="button"
                        onClick={() => setMenuForm({ ...menuForm, itemsStr: 'Chole Masala, Bhature, Onion Lachha Salad, Mint Chutney, Chaas' })}
                        className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                      >
                        + Chole Bhature
                      </button>
                    </>
                  )}
                  {menuForm.mealType === 'SNACKS' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setMenuForm({ ...menuForm, itemsStr: 'Crispy Veg Samosas, Mint & Tamarind Chutney, Hot Adrak Chai' })}
                        className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                      >
                        + Samosa & Chai
                      </button>
                      <button
                        type="button"
                        onClick={() => setMenuForm({ ...menuForm, itemsStr: 'Cheese Grilled Sandwich, French Fries, Cold Coffee' })}
                        className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                      >
                        + Sandwich & Cold Coffee
                      </button>
                      <button
                        type="button"
                        onClick={() => setMenuForm({ ...menuForm, itemsStr: 'Hot Bread Pakora, Green Chutney, Filter Coffee' })}
                        className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                      >
                        + Bread Pakora
                      </button>
                    </>
                  )}
                  {menuForm.mealType === 'DINNER' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setMenuForm({ ...menuForm, itemsStr: 'Dal Makhani, Butter Naan / Roti, Jeera Rice, Kadhai Paneer, Ice Cream' })}
                        className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                      >
                        + Dal Makhani & Paneer
                      </button>
                      <button
                        type="button"
                        onClick={() => setMenuForm({ ...menuForm, itemsStr: 'Yellow Moong Dal, Steamed Rice, Chapati, Aloo Gobhi Matar, Kheer' })}
                        className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                      >
                        + Light Home-Style Dinner
                      </button>
                      <button
                        type="button"
                        onClick={() => setMenuForm({ ...menuForm, itemsStr: 'Egg Curry / Paneer Bhurji, Steamed Rice, Tawa Roti, Papad, Salad' })}
                        className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                      >
                        + Egg / Paneer Bhurji Plate
                      </button>
                    </>
                  )}
                  {menuForm.mealType === 'BEVERAGES' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setMenuForm({ ...menuForm, itemsStr: 'Sweet Punjabi Lassi, Fresh Lime Soda, Cold Coffee, Mineral Water' })}
                        className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                      >
                        + Lassi & Cold Coffee
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMenuModalOpen(false)}
                  className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMenu}
                  className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2"
                >
                  {savingMenu ? 'Saving...' : 'Save & Publish Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
