import React, { useState, useEffect } from 'react';
import { announcementApi, branchApi } from '../../api';
import { AdminNav } from '../../components/AdminNav';
import { Plus, Trash2, Pin, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    branch: '',
    pinned: false,
  });

  const loadData = async () => {
    try {
      const [annRes, brRes] = await Promise.all([
        announcementApi.getAll(),
        branchApi.getAll(),
      ]);
      if (annRes.data.success) setAnnouncements(annRes.data.data);
      if (brRes.data.success) setBranches(brRes.data.data);
    } catch (err) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await announcementApi.delete(id);
      toast.success('Announcement deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await announcementApi.create(form);
      toast.success('Announcement published');
      setModalOpen(false);
      setForm({ title: '', message: '', branch: '', pinned: false });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post announcement');
    }
  };

  return (
    <div>
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notice Board & Announcements</h1>
            <p className="text-sm text-gray-500">Publish notices to student feeds (branch-specific or all branches)</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" /> New Announcement
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            No announcements published yet.
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((a) => (
              <div
                key={a._id}
                className={`card p-5 flex justify-between items-start ${
                  a.pinned ? 'border-l-4 border-amber-500 bg-amber-50/20' : ''
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {a.pinned && (
                      <span className="badge-warning text-[10px] flex items-center gap-1">
                        <Pin className="w-3 h-3" /> PINNED
                      </span>
                    )}
                    <span className="badge-info text-[10px]">
                      {a.branch?.name || 'All Branches'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{a.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{a.message}</p>
                </div>

                <button
                  onClick={() => handleDelete(a._id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
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
            <h2 className="text-lg font-bold text-gray-900 mb-4">Post Announcement</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wi-Fi router maintenance schedule"
                  className="input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Target Branch</label>
                <select
                  className="input"
                  value={form.branch}
                  onChange={(e) => setForm({ ...form, branch: e.target.value })}
                >
                  <option value="">All Branches</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Message *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Write announcement body..."
                  className="input"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pin"
                  checked={form.pinned}
                  onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                  className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="pin" className="text-sm font-medium text-gray-700">
                  Pin to top of feed
                </label>
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
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

