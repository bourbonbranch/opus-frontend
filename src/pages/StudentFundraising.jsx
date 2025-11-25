import React, { useState } from 'react';
import { Search, DollarSign, Link as LinkIcon, ExternalLink, Copy } from 'lucide-react';

export default function StudentFundraising() {
    const [email, setEmail] = useState('');
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setSearched(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';
            const response = await fetch(`${API_URL}/api/student/campaigns?student_email=${encodeURIComponent(email)}`);
            const data = await response.json();
            setCampaigns(data || []);
        } catch (err) {
            console.error('Error loading campaigns:', err);
            setCampaigns([]);
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
        const baseUrl = window.location.origin;
        return `${baseUrl}/fundraising/${slug}/${token}`;
    };

    const copyLink = (slug, token) => {
        const link = getPublicLink(slug, token);
        navigator.clipboard.writeText(link);
        alert('Link copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 p-6 flex flex-col items-center">
            <div className="max-w-3xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Student Fundraising Portal</h1>
                    <p className="text-blue-200">Enter your email to find your personal fundraising links.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 mb-8">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your school email..."
                                className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Searching...' : 'Find Campaigns'}
                        </button>
                    </form>
                </div>

                {searched && !loading && campaigns.length === 0 && (
                    <div className="text-center text-white/60 py-8">
                        No active fundraising campaigns found for this email.
                    </div>
                )}

                <div className="space-y-6">
                    {campaigns.map((campaign) => {
                        const percent = Math.min(100, Math.round((campaign.total_raised_cents / campaign.personal_goal_cents) * 100));

                        return (
                            <div key={campaign.id} className="bg-white rounded-2xl p-6 shadow-xl">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{campaign.name}</h2>
                                        <p className="text-gray-500">{campaign.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => copyLink(campaign.slug, campaign.token)}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                                        >
                                            <Copy className="w-4 h-4" />
                                            Copy Link
                                        </button>
                                        <a
                                            href={getPublicLink(campaign.slug, campaign.token)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            View Page
                                        </a>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <div className="text-sm text-gray-500 mb-1">Total Raised</div>
                                            <div className="text-3xl font-bold text-gray-900">
                                                {formatCurrency(campaign.total_raised_cents)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500 mb-1">Goal</div>
                                            <div className="text-xl font-semibold text-gray-700">
                                                {formatCurrency(campaign.personal_goal_cents)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
                                        <div
                                            className="h-full bg-green-500 transition-all duration-1000"
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-right text-sm font-medium text-green-600">
                                        {percent}% Complete
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
