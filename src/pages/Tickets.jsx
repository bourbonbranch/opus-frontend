import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, TicketIcon, DollarSignIcon, UsersIcon, CalendarIcon, TrendingUpIcon } from 'lucide-react';
import { getTicketEvents } from '../lib/opusApi';

export default function Tickets() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, upcoming, past, draft

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await getTicketEvents();
            setEvents(data || []);
        } catch (err) {
            console.error('Failed to load events:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events.filter(event => {
        if (filter === 'all') return true;
        if (filter === 'draft') return event.status === 'draft';
        if (filter === 'published') return event.status === 'published';
        // TODO: Add date-based filtering for upcoming/past
        return true;
    });

    const totalRevenue = events.reduce((sum, event) => sum + parseFloat(event.total_revenue || 0), 0);
    const publishedEvents = events.filter(e => e.status === 'published').length;

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Tickets</h1>
                    <p className="text-gray-300">Manage events and track ticket sales</p>
                </div>
                <Link
                    to="/director/tickets/events/new"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg shadow-purple-500/30"
                >
                    <PlusIcon className="w-5 h-5" />
                    Create Event
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <TicketIcon className="w-5 h-5 text-purple-300" />
                        </div>
                        <span className="text-gray-400 text-sm">Total Events</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{events.length}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <CalendarIcon className="w-5 h-5 text-green-300" />
                        </div>
                        <span className="text-gray-400 text-sm">Published</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{publishedEvents}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <DollarSignIcon className="w-5 h-5 text-blue-300" />
                        </div>
                        <span className="text-gray-400 text-sm">Total Revenue</span>
                    </div>
                    <p className="text-3xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                            <TrendingUpIcon className="w-5 h-5 text-orange-300" />
                        </div>
                        <span className="text-gray-400 text-sm">Avg per Event</span>
                    </div>
                    <p className="text-3xl font-bold text-white">
                        ${events.length > 0 ? (totalRevenue / events.length).toFixed(2) : '0.00'}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6">
                {['all', 'published', 'draft'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${filter === f
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Events List */}
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-400">Loading events...</p>
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                    <TicketIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No events found</p>
                    <Link
                        to="/director/tickets/events/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Create Your First Event
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredEvents.map((event) => (
                        <Link
                            key={event.id}
                            to={`/director/tickets/events/${event.id}`}
                            className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors mb-1">
                                        {event.title}
                                    </h3>
                                    {event.subtitle && (
                                        <p className="text-gray-400 text-sm">{event.subtitle}</p>
                                    )}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${event.status === 'published'
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'bg-gray-500/20 text-gray-300'
                                    }`}>
                                    {event.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <p className="text-gray-500 text-xs mb-1">Performances</p>
                                    <p className="text-white font-semibold">{event.performance_count || 0}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs mb-1">Revenue</p>
                                    <p className="text-white font-semibold">${parseFloat(event.total_revenue || 0).toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs mb-1">Venue</p>
                                    <p className="text-white font-semibold text-sm truncate">{event.venue_name || 'TBD'}</p>
                                </div>
                            </div>

                            {event.description && (
                                <p className="text-gray-400 text-sm line-clamp-2">{event.description}</p>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
