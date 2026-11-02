import React, { useState, useEffect } from 'react';
import { electricityApi, studentApi, roomApi } from '../../api';
import { AdminNav } from '../../components/AdminNav';
import { Plus, Trash2, X, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminElectricity = () => {
  const [bills, setBills] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const now = new Date();
  const [form, setForm] = useState({
    student: '',
    room: '',
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    units: 50,
    amount: 400,
    dueDate: new Date(now.getFullYear(), now.getMonth(), 10).toISOString().split('T')[0],
  });

  const loadData = async () => {
    try {
      const [bRes, sRes, rRes] = await Promise.all([
        electricityApi.getAll(),
        studentApi.getAll(),
        roomApi.getAll(),
      ]);
      if (bRes.data.success) setBills(bRes.data.data);
      if (sRes.data.success) setStudents(sRes.data.data);
      if (rRes.data.success) setRooms(rRes.data.data);
    } catch (err) {
      toast.error('Failed to load electricity data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStudentSelect = (studentId) => {
    const student = students.find((s) => s._id === studentId);
    setForm({
      ...form,
      student: studentId,
      room: student?.room?._id || student?.room || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bill?')) return;
    try {
      await electricityApi.delete(id);
      toast.success('Bill deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await electricityApi.create(form);
      toast.success('Electricity bill created');
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create bill');
    }
  };

  return (
    <div>
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Electricity Bills</h1>
            <p className="text-sm text-gray-500">Record meter readings and assign monthly electricity dues</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Add Bill
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-3.5 text-left">Student</th>
                  <th className="px-6 py-3.5 text-left">Room</th>
                  <th className="px-6 py-3.5 text-left">Month/Year</th>
                  <th className="px-6 py-3.5 text-left">Units</th>
                  <th className="px-6 py-3.5 text-left">Amount</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bills.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-gray-900">{b.student?.name}</td>
                    <td className="px-6 py-4 text-gray-600">Room {b.room?.roomNumber || 'N/A'}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {b.month}/{b.year}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{b.units} kWh</td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      ₹{b.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      {b.status === 'PAID' ? (
                        <span className="badge-success">PAID</span>
                      ) : (
                        <span className="badge-warning">PENDING</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(b._id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Electricity Bill</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Student *</label>
                <select
                  required
                  className="input"
                  value={form.student}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                >
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.room?.roomNumber ? `Room ${s.room.roomNumber}` : 'No Room'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Room *</label>
                <select
                  required
                  className="input"
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                >
                  <option value="">Select Room</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      Room {r.roomNumber} ({r.branch?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Month</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    className="input"
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Year</label>
                  <input
                    type="number"
                    className="input"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Units (kWh)</label>
                  <input
                    type="number"
                    className="input"
                    value={form.units}
                    onChange={(e) => setForm({ ...form, units: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Due Date *</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

