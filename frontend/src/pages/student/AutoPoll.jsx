import React, { useState, useEffect } from 'react';
import { pollApi } from '../../api';
import { 
  Car, 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentAutoPoll = () => {
  const [pollData, setPollData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDateTab, setActiveDateTab] = useState('ACTIVE'); // 'ACTIVE' | 'TODAY' | 'TOMORROW'

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const loadPoll = async (dateParam = null) => {
    setLoading(true);
    try {
      const params = dateParam ? { date: dateParam } : {};
      const res = await pollApi.getToday(params);
      if (res.data.success) {
        setPollData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load auto poll data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPoll();
  }, []);

  const handleSelectDateTab = (tab) => {
    setActiveDateTab(tab);
    if (tab === 'TODAY') {
      loadPoll(getTodayStr());
    } else if (tab === 'TOMORROW') {
      loadPoll(getTomorrowStr());
    } else {
      loadPoll(null); // Load latest active/upcoming
    }
  };

  const handleVote = async (tripType, willTakeAuto) => {
    try {
      const res = await pollApi.vote({
        pollId: poll?._id,
        tripType,
        willTakeAuto,
      });
      if (res.data.success) {
        toast.success(
          `${tripType === 'MORNING' ? 'Morning ride' : 'Return ride'} recorded: ${
            willTakeAuto ? 'YES, Going in auto' : 'NO, Not taking auto'
          }`
        );
        // Refresh with current tab
        if (activeDateTab === 'TODAY') loadPoll(getTodayStr());
        else if (activeDateTab === 'TOMORROW') loadPoll(getTomorrowStr());
        else loadPoll(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Voting failed');
    }
  };

  const poll = pollData?.poll;
  const myVote = pollData?.myVote;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Car className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Daily College Auto Transport Service
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Vote for both the <strong>morning drop to college</strong> and the <strong>evening return trip to the PG</strong> so we can arrange the exact number of autos.
        </p>

        {/* Date Filter Tabs */}
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => handleSelectDateTab('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeDateTab === 'ACTIVE'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            ⚡ Latest Scheduled Poll
          </button>
          <button
            onClick={() => handleSelectDateTab('TODAY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeDateTab === 'TODAY'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Today ({getTodayStr()})
          </button>
          <button
            onClick={() => handleSelectDateTab('TOMORROW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeDateTab === 'TOMORROW'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Tomorrow ({getTomorrowStr()})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : !poll ? (
        <div className="card text-center py-16 text-gray-400 space-y-2">
          <Car className="w-12 h-12 mx-auto mb-2 opacity-50 text-purple-400" />
          <h3 className="font-bold text-gray-700 text-base">No Auto Poll Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {activeDateTab === 'TOMORROW'
              ? "Tomorrow's auto poll has not been scheduled yet by the warden. Check back in the evening or click 'Latest Scheduled Poll' above."
              : "No auto poll has been scheduled yet for this date. Check with the PG warden or click 'Tomorrow' to check upcoming schedules."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* General Poll Info Banner */}
          <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-purple-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span>
                Schedule for: <strong>{poll.date}</strong> ({poll.branch?.name || 'All Branches'})
              </span>
            </div>
            <span className="text-purple-800 font-semibold bg-white/80 px-2.5 py-1 rounded-lg border border-purple-100">
              Autos depart sharp from PG main gate
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 1. TRIP 1: PG -> College (Morning) */}
            <div className="card p-6 flex flex-col justify-between border-2 border-primary-100 shadow-sm hover:border-primary-300 transition">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="badge-info text-xs font-bold py-1">
                    TRIP 1 • MORNING
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">Cutoff Time</span>
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {poll.morningCutoffTime || '21:00'}
                    </span>
                  </div>
                </div>

                <h2 className="text-xl font-black text-gray-900">PG ➔ College</h2>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 my-2">
                  <Clock className="w-4 h-4 text-primary-600" />
                  <span>Pickup Time: <strong>{poll.morningPickupTime || '08:30 AM'}</strong></span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Morning shared auto drops students directly at college campus gates.
                </p>

                {/* Vote Status Indicator */}
                <div className="my-5 p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <span className="text-gray-500 block mb-1">Your Morning Selection:</span>
                  {myVote?.morningVote === true ? (
                    <div className="flex items-center gap-1.5 text-green-700 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4" /> YES, Going in Auto
                    </div>
                  ) : myVote?.morningVote === false ? (
                    <div className="text-red-600 font-bold text-sm">
                      ✕ NO, Not Taking Auto
                    </div>
                  ) : (
                    <div className="text-amber-600 font-semibold italic">
                      Vote pending (Please select below)
                    </div>
                  )}
                </div>
              </div>

              {/* Vote Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleVote('MORNING', true)}
                  disabled={pollData?.morningCutoffPassed}
                  className={`btn py-3 text-xs flex flex-col items-center justify-center gap-1 ${
                    myVote?.morningVote === true
                      ? 'bg-green-600 text-white shadow-md'
                      : 'border border-gray-200 hover:bg-green-50 text-gray-700'
                  }`}
                >
                  <ThumbsUp className={`w-5 h-5 ${myVote?.morningVote === true ? 'text-white' : 'text-green-600'}`} />
                  <span className="font-bold">YES, Going</span>
                </button>

                <button
                  onClick={() => handleVote('MORNING', false)}
                  disabled={pollData?.morningCutoffPassed}
                  className={`btn py-3 text-xs flex flex-col items-center justify-center gap-1 ${
                    myVote?.morningVote === false
                      ? 'bg-red-600 text-white shadow-md'
                      : 'border border-gray-200 hover:bg-red-50 text-gray-700'
                  }`}
                >
                  <ThumbsDown className={`w-5 h-5 ${myVote?.morningVote === false ? 'text-white' : 'text-red-600'}`} />
                  <span className="font-bold">NO, Not Taking</span>
                </button>
              </div>
            </div>

            {/* 2. TRIP 2: College -> PG (Evening Return) */}
            <div className="card p-6 flex flex-col justify-between border-2 border-amber-100 shadow-sm hover:border-amber-300 transition">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="badge-warning text-xs font-bold py-1">
                    TRIP 2 • EVENING RETURN
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">Cutoff Time</span>
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {poll.returnCutoffTime || '14:00'}
                    </span>
                  </div>
                </div>

                <h2 className="text-xl font-black text-gray-900">College ➔ PG (Return)</h2>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 my-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Return Pickup: <strong>{poll.returnPickupTime || '04:30 PM'}</strong></span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Evening auto brings you safely back to Sunil PG after classes end.
                </p>

                {/* Vote Status Indicator */}
                <div className="my-5 p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <span className="text-gray-500 block mb-1">Your Return Selection:</span>
                  {myVote?.returnVote === true ? (
                    <div className="flex items-center gap-1.5 text-green-700 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4" /> YES, Need Return Ride
                    </div>
                  ) : myVote?.returnVote === false ? (
                    <div className="text-red-600 font-bold text-sm">
                      ✕ NO, Will Not Need Auto
                    </div>
                  ) : (
                    <div className="text-amber-600 font-semibold italic">
                      Vote pending (Please select below)
                    </div>
                  )}
                </div>
              </div>

              {/* Vote Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleVote('RETURN', true)}
                  disabled={pollData?.returnCutoffPassed}
                  className={`btn py-3 text-xs flex flex-col items-center justify-center gap-1 ${
                    myVote?.returnVote === true
                      ? 'bg-green-600 text-white shadow-md'
                      : 'border border-gray-200 hover:bg-green-50 text-gray-700'
                  }`}
                >
                  <ThumbsUp className={`w-5 h-5 ${myVote?.returnVote === true ? 'text-white' : 'text-green-600'}`} />
                  <span className="font-bold">YES, Return Auto</span>
                </button>

                <button
                  onClick={() => handleVote('RETURN', false)}
                  disabled={pollData?.returnCutoffPassed}
                  className={`btn py-3 text-xs flex flex-col items-center justify-center gap-1 ${
                    myVote?.returnVote === false
                      ? 'bg-red-600 text-white shadow-md'
                      : 'border border-gray-200 hover:bg-red-50 text-gray-700'
                  }`}
                >
                  <ThumbsDown className={`w-5 h-5 ${myVote?.returnVote === false ? 'text-white' : 'text-red-600'}`} />
                  <span className="font-bold">NO Return Ride</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-500 text-center">
            💡 <strong>Helpful Note:</strong> You can change your choice anytime before the respective cutoff times. After cutoff, the driver list is locked.
          </div>
        </div>
      )}
    </div>
  );
};
