import React, { useState, useEffect } from 'react';
import { menuApi } from '../../api';
import { Utensils, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentMenu = () => {
  const [weekMenu, setWeekMenu] = useState([]);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    menuApi.getWeek()
      .then((res) => {
        if (res.data.success) {
          setWeekMenu(res.data.data);
          setDates(res.data.dates || []);
          const today = new Date().toISOString().split('T')[0];
          setSelectedDate(res.data.dates?.includes(today) ? today : res.data.dates[0] || '');
        }
      })
      .catch((err) => toast.error('Failed to load menu schedule'))
      .finally(() => setLoading(false));
  }, []);

  const currentDayMenu = weekMenu.filter((m) => m.date === selectedDate);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hostel Food & Canteen Menu</h1>
          <p className="text-sm text-gray-500">Weekly rotating breakfast, lunch, and dinner timetable</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Day Selector Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {dates.map((d) => {
              const dateObj = new Date(d);
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              const isSelected = d === selectedDate;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`px-4 py-2.5 rounded-xl font-medium text-xs whitespace-nowrap transition flex flex-col items-center min-w-[72px] ${
                    isSelected
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-bold text-sm">{dayName}</span>
                  <span className={isSelected ? 'text-primary-100' : 'text-gray-400'}>
                    {dateObj.getDate()}/{dateObj.getMonth() + 1}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Meals for Selected Day */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['BREAKFAST', 'LUNCH', 'DINNER'].map((mealType) => {
              const item = currentDayMenu.find((m) => m.mealType === mealType);
              const mealTime =
                mealType === 'BREAKFAST'
                  ? '7:30 AM – 9:30 AM'
                  : mealType === 'LUNCH'
                  ? '12:30 PM – 2:30 PM'
                  : '7:30 PM – 10:00 PM';

              return (
                <div key={mealType} className="card p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                        {mealType}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">{mealTime}</span>
                    </div>

                    {item && item.items?.length > 0 ? (
                      <ul className="space-y-2">
                        {item.items.map((food, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-800">
                            <span className="w-2 h-2 rounded-full bg-primary-500" />
                            {food}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-400 italic py-6 text-center">
                        Menu not finalized yet for this meal.
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
                    <span>Unlimited refills</span>
                    <span className="font-medium text-green-600">Freshly Cooked</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

