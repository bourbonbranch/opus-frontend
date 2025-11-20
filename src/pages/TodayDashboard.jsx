import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  DollarSignIcon,
  TicketIcon,
  MessageSquareIcon,
  TrendingUpIcon,
  UsersIcon
} from 'lucide-react';
import { getEnsembles } from '../lib/opusApi';

export function TodayDashboard() {
  const [ensembles, setEnsembles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getEnsembles();
        if (isMounted) {
          setEnsembles(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error loading ensembles:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load ensembles');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-white mb-2 drop-shadow-lg">
          Today's Overview
        </h1>
        <p className="text-gray-200">
          Monday, January 15, 2024 • Quick snapshot of your ensemble
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
          <p className="text-sm text-gray-200 mb-1">Attendance</p>
          <p className="text-3xl font-bold text-white">34/40</p>
          <p className="text-sm text-gray-300 mt-2">2 late • 4 absent</p>
        </div>

        <div className="bg-white/10 backdrop-blur-3xl rounded-2xl p-6 border border-white/30 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <DollarSignIcon className="w-6 h-6 text-purple-300" />
            </div>
            <TrendingUpIcon className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-sm text-gray-200 mb-1">Fundraising</p>
          <p className="text-3xl font-bold text-white">$18.8k</p>
          <p className="text-sm text-gray-300 mt-2">75% of $25k goal</p>
        </div>

        <div className="bg-white/10 backdrop-blur-3xl rounded-2xl p-6 border border-white/30 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <TicketIcon className="w-6 h-6 text-blue-300" />
            </div>
            <span className="text-sm text-gray-300">Spring Concert</span>
          </div>
          <p className="text-sm text-gray-200 mb-1">Tickets Sold</p>
          <p className="text-3xl font-bold text-white">156</p>
          <p className="text-sm text-gray-300 mt-2">$3,120 revenue</p>
        </div>

        <div className="bg-white/10 backdrop-blur-3xl rounded-2xl p-6 border border-white/30 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <MessageSquareIcon className="w-6 h-6 text-pink-300" />
            </div>
            <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs font-semibold rounded-full">
              5
            </span>
          </div>
          <p className="text-sm text-gray-200 mb-1">Messages</p>
          <p className="text-3xl font-bold text-white">5</p>
          <p className="text-sm text-gray-300 mt-2">Unread messages</p>
          <p className="text-xs text-gray-400">23 total conversations</p>
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
          <div className="space-y-3">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <CalendarIcon className="w-5 h-5 text-purple-300" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Wednesday Rehearsal</h3>
                  <p className="text-sm text-gray-300">Jan 17 • 3:00 PM</p>
                  <p className="text-xs text-gray-400 mt-1">Main Hall</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <CalendarIcon className="w-5 h-5 text-blue-300" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Spring Concert</h3>
                  <p className="text-sm text-gray-300">Jan 20 • 7:00 PM</p>
                  <p className="text-xs text-gray-400 mt-1">Auditorium</p>
                </div>
              </div>
            </div>
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
          <div className="space-y-3">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-white">EJ</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-white">Emma Johnson</h3>
                    <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-1.5" />
                  </div>
                  <p className="text-sm text-gray-300 truncate">Unable to attend Friday</p>
                  <p className="text-xs text-gray-400 mt-1">2h ago</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-white">MC</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-white">Michael Chen</h3>
                    <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-1.5" />
                  </div>
                  <p className="text-sm text-gray-300 truncate">Music folder question</p>
                  <p className="text-xs text-gray-400 mt-1">5h ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
