import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, Filter, Download, Upload, QrCode, Mail, BarChart3 } from 'lucide-react';

export default function Recruiting() {
    const navigate = useNavigate();
    const [prospects, setProspects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        stage: '',
        interest_level: '',
        voice_part: '',
        graduation_year: ''
    });

    const directorId = localStorage.getItem('directorId');

    useEffect(() => {
        loadProspects();
    }, [filters]);

    const loadProspects = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                director_id: directorId,
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
            });

            if (searchTerm) {
                params.append('search', searchTerm);
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recruiting/prospects?${params}`);
            const data = await response.json();
            setProspects(data.prospects || []);
        } catch (err) {
            console.error('Error loading prospects:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadProspects();
    };

    const getInterestBadge = (level) => {
        const colors = {
            hot: 'bg-red-500/20 text-red-300 border-red-500/30',
            warm: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
            cold: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        };
        return colors[level] || colors.warm;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Recruiting</h1>
                        <p className="text-white/60">Manage prospective students and audition pipeline</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/director/recruiting/analytics')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span className="hidden sm:inline">Analytics</span>
                        </button>
                        <button
                            onClick={() => navigate('/director/recruiting/import')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                            <Upload className="w-4 h-4" />
                            <span className="hidden sm:inline">Import CSV</span>
                        </button>
                        <button
                            onClick={() => navigate('/director/recruiting/qr-code')}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                        >
                            <QrCode className="w-4 h-4" />
                            <span className="hidden sm:inline">QR Code</span>
                        </button>
                        <button
                            onClick={() => navigate('/director/recruiting/pipeline')}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            <span className="hidden sm:inline">Pipeline</span>
                        </button>
                        <button
                            onClick={() => navigate('/director/recruiting/new')}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-lg shadow-purple-500/20"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Prospect</span>
                        </button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6">
                    <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Search prospects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        <select
                            value={filters.voice_part}
                            onChange={(e) => setFilters({ ...filters, voice_part: e.target.value })}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">All Voice Parts</option>
                            <option value="Soprano">Soprano</option>
                            <option value="Alto">Alto</option>
                            <option value="Tenor">Tenor</option>
                            <option value="Bass">Bass</option>
                        </select>

                        <select
                            value={filters.interest_level}
                            onChange={(e) => setFilters({ ...filters, interest_level: e.target.value })}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">All Interest Levels</option>
                            <option value="hot">Hot</option>
                            <option value="warm">Warm</option>
                            <option value="cold">Cold</option>
                        </select>

                        <select
                            value={filters.graduation_year}
                            onChange={(e) => setFilters({ ...filters, graduation_year: e.target.value })}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">All Grad Years</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                            <option value="2028">2028</option>
                        </select>

                        <button
                            type="submit"
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <div className="text-white/60 text-sm mb-1">Total Prospects</div>
                        <div className="text-3xl font-bold text-white">{prospects.length}</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <div className="text-white/60 text-sm mb-1">Hot Leads</div>
                        <div className="text-3xl font-bold text-white">
                            {prospects.filter(p => p.interest_level === 'hot').length}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <div className="text-white/60 text-sm mb-1">Auditions Scheduled</div>
                        <div className="text-3xl font-bold text-white">
                            {prospects.filter(p => p.audition_scheduled).length}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <div className="text-white/60 text-sm mb-1">This Month</div>
                        <div className="text-3xl font-bold text-white">
                            {prospects.filter(p => {
                                const created = new Date(p.created_at);
                                const now = new Date();
                                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                            }).length}
                        </div>
                    </div>
                </div>

                {/* Prospects Table */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">High School</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Voice Part</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Grad Year</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Interest</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Stage</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-white/60">
                                            Loading prospects...
                                        </td>
                                    </tr>
                                ) : prospects.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <UserPlus className="w-12 h-12 text-white/20" />
                                                <p className="text-white/60">No prospects found</p>
                                                <button
                                                    onClick={() => navigate('/director/recruiting/new')}
                                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                                >
                                                    Add Your First Prospect
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    prospects.map((prospect) => (
                                        <tr
                                            key={prospect.id}
                                            className="hover:bg-white/5 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/director/recruiting/${prospect.id}`)}
                                        >
                                            <td className="px-6 py-4 text-white">
                                                {prospect.first_name} {prospect.last_name}
                                            </td>
                                            <td className="px-6 py-4 text-white/70">{prospect.email}</td>
                                            <td className="px-6 py-4 text-white/70">{prospect.high_school || '—'}</td>
                                            <td className="px-6 py-4 text-white/70">{prospect.voice_part || '—'}</td>
                                            <td className="px-6 py-4 text-white/70">{prospect.graduation_year || '—'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getInterestBadge(prospect.interest_level)}`}>
                                                    {prospect.interest_level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className="px-2 py-1 rounded-full text-xs font-medium"
                                                    style={{
                                                        backgroundColor: `${prospect.stage_color}20`,
                                                        color: prospect.stage_color,
                                                        borderColor: `${prospect.stage_color}40`,
                                                        borderWidth: '1px'
                                                    }}
                                                >
                                                    {prospect.stage_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/director/recruiting/${prospect.id}`);
                                                    }}
                                                    className="text-purple-400 hover:text-purple-300 transition-colors"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
