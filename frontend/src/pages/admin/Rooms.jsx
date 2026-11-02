import React, { useState, useEffect } from 'react';
import { roomApi, branchApi } from '../../api';
import { AdminNav } from '../../components/AdminNav';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form, setForm] = useState({
    branch: '',
    roomNumber: '',
    capacity: 1,
    monthlyRent: '',
    floor: '',
    type: 'SINGLE',
  });

  const loadData = async () => {
    try {
      const [roomsRes, branchesRes] = await Promise.all([
        roomApi.getAll(selectedBranch ? { branch: selectedBranch } : {}),
        branchApi.getAll(),
      ]);
      if (roomsRes.data.success) setRooms(roomsRes.data.data);
      if (branchesRes.data.success) setBranches(branchesRes.data.data);
    } catch (err) {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranch]);

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setForm({
      branch: branches[0]?._id || '',
      roomNumber: '',
      capacity: 1,
      monthlyRent: '',
      floor: '1',
      type: 'SINGLE',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setForm({
      branch: room.branch?._id || room.branch,
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      monthlyRent: room.monthlyRent,
      floor: room.floor || '',
      type: room.type || 'SINGLE',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await roomApi.delete(id);
      toast.success('Room deleted');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await roomApi.update(editingRoom._id, form);
        toast.success('Room updated');
      } else {
        await roomApi.create(form);
        toast.success('Room created');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  return (
    <div>
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Rooms</h1>
            <p className="text-sm text-gray-500">Configure room pricing, capacities, and types</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="input py-2 text-xs"
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus className="w-4 h-4" /> Add Room
            </button>
          </div>
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
                  <th className="px-6 py-3.5 text-left">Room #</th>
                  <th className="px-6 py-3.5 text-left">Branch</th>
                  <th className="px-6 py-3.5 text-left">Floor</th>
                  <th className="px-6 py-3.5 text-left">Type / Sharing</th>
                  <th className="px-6 py-3.5 text-left">Monthly Rent</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rooms.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-gray-900">{r.roomNumber}</td>
                    <td className="px-6 py-4 text-gray-600">{r.branch?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-500">{r.floor ? `Floor ${r.floor}` : '-'}</td>
                    <td className="px-6 py-4">
                      <span className="badge-info">{r.type} ({r.capacity} Bed)</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ₹{r.monthlyRent.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="p-1 text-gray-500 hover:text-primary-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="p-1 text-gray-500 hover:text-red-600"
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
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingRoom ? 'Edit Room' : 'Add New Room'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Branch *</label>
                <select
                  required
                  className="input"
                  value={form.branch}
                  onChange={(e) => setForm({ ...form, branch: e.target.value })}
                >
                  <option value="" disabled>Select Branch</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Room Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 101"
                    className="input"
                    value={form.roomNumber}
                    onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Floor</label>
                  <input
                    type="text"
                    placeholder="e.g. 1"
                    className="input"
                    value={form.floor}
                    onChange={(e) => setForm({ ...form, floor: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Type</label>
                  <select
                    className="input"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="SINGLE">Single</option>
                    <option value="DOUBLE">Double Sharing</option>
                    <option value="TRIPLE">Triple Sharing</option>
                  </select>
                </div>
                <div>
                  <label className="label">Capacity (Beds)</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="label">Monthly Rent (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 6500"
                  className="input"
                  value={form.monthlyRent}
                  onChange={(e) => setForm({ ...form, monthlyRent: Number(e.target.value) })}
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
                  {editingRoom ? 'Update Room' : 'Save Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

