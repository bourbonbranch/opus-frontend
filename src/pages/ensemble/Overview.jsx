import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { Users, Calendar, TrendingUp, FileText, MessageSquare } from 'lucide-react';

export default function EnsembleOverview() {
    const { id } = useParams();
    const { ensemble } = useOutletContext();
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOverview();
    }, [id]);

    const loadOverview = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';
            const response = await fetch(`${API_URL}/api/ensembles/${id}/overview`);
            const data = await response.json();
            setOverview(data);
        } catch (error) {
            console.error('Error loading overview:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-white">Loading overview...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        <h3 className="text-white/60 text-sm">Active Members</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{overview?.stats?.member_count || 0}</p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-green-400" />
                        <h3 className="text-white/60 text-sm">Upcoming Events</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{overview?.upcoming_events?.length || 0}</p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-purple-400" />
                        <h3 className="text-white/60 text-sm">Active Assignments</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{overview?.upcoming_assignments?.length || 0}</p>
                </div>
            </div>

            {/* Upcoming Events */}
            {overview?.upcoming_events && overview.upcoming_events.length > 0 && (
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Upcoming Events</h3>
                    <div className="space-y-3">
                        {overview.upcoming_events.map((event) => (
                            <div key={event.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div>
                                    <p className="text-white font-medium">{event.name}</p>
                                    <p className="text-white/60 text-sm">
                                        {new Date(event.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded capitalize">
                                    {event.type}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Messages */}
            {overview?.recent_messages && overview.recent_messages.length > 0 && (
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Recent Messages</h3>
                    <div className="space-y-3">
                        {overview.recent_messages.map((message) => (
                            <div key={message.id} className="p-3 bg-white/5 rounded-lg">
                                <p className="text-white font-medium">{message.subject}</p>
                                <p className="text-white/60 text-sm">
                                    {new Date(message.sent_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upcoming Assignments */}
            {overview?.upcoming_assignments && overview.upcoming_assignments.length > 0 && (
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Upcoming Assignments</h3>
                    <div className="space-y-3">
                        {overview.upcoming_assignments.map((assignment) => (
                            <div key={assignment.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div>
                                    <p className="text-white font-medium">{assignment.title}</p>
                                    {assignment.type && (
                                        <p className="text-white/60 text-sm capitalize">{assignment.type}</p>
                                    )}
                                </div>
                                {assignment.due_at && (
                                    <p className="text-white/60 text-sm">
                                        Due {new Date(assignment.due_at).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
