import React, { useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const PaymentModal = ({ isOpen, onClose, title, amount, onConfirm, isMock = true }) => {
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePay = async () => {
    setProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in duration-200">
        <button
          onClick={onClose}
          disabled={processing}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">Secure Online Checkout</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 my-4 border border-gray-100">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Payable Amount:</span>
            <span className="text-2xl font-black text-gray-900">₹{amount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green-700 mt-2">
            <ShieldCheck className="w-4 h-4" />
            <span>256-bit encrypted test transaction</span>
          </div>
        </div>

        {isMock && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 mb-5">
            <strong>Mock Mode Enabled:</strong> No actual money will be deducted. Clicking "Confirm & Pay" will simulate a successful Razorpay gateway callback.
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="btn btn-outline flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePay}
            disabled={processing}
            className="btn btn-primary flex-1"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Processing...
              </span>
            ) : (
              `Pay ₹${amount.toLocaleString('en-IN')}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

