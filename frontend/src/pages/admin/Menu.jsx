import React, { useState, useEffect } from 'react';
import { menuApi, branchApi } from '../../api';
import { AdminNav } from '../../components/AdminNav';
import { 
  Plus, 
  Utensils, 
  X, 
  Trash2, 
  Calendar, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const MEAL_TYPES = [
  { key: 'BREAKFAST', title: '🌅 Breakfast', time: '07:30 AM – 10:00 AM', color: 'from-amber-500/10 to-orange-500/10 border-amber-200' },
  { key: 'LUNCH', title: '🍛 Lunch', time: '12:30 PM – 02:30 PM', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200' },
  { key: 'SNACKS', title: '☕ Snacks & Tea', time: '05:00 PM – 06:30 PM', color: 'from-yellow-500/10 to-amber-500/10 border-yellow-200' },
  { key: 'DINNER', title: '🌙 Dinner', time: '08:00 PM – 10:00 PM', color: 'from-indigo-500/10 to-blue-500/10 border-indigo-200' },
  { key: 'BEVERAGES', title: '🥤 Beverages & Specials', time: 'Canteen Hours (All Day)', color: 'from-rose-500/10 to-pink-500/10 border-rose-200' },
];

export const AdminMenu = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [menuList, setMenuList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    mealType: 'BREAKFAST',
    branch: 'ALL',
    date: new Date().toISOString().split('T')[0],
    itemsStr: '',
    existingId: null,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const params = { date: selectedDate };
      if (selectedBranch && selectedBranch !== 'ALL') {
        params.branch = selectedBranch;
      }

      const [brRes, menuRes] = await Promise.all([
        branchApi.getAll(),
        menuApi.getToday(params),
      ]);

      if (brRes.data.success) {
        setBranches(brRes.data.data);
      }
      if (menuRes.data.success) {
        setMenuList(menuRes.data.data);
      }
    } catch (err) {
      toast.error('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranch, selectedDate]);

  const handleOpenEdit = (mealType) => {
    const existing = menuList.find((m) => m.mealType === mealType);
    setForm({
      mealType,
      branch: selectedBranch,
      date: selectedDate,
      itemsStr: existing && existing.items ? existing.items.join(', ') : '',
      existingId: existing?._id || null,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const items = form.itemsStr.split(',').map((s) => s.trim()).filter(Boolean);
    if (items.length === 0) {
      toast.error('Please enter at least one food item or dish');
      return;
    }

    setSaving(true);
    try {
      const res = await menuApi.upsert({
        branch: form.branch === 'ALL' ? undefined : form.branch,
        date: form.date,
        mealType: form.mealType,
        items,
      });

      toast.success(res.data?.message || `${form.mealType} menu updated!`);
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update menu');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMenu = async (id, mealType) => {
    if (!window.confirm(`Are you sure you want to clear the ${mealType} menu for this day?`)) return;

    try {
      const res = await menuApi.delete(id);
      if (res.data.success) {
        toast.success(res.data.message || 'Menu cleared');
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to clear menu');
    }
  };

  // Helper date buttons
  const setQuickDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div>
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Manage Canteen & Food Menu</h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure daily breakfast, lunch, snacks, and dinner schedules across PG branches
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleOpenEdit('BREAKFAST')}
              className="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs flex items-center gap-2 text-xs"
            >
              <Plus className="w-4 h-4" /> Add / Edit Meal Menu
            </button>
            <button
              onClick={loadData}
              title="Refresh"
              className="btn bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 p-2.5"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Date and Branch Filter Controls */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary-600" /> Select Date:
            </span>
            <button
              onClick={() => setQuickDate(0)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition ${
                isToday ? 'bg-primary-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition ${
                selectedDate === new Date(Date.now() + 86400000).toISOString().split('T')[0]
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tomorrow
            </button>
            <input
              type="date"
              className="input text-xs py-1.5 w-auto"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-600" /> Branch:
            </span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="input text-xs py-1.5 w-auto"
            >
              <option value="ALL">All Branches ({branches.length})</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Meal Cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MEAL_TYPES.map((meal) => {
              const item = menuList.find((m) => m.mealType === meal.key);
              const hasItems = item && item.items && item.items.length > 0;

              return (
                <div
                  key={meal.key}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col justify-between hover:shadow-md transition duration-150"
                >
                  <div>
                    <div className="flex justify-between items-start pb-3 border-b border-gray-100 mb-4">
                      <div>
                        <h3 className="font-extrabold text-gray-900 text-base">{meal.title}</h3>
                        <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-primary-500" /> {meal.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(meal.key)}
                          className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-xl transition"
                        >
                          {hasItems ? 'Edit' : '+ Add'}
                        </button>
                        {item && (
                          <button
                            onClick={() => handleDeleteMenu(item._id, meal.title)}
                            title="Clear Menu"
                            className="text-gray-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {hasItems ? (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Menu Items ({item.items.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.items.map((dish, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-50 text-gray-800 px-2.5 py-1 rounded-xl border border-gray-100 font-medium"
                            >
                              {dish}
                            </span>
                          ))}
                        </div>
                        {item.branch && (
                          <span className="text-[10px] text-gray-400 block mt-2">
                            Branch: {item.branch.name || 'All'}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        <Utensils className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 font-medium">No menu configured for this meal.</p>
                        <button
                          onClick={() => handleOpenEdit(meal.key)}
                          className="mt-3 text-xs font-bold text-primary-600 hover:text-primary-700"
                        >
                          + Set {meal.title} Items
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Add or Edit Menu */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in zoom-in duration-150">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg">
                      Configure {form.mealType} Menu
                    </h3>
                    <p className="text-xs text-gray-500">Live for student dashboard & canteen ordering</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Meal Type *
                    </label>
                    <select
                      value={form.mealType}
                      onChange={(e) => {
                        const newType = e.target.value;
                        const match = menuList.find((m) => m.mealType === newType);
                        setForm({
                          ...form,
                          mealType: newType,
                          itemsStr: match && match.items ? match.items.join(', ') : '',
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
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
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
                    value={form.branch}
                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
                    className="input w-full text-sm"
                  >
                    <option value="ALL">Apply to All Branches ({branches.length})</option>
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
                    value={form.itemsStr}
                    onChange={(e) => setForm({ ...form, itemsStr: e.target.value })}
                  />
                </div>

                {/* Quick preset suggestions */}
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Quick Presets (Click to insert):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {form.mealType === 'BREAKFAST' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, itemsStr: 'Masala Dosa, Sambhar, Coconut Chutney, Filter Coffee' })}
                          className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                        >
                          + Dosa & Sambhar
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, itemsStr: 'Aloo Paratha, Curd, Mixed Pickle, Masala Chai' })}
                          className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                        >
                          + Aloo Paratha & Chai
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, itemsStr: 'Poha with Roasted Peanuts, Sev, Jalebi, Tea' })}
                          className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                        >
                          + Poha & Jalebi
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, itemsStr: 'Idli, Medu Vada, Coconut Chutney, Sambhar, Filter Coffee' })}
                          className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                        >
                          + Idli Vada
                        </button>
                      </>
                    )}
                    {form.mealType === 'LUNCH' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, itemsStr: 'Dal Tadka, Steamed Basmati Rice, Paneer Butter Masala, Fresh Roti, Salad' })}
                          className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                        >
                          + Paneer & Dal Tadka
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, itemsStr: 'Rajma Masala, Jeera Rice, Boondi Raita, Mixed Veg, Gulab Jamun' })}
                          className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                        >
                          + Rajma Chawal Special
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, itemsStr: 'Chole Masala, Bhature, Onion Lachha Salad, Mint Chutney, Chaas' })}
                          className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                        >
                          + Chole Bhature
                        </button>
                      </>
                    )}
                    {form.mealType === 'SNACKS' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, itemsStr: 'Crispy Veg Samosas, Mint & Tamarind Chutney, Hot Adrak Chai' })}
                          className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                        >
                          + Samosa & Chai
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, itemsStr: 'Cheese Grilled Sandwich, French Fries, Cold Coffee' })}
                          className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                        >
                          + Sandwich & Cold Coffee
                        </button>
                      </>
                    )}
                    {form.mealType === 'DINNER' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, itemsStr: 'Dal Makhani, Butter Naan / Roti, Jeera Rice, Kadhai Paneer, Ice Cream' })}
                          className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                        >
                          + Dal Makhani & Paneer
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, itemsStr: 'Yellow Moong Dal, Steamed Rice, Chapati, Aloo Gobhi Matar, Kheer' })}
                          className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium"
                        >
                          + Light Home-Style Dinner
                        </button>
                      </>
                    )}
                    {form.mealType === 'BEVERAGES' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, itemsStr: 'Sweet Punjabi Lassi, Fresh Lime Soda, Cold Coffee, Mineral Water' })}
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
                    onClick={() => setModalOpen(false)}
                    className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2"
                  >
                    {saving ? 'Saving...' : 'Save & Publish Menu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
