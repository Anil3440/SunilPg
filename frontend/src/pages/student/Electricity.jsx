import React, { useState, useEffect } from 'react';
import { electricityApi } from '../../api';
import { PaymentModal } from '../../components/PaymentModal';
import { 
  Zap, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Receipt, 
  Download,
  Gauge
} from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentElectricity = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, bill: null });
  const [receiptView, setReceiptView] = useState(null);

  const loadData = async () => {
    try {
      const res = await electricityApi.getMy();
      if (res.data.success) setBills(res.data.data);
    } catch (err) {
      toast.error('Failed to load electricity bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePay = (bill) => {
    setModal({ isOpen: true, bill });
  };

  const handleConfirmPay = async () => {
    const { bill } = modal;
    const init = await electricityApi.initiatePayment(bill._id);
    const { order } = init.data;

    await electricityApi.confirmPayment(bill._id, {
      gatewayOrderId: order.id,
      gatewayPaymentId: `pay_elec_${Date.now()}`,
      signature: 'mock_signature',
    });

    toast.success('Electricity bill payment confirmed!');
    loadData();
  };

  const pendingBills = bills.filter((b) => b.status === 'PENDING' || b.status === 'OVERDUE');
  const totalDue = pendingBills.reduce((sum, b) => sum + b.amount, 0);
  const totalUnits = pendingBills.reduce((sum, b) => sum + (b.units || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Dues Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Electricity Bills & Meter Readings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Check monthly room meter units consumed, due dates, and pay electricity bills online
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-right">
          <span className="text-[11px] font-bold uppercase text-amber-800 tracking-wider">
            Total Electricity Dues
          </span>
          <div className="text-2xl font-black text-amber-950">
            ₹{totalDue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-amber-700">({totalUnits} units pending)</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : bills.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-700">No Electricity Bills Issued</p>
          <p className="text-xs text-gray-500 mt-1">
            Monthly room meter readings will appear here once recorded by the hostel warden.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Pending Invoices Section */}
          {pendingBills.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Unpaid Electricity Invoices ({pendingBills.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingBills.map((b) => (
                  <div
                    key={b._id}
                    className="card p-6 border-2 border-amber-300 bg-amber-50/20 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Period: {b.month}/{b.year}
                        </span>
                        <span className="badge-warning">PENDING</span>
                      </div>
                      <div className="flex items-baseline gap-3 my-2">
                        <span className="text-3xl font-black text-gray-900">
                          ₹{b.amount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-sm font-semibold text-gray-600 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                          ⚡ {b.units} Units Consumed
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1 mt-3">
                        <p>
                          Due Date: <strong className="text-gray-900">{new Date(b.dueDate).toLocaleDateString()}</strong>
                        </p>
                        <p className="text-gray-500 text-[11px]">
                          Tariff calculated as per branch sub-meter reading.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handlePay(b)}
                        className="btn bg-amber-500 hover:bg-amber-600 text-gray-900 w-full py-2.5 font-bold text-sm shadow-xs"
                      >
                        Pay Bill ₹{b.amount.toLocaleString('en-IN')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complete Invoices Table */}
          <div className="card p-0 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Electricity Consumption History</h3>
              <span className="text-xs text-gray-400">Total {bills.length} bills</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                  <tr>
                    <th className="px-6 py-3.5 text-left">Period</th>
                    <th className="px-6 py-3.5 text-left">Units (kWh)</th>
                    <th className="px-6 py-3.5 text-left">Total Amount</th>
                    <th className="px-6 py-3.5 text-left">Due Date</th>
                    <th className="px-6 py-3.5 text-left">Status</th>
                    <th className="px-6 py-3.5 text-left">Paid Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bills.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {b.month}/{b.year}
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-semibold">
                        {b.units} units
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        ₹{b.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {new Date(b.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {b.status === 'PAID' ? (
                          <span className="badge-success">PAID</span>
                        ) : (
                          <span className="badge-warning">PENDING</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {b.paidAt ? new Date(b.paidAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {b.status === 'PAID' ? (
                          <button
                            onClick={() => setReceiptView(b)}
                            className="btn btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 ml-auto"
                          >
                            <Receipt className="w-3.5 h-3.5 text-primary-600" /> View Receipt
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePay(b)}
                            className="btn bg-amber-500 hover:bg-amber-600 text-gray-900 text-xs py-1.5 px-3.5 ml-auto font-bold"
                          >
                            Pay Online
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {modal.bill && (
        <PaymentModal
          isOpen={modal.isOpen}
          onClose={() => setModal({ isOpen: false, bill: null })}
          title={`Pay Electricity Bill (${modal.bill.month}/${modal.bill.year})`}
          amount={modal.bill.amount}
          onConfirm={handleConfirmPay}
        />
      )}

      {/* Receipt Modal */}
      {receiptView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative border border-gray-100">
            <div className="text-center pb-6 border-b border-gray-100">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Electricity Bill Receipt</h3>
              <p className="text-xs text-gray-500">Sunil PG Management Portal</p>
            </div>

            <div className="py-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Bill Ref:</span>
                <span className="font-mono text-xs font-bold text-gray-900">{receiptView._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Billing Period:</span>
                <span className="font-bold text-gray-900">{receiptView.month}/{receiptView.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Units Consumed:</span>
                <span className="font-bold text-gray-900">{receiptView.units} kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Paid Date:</span>
                <span className="font-medium text-gray-900">
                  {new Date(receiptView.paidAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">Total Amount:</span>
                <span className="text-2xl font-black text-green-600">
                  ₹{receiptView.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setReceiptView(null)}
                className="btn btn-outline flex-1"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="btn btn-primary flex-1"
              >
                <Download className="w-4 h-4" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
