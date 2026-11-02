import React, { useState, useEffect } from 'react';
import { pollApi, branchApi } from '../../api';
import { AdminNav } from '../../components/AdminNav';
import { 
  Car, 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  Plus, 
  Users, 
  Calendar, 
  Trash2, 
  X, 
  CheckCircle2,
  Phone,
  DoorClosed,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminAutoPoll = () => {
  const [summary, setSummary] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Default date to today or tomorrow
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(getTodayStr());

  const [form, setForm] = useState({
    branchId: 'ALL',
    date: getTodayStr(),
    morningCutoffTime: '21:00',
    morningPickupTime: '08:30 AM',
    returnCutoffTime: '14:00',
    returnPickupTime: '04:30 PM',
    question: 'Daily College Auto Transport Service',
  });

  const loadData = async () => {
    try {
      const [sumRes, brRes] = await Promise.all([
        pollApi.getSummary({ date: selectedDate }),
        branchApi.getAll(),
      ]);
      if (sumRes.data.success) setSummary(sumRes.data.data);
      if (brRes.data.success) setBranches(brRes.data.data);
    } catch (err) {
      toast.error('Failed to load auto poll data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const handleOpenAdd = (targetDate = selectedDate) => {
    setForm({
      branchId: 'ALL',
      date: targetDate,
      morningCutoffTime: '21:00',
      morningPickupTime: '08:30 AM',
      returnCutoffTime: '14:00',
      returnPickupTime: '04:30 PM',
      question: 'Daily College Auto Transport Service',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await pollApi.create(form);
      if (res.data.success) {
        toast.success(res.data.message || 'Auto poll scheduled successfully!');
        setModalOpen(false);
        // If poll was created for a different date, switch to that date
        if (form.date !== selectedDate) {
          setSelectedDate(form.date);
        } else {
          loadData();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to setup auto poll');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePoll = async (id, branchName) => {
    if (!window.confirm(`Remove auto poll for ${branchName || 'this branch'} on ${selectedDate}?`)) return;
    try {
      const res = await pollApi.delete(id);
      if (res.data.success) {
        toast.success('Auto poll removed');
        loadData();
      }
    } catch (err) {
      toast.error('Failed to remove poll');
    }
  };

  return (
    <div>
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header & Date Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                College Auto Transport Polls
              </h1>
              <span className="badge-info text-xs">Morning & Return Trips</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Setup daily morning pickup & evening return polls, monitor passenger headcounts, and estimate autos needed.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedDate(getTodayStr())}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                selectedDate === getTodayStr()
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Today ({getTodayStr()})
            </button>
            <button
              onClick={() => setSelectedDate(getTomorrowStr())}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                selectedDate === getTomorrowStr()
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Tomorrow ({getTomorrowStr()})
            </button>
            <input
              type="date"
              className="input py-1.5 px-3 text-xs max-w-[140px]"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button
              onClick={() => handleOpenAdd(selectedDate)}
              className="btn btn-primary font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Setup Auto Poll
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : summary.length === 0 ? (
          <div className="card text-center py-16 text-gray-400 space-y-3">
            <Car className="w-12 h-12 mx-auto text-purple-400 opacity-60" />
            <h3 className="text-lg font-bold text-gray-700">No Auto Polls Configured for {selectedDate}</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Students cannot vote until a poll is scheduled. Click "Setup Auto Poll" to enable voting across your PG branches.
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleOpenAdd(selectedDate)}
                className="btn btn-primary text-xs py-2 px-4 font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Setup Poll for {selectedDate}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {summary.map((item) => {
              const poll = item.poll;
              const morning = item.morning || { yes: item.yes || 0, no: item.no || 0, voters: item.voters || [] };
              const returnTrip = item.returnTrip || { yes: 0, no: 0, voters: [] };
              const autosMorning = Math.ceil((morning.yes || 0) / 3);
              const autosReturn = Math.ceil((returnTrip.yes || 0) / 3);

              return (
                <div key={poll._id} className="card p-6 shadow-sm border border-gray-100 space-y-6">
                  {/* Branch & Schedule Info Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                        <h2 className="text-xl font-black text-gray-900">{poll.branch?.name || 'All Branches'}</h2>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Date: <strong>{poll.date}</strong> • {poll.question || 'Daily College Auto Transport'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeletePoll(poll._id, poll.branch?.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition"
                        title="Delete this poll"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Dual Trip Cards: Morning & Return */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 1. MORNING TRIP (PG -> College) */}
                    <div className="bg-purple-50/40 rounded-2xl p-5 border border-purple-100 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="badge-info text-xs font-bold py-0.5">
                            TRIP 1 • MORNING DROP
                          </span>
                          <span className="text-xs text-gray-500">
                            Cutoff: <strong className="text-gray-900">{poll.morningCutoffTime || '21:00'}</strong>
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between mb-2">
                          <h3 className="text-lg font-black text-gray-900">PG ➔ College</h3>
                          <span className="text-xs font-semibold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded">
                            Pickup: {poll.morningPickupTime || '08:30 AM'}
                          </span>
                        </div>

                        {/* Headcount metrics */}
                        <div className="grid grid-cols-3 gap-2 my-4">
                          <div className="bg-white p-3 rounded-xl border border-purple-100 text-center">
                            <span className="text-2xl font-black text-green-700 block">
                              {morning.yes || 0}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-green-800">
                              Taking Auto
                            </span>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-purple-100 text-center">
                            <span className="text-2xl font-black text-red-600 block">
                              {morning.no || 0}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-red-700">
                              Not Taking
                            </span>
                          </div>

                          <div className="bg-purple-600 text-white p-3 rounded-xl text-center">
                            <span className="text-2xl font-black block">
                              {autosMorning}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-purple-100">
                              Autos Needed
                            </span>
                          </div>
                        </div>

                        {/* Passenger List */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-purple-600" /> Morning Passengers ({morning.voters?.length || 0})
                          </h4>
                          {!morning.voters || morning.voters.length === 0 ? (
                            <p className="text-xs text-gray-400 italic py-2">No students have voted YES yet.</p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                              {morning.voters.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white text-gray-800 border border-gray-200 shadow-2xs"
                                >
                                  <span className="font-bold">{s.name}</span>
                                  {s.room && <span className="text-primary-700 text-[10px] bg-primary-50 px-1 rounded">Rm {s.room}</span>}
                                  {s.phone && <span className="text-gray-400 text-[10px]">{s.phone}</span>}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 2. RETURN TRIP (College -> PG) */}
                    <div className="bg-amber-50/40 rounded-2xl p-5 border border-amber-100 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="badge-warning text-xs font-bold py-0.5">
                            TRIP 2 • EVENING RETURN
                          </span>
                          <span className="text-xs text-gray-500">
                            Cutoff: <strong className="text-gray-900">{poll.returnCutoffTime || '14:00'}</strong>
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between mb-2">
                          <h3 className="text-lg font-black text-gray-900">College ➔ PG</h3>
                          <span className="text-xs font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                            Return Pickup: {poll.returnPickupTime || '04:30 PM'}
                          </span>
                        </div>

                        {/* Headcount metrics */}
                        <div className="grid grid-cols-3 gap-2 my-4">
                          <div className="bg-white p-3 rounded-xl border border-amber-100 text-center">
                            <span className="text-2xl font-black text-green-700 block">
                              {returnTrip.yes || 0}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-green-800">
                              Taking Return
                            </span>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-amber-100 text-center">
                            <span className="text-2xl font-black text-red-600 block">
                              {returnTrip.no || 0}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-red-700">
                              Not Taking
                            </span>
                          </div>

                          <div className="bg-amber-600 text-white p-3 rounded-xl text-center">
                            <span className="text-2xl font-black block">
                              {autosReturn}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-amber-100">
                              Autos Needed
                            </span>
                          </div>
                        </div>

                        {/* Passenger List */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-amber-600" /> Return Passengers ({returnTrip.voters?.length || 0})
                          </h4>
                          {!returnTrip.voters || returnTrip.voters.length === 0 ? (
                            <p className="text-xs text-gray-400 italic py-2">No students have voted YES yet.</p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                              {returnTrip.voters.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white text-gray-800 border border-gray-200 shadow-2xs"
                                >
                                  <span className="font-bold">{s.name}</span>
                                  {s.room && <span className="text-primary-700 text-[10px] bg-primary-50 px-1 rounded">Rm {s.room}</span>}
                                  {s.phone && <span className="text-gray-400 text-[10px]">{s.phone}</span>}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Setup Auto Poll Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Car className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Setup College Auto Poll</h2>
            </div>
            <p className="text-xs text-gray-500 mb-6">
              Configure morning pickup and evening return auto schedules for student voting.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Target Branch *</label>
                <select
                  required
                  className="input font-medium"
                  value={form.branchId}
                  onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                >
                  <option value="ALL">✨ All PG Branches (Apply to all)</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Poll Schedule Date *</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>

              {/* Trip 1: Morning Settings */}
              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900 block">
                  1. Morning Trip (PG ➔ College)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Pickup Time</label>
                    <input
                      type="text"
                      required
                      placeholder="08:30 AM"
                      className="input text-xs"
                      value={form.morningPickupTime}
                      onChange={(e) => setForm({ ...form, morningPickupTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Voting Cutoff (24h)</label>
                    <input
                      type="text"
                      required
                      placeholder="21:00"
                      className="input text-xs"
                      value={form.morningCutoffTime}
                      onChange={(e) => setForm({ ...form, morningCutoffTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Trip 2: Evening Return Settings */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
                  2. Evening Return Trip (College ➔ PG)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Return Pickup Time</label>
                    <input
                      type="text"
                      required
                      placeholder="04:30 PM"
                      className="input text-xs"
                      value={form.returnPickupTime}
                      onChange={(e) => setForm({ ...form, returnPickupTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Voting Cutoff (24h)</label>
                    <input
                      type="text"
                      required
                      placeholder="14:00"
                      className="input text-xs"
                      value={form.returnCutoffTime}
                      onChange={(e) => setForm({ ...form, returnCutoffTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="label text-xs">Poll Notice / Title</label>
                <input
                  type="text"
                  className="input text-xs"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary font-bold shadow-xs"
                >
                  {submitting ? 'Saving Poll...' : 'Schedule Auto Poll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
