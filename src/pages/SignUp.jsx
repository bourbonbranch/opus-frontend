// src/pages/SignUp.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupDirector } from '../lib/opusApi';

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'director',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const result = await signupDirector({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (result && result.id) {
        localStorage.setItem('directorId', String(result.id));
      }

      navigate('/add-ensemble');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Unable to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-all group"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
            <span className="font-medium">Back</span>
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-blue-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
              <span className="text-3xl text-white">♪</span>
            </div>
            <h1 className="text-4xl font-bold text-white drop-shadow-2xl">
              Opus
            </h1>
          </div>

          {/* Sign Up Card */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">
                Create your account
              </h2>
              <p className="text-gray-300 text-sm">
                Start managing your ensemble today
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                <p className="text-sm text-red-200 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:bg-white/10"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:bg-white/10"
                    placeholder="Director"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:bg-white/10"
                  placeholder="jane@school.edu"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:bg-white/10 cursor-pointer"
                >
                  <option value="director" className="bg-gray-900">Director</option>
                  <option value="assistant" className="bg-gray-900">Assistant Director</option>
                  <option value="student" className="bg-gray-900">Student</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:bg-white/10"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:bg-white/10"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 via-purple-600 to-blue-500 text-white font-bold rounded-xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <span className="text-xl">✓</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-center text-sm text-gray-300">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/director/today')}
                  className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                >
                  Sign in →
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-gray-400">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
