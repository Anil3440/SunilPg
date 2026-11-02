import React, { useState } from 'react';
import { enquiryApi } from '../api';
import { Phone, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Contact = () => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      toast.error('Please fill in name, phone, and message');
      return;
    }
    setSubmitting(true);
    try {
      const res = await enquiryApi.create(form);
      if (res.data.success) {
        setSubmitted(true);
        toast.success('Enquiry submitted successfully!');
        setForm({ name: '', phone: '', email: '', message: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Get in Touch</h1>
        <p className="mt-3 text-gray-600">
          Interested in room booking, tour scheduling, or general inquiries? Send us a message!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Contact info */}
        <div className="bg-primary-900 text-white rounded-3xl p-8 lg:p-12 shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
          <p className="text-primary-200 text-sm mb-8 leading-relaxed">
            Feel free to call our central reception or visit any of our branches directly. Our resident warden is available 24/7.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-800 rounded-xl">
                <Phone className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-primary-300">Call / WhatsApp (Owner)</p>
                <a href="tel:+919876703899" className="text-base font-bold hover:text-amber-300 transition">+91 98767 03899</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-800 rounded-xl">
                <Mail className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-primary-300">Email Address</p>
                <p className="text-base font-semibold">sunilpg@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-800 rounded-xl">
                <MapPin className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-primary-300">Head Office</p>
                <p className="text-base font-semibold">Chachoki Colony, Near Choti Pulli, Phagwara</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-primary-800 text-xs text-primary-300">
            Visiting Hours: 9:00 AM – 8:00 PM (Monday to Sunday)
          </div>
        </div>

        {/* Form */}
        <div className="card p-8 shadow-md">
          {submitted ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h3>
              <p className="text-gray-600 mb-6">
                Your enquiry has been received. Our team will get back to you shortly via phone or WhatsApp.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="btn btn-outline"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    className="input"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. john@example.com"
                    className="input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Message / Room Requirement *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Tell us which branch, sharing preference (single/double), or joining date..."
                  className="input"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full py-3"
              >
                {submitting ? 'Submitting...' : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" /> Submit Enquiry
                  </span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

