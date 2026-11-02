import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, AlertCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@sunilpg.com');
      setPassword('admin123');
    } else {
      setEmail('arjun@student.com');
      setPassword('student123');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        {/* Toggle Login / Register Tabs */}
        <div className="flex rounded-2xl bg-gray-100 p-1">
          <Link
            to="/login"
            className="flex-1 py-2 text-center text-xs font-bold rounded-xl transition bg-white text-gray-900 shadow-xs"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="flex-1 py-2 text-center text-xs font-bold rounded-xl transition text-gray-500 hover:text-gray-900"
          >
            Create Account
          </Link>
        </div>

        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-primary-50 text-primary-600 mb-3">
            <LogIn className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sign in to your account</h2>
          <p className="mt-1.5 text-xs text-gray-500">
            Access your room rent, canteen orders, auto polls, and complaints
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="label">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  className="input pl-10 text-sm"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  className="input pl-10 text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full py-3 font-bold text-sm shadow-xs mt-2"
          >
            {submitting ? 'Signing in...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-5 border-t border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 1-Click Demo Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="text-xs py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold border border-gray-200 transition"
            >
              Demo Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('student')}
              className="text-xs py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold border border-gray-200 transition"
            >
              Demo Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

