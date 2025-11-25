import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Users, Calendar, Link as LinkIcon, ExternalLink, Search } from 'lucide-react';

export default function CampaignDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadCampaignData();
    }, [id]);

    const loadCampaignData = async () => {
        try {
            setLoading(true);
            const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';

            // Fetch campaign details
            const campaignRes = await fetch(`${API_URL}/api/campaigns/${id}`);
            const campaignData = await campaignRes.json();
            setCampaign(campaignData);

            // Fetch participants
            const participantsRes = await fetch(`${API_URL}/api/campaigns/${id}/participants`);
            const participantsData = await participantsRes.json();
            setParticipants(participantsData || []);

        } catch (err) {
            console.error('Error loading campaign data:', err);
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

    const getPublicLink = (slug, token) => {
        // In production, this would be the actual domain
        const baseUrl = window.location.origin;
        return `${baseUrl}/fundraising/${slug}/${token}`;
    };

    const copyLink = (slug, token) => {
        const link = getPublicLink(slug, token);
        navigator.clipboard.writeText(link);
        // Could add toast notification here
    };

    const filteredParticipants = participants.filter(p =>
        p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="min-h-screen bg-gray-900 p-6 text-white">
                Campaign not found.
            </div>
        );
    }

    const percent = campaign.goal_amount_cents
        ? Math.min(100, Math.round((campaign.stats?.total_raised / campaign.goal_amount_cents) * 100))
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/director/fundraising')}
                    className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Fundraising
                </button>

                {/* Campaign Header */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-8 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{campaign.name}</h1>
                            <div className="flex items-center gap-4 text-white/60">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${campaign.is_active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                                    {campaign.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(campaign.starts_at).toLocaleDateString()} - {new Date(campaign.ends_at).toLocaleDateString()}
                                </span>
                                {campaign.ensemble_name && (
                                    <span className="px-2 py-1 rounded-full bg-white/10 text-xs">
                                        {campaign.ensemble_name}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                                Edit Campaign
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <span className="text-4xl font-bold text-white">{formatCurrency(campaign.stats?.total_raised)}</span>
                                <span className="text-white/60 ml-2">raised of {formatCurrency(campaign.goal_amount_cents)} goal</span>
                            </div>
                            <div className="text-2xl font-bold text-green-400">{percent}%</div>
                        </div>
                        <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000"
                                style={{ width: `${percent}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-300">
                                    <Users className="w-5 h-5" />
                                </div>
                                <span className="text-white/60">Participants</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{campaign.stats?.participant_count}</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
                                    <Users className="w-5 h-5" />
                                </div>
                                <span className="text-white/60">Donors</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{campaign.stats?.donor_count}</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-500/20 rounded-lg text-green-300">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <span className="text-white/60">Avg Donation</span>
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {campaign.stats?.donor_count > 0
                                    ? formatCurrency(campaign.stats?.total_raised / campaign.stats?.donor_count)
                                    : '$0.00'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Participants Table */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Student Leaderboard</h2>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Student</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Section</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Raised</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Progress</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Personal Link</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredParticipants.map((participant) => {
                                    const pPercent = Math.min(100, Math.round((participant.total_raised_cents / participant.personal_goal_cents) * 100));

                                    return (
                                        <tr key={participant.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-white font-medium">
                                                {participant.first_name} {participant.last_name}
                                            </td>
                                            <td className="px-6 py-4 text-white/60">{participant.section}</td>
                                            <td className="px-6 py-4 text-white font-medium">
                                                {formatCurrency(participant.total_raised_cents)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="w-32">
                                                    <div className="flex justify-between text-xs text-white/60 mb-1">
                                                        <span>{pPercent}%</span>
                                                        <span>of {formatCurrency(participant.personal_goal_cents)}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-500"
                                                            style={{ width: `${pPercent}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => copyLink(campaign.slug, participant.token)}
                                                        className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                                        title="Copy Link"
                                                    >
                                                        <LinkIcon className="w-4 h-4" />
                                                    </button>
                                                    <a
                                                        href={`/fundraising/${campaign.slug}/${participant.token}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                                        title="Open Page"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
