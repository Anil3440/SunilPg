import React, { useState, useEffect, useMemo } from 'react';
import { rentApi, studentApi, branchApi } from '../../api';
import { AdminNav } from '../../components/AdminNav';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  X,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const AdminRent = () => {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Modals state
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    branchId: 'ALL',
    defaultAmount: 6500,
    overwrite: false,
  });

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [addForm, setAddForm] = useState({
    studentId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: '',
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString().split('T')[0],
    status: 'PENDING',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [rentRes, studentRes, branchRes] = await Promise.all([
        rentApi.getAll(),
        studentApi.getAll(),
        branchApi.getAll(),
      ]);

      if (rentRes.data.success) setRecords(rentRes.data.data);
      if (studentRes.data.success) setStudents(studentRes.data.data);
      if (branchRes.data.success) setBranches(branchRes.data.data);
    } catch (err) {
      toast.error('Failed to load rent records or dependencies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When student selection changes in Add Form, auto-populate amount with room's rent
  const handleStudentSelect = (studentId) => {
    const selected = students.find((s) => s._id === studentId);
    let amountToSet = addForm.amount;
    if (selected && selected.room?.monthlyRent) {
      amountToSet = selected.room.monthlyRent;
    } else if (selected && !amountToSet) {
      amountToSet = 6500;
    }
    setAddForm((prev) => ({
      ...prev,
      studentId,
      amount: amountToSet,
    }));
  };

  // Create individual rent invoice
  const handleCreateRent = async (e) => {
    e.preventDefault();
    if (!addForm.studentId) {
      toast.error('Please select a student');
      return;
    }
    if (!addForm.amount || Number(addForm.amount) <= 0) {
      toast.error('Please enter a valid rent amount in ₹');
      return;
    }

    setCreating(true);
    try {
      const res = await rentApi.create({
        studentId: addForm.studentId,
        month: Number(addForm.month),
        year: Number(addForm.year),
        amount: Number(addForm.amount),
        dueDate: addForm.dueDate,
        status: addForm.status,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Rent invoice created successfully!');
        setAddModalOpen(false);
        setAddForm({
          studentId: '',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          amount: '',
          dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString().split('T')[0],
          status: 'PENDING',
        });
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create rent invoice');
    } finally {
      setCreating(false);
    }
  };

  // Generate monthly batch rent
  const handleGenerateRent = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await rentApi.generate({
        month: Number(generateForm.month),
        year: Number(generateForm.year),
        branchId: generateForm.branchId,
        defaultAmount: Number(generateForm.defaultAmount) || 6500,
        overwrite: generateForm.overwrite,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Rent batch generated successfully!');
        setGenerateModalOpen(false);
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rent generation failed');
    } finally {
      setGenerating(false);
    }
  };

  // Quick status change
  const handleStatusChange = async (id, status) => {
    try {
      const res = await rentApi.updateStatus(id, { status });
      if (res.data.success) {
        toast.success(`Status updated to ${status}`);
        setRecords((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status, paidAt: status === 'PAID' ? new Date() : null } : r))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Delete invoice
  const handleDeleteRent = async (id, studentName, month, year) => {
    const confirmMsg = `Are you sure you want to delete the rent invoice for ${studentName || 'this student'} (${month}/${year})?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await rentApi.delete(id);
      if (res.data.success) {
        toast.success(res.data.message || 'Rent invoice deleted');
        setRecords((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete rent record');
    }
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const studentName = r.student?.name?.toLowerCase() || '';
        const studentEmail = r.student?.email?.toLowerCase() || '';
        const roomNumber = r.student?.room?.roomNumber?.toLowerCase() || '';
        if (!studentName.includes(term) && !studentEmail.includes(term) && !roomNumber.includes(term)) {
          return false;
        }
      }

      // Status
      if (statusFilter && r.status !== statusFilter) return false;

      // Branch
      if (branchFilter) {
        const studentBranchId = r.student?.branch?._id || r.student?.branch;
        if (studentBranchId !== branchFilter) return false;
      }

      // Month
      if (monthFilter && r.month !== Number(monthFilter)) return false;

      // Year
      if (yearFilter && r.year !== Number(yearFilter)) return false;

      return true;
    });
  }, [records, searchTerm, statusFilter, branchFilter, monthFilter, yearFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    let totalInvoiced = 0;
    let totalCollected = 0;
    let pendingAmount = 0;
    let overdueCount = 0;

    records.forEach((r) => {
      totalInvoiced += r.amount || 0;
      if (r.status === 'PAID') {
        totalCollected += r.amount || 0;
      } else {
        pendingAmount += r.amount || 0;
        if (r.status === 'OVERDUE') overdueCount += 1;
      }
    });

    return { totalInvoiced, totalCollected, pendingAmount, overdueCount };
  }, [records]);

  return (
    <div>
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Rent Records & Collections</h1>
            <p className="text-sm text-gray-500 mt-1">
              Generate batch monthly rent, create individual student invoices, and record payments
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setAddModalOpen(true)}
              className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Rent Invoice
            </button>
            <button
              onClick={() => setGenerateModalOpen(true)}
              className="btn btn-primary font-bold shadow-xs flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Generate Monthly Rent
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

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Invoiced</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
              ₹{stats.totalInvoiced.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-gray-400 mt-1">{records.length} total invoice(s)</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Collected</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-2">
              ₹{stats.totalCollected.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-emerald-600/80 mt-1">Paid by students or cash</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Dues</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 mt-2">
              ₹{stats.pendingAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-amber-600/80 mt-1">Awaiting settlement</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Overdue Bills</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-600 mt-2">
              {stats.overdueCount}
            </div>
            <p className="text-xs text-rose-500 mt-1">Past designated due date</p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by student name, email, or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 text-sm py-2"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input text-xs py-2 w-auto"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="input text-xs py-2 w-auto"
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>

            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="input text-xs py-2 w-auto"
            >
              <option value="">All Months</option>
              {MONTH_NAMES.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>

            {(searchTerm || statusFilter || branchFilter || monthFilter || yearFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setBranchFilter('');
                  setMonthFilter('');
                  setYearFilter('');
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 transition"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Invoices Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-2xs">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">No rent records found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
              {records.length === 0
                ? 'No rent invoices have been created yet. Click "Generate Monthly Rent" to generate invoices for all students, or click "Add Rent Invoice" to create one manually.'
                : 'No records matched your search or filters. Try adjusting or clearing filters.'}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => setAddModalOpen(true)}
                className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Rent Invoice
              </button>
              <button
                onClick={() => setGenerateModalOpen(true)}
                className="btn btn-primary font-bold text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" /> Generate Rent Batch
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50/75 text-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4 text-left">Student Info</th>
                    <th className="px-6 py-4 text-left">Period</th>
                    <th className="px-6 py-4 text-left">Amount</th>
                    <th className="px-6 py-4 text-left">Due Date</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRecords.map((r) => {
                    const student = r.student;
                    const branchName = student?.branch?.name || (typeof student?.branch === 'string' ? student.branch : '');
                    const roomNum = student?.room?.roomNumber || (typeof student?.room === 'string' ? student.room : '');
                    const isDuePast = new Date(r.dueDate) < new Date() && r.status !== 'PAID';

                    return (
                      <tr key={r._id} className="hover:bg-gray-50/60 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-sm">
                              {student?.name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{student?.name || 'Unknown Student'}</div>
                              <div className="text-xs text-gray-500">{student?.email || 'No email'}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {branchName && (
                                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                                    {branchName}
                                  </span>
                                )}
                                {roomNum && (
                                  <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                                    Room {roomNum}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">
                            {MONTH_NAMES[r.month - 1] || r.month} {r.year}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            Month #{r.month}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-gray-900 text-base">
                            ₹{r.amount?.toLocaleString('en-IN')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-xs font-semibold ${isDuePast ? 'text-rose-600' : 'text-gray-600'}`}>
                            {new Date(r.dueDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          {isDuePast && (
                            <span className="inline-block text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded mt-0.5">
                              Due date passed
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {r.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" /> PAID
                            </span>
                          ) : r.status === 'OVERDUE' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                              <AlertCircle className="w-3.5 h-3.5" /> OVERDUE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3.5 h-3.5" /> PENDING
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {r.status !== 'PAID' ? (
                              <button
                                onClick={() => handleStatusChange(r._id, 'PAID')}
                                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition"
                              >
                                Mark Paid
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(r._id, 'PENDING')}
                                className="text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg border border-gray-200 transition"
                              >
                                Mark Pending
                              </button>
                            )}

                            {r.status === 'PENDING' && (
                              <button
                                onClick={() => handleStatusChange(r._id, 'OVERDUE')}
                                className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg border border-rose-200 transition"
                                title="Mark as Overdue"
                              >
                                Overdue
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteRent(r._id, student?.name, r.month, r.year)}
                              title="Delete Invoice"
                              className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Add New Rent Invoice */}
        {addModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg">Add New Rent Invoice</h3>
                    <p className="text-xs text-gray-500">Create an individual rent bill for any student</p>
                  </div>
                </div>
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRent} className="space-y-4">
                {/* Student Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Select Student *
                  </label>
                  <select
                    value={addForm.studentId}
                    onChange={(e) => handleStudentSelect(e.target.value)}
                    required
                    className="input w-full text-sm"
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map((s) => {
                      const branchLabel = s.branch?.name ? ` [${s.branch.name}]` : '';
                      const roomLabel = s.room?.roomNumber ? ` (Room ${s.room.roomNumber})` : ' (No Room)';
                      const rentLabel = s.room?.monthlyRent ? ` - ₹${s.room.monthlyRent}` : '';
                      return (
                        <option key={s._id} value={s._id}>
                          {s.name} - {s.email}{roomLabel}{rentLabel}{branchLabel}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Month & Year */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Billing Month *
                    </label>
                    <select
                      value={addForm.month}
                      onChange={(e) => setAddForm({ ...addForm, month: e.target.value })}
                      className="input w-full text-sm"
                      required
                    >
                      {MONTH_NAMES.map((name, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          {name} ({idx + 1})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Billing Year *
                    </label>
                    <input
                      type="number"
                      value={addForm.year}
                      onChange={(e) => setAddForm({ ...addForm, year: e.target.value })}
                      min="2020"
                      max="2035"
                      required
                      className="input w-full text-sm"
                    />
                  </div>
                </div>

                {/* Amount & Due Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Rent Amount (₹) *
                    </label>
                    <input
                      type="number"
                      value={addForm.amount}
                      onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
                      placeholder="e.g. 6500"
                      min="1"
                      required
                      className="input w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={addForm.dueDate}
                      onChange={(e) => setAddForm({ ...addForm, dueDate: e.target.value })}
                      required
                      className="input w-full text-sm"
                    />
                  </div>
                </div>

                {/* Initial Payment Status */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Initial Payment Status
                  </label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                    className="input w-full text-sm"
                  >
                    <option value="PENDING">PENDING (Awaiting payment)</option>
                    <option value="PAID">PAID (Already received in cash/UPI)</option>
                    <option value="OVERDUE">OVERDUE (Already overdue)</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="btn bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2"
                  >
                    {creating ? 'Saving Invoice...' : 'Save & Create Invoice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Generate Monthly Rent Batch */}
        {generateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg">Generate Monthly Rent</h3>
                    <p className="text-xs text-gray-500">Auto-create rent invoices for all active students</p>
                  </div>
                </div>
                <button
                  onClick={() => setGenerateModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleGenerateRent} className="space-y-4">
                <div className="bg-primary-50/60 border border-primary-100 rounded-xl p-3.5 text-xs text-primary-900 space-y-1">
                  <p className="font-bold">How generation works:</p>
                  <p className="text-primary-800">
                    Invoices are created using each student's assigned room monthly rent. If a student does not have a room assigned yet, the fallback amount will be used.
                  </p>
                </div>

                {/* Target Month & Year */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Target Month *
                    </label>
                    <select
                      value={generateForm.month}
                      onChange={(e) => setGenerateForm({ ...generateForm, month: e.target.value })}
                      className="input w-full text-sm"
                      required
                    >
                      {MONTH_NAMES.map((name, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          {name} ({idx + 1})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Target Year *
                    </label>
                    <input
                      type="number"
                      value={generateForm.year}
                      onChange={(e) => setGenerateForm({ ...generateForm, year: e.target.value })}
                      min="2020"
                      max="2035"
                      required
                      className="input w-full text-sm"
                    />
                  </div>
                </div>

                {/* Branch Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Branch Filter
                  </label>
                  <select
                    value={generateForm.branchId}
                    onChange={(e) => setGenerateForm({ ...generateForm, branchId: e.target.value })}
                    className="input w-full text-sm"
                  >
                    <option value="ALL">All Branches ({students.length} students)</option>
                    {branches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fallback Amount */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Fallback Amount (₹) for students without room
                  </label>
                  <input
                    type="number"
                    value={generateForm.defaultAmount}
                    onChange={(e) => setGenerateForm({ ...generateForm, defaultAmount: e.target.value })}
                    placeholder="e.g. 6500"
                    min="1"
                    required
                    className="input w-full text-sm"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Used only if the student hasn't been allocated a room in the system.
                  </p>
                </div>

                {/* Overwrite Checkbox */}
                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="overwriteCheckbox"
                    checked={generateForm.overwrite}
                    onChange={(e) => setGenerateForm({ ...generateForm, overwrite: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="overwriteCheckbox" className="text-xs font-semibold text-gray-700 cursor-pointer select-none">
                    Overwrite / Update existing unpaid invoices for this month
                  </label>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setGenerateModalOpen(false)}
                    className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="btn btn-primary text-xs font-bold flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    {generating ? 'Generating Invoices...' : 'Generate Rent Now'}
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
