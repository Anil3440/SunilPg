import React, { useState, useEffect } from 'react';
import { enquiryApi } from '../../api';
import { AdminNav } from '../../components/AdminNav';
import { Mail, Phone, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const loadEnquiries = async () => {
    try {
      const res = await enquiryApi.getAll(statusFilter ? { status: statusFilter } : {});
      if (res.data.success) setEnquiries(res.data.data);
    } catch (err) {
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await enquiryApi.updateStatus(id, { status });
      toast.success(`Enquiry marked as ${status}`);
      loadEnquiries();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div>
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contact & Tour Enquiries</h1>
            <p className="text-sm text-gray-500">Prospective resident messages submitted from the public website</p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input py-2 text-xs max-w-xs"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="READ">Read</option>
            <option value="REPLIED">Replied</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            No visitor enquiries found.
          </div>
        ) : (
          <div className="space-y-4">
            {enquiries.map((e) => (
              <div key={e._id} className="card p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">{e.name}</h3>
                    {e.status === 'NEW' ? (
                      <span className="badge-danger">NEW</span>
                    ) : e.status === 'REPLIED' ? (
                      <span className="badge-success">REPLIED</span>
                    ) : (
                      <span className="badge-info">READ</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(e.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-primary-600" />
                      <a href={`tel:${e.phone}`} className="hover:underline">{e.phone}</a>
                    </div>
                    {e.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-primary-600" />
                        <a href={`mailto:${e.email}`} className="hover:underline">{e.email}</a>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-800 border border-gray-100">
                    "{e.message}"
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 flex-shrink-0">
                  {e.status !== 'REPLIED' && (
                    <button
                      onClick={() => handleUpdateStatus(e._id, 'REPLIED')}
                      className="btn btn-primary text-xs py-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Replied
                    </button>
                  )}
                  {e.status === 'NEW' && (
                    <button
                      onClick={() => handleUpdateStatus(e._id, 'READ')}
                      className="btn btn-outline text-xs py-1.5"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

