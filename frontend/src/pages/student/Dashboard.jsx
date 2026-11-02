import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  dashboardApi,
  rentApi,
  electricityApi,
  pollApi,
  announcementApi,
  menuApi,
  ticketApi
} from '../../api';
import { PaymentModal } from '../../components/PaymentModal';
import { 
  Building2, 
  DollarSign, 
  Zap, 
  Car, 
  Utensils, 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  LifeBuoy,
  PlusCircle,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Phone,
  PhoneCall,
  MessageSquare,
  Mail,
  MapPin,
  ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [todayMenu, setTodayMenu] = useState([]);
  const [newTicketModal, setNewTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    category: 'ROOM_MAINTENANCE',
    priority: 'MEDIUM',
  });
  const [ticketSubmitting, setTicketSubmitting] = useState(false);

  // Payment modal state
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    title: '',
    amount: 0,
    onConfirm: null,
  });

  const loadData = async () => {
    try {
      const [dashRes, annRes, menuRes] = await Promise.all([
        dashboardApi.student(),
        announcementApi.getAll(),
        menuApi.getToday(),
      ]);

      if (dashRes.data.success) setDashboardData(dashRes.data.data);
      if (annRes.data.success) setAnnouncements(annRes.data.data);
      if (menuRes.data.success) setTodayMenu(menuRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Could not refresh some dashboard updates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [votingTrip, setVotingTrip] = useState(null);

  // Handle Quick Vote
  const handleQuickVote = async (tripType, willTakeAuto) => {
    const activePollId = pollObj?._id || dashboardData?.poll?.poll?._id;
    setVotingTrip(tripType);

    // Optimistic local state update so buttons change instantly
    setDashboardData((prev) => {
      if (!prev?.poll) return prev;
      return {
        ...prev,
        poll: {
          ...prev.poll,
          myVote: {
            ...(prev.poll.myVote || {}),
            [tripType === 'MORNING' ? 'morningVote' : 'returnVote']: willTakeAuto,
          },
        },
      };
    });

    try {
      const res = await pollApi.vote({
        pollId: activePollId,
        tripType,
        willTakeAuto,
      });
      if (res.data.success) {
        toast.success(
          `${tripType === 'MORNING' ? 'Morning ride' : 'Return ride'} recorded: ${
            willTakeAuto ? 'YES, going in auto' : 'NO, not taking auto'
          }`
        );
        const dashRes = await dashboardApi.student();
        if (dashRes.data.success) setDashboardData(dashRes.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Voting failed');
      loadData();
    } finally {
      setVotingTrip(null);
    }
  };

  // Quick Rent Pay
  const handlePayRent = (record) => {
    setPaymentModal({
      isOpen: true,
      title: `Pay Room Rent (${record.month}/${record.year})`,
      amount: record.amount,
      onConfirm: async () => {
        const init = await rentApi.initiatePayment(record._id);
        const { order } = init.data;
        await rentApi.confirmPayment(record._id, {
          gatewayOrderId: order.id,
          gatewayPaymentId: `pay_mock_${Date.now()}`,
          signature: 'mock_sig',
        });
        toast.success('Rent payment processed successfully!');
        loadData();
      },
    });
  };

  // Quick Electricity Pay
  const handlePayElectricity = (bill) => {
    setPaymentModal({
      isOpen: true,
      title: `Pay Electricity Bill (${bill.month}/${bill.year})`,
      amount: bill.amount,
      onConfirm: async () => {
        const init = await electricityApi.initiatePayment(bill._id);
        const { order } = init.data;
        await electricityApi.confirmPayment(bill._id, {
          gatewayOrderId: order.id,
          gatewayPaymentId: `pay_elec_mock_${Date.now()}`,
          signature: 'mock_sig',
        });
        toast.success('Electricity bill payment confirmed!');
        loadData();
      },
    });
  };

  // Raise Ticket
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setTicketSubmitting(true);
    try {
      const res = await ticketApi.createTicket(ticketForm);
      if (res.data.success) {
        toast.success('Help ticket submitted to management!');
        setNewTicketModal(false);
        setTicketForm({ title: '', description: '', category: 'ROOM_MAINTENANCE', priority: 'MEDIUM' });
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setTicketSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-28">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const { dues, latestRent, latestElec, poll, activeTickets, reminders, contactDetails } = dashboardData || {
    dues: { totalRentDue: 0, totalElecDue: 0, totalDue: 0, pendingRentCount: 0, pendingElecCount: 0 },
    latestRent: null,
    latestElec: null,
    poll: null,
    activeTickets: [],
    reminders: [],
    contactDetails: null,
  };

  const pollObj = poll?.poll;
  const myVote = poll?.myVote;

  const contact = contactDetails || {
    wardenName: 'Sunil Kumar (Chief Warden & Owner)',
    phone: '+91 98765 43210',
    emergencyPhone: '+91 98765 43211',
    whatsapp: '9876543210',
    email: 'warden@sunilpg.com',
    officeHours: '08:00 AM – 10:30 PM (Daily)',
    address: 'Main Office Desk, Ground Floor, Sunil PG',
    notice: 'For late night emergency entry, medical help, or urgent assistance, call the night helpline directly.',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome & Residency Summary Banner - High Contrast & Guaranteed Visible */}
      <div
        className="rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-white"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #312e81 100%)',
          color: '#ffffff',
        }}
      >
        {/* Decorative glowing gradient accents */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
                Student Resident Portal
              </span>
              <span className="text-xs text-blue-200">
                • {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1.5 tracking-tight text-white drop-shadow-xs">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-blue-100 text-sm mt-1.5 flex flex-wrap items-center gap-2">
              <span className="bg-white/10 px-2.5 py-1 rounded-xl border border-white/15">
                🏠 <strong>{user?.branch?.name || 'Branch Assigned'}</strong>
              </span>
              <span className="bg-white/10 px-2.5 py-1 rounded-xl border border-white/15">
                • Room <strong>{user?.room?.roomNumber || 'Assigned'}</strong>
              </span>
            </p>
          </div>

          {/* Quick Action Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/student/rent"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm border border-blue-400/40"
            >
              <DollarSign className="w-3.5 h-3.5" /> Rent Portal
            </Link>
            <Link
              to="/student/electricity"
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-gray-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" /> Electricity
            </Link>
            <button
              onClick={() => setNewTicketModal(true)}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 backdrop-blur-xs"
            >
              <LifeBuoy className="w-3.5 h-3.5" /> Raise Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Proactive Reminders Engine Banner */}
      {reminders && reminders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-primary-600" /> Active Alerts & Reminders ({reminders.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reminders.map((rem, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-xs ${
                  rem.type === 'DANGER'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : rem.type === 'WARNING'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : rem.type === 'SUCCESS'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}
              >
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-1.5">{rem.title}</h4>
                  <p className="text-xs opacity-90 mt-0.5">{rem.message}</p>
                </div>
                {rem.actionLink && (
                  <Link
                    to={rem.actionLink}
                    className="btn bg-white hover:bg-gray-50 text-gray-900 text-xs font-bold py-1.5 px-3 border border-gray-200 whitespace-nowrap shadow-2xs"
                  >
                    {rem.actionLabel}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DUES BREAKDOWN ROW: Rent & Electricity Invoices */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
          Pending Invoices & Dues
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Consolidated Dues Card */}
          <div className="card bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                Total Outstanding Dues
              </span>
              <div className="text-3xl font-black text-amber-400 mt-2">
                ₹{dues.totalDue.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-gray-300 mt-2">
                Includes pending room rent and room electricity consumption bills.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/60 flex items-center justify-between text-xs">
              <span className="text-gray-400">Status:</span>
              <span className={dues.totalDue > 0 ? 'text-amber-400 font-bold' : 'text-green-400 font-bold'}>
                {dues.totalDue > 0 ? 'Payment Pending' : 'All Clear / No Dues'}
              </span>
            </div>
          </div>

          {/* Rent Due Card */}
          <div className="card p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                    Room Rent Dues
                  </span>
                  <div className="text-2xl font-black text-gray-900 mt-1">
                    ₹{dues.totalRentDue.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              {latestRent ? (
                <div className="mt-3 text-xs space-y-1">
                  <p className="text-gray-600">
                    Latest invoice: <strong>{latestRent.month}/{latestRent.year}</strong> (₹{latestRent.amount})
                  </p>
                  <p className="text-gray-500">
                    Due by: {new Date(latestRent.dueDate).toLocaleDateString()}
                  </p>
                  <div className="pt-1">
                    {latestRent.status === 'PAID' ? (
                      <span className="badge-success">Paid</span>
                    ) : latestRent.status === 'OVERDUE' ? (
                      <span className="badge-danger">Overdue</span>
                    ) : (
                      <span className="badge-warning">Pending</span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-3">No active rent invoices generated.</p>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 flex gap-2">
              {latestRent && latestRent.status !== 'PAID' ? (
                <button
                  onClick={() => handlePayRent(latestRent)}
                  className="btn btn-primary flex-1 text-xs py-2"
                >
                  Pay ₹{latestRent.amount} Now
                </button>
              ) : (
                <Link to="/student/rent" className="btn btn-outline flex-1 text-xs py-2">
                  View Rent History
                </Link>
              )}
            </div>
          </div>

          {/* Electricity Due Card */}
          <div className="card p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                    Electricity Dues
                  </span>
                  <div className="text-2xl font-black text-gray-900 mt-1">
                    ₹{dues.totalElecDue.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <Zap className="w-5 h-5" />
                </div>
              </div>

              {latestElec ? (
                <div className="mt-3 text-xs space-y-1">
                  <p className="text-gray-600">
                    Units: <strong>{latestElec.units} kWh</strong> ({latestElec.month}/{latestElec.year})
                  </p>
                  <p className="text-gray-500">
                    Due by: {new Date(latestElec.dueDate).toLocaleDateString()}
                  </p>
                  <div className="pt-1">
                    {latestElec.status === 'PAID' ? (
                      <span className="badge-success">Paid</span>
                    ) : (
                      <span className="badge-warning">Pending</span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-3">No pending electricity charges.</p>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 flex gap-2">
              {latestElec && latestElec.status !== 'PAID' ? (
                <button
                  onClick={() => handlePayElectricity(latestElec)}
                  className="btn bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold flex-1 text-xs py-2"
                >
                  Pay ₹{latestElec.amount} Now
                </button>
              ) : (
                <Link to="/student/electricity" className="btn btn-outline flex-1 text-xs py-2">
                  View Meter Bills
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DUAL AUTO POLL: Morning (To College) & Return (To PG) */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {pollObj?.date
                  ? `${pollObj.date} College Auto Transport Poll`
                  : 'College Auto Transport Poll'}
              </h2>
              <p className="text-xs text-gray-500">
                {pollObj?.branch?.name ? `Branch: ${pollObj.branch.name} • ` : ''}Vote Yes/No for both trips so autos can be arranged in advance
              </p>
            </div>
          </div>
          <Link
            to="/student/poll"
            className="text-xs text-primary-600 font-bold hover:text-primary-700 flex items-center gap-1"
          >
            Full Poll Page <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pollObj ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Morning Trip: PG -> College */}
            <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="badge-info text-[10px]">TRIP 1 • MORNING</span>
                    <h3 className="text-base font-bold text-gray-900 mt-1">PG ➔ College</h3>
                    <p className="text-xs text-gray-500">Pickup: {pollObj.morningPickupTime || '08:30 AM'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">Cutoff Time</span>
                    <span className="text-xs font-bold text-gray-700">{pollObj.morningCutoffTime}</span>
                  </div>
                </div>

                <div className="my-3 py-2 px-3 bg-white rounded-xl border border-gray-100 text-xs flex justify-between items-center">
                  <span className="text-gray-500">Your Current Status:</span>
                  <span className="font-bold">
                    {myVote?.morningVote === true ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> YES (Taking Auto)
                      </span>
                    ) : myVote?.morningVote === false ? (
                      <span className="text-red-600">NO (Not Taking)</span>
                    ) : (
                      <span className="text-amber-600 font-semibold">Not Voted Yet</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => handleQuickVote('MORNING', true)}
                  disabled={votingTrip === 'MORNING'}
                  className={`btn text-xs py-2.5 transition flex items-center justify-center gap-1.5 font-bold ${
                    myVote?.morningVote === true
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm ring-2 ring-green-300'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-green-50'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${myVote?.morningVote === true ? 'text-white' : 'text-green-600'}`} />
                  <span>{myVote?.morningVote === true ? 'Going in Auto' : 'Yes, Need Auto'}</span>
                </button>
                <button
                  onClick={() => handleQuickVote('MORNING', false)}
                  disabled={votingTrip === 'MORNING'}
                  className={`btn text-xs py-2.5 transition flex items-center justify-center gap-1.5 font-bold ${
                    myVote?.morningVote === false
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm ring-2 ring-red-300'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-red-50'
                  }`}
                >
                  <span className={myVote?.morningVote === false ? 'text-white' : 'text-red-600'}>✕</span>
                  <span>{myVote?.morningVote === false ? 'Not Taking' : 'No, Not Going'}</span>
                </button>
              </div>
            </div>

            {/* 2. Return Trip: College -> PG */}
            <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="badge-warning text-[10px]">TRIP 2 • EVENING RETURN</span>
                    <h3 className="text-base font-bold text-gray-900 mt-1">College ➔ PG</h3>
                    <p className="text-xs text-gray-500">Return Pickup: {pollObj.returnPickupTime || '04:30 PM'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">Cutoff Time</span>
                    <span className="text-xs font-bold text-gray-700">{pollObj.returnCutoffTime}</span>
                  </div>
                </div>

                <div className="my-3 py-2 px-3 bg-white rounded-xl border border-gray-100 text-xs flex justify-between items-center">
                  <span className="text-gray-500">Your Current Status:</span>
                  <span className="font-bold">
                    {myVote?.returnVote === true ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> YES (Need Return Auto)
                      </span>
                    ) : myVote?.returnVote === false ? (
                      <span className="text-red-600">NO (Self Travel / Staying back)</span>
                    ) : (
                      <span className="text-amber-600 font-semibold">Not Voted Yet</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => handleQuickVote('RETURN', true)}
                  disabled={votingTrip === 'RETURN'}
                  className={`btn text-xs py-2.5 transition flex items-center justify-center gap-1.5 font-bold ${
                    myVote?.returnVote === true
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm ring-2 ring-green-300'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-green-50'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${myVote?.returnVote === true ? 'text-white' : 'text-green-600'}`} />
                  <span>{myVote?.returnVote === true ? 'Return Auto Booked' : 'Yes, Return Ride'}</span>
                </button>
                <button
                  onClick={() => handleQuickVote('RETURN', false)}
                  disabled={votingTrip === 'RETURN'}
                  className={`btn text-xs py-2.5 transition flex items-center justify-center gap-1.5 font-bold ${
                    myVote?.returnVote === false
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm ring-2 ring-red-300'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-red-50'
                  }`}
                >
                  <span className={myVote?.returnVote === false ? 'text-white' : 'text-red-600'}>✕</span>
                  <span>{myVote?.returnVote === false ? 'No Return Auto' : 'No Return Ride'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 py-3">No active auto poll scheduled for your branch today.</p>
        )}
      </div>

      {/* SPLIT SECTION: Canteen Today & Helpdesk Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Canteen Menu + Place Order button */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-900">Today's Canteen Menu</h3>
              </div>
              <Link
                to="/student/canteen"
                className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Place Order Online
              </Link>
            </div>

            {todayMenu.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">Menu hasn't been set for today.</p>
            ) : (
              <div className="space-y-3">
                {['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'].map((meal) => {
                  const m = todayMenu.find((item) => item.mealType === meal);
                  if (!m) return null;
                  return (
                    <div key={meal} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                        {meal}
                      </span>
                      <p className="text-xs text-gray-700">
                        {m.items?.join(' • ') || 'Standard hostel meal'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Snacks & extras delivered to your room</span>
            <Link to="/student/canteen" className="font-bold text-primary-600 hover:underline">
              Browse Menu & Cart →
            </Link>
          </div>
        </div>

        {/* Support Tickets & Problem Reports */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg font-bold text-gray-900">Problems & Query Tickets</h3>
              </div>
              <button
                onClick={() => setNewTicketModal(true)}
                className="btn btn-outline text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5 text-rose-600" /> Raise New Ticket
              </button>
            </div>

            {activeTickets.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-bold text-gray-700">No Open Complaints</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Everything running smoothly! Need repairs or have questions? Raise a ticket.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTickets.slice(0, 3).map((t) => (
                  <div key={t._id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-900 truncate max-w-[200px]">
                        {t.title}
                      </span>
                      <span
                        className={`badge ${
                          t.status === 'IN_PROGRESS' ? 'badge-warning' : 'badge-info'
                        } text-[10px]`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1">{t.description}</p>
                    {t.adminResponse && (
                      <p className="text-[11px] text-emerald-700 bg-emerald-50 p-1.5 rounded font-medium mt-1">
                        Warden Response: {t.adminResponse}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>24/7 PG Care & Maintenance</span>
            <Link to="/student/tickets" className="font-bold text-primary-600 hover:underline">
              View All Tickets ({activeTickets.length}) →
            </Link>
          </div>
        </div>
      </div>

      {/* Warden Contact & Emergency Helpdesk Card (Live from Admin Settings) */}
      <div className="card p-6 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 border border-blue-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-xs">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">{contact.wardenName}</h3>
                <span className="badge-info text-[10px] py-0.5 font-bold">Warden & Resident Care</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1 font-medium text-gray-600">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> {contact.officeHours}
                </span>
                <span className="flex items-center gap-1 font-medium text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> {contact.address}
                </span>
              </p>
            </div>
          </div>
          <span className="text-xs text-blue-800 font-semibold bg-blue-50 px-3 py-1 rounded-xl border border-blue-200 shadow-2xs">
            Direct Resident Helpline
          </span>
        </div>

        {contact.notice && (
          <div className="mb-5 p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{contact.notice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Primary Call */}
          <a
            href={`tel:${contact.phone?.replace(/[^0-9+]/g, '')}`}
            className="p-3.5 bg-white hover:bg-blue-50/70 rounded-xl border border-gray-200 hover:border-blue-300 transition flex items-center gap-3 group shadow-2xs"
          >
            <div className="p-2.5 rounded-xl bg-blue-50 group-hover:bg-blue-100 text-blue-600 transition">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Primary Call</span>
              <span className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition truncate block">
                {contact.phone}
              </span>
            </div>
          </a>

          {/* 2. 24/7 Emergency Line */}
          <a
            href={`tel:${contact.emergencyPhone?.replace(/[^0-9+]/g, '')}`}
            className="p-3.5 bg-rose-50/40 hover:bg-rose-50 rounded-xl border border-rose-200 hover:border-rose-300 transition flex items-center gap-3 group shadow-2xs"
          >
            <div className="p-2.5 rounded-xl bg-rose-100 group-hover:bg-rose-200 text-rose-600 transition animate-pulse">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-rose-600 block font-bold uppercase tracking-wider">🚨 24/7 Night Line</span>
              <span className="text-xs font-bold text-rose-900 group-hover:text-rose-700 transition truncate block">
                {contact.emergencyPhone}
              </span>
            </div>
          </a>

          {/* 3. WhatsApp Support */}
          <a
            href={`https://wa.me/${contact.whatsapp?.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 bg-emerald-50/40 hover:bg-emerald-50 rounded-xl border border-emerald-200 hover:border-emerald-300 transition flex items-center gap-3 group shadow-2xs"
          >
            <div className="p-2.5 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 text-emerald-600 transition">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-emerald-600 block font-bold uppercase tracking-wider">WhatsApp Warden</span>
              <span className="text-xs font-bold text-emerald-900 group-hover:text-emerald-700 transition truncate block">
                Chat on WhatsApp
              </span>
            </div>
          </a>

          {/* 4. Support Email */}
          <a
            href={`mailto:${contact.email}`}
            className="p-3.5 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition flex items-center gap-3 group shadow-2xs"
          >
            <div className="p-2.5 rounded-xl bg-gray-100 group-hover:bg-gray-200 text-gray-700 transition">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Official Email</span>
              <span className="text-xs font-bold text-gray-800 truncate block">
                {contact.email}
              </span>
            </div>
          </a>
        </div>
      </div>

      {/* Notice Board Feed */}
      <div className="card p-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-bold text-gray-900">Hostel Notice Board</h3>
          </div>
        </div>

        {announcements.length === 0 ? (
          <p className="text-xs text-gray-400 py-3">No announcements posted.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.slice(0, 4).map((a) => (
              <div
                key={a._id}
                className={`p-4 rounded-2xl border ${
                  a.pinned ? 'bg-amber-50/40 border-amber-200' : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    {a.pinned && <span className="badge-warning text-[9px] py-0">PINNED</span>}
                    {a.title}
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mt-1">{a.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raise Ticket Modal */}
      {newTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Raise a Problem / Query Ticket</h3>
            <p className="text-xs text-gray-500 mb-4">
              Report room issues, plumbing, electrical, Wi-Fi, food, or general queries.
            </p>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="label">Issue Category *</label>
                <select
                  className="input"
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                >
                  <option value="ROOM_MAINTENANCE">Room Maintenance (Furniture, Doors, Windows)</option>
                  <option value="PLUMBING">Plumbing (Washbasin, Geyser, Water, Tap)</option>
                  <option value="ELECTRICAL">Electrical (Lights, Fan, Switchboard)</option>
                  <option value="WIFI_INTERNET">Wi-Fi & Internet Speed / Connectivity</option>
                  <option value="FOOD_CANTEEN">Food & Canteen Feedback</option>
                  <option value="CLEANING_HYGIENE">Cleaning & Bathroom Sanitation</option>
                  <option value="RENT_BILLING">Rent & Billing Inquiries</option>
                  <option value="GENERAL_QUERY">General Resident Query</option>
                  <option value="OTHER">Other Problem</option>
                </select>
              </div>

              <div>
                <label className="label">Issue Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Geyser in room 101 not heating water"
                  className="input"
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Detailed Description *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Explain when the problem started or details to help the technician..."
                  className="input"
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Priority Level</label>
                <select
                  className="input"
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                >
                  <option value="LOW">Low (Can be addressed in 2-3 days)</option>
                  <option value="MEDIUM">Medium (Normal repair within 24 hours)</option>
                  <option value="HIGH">High (Urgent same-day attention)</option>
                  <option value="URGENT">Urgent (Immediate emergency)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNewTicketModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" disabled={ticketSubmitting} className="btn btn-primary">
                  {ticketSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
        title={paymentModal.title}
        amount={paymentModal.amount}
        onConfirm={paymentModal.onConfirm}
      />
    </div>
  );
};
