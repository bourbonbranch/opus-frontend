import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Users, School, Target } from 'lucide-react';

export default function RecruitingAnalytics() {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const directorId = localStorage.getItem('directorId');

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/recruiting/analytics?director_id=${directorId}`
            );
            const data = await response.json();
            setAnalytics(data);
        } catch (err) {
            console.error('Error loading analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
                <div className="text-white text-xl">Loading analytics...</div>
            </div>
        );
    }

    const voiceParts = analytics?.prospects_by_voice_part || {};
    const schools = analytics?.top_feeder_schools || [];
    const funnel = analytics?.conversion_funnel || {};
    const interestLevels = analytics?.interest_level_breakdown || {};

    const totalProspects = Object.values(voiceParts).reduce((sum, count) => sum + count, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/director/recruiting')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Recruiting Analytics</h1>
                        <p className="text-white/60">Insights into your recruiting pipeline and prospects</p>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-6 h-6 text-purple-400" />
                            <div className="text-white/60 text-sm">Total Prospects</div>
                        </div>
                        <div className="text-3xl font-bold text-white">{totalProspects}</div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Target className="w-6 h-6 text-red-400" />
                            <div className="text-white/60 text-sm">Leads</div>
                        </div>
                        <div className="text-3xl font-bold text-white">{interestLevels.hot || 0}</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                            <div className="text-white/60 text-sm">In Ensemble</div>
                        </div>
                        <div className="text-3xl font-bold text-white">{funnel['In Ensemble'] || 0}</div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <School className="w-6 h-6 text-blue-400" />
                            <div className="text-white/60 text-sm">Feeder Schools</div>
                        </div>
                        <div className="text-3xl font-bold text-white">{schools.length}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Voice Part Distribution */}
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Voice Part Distribution</h2>
                        <div className="space-y-4">
                            {Object.entries(voiceParts).map(([part, count]) => {
                                const percentage = totalProspects > 0 ? (count / totalProspects) * 100 : 0;
                                const colors = {
                                    Soprano: 'bg-pink-500',
                                    Alto: 'bg-purple-500',
                                    Tenor: 'bg-blue-500',
                                    Bass: 'bg-green-500',
                                    Unknown: 'bg-gray-500'
                                };
                                return (
                                    <div key={part}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white/80">{part}</span>
                                            <span className="text-white font-semibold">{count} ({percentage.toFixed(1)}%)</span>
                                        </div>
                                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${colors[part] || colors.Unknown} transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Conversion Funnel */}
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Conversion Funnel</h2>
                        <div className="space-y-4">
                            {Object.entries(funnel).map(([stage, count], index) => {
                                const maxCount = Math.max(...Object.values(funnel));
                                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                                const colors = [
                                    'bg-gray-500',
                                    'bg-blue-500',
                                    'bg-orange-500',
                                    'bg-purple-500',
                                    'bg-green-500',
                                    'bg-emerald-500',
                                    'bg-indigo-500'
                                ];
                                return (
                                    <div key={stage}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white/80">{stage}</span>
                                            <span className="text-white font-semibold">{count}</span>
                                        </div>
                                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${colors[index % colors.length]} transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Top Feeder Schools */}
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Top Feeder Schools</h2>
                        {schools.length > 0 ? (
                            <div className="space-y-3">
                                {schools.map((school, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-300 font-semibold">
                                                {index + 1}
                                            </div>
                                            <span className="text-white">{school.school}</span>
                                        </div>
                                        <span className="text-white/60">{school.count} prospects</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-white/40 py-8">
                                No feeder school data yet
                            </div>
                        )}
                    </div>

                    {/* Interest Level Breakdown */}
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Interest Level Breakdown</h2>
                        <div className="space-y-4">
                            {Object.entries(interestLevels).map(([level, count]) => {
                                const total = Object.values(interestLevels).reduce((sum, c) => sum + c, 0);
                                const percentage = total > 0 ? (count / total) * 100 : 0;
                                const colors = {
                                    hot: 'bg-red-500',
                                    warm: 'bg-orange-500',
                                    cold: 'bg-blue-500'
                                };
                                return (
                                    <div key={level}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white/80 capitalize">{level}</span>
                                            <span className="text-white font-semibold">{count} ({percentage.toFixed(1)}%)</span>
                                        </div>
                                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${colors[level] || 'bg-gray-500'} transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
