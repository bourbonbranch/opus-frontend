import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  DollarSignIcon,
  TicketIcon,
  MessageSquareIcon,
  TrendingUpIcon,
  UsersIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  MusicIcon,
  MapPinIcon,
  ClipboardListIcon
} from 'lucide-react';
import {
  getTodaySummary,
  getEnsemblesSummary,
  getUpcomingEvents,
  getAssignmentsSummary,
  getMessages
} from '../lib/opusApi';

export function TodayDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [todaySummary, setTodaySummary] = useState(null);
  const [ensembles, setEnsembles] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    const directorId = localStorage.getItem('directorId');
    if (!directorId) {
      navigate('/login');
      return;
    }
    loadDashboardData(directorId);
  }, [navigate]);

  const loadDashboardData = async (directorId) => {
    setLoading(true);
    try {
      const [summary, ensemblesData, events, assignmentsData, messages] = await Promise.all([
        getTodaySummary(directorId),
        getEnsemblesSummary(directorId),
        getUpcomingEvents(directorId),
        getAssignmentsSummary(directorId),
        getMessages(directorId).catch(() => []) // Handle messages separately in case it fails or is empty
      ]);

      setTodaySummary(summary);

      if (ensemblesData && ensemblesData.error) {
        alert('Error loading ensembles: ' + ensemblesData.error);
        setEnsembles([]);
      } else {
        setEnsembles(Array.isArray(ensemblesData) ? ensemblesData : []);
      }

      setUpcomingEvents(Array.isArray(events) ? events : []);
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      setRecentMessages(Array.isArray(messages) ? messages.slice(0, 3) : []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      alert('Failed to load dashboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Helper to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* 1. Today at a Glance (Header Bar) */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shrink-0">
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            <p className="text-sm text-purple-200">
              {todaySummary?.next_event ? (
                <>Next: {todaySummary.next_event.name} at {new Date(todaySummary.next_event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
              ) : (
                'No events today'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
          <div className="flex flex-col items-center md:items-end">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Attendance</span>
            <span className="text-white font-medium">
              {todaySummary?.attendance_summary?.taken ? `${todaySummary.attendance_summary.present}/${todaySummary.attendance_summary.total}` : 'Not taken'}
            </span>
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block"></div>
          <div className="flex flex-col items-center md:items-end">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Assignments</span>
            <span className="text-white font-medium">{todaySummary?.assignments_summary?.count || 0} due soon</span>
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block"></div>
          <div className="flex flex-col items-center md:items-end">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Messages</span>
            <span className="text-white font-medium">{todaySummary?.unread_messages_count || 0} unread</span>
          </div>
        </div>
      </div>

      {/* 2. Your Ensembles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Your Ensembles</h2>
          <button
            onClick={() => navigate('/add-ensemble')}
            className="text-sm text-purple-300 hover:text-purple-200 font-medium flex items-center gap-1"
          >
            <PlusIcon className="w-4 h-4" /> Add New
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ensembles.map((ensemble) => (
            <div
              key={ensemble.id}
              onClick={() => navigate(`/director/ensembles/${ensemble.id}`)}
              className="group bg-white/5 hover:bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-inner`} style={{ backgroundColor: ensemble.color_hex || '#8b5cf6' }}>
                    {ensemble.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold group-hover:text-purple-300 transition-colors">{ensemble.name}</h3>
                    <p className="text-xs text-gray-400">{ensemble.type} • {ensemble.member_count} members</p>
                  </div>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
              </div>

              {ensemble.next_event_date && (
                <div className="mb-4 p-2 bg-black/20 rounded-lg flex items-center gap-2 text-xs text-gray-300">
                  <ClockIcon className="w-3 h-3 text-purple-400" />
                  Next: {new Date(ensemble.next_event_date).toLocaleDateString()}
                </div>
              )}

              <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/5">
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/director/ensembles/${ensemble.id}/roster`); }}
                  className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Roster"
                >
                  <UsersIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/director/ensembles/${ensemble.id}/attendance`); }}
                  className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Attendance"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/director/ensembles/${ensemble.id}/assignments`); }}
                  className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Assignments"
                >
                  <ClipboardListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {ensembles.length === 0 && (
            <div className="col-span-full text-center py-8 bg-white/5 rounded-xl border border-white/10 border-dashed">
              <p className="text-gray-400 mb-2">No ensembles yet</p>
              <button onClick={() => navigate('/add-ensemble')} className="text-purple-400 hover:text-purple-300 font-medium">Create your first ensemble</button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">

          {/* 3. Upcoming Events */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-400" /> Upcoming Events
              </h3>
              <Link to="/director/calendar" className="text-xs text-gray-400 hover:text-white transition-colors">View Calendar</Link>
            </div>
            <div className="divide-y divide-white/5">
              {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
                <div key={event.id} className="p-4 hover:bg-white/5 transition-colors flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 text-center">
                    <div className="text-xs text-gray-400 uppercase">{new Date(event.start_time).toLocaleDateString('en-US', { month: 'short' })}</div>
                    <div className="text-xl font-bold text-white">{new Date(event.start_time).getDate()}</div>
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-white font-medium">{event.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" /> {new Date(event.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                      {event.location && <span className="flex items-center gap-1"><MapPinIcon className="w-3 h-3" /> {event.location}</span>}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-white/10 text-gray-300 border border-white/10">
                      {event.ensemble_name}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-gray-400">
                  No upcoming events in the next 7 days.
                </div>
              )}
            </div>
          </div>

          {/* 4. Assignments & Tasks */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <ClipboardListIcon className="w-5 h-5 text-green-400" /> Assignments Due Soon
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {assignments.length > 0 ? assignments.map((assignment) => (
                <div key={assignment.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{assignment.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {assignment.ensemble_name} • Due {new Date(assignment.due_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{assignment.submitted_count}/{assignment.total_count}</div>
                    <div className="text-xs text-gray-400">Submitted</div>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-gray-400">
                  No assignments due soon.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">

          {/* 5. Recent Messages */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquareIcon className="w-5 h-5 text-pink-400" /> Recent Messages
            </h3>
            <div className="space-y-4">
              {recentMessages.length > 0 ? recentMessages.map((msg) => (
                <div key={msg.id} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-medium text-white truncate">{msg.subject}</h4>
                    <span className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{msg.content}</p>
                </div>
              )) : (
                <p className="text-sm text-gray-400 text-center py-4">No recent messages.</p>
              )}
              <Link to="/director/messages" className="block text-center text-sm text-purple-300 hover:text-purple-200 mt-2">View All Messages</Link>
            </div>
          </div>

          {/* 6. Fundraising Snapshot */}
          <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-lg rounded-2xl border border-white/10 p-5">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <DollarSignIcon className="w-5 h-5 text-green-400" /> Fundraising
            </h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-bold text-white">$0</span>
              <span className="text-sm text-gray-400">raised this season</span>
            </div>
            <Link to="/director/fundraising" className="text-xs text-purple-300 hover:text-purple-200">View Campaigns →</Link>
          </div>

          {/* 7. Ticketing Snapshot */}
          <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-lg rounded-2xl border border-white/10 p-5">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <TicketIcon className="w-5 h-5 text-blue-400" /> Ticketing
            </h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-bold text-white">0</span>
              <span className="text-sm text-gray-400">tickets sold recently</span>
            </div>
            <Link to="/director/tickets" className="text-xs text-blue-300 hover:text-blue-200">Manage Events →</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
