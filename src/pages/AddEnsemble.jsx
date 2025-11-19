// src/pages/AddEnsemble.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEnsemble } from '../lib/opusApi.js';

const AddEnsemble = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    type: 'choir',
    school: '',
    level: 'high-school',
    size: '',
  });

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    // --- Get director_id ---
    let director_id = null;

    try {
      const stored = localStorage.getItem('opusUser');
      if (stored) {
        const user = JSON.parse(stored);
        if (user && user.id) {
          director_id = user.id;
        }
      }
    } catch {
      // ignore parse errors
    }

    // TEMP: dev fallback so it *always* works
    if (!director_id) {
      director_id = 1;
    }

    setLoading(true);

    try {
      await createEnsemble({
        name: formData.name,
        type: formData.type,
        organization_name: formData.school || null,
        director_id, // <- this is now guaranteed to be present
      });

      navigate('/director/today');
    } catch (err) {
      console.error('Error creating ensemble:', err);
      setStatus(err.message || 'Failed to create ensemble');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          {/* Logo + steps */}
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-xl">
                <span className="text-xl font-bold text-white">♪</span>
              </div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                Opus
              </h1>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">1</span>
                </div>
                <span className="text-gray-300">Account</span>
              </div>
              <div className="w-12 h-0.5 bg-white/20" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">2</span>
                </div>
                <span className="text-white font-medium">Ensemble</span>
              </div>
              <div className="w-12 h-0.5 bg:white/20" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-400">3</span>
                </div>
                <span className="text-gray-400">Dashboard</span>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">
              Create your ensemble
            </h2>
            <p className="text-gray-300 mb-6">
              Tell us about your choir, band, or orchestra
            </p>

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
                  placeholder="Incendium"
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
                    <option value="choir">Choir</option>
                    <option value="band">Band</option>
                    <option value="orchestra">Orchestra</option>
                    <option value="jazz-band">Jazz Band</option>
                    <option value="marching-band">Marching Band</option>
                    <option value="chamber">Chamber Ensemble</option>
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
                    <option value="elementary">Elementary</option>
                    <option value="middle-school">Middle School</option>
                    <option value="high-school">High School</option>
                    <option value="college">College</option>
                    <option value="community">Community</option>
                    <option value="professional">Professional</option>
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
                  placeholder="Incendium"
                />
              </div>

              {status && (
                <p className="text-sm text-amber-300 mt-2">{status}</p>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow-xl hover:shadow-purple-500/50 transition-all hover:scale-105 disabled:opacity-60"
                >
                  {loading ? 'Saving…' : 'Continue'}
                </button>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-400">
            You can add more ensembles later from your dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddEnsemble;
