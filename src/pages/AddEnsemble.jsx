// src/pages/AddEnsemble.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEnsemble } from '../lib/opusApi';

const AddEnsemble = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    type: 'choir',
    school: '',
    level: 'high-school',
    size: '',
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const directorId = localStorage.getItem('directorId');

      if (!directorId) {
        setError('You are not signed in. Please create an account first.');
        navigate('/signup');
        return;
      }

      await createEnsemble({
        name: formData.name,
        type: formData.type,
        organization_name: formData.school || null,
        level: formData.level || null,
        size: formData.size || null,
        director_id: Number(directorId),
      });

      navigate('/director/today');
    } catch (err) {
      console.error('Create ensemble error:', err);
      setError(err.message || 'Failed to create ensemble');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden text-white">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-12%] left-[-10%] w-[36rem] h-[36rem] bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-10%] w-[36rem] h-[36rem] bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        {/* Header / Steps */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-xl">
            <span className="text-xl text-white">♪</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Opus</h1>
        </div>

        <div className="flex items-center gap-2 mb-8 text-gray-300/90">
          <span className="px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-white text-xs">Account ✓</span>
          <span className="w-10 h-[2px] bg-white/20" />
          <span className="px-2 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">Ensemble 2/3</span>
          <span className="w-10 h-[2px] bg-white/20" />
          <span className="px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-gray-200 text-xs">Dashboard</span>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-bold mb-2">Create your ensemble</h2>
          <p className="text-gray-300 mb-6">
            Tell us about your choir, band, or orchestra.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/40 rounded-xl text-yellow-100 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Ensemble Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="e.g., Varsity Choir, Concert Band"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Ensemble Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  <option value="choir" className="bg-gray-900">Choir</option>
                  <option value="band" className="bg-gray-900">Band</option>
                  <option value="orchestra" className="bg-gray-900">Orchestra</option>
                  <option value="jazz-band" className="bg-gray-900">Jazz Band</option>
                  <option value="marching-band" className="bg-gray-900">Marching Band</option>
                  <option value="chamber" className="bg-gray-900">Chamber Ensemble</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Level
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  <option value="elementary" className="bg-gray-900">Elementary</option>
                  <option value="middle-school" className="bg-gray-900">Middle School</option>
                  <option value="high-school" className="bg-gray-900">High School</option>
                  <option value="college" className="bg-gray-900">College</option>
                  <option value="community" className="bg-gray-900">Community</option>
                  <option value="professional" className="bg-gray-900">Professional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                School or Organization
              </label>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="e.g., Lincoln High School"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Approximate Size
              </label>
              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option value="" className="bg-gray-900">Select size</option>
                <option value="1-25" className="bg-gray-900">1–25 members</option>
                <option value="26-50" className="bg-gray-900">26–50 members</option>
                <option value="51-75" className="bg-gray-900">51–75 members</option>
                <option value="76-100" className="bg-gray-900">76–100 members</option>
                <option value="100+" className="bg-gray-900">100+ members</option>
              </select>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow-xl hover:shadow-purple-500/50 transition-all hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
              >
                {saving ? 'Saving…' : 'Continue'}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-300">
          You can add more ensembles later from your dashboard
        </p>
      </div>
    </div>
  );
};

export default AddEnsemble;

