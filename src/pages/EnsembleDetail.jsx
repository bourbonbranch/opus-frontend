import React, { useState, useEffect } from 'react';
import { useParams, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Users, Calendar, MapPin, FileText, Library, MessageSquare, CalendarDays, Settings } from 'lucide-react';

export default function EnsembleDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ensemble, setEnsemble] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEnsemble();
    }, [id]);

    const loadEnsemble = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';
            const response = await fetch(`${API_URL}/api/ensembles/${id}`);
            const data = await response.json();
            setEnsemble(data);
        } catch (error) {
            console.error('Error loading ensemble:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { path: '', label: 'Overview', icon: Home },
        { path: 'roster', label: 'Roster', icon: Users },
        { path: 'attendance', label: 'Attendance', icon: Calendar },
        { path: 'rooms', label: 'Rooms', icon: MapPin },
        { path: 'assignments', label: 'Assignments', icon: FileText },
        { path: 'library', label: 'Library', icon: Library },
        { path: 'events', label: 'Events', icon: CalendarDays },
        { path: 'settings', label: 'Settings', icon: Settings },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
                <div className="text-white text-center mt-20">Loading ensemble...</div>
            </div>
        );
    }

    if (!ensemble) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
                <div className="text-white text-center mt-20">Ensemble not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/director/ensembles')}
                    className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Ensembles
                </button>

                {/* Header */}
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            {ensemble.color_hex && (
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: ensemble.color_hex }}
                                />
                            )}
                            <h1 className="text-3xl font-bold text-white">{ensemble.name}</h1>
                            {ensemble.short_code && (
                                <span className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded">
                                    {ensemble.short_code}
                                </span>
                            )}
                        </div>
                        <p className="text-white/60 capitalize">{ensemble.type}</p>
                        {ensemble.description && (
                            <p className="text-white/70 mt-2">{ensemble.description}</p>
                        )}
                    </div>
                    <button
                        onClick={() => navigate('/director/messages', {
                            state: { composeAnnouncement: true, ensembleId: ensemble.id }
                        })}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-purple-500/20"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Send Announcement
                    </button>
                </div>

                {/* Tabs */}
                <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl border border-white/10 mb-6">
                    <div className="flex overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const to = tab.path ? `/director/ensembles/${id}/${tab.path}` : `/director/ensembles/${id}`;

                            return (
                                <NavLink
                                    key={tab.path || 'overview'}
                                    to={to}
                                    end={tab.path === ''}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${isActive
                                            ? 'text-white border-purple-500'
                                            : 'text-white/60 border-transparent hover:text-white hover:border-white/20'
                                        }`
                                    }
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </NavLink>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <Outlet context={{ ensemble, refreshEnsemble: loadEnsemble }} />
            </div>
        </div>
    );
}
