import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';

export default function EnsembleEvents() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, [id]);

    const loadEvents = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';
            const response = await fetch(`${API_URL}/api/ensembles/${id}/events`);
            const data = await response.json();
            setEvents(data || []);
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Events</h2>
                <button
                    onClick={() => navigate('/director/calendar')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Event
                </button>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                {events.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60">No events yet</p>
                        <p className="text-white/40 text-sm mt-2">Events for this ensemble will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {events.map((event) => (
                            <div key={event.id} className="p-4 bg-white/5 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-white font-medium">{event.title}</h4>
                                        {event.type && (
                                            <span className="inline-block mt-1 px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded capitalize">
                                                {event.type}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-white/60 text-sm">
                                        {new Date(event.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                {event.description && (
                                    <p className="text-white/70 text-sm mt-2">{event.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
