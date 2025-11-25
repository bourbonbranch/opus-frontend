import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, DollarSign, Users, Calendar, ArrowRight, TrendingUp } from 'lucide-react';

export default function FundraisingDashboard() {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    const directorId = localStorage.getItem('directorId');

    useEffect(() => {
        if (directorId) {
            loadCampaigns();
        }
    }, [directorId]);

    const loadCampaigns = async () => {
        try {
            setLoading(true);
            const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';
            const response = await fetch(`${API_URL}/api/campaigns?director_id=${directorId}`);
            const data = await response.json();

            if (Array.isArray(data)) {
                setCampaigns(data);
            } else {
                console.error('Invalid campaigns data:', data);
                setCampaigns([]);
            }
        } catch (err) {
            console.error('Error loading campaigns:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (cents) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(cents / 100);
    };

    const getProgressColor = (percent) => {
        if (percent >= 100) return 'bg-green-500';
        if (percent >= 75) return 'bg-emerald-500';
        if (percent >= 50) return 'bg-blue-500';
        if (percent >= 25) return 'bg-yellow-500';
        return 'bg-gray-500';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Fundraising</h1>
                        <p className="text-white/60">Manage peer-to-peer fundraising campaigns</p>
                    </div>
                    <button
                        onClick={() => navigate('/director/fundraising/new')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-lg shadow-green-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">New Campaign</span>
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-white/60">Loading campaigns...</p>
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-12 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DollarSign className="w-8 h-8 text-white/40" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Active Campaigns</h3>
                        <p className="text-white/60 mb-6 max-w-md mx-auto">
                            Start a new fundraising campaign to raise money for your ensemble.
                            Students will get their own donation pages to share.
                        </p>
                        <button
                            onClick={() => navigate('/director/fundraising/new')}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                            Create Your First Campaign
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campaigns.map((campaign) => {
                            const percent = campaign.goal_amount_cents
                                ? Math.min(100, Math.round((campaign.total_raised / campaign.goal_amount_cents) * 100))
                                : 0;

                            return (
                                <div
                                    key={campaign.id}
                                    onClick={() => navigate(`/director/fundraising/${campaign.id}`)}
                                    className="group bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6 cursor-pointer hover:border-green-500/50 transition-all hover:transform hover:-translate-y-1"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-green-400 transition-colors">
                                                {campaign.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-white/60">
                                                <span className={`w-2 h-2 rounded-full ${campaign.is_active ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                                {campaign.is_active ? 'Active' : 'Inactive'}
                                            </div>
                                        </div>
                                        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-green-500/10 transition-colors">
                                            <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-green-400" />
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-6">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-white font-medium">{formatCurrency(campaign.total_raised)}</span>
                                            <span className="text-white/60">of {formatCurrency(campaign.goal_amount_cents)}</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${getProgressColor(percent)} transition-all duration-500`}
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                                                <Users className="w-3 h-3" />
                                                Participants
                                            </div>
                                            <div className="text-lg font-semibold text-white">
                                                {campaign.participant_count}
                                            </div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                                                <TrendingUp className="w-3 h-3" />
                                                Avg/Student
                                            </div>
                                            <div className="text-lg font-semibold text-white">
                                                {campaign.participant_count > 0
                                                    ? formatCurrency(campaign.total_raised / campaign.participant_count)
                                                    : '$0.00'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
