import React, { useState, useEffect } from 'react';
import { canteenOrderApi, branchApi } from '../../api';
import { AdminNav } from '../../components/AdminNav';
import { ShoppingBag, Clock, CheckCircle, Truck, Phone, X, Store } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminCanteenOrders = () => {
  const [orders, setOrders] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [ordRes, brRes] = await Promise.all([
        canteenOrderApi.getAllOrders({
          branch: selectedBranch || undefined,
          status: statusFilter || undefined,
        }),
        branchApi.getAll(),
      ]);
      if (ordRes.data.success) setOrders(ordRes.data.data);
      if (brRes.data.success) setBranches(brRes.data.data);
    } catch (err) {
      toast.error('Failed to load canteen orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranch, statusFilter]);

  const handleStatusChange = async (id, orderStatus) => {
    try {
      await canteenOrderApi.updateStatus(id, { orderStatus });
      toast.success(`Order status updated to ${orderStatus}`);
      loadData();
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
            <h1 className="text-2xl font-bold text-gray-900">Canteen Orders Kitchen Monitor</h1>
            <p className="text-sm text-gray-500">Manage incoming food and snack orders placed by residents</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="input py-2 text-xs"
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input py-2 text-xs"
            >
              <option value="">All Statuses</option>
              <option value="RECEIVED">Received</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            No canteen food orders matching filter.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div key={ord._id} className="card p-6 flex flex-col lg:flex-row justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-gray-100 rounded text-gray-800">
                      {ord.orderNumber}
                    </span>
                    <span
                      className={`badge ${
                        ord.orderStatus === 'DELIVERED'
                          ? 'badge-success'
                          : ord.orderStatus === 'CANCELLED'
                          ? 'badge-danger'
                          : 'badge-warning'
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      {ord.student?.name} • Room {ord.room?.roomNumber || 'N/A'} ({ord.branch?.name})
                    </h3>
                    <p className="text-xs text-gray-500">Phone: {ord.student?.phone || 'N/A'}</p>
                  </div>

                  {/* Items List */}
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 max-w-lg space-y-1">
                    {ord.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-gray-800">
                        <span>
                          <strong>{item.quantity} ×</strong> {item.name}
                        </span>
                        <span className="font-semibold text-gray-900">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                    {ord.specialInstructions && (
                      <div className="pt-2 mt-2 border-t border-gray-200 text-[11px] text-amber-800 font-medium">
                        Note: "{ord.specialInstructions}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1 font-semibold text-primary-700">
                      {ord.deliveryType === 'ROOM_DELIVERY' ? <Truck className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                      {ord.deliveryType === 'ROOM_DELIVERY' ? 'Deliver to Room' : 'Canteen Pickup'}
                    </span>
                    <span>Payment: <strong>{ord.paymentMethod}</strong> ({ord.paymentStatus})</span>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex flex-col justify-between items-end gap-4 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Total Bill</span>
                    <span className="text-2xl font-black text-gray-900">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {ord.orderStatus === 'RECEIVED' && (
                      <button
                        onClick={() => handleStatusChange(ord._id, 'PREPARING')}
                        className="btn bg-amber-500 hover:bg-amber-600 text-white text-xs py-1.5 px-3"
                      >
                        Start Preparing
                      </button>
                    )}
                    {ord.orderStatus === 'PREPARING' && (
                      <button
                        onClick={() => handleStatusChange(ord._id, 'READY')}
                        className="btn bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 px-3"
                      >
                        Mark Ready
                      </button>
                    )}
                    {ord.orderStatus === 'READY' && (
                      <button
                        onClick={() => handleStatusChange(ord._id, 'DELIVERED')}
                        className="btn btn-primary text-xs py-1.5 px-3"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {ord.orderStatus !== 'DELIVERED' && ord.orderStatus !== 'CANCELLED' && (
                      <button
                        onClick={() => handleStatusChange(ord._id, 'CANCELLED')}
                        className="btn btn-outline text-xs py-1.5 px-2 text-red-600 hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

