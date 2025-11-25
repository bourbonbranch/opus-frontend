import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, DollarSign, Calendar, Users, Info } from 'lucide-react';

export default function CreateCampaign() {
    const navigate = useNavigate();
    const [ensembles, setEnsembles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        ensemble_id: '',
        description: '',
        goal_amount: '',
        per_student_goal: '',
        starts_at: '',
        ends_at: ''
    });

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
        } catch (err) {
            console.error('Error loading ensembles:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';

            // Convert dollars to cents and ensure proper types
            const payload = {
                director_id: parseInt(directorId),
                ensemble_id: formData.ensemble_id ? parseInt(formData.ensemble_id) : null,
                name: formData.name,
                description: formData.description,
                goal_amount_cents: Math.round(parseFloat(formData.goal_amount) * 100),
                per_student_goal_cents: Math.round(parseFloat(formData.per_student_goal) * 100),
                starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : null,
                ends_at: formData.ends_at ? new Date(formData.ends_at).toISOString() : null
            };

            console.log('=== CreateCampaign v2.0 - 2025-11-24 ===');
            console.log('Creating campaign with payload:', payload);
            console.log('Raw form data:', formData);
            console.log('Ensembles loaded:', ensembles);

            const response = await fetch(`${API_URL}/api/campaigns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const responseText = await response.text();
            console.log('Response status:', response.status);
            console.log('Response body:', responseText);

            if (!response.ok) {
                throw new Error(`Failed to create campaign: ${responseText}`);
            }

            const data = JSON.parse(responseText);
            navigate(`/director/fundraising/${data.id}`);
        } catch (err) {
            console.error('Error creating campaign:', err);
            setError(err.message || 'Failed to create campaign. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate('/director/fundraising')}
                    className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Fundraising
                </button>

                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-8">
                    <h1 className="text-2xl font-bold text-white mb-6">Create New Campaign</h1>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">Campaign Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Spring Tour Fundraiser"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">Ensemble (Participants)</label>
                                <select
                                    required
                                    value={formData.ensemble_id}
                                    onChange={(e) => setFormData({ ...formData, ensemble_id: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Select an ensemble...</option>
                                    {ensembles.map(ens => (
                                        <option key={ens.id} value={ens.id}>{ens.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-white/40 mt-1">
                                    All active students in this ensemble will be added as participants.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">Description</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="What are you raising money for?"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        {/* Financials */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">Total Goal ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.goal_amount}
                                        onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="5000.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">Goal Per Student ($)</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.per_student_goal}
                                        onChange={(e) => setFormData({ ...formData, per_student_goal: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="100.00"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">Start Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <input
                                        type="datetime-local"
                                        value={formData.starts_at}
                                        onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">End Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <input
                                        type="datetime-local"
                                        value={formData.ends_at}
                                        onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/director/fundraising')}
                                className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Create Campaign
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
