import React, { useState, useEffect } from 'react';
import { studentApi, branchApi, roomApi } from '../../api';
import { AdminNav } from '../../components/AdminNav';
import { Plus, Edit2, Trash2, X, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    branch: '',
    room: '',
  });

  const loadData = async () => {
    try {
      const [stuRes, brRes, rmRes] = await Promise.all([
        studentApi.getAll(),
        branchApi.getAll(),
        roomApi.getAll(),
      ]);
      if (stuRes.data.success) setStudents(stuRes.data.data);
      if (brRes.data.success) setBranches(brRes.data.data);
      if (rmRes.data.success) setRooms(rmRes.data.data);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      password: 'student123',
      branch: branches[0]?._id || '',
      room: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setForm({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      password: '',
      branch: student.branch?._id || student.branch || '',
      room: student.room?._id || student.room || '',
    });
    setModalOpen(true);
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this student account?')) return;
    try {
      await studentApi.delete(id);
      toast.success('Student deactivated');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await studentApi.update(editingStudent._id, form);
        toast.success('Student updated');
      } else {
        await studentApi.create(form);
        toast.success('Student created');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  // Filter rooms belonging to chosen branch in form
  const availableRooms = rooms.filter((r) => !form.branch || (r.branch?._id || r.branch) === form.branch);

  return (
    <div>
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Students</h1>
            <p className="text-sm text-gray-500">Student roster, room allocation, and branch assignments</p>
          </div>
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Add Student
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
                  <th className="px-6 py-3.5 text-left">Student Name</th>
                  <th className="px-6 py-3.5 text-left">Contact</th>
                  <th className="px-6 py-3.5 text-left">Branch</th>
                  <th className="px-6 py-3.5 text-left">Room</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-gray-900">{s.name}</td>
                    <td className="px-6 py-4 text-xs text-gray-600 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {s.email}
                      </div>
                      {s.phone && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> {s.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{s.branch?.name || <span className="text-gray-400 italic">Not Assigned</span>}</td>
                    <td className="px-6 py-4">
                      {s.room ? (
                        <span className="badge-info">Room {s.room.roomNumber}</span>
                      ) : (
                        <span className="badge-warning">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {s.active ? (
                        <span className="badge-success">Active</span>
                      ) : (
                        <span className="badge-danger">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1 text-gray-500 hover:text-primary-600"
                        title="Edit / Assign"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeactivate(s._id)}
                        className="p-1 text-gray-500 hover:text-red-600"
                        title="Deactivate"
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
              {editingStudent ? 'Edit Student Details' : 'Add New Student'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arjun Sharma"
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    className="input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    className="input"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              {!editingStudent && (
                <div>
                  <label className="label">Default Password</label>
                  <input
                    type="text"
                    className="input"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="label">Assigned Branch</label>
                <select
                  className="input"
                  value={form.branch}
                  onChange={(e) => setForm({ ...form, branch: e.target.value, room: '' })}
                >
                  <option value="">None</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Assigned Room</label>
                <select
                  className="input"
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                >
                  <option value="">None</option>
                  {availableRooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      Room {r.roomNumber} ({r.type} - ₹{r.monthlyRent})
                    </option>
                  ))}
                </select>
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
                  {editingStudent ? 'Update Student' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

