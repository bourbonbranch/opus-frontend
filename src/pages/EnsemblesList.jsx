import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Calendar, TrendingUp } from 'lucide-react';

export default function EnsemblesList() {
    const navigate = useNavigate();
    const [ensembles, setEnsembles] = useState([]);
    const [loading, setLoading] = useState(true);
    const directorId = localStorage.getItem('directorId');

    useEffect(() => {
        loadEnsembles();
    }, []);

    const loadEnsembles = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';
            const response = await fetch(`${API_URL}/ensembles?director_id=${directorId}`);
            const data = await response.json();
            setEnsembles(data || []);
        } catch (error) {
            console.error('Error loading ensembles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEnsemble = () => {
        navigate('/ensembles/new');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
                <div className="text-white text-center mt-20">Loading ensembles...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Ensembles</h1>
                        <p className="text-white/60 mt-1">Manage your musical groups</p>
                    </div>
                    <button
                        onClick={handleCreateEnsemble}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Ensemble
                    </button>
                </div>

                {/* Ensembles Grid */}
                {ensembles.length === 0 ? (
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-12 text-center">
                        <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No ensembles yet</h3>
                        <p className="text-white/60 mb-6">Create your first ensemble to get started</p>
                        <button
                            onClick={handleCreateEnsemble}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                        >
                            Create Ensemble
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ensembles.map((ensemble) => (
                            <div
                                key={ensemble.id}
                                onClick={() => navigate(`/director/ensembles/${ensemble.id}`)}
                                className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6 cursor-pointer hover:bg-gray-800/70 transition-all hover:scale-105"
                                style={ensemble.color_hex ? { borderLeftColor: ensemble.color_hex, borderLeftWidth: '4px' } : {}}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{ensemble.name}</h3>
                                        <p className="text-white/60 text-sm capitalize">{ensemble.type}</p>
                                    </div>
                                    {ensemble.short_code && (
                                        <span className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded">
                                            {ensemble.short_code}
                                        </span>
                                    )}
                                </div>

                                {ensemble.description && (
                                    <p className="text-white/70 text-sm mb-4 line-clamp-2">{ensemble.description}</p>
                                )}

                                <div className="flex items-center gap-4 text-sm text-white/60">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        <span>Members</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Events</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
