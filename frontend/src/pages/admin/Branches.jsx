import React, { useState, useEffect } from 'react';
import { branchApi } from '../../api';
import { AdminNav } from '../../components/AdminNav';
import { Plus, Edit2, Trash2, MapPin, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', description: '', rentRange: '', imageUrl: '' });

  const loadBranches = async () => {
    try {
      const res = await branchApi.getAll();
      if (res.data.success) setBranches(res.data.data);
    } catch (err) {
      toast.error('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setForm({ name: '', address: '', description: '', rentRange: '', imageUrl: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (branch) => {
    setEditingBranch(branch);
    setForm({
      name: branch.name,
      address: branch.address,
      description: branch.description || '',
      rentRange: branch.rentRange || '',
      imageUrl: branch.imageUrl || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) return;
    try {
      await branchApi.delete(id);
      toast.success('Branch deleted');
      loadBranches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await branchApi.update(editingBranch._id, form);
        toast.success('Branch updated');
      } else {
        await branchApi.create(form);
        toast.success('Branch added');
      }
      setModalOpen(false);
      loadBranches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  return (
    <div>
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Branches</h1>
            <p className="text-sm text-gray-500">Configure your hostel branches and properties</p>
          </div>
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Add Branch
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((b) => (
              <div key={b._id} className="card flex flex-col justify-between">
                <div>
                  <div className="h-40 rounded-lg overflow-hidden bg-gray-100 mb-4">
                    <img
                      src={b.imageUrl || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'}
                      alt={b.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{b.name}</h3>
                  <div className="flex items-start gap-1.5 text-xs text-gray-500 mt-1 mb-2">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-primary-600" />
                    <span>{b.address}</span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{b.description}</p>
                  <p className="text-xs font-semibold text-primary-600 mt-2">{b.rentRange}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-1.5 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="p-1.5 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingBranch ? 'Edit Branch' : 'Add New Branch'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Branch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunil PG – Indiranagar"
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Full Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Street address, City, Pincode"
                  className="input"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Rent Range</label>
                <input
                  type="text"
                  placeholder="e.g. ₹6,000 – ₹10,000"
                  className="input"
                  value={form.rentRange}
                  onChange={(e) => setForm({ ...form, rentRange: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="input"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  rows="3"
                  placeholder="Highlights, nearby landmarks..."
                  className="input"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                  {editingBranch ? 'Update Branch' : 'Save Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

