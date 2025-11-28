import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Heart, Search, Filter, ArrowUpDown, Mail, Tag, DollarSign } from 'lucide-react';
import { VITE_API_BASE_URL } from '../lib/opusApi';

export default function DonorsList() {
    const navigate = useNavigate();
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('last_donation_at');
    const [sortOrder, setSortOrder] = useState('DESC');

    const ensembleId = localStorage.getItem('currentEnsembleId') || localStorage.getItem('ensembleId');

    useEffect(() => {
        if (ensembleId) {
            loadDonors();
        }
    }, [ensembleId, search, sortBy, sortOrder]);

    const loadDonors = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                ensembleId,
                sortBy,
                sortOrder,
                limit: 100
            });

            if (search) {
                params.append('search', search);
            }

            const response = await fetch(`${VITE_API_BASE_URL}/api/donors?${params}`);
            const data = await response.json();

            if (Array.isArray(data)) {
                setDonors(data);
            } else {
                console.error('Invalid donors data:', data);
                setDonors([]);
            }
        } catch (err) {
            console.error('Error loading donors:', err);
            setDonors([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (cents) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format((cents || 0) / 100);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getDonorName = (donor) => {
        if (donor.organization_name) return donor.organization_name;
        const name = [donor.first_name, donor.last_name].filter(Boolean).join(' ');
        return name || 'Anonymous Donor';
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(field);
            setSortOrder('DESC');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Donors</h1>
                        <p className="text-white/60">Manage your donor relationships and giving history</p>
                    </div>
                    <button
                        onClick={() => navigate('/director/donors/new')}
                        className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors shadow-lg shadow-pink-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add Donor</span>
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="text"
                                placeholder="Search donors by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10">
                                <Filter className="w-4 h-4" />
                                <span className="hidden sm:inline">Filters</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-white/60">Loading donors...</p>
                    </div>
                ) : donors.length === 0 ? (
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-12 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-8 h-8 text-white/40" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Donors Yet</h3>
                        <p className="text-white/60 mb-6 max-w-md mx-auto">
                            {search ? 'No donors match your search criteria.' : 'Donors will appear here as people make donations to your campaigns.'}
                        </p>
                        {!search && (
                            <button
                                onClick={() => navigate('/director/fundraising')}
                                className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
                            >
                                View Fundraising Campaigns
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 border-b border-white/10 text-sm font-medium text-white/60">
                            <div className="col-span-3 flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => handleSort('first_name')}>
                                Name
                                <ArrowUpDown className="w-4 h-4" />
                            </div>
                            <div className="col-span-3">Email</div>
                            <div className="col-span-2">Tags</div>
                            <div className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => handleSort('lifetime_donation_cents')}>
                                Lifetime Giving
                                <ArrowUpDown className="w-4 h-4" />
                            </div>
                            <div className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => handleSort('last_donation_at')}>
                                Last Donation
                                <ArrowUpDown className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-white/10">
                            {donors.map((donor) => (
                                <div
                                    key={donor.id}
                                    onClick={() => navigate(`/director/donors/${donor.id}`)}
                                    className="grid grid-cols-12 gap-4 p-4 hover:bg-white/5 cursor-pointer transition-colors group"
                                >
                                    <div className="col-span-3">
                                        <div className="font-medium text-white group-hover:text-pink-400 transition-colors">
                                            {getDonorName(donor)}
                                        </div>
                                        {donor.organization_name && donor.first_name && (
                                            <div className="text-sm text-white/60">
                                                {donor.first_name} {donor.last_name}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-span-3 flex items-center gap-2 text-white/80">
                                        {donor.email && (
                                            <>
                                                <Mail className="w-4 h-4 text-white/40" />
                                                <span className="truncate">{donor.email}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="col-span-2 flex items-center gap-1 flex-wrap">
                                        {donor.tags && donor.tags.length > 0 ? (
                                            donor.tags.slice(0, 2).map((tag, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                                                    {tag}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-white/40 text-sm">—</span>
                                        )}
                                    </div>
                                    <div className="col-span-2 flex items-center gap-2 text-white font-medium">
                                        <DollarSign className="w-4 h-4 text-green-400" />
                                        {formatCurrency(donor.lifetime_donation_cents)}
                                    </div>
                                    <div className="col-span-2 text-white/60 text-sm">
                                        {formatDate(donor.last_donation_at)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
