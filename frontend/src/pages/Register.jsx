import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Phone, Key } from 'lucide-react';
import toast from 'react-hot-toast';

export const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    try {
      const data = await register(form);
      toast.success('Registration successful! Welcome to Sunil PG.');
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        {/* Toggle Login / Register Tabs */}
        <div className="flex rounded-2xl bg-gray-100 p-1">
          <Link
            to="/login"
            className="flex-1 py-2 text-center text-xs font-bold rounded-xl transition text-gray-500 hover:text-gray-900"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="flex-1 py-2 text-center text-xs font-bold rounded-xl transition bg-white text-gray-900 shadow-xs"
          >
            Create Account
          </Link>
        </div>

        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-primary-50 text-primary-600 mb-3">
            <UserPlus className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create Student Account</h2>
          <p className="mt-1.5 text-xs text-gray-500">
            Join Sunil PG for room booking, daily college auto drop, and food plans
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                className="input pl-10 text-sm"
                placeholder="Arjun Sharma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="label">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                className="input pl-10 text-sm"
                placeholder="arjun@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="label">Phone / WhatsApp Number *</label>
            <div className="relative">
              <input
                type="tel"
                required
                className="input pl-10 text-sm"
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="label">Password (min 6 characters) *</label>
            <div className="relative">
              <input
                type="password"
                required
                className="input pl-10 text-sm"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed pt-1">
            Note: Once registered, your room and branch can be assigned by the PG management or warden.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full py-3 font-bold text-sm shadow-xs mt-2"
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
