import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  DollarSignIcon,
  TicketIcon,
  MessageSquareIcon,
  TrendingUpIcon,
  UsersIcon,
  PlusIcon
} from 'lucide-react';
import { getEnsembles } from '../lib/opusApi';

export function TodayDashboard() {
  const navigate = useNavigate();
  const [ensembles, setEnsembles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const directorId = localStorage.getItem('directorId');
    if (!directorId) {
      navigate('/signup');
      return;
    }
    loadEnsembles();
  }, [navigate]);

  const loadEnsembles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getEnsembles();
      setEnsembles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading ensembles:', err);
      setError(err.message || 'Failed to load ensembles');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <p className="text-gray-300">Loading...</p>
      </div>
    );
  }

  if (ensembles.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center py-12 bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/30">
          <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Welcome to Opus!</h2>
          <p className="text-gray-300 mb-6">Let's get started by creating your first ensemble</p>
          <button
            onClick={() => navigate('/add-ensemble')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-2xl"
          >
            <PlusIcon className="w-5 h-5" />
            Create Your First Ensemble
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2 drop-shadow-lg">
          Today's Overview
        </h1>
        <p className="text-sm md:text-base text-gray-200">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} • Quick snapshot of your ensemble
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-3xl rounded-2xl p-6 border border-white/30 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-green-300" />
            </div>
            <span className="text-sm text-gray-300">Today</span>
          </div>
          <p className="text-base md:text-lg text-gray-200 mb-1">Attendance</p>
          <p className="text-4xl md:text-3xl font-bold text-white">--/--</p>
          <p className="text-base md:text-sm text-gray-300 mt-2">Check rooms for tracking</p>
        </div>

        <div className="bg-white/10 backdrop-blur-3xl rounded-2xl p-6 border border-white/30 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <DollarSignIcon className="w-6 h-6 text-purple-300" />
            </div>
            <TrendingUpIcon className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-base md:text-lg text-gray-200 mb-1">Fundraising</p>
          <p className="text-4xl md:text-3xl font-bold text-white">$0</p>
          <p className="text-base md:text-sm text-gray-300 mt-2">Coming soon</p>
        </div>

        <div className="bg-white/10 backdrop-blur-3xl rounded-2xl p-6 border border-white/30 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <TicketIcon className="w-6 h-6 text-blue-300" />
            </div>
            <span className="text-sm text-gray-300">Events</span>
          </div>
          <p className="text-base md:text-lg text-gray-200 mb-1">Tickets Sold</p>
          <p className="text-4xl md:text-3xl font-bold text-white">0</p>
          <p className="text-base md:text-sm text-gray-300 mt-2">Coming soon</p>
        </div>

        <div className="bg-white/10 backdrop-blur-3xl rounded-2xl p-6 border border-white/30 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <MessageSquareIcon className="w-6 h-6 text-pink-300" />
            </div>
            <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs font-semibold rounded-full">
              0
            </span>
          </div>
          <p className="text-base md:text-lg text-gray-200 mb-1">Messages</p>
          <p className="text-4xl md:text-3xl font-bold text-white">0</p>
          <p className="text-base md:text-sm text-gray-300 mt-2">Coming soon</p>
        </div>
      </div>

      {/* Ensembles Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-white">Your Ensembles</h2>
          <button
            onClick={() => navigate('/add-ensemble')}
            className="flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Ensemble</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ensembles.map((ensemble) => (
            <div
              key={ensemble.id}
              className="bg-white/10 backdrop-blur-3xl rounded-2xl p-6 border border-white/30 shadow-2xl hover:bg-white/15 transition-all cursor-pointer"
              onClick={() => navigate(`/director/ensembles/${ensemble.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <UsersIcon className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full border border-purple-400/30">
                  {ensemble.type || 'Ensemble'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {ensemble.name}
              </h3>
              {ensemble.school && (
                <p className="text-sm text-gray-300 mb-3">{ensemble.school}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                {ensemble.level && (
                  <span className="capitalize">{ensemble.level.replace('-', ' ')}</span>
                )}
                {ensemble.size && <span>{ensemble.size} members</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white/10 backdrop-blur-3xl rounded-2xl p-6 border border-white/30 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Upcoming Events
            </h2>
            <Link to="/director/calendar" className="text-sm text-purple-300 hover:text-purple-200 font-medium">
              View All
            </Link>
          </div>
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300">No upcoming events</p>
            <p className="text-sm text-gray-400 mt-1">Events feature coming soon</p>
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white/10 backdrop-blur-3xl rounded-2xl p-6 border border-white/30 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <MessageSquareIcon className="w-5 h-5" />
              Recent Messages
            </h2>
            <Link to="/director/messages" className="text-sm text-purple-300 hover:text-purple-200 font-medium">
              View All
            </Link>
          </div>
          <div className="text-center py-8">
            <MessageSquareIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300">No messages</p>
            <p className="text-sm text-gray-400 mt-1">Messaging feature coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
