import React, { useState, useEffect } from 'react';
import { Plus, Filter, Calendar, List, Clock, CheckCircle, Users } from 'lucide-react';
import { getAssignments, createAssignment } from '../../lib/opusApi';
import NewAssignmentModal from '../../components/assignments/NewAssignmentModal';

export default function Assignments() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEnsembleId, setSelectedEnsembleId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [viewMode, setViewMode] = useState('list');

    useEffect(() => {
        // Get ensemble ID from URL or localStorage
        const ensembleId = localStorage.getItem('selectedEnsembleId') || 1;
        setSelectedEnsembleId(ensembleId);
        loadAssignments(ensembleId);
    }, []);

    const loadAssignments = async (ensembleId, filters = {}) => {
        try {
            setLoading(true);
            const data = await getAssignments(ensembleId, filters);
            setAssignments(data);
        } catch (err) {
            console.error('Failed to load assignments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterType, value) => {
        const filters = {};
        if (filterType === 'status') {
            setStatusFilter(value);
            if (value !== 'all') filters.status = value;
        } else if (filterType === 'type') {
            setTypeFilter(value);
            if (value !== 'all') filters.type = value;
        }
        loadAssignments(selectedEnsembleId, filters);
    };

    const handleCreateAssignment = async (assignmentData) => {
        try {
            await createAssignment(assignmentData);
            await loadAssignments(selectedEnsembleId);
            alert('Assignment created successfully!');
        } catch (err) {
            console.error('Failed to create assignment:', err);
            alert('Failed to create assignment. Please try again.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'draft': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
            case 'closed': return 'bg-red-500/20 text-red-300 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'memorization': return '🧠';
            case 'recording': return '🎤';
            case 'written': return '✍️';
            case 'check-in': return '✓';
            default: return '📋';
        }
    };

    const formatDueDate = (dueAt) => {
        const date = new Date(dueAt);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return <span className="text-red-400">Overdue</span>;
        if (diffDays === 0) return <span className="text-orange-400">Due today</span>;
        if (diffDays === 1) return <span className="text-yellow-400">Due tomorrow</span>;
        if (diffDays <= 7) return <span className="text-blue-400">Due in {diffDays} days</span>;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Assignments</h1>
                        <p className="text-gray-400 mt-1">Manage and track student assignments</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg shadow-purple-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        New Assignment
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div className="flex items-center gap-2">
                            <select
                                value={typeFilter}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All Types</option>
                                <option value="memorization">Memorization</option>
                                <option value="recording">Recording</option>
                                <option value="written">Written</option>
                                <option value="check-in">Check-in</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* View Mode */}
                        <div className="flex items-center gap-2 ml-auto">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:bg-white/5'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'calendar' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:bg-white/5'}`}
                            >
                                <Calendar className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Assignments List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                        <p className="text-gray-400 mt-4">Loading assignments...</p>
                    </div>
                ) : assignments.length === 0 ? (
                    /* Empty State */
                    <div className="bg-gray-800/30 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No assignments yet</h3>
                        <p className="text-gray-400 mb-6">Create your first assignment to get started</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
                        >
                            Create Assignment
                        </button>
                    </div>
                ) : (
                    /* Assignments Table */
                    <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Title</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Due Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Completion</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {assignments.map((assignment) => (
                                    <tr key={assignment.id} className="hover:bg-white/5 cursor-pointer transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{assignment.title}</div>
                                            {assignment.measures_text && (
                                                <div className="text-sm text-gray-400 mt-1">{assignment.measures_text}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-2xl">{getTypeIcon(assignment.type)}</span>
                                            <span className="ml-2 text-sm text-gray-400 capitalize">{assignment.type}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                {formatDueDate(assignment.due_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all"
                                                        style={{
                                                            width: `${assignment.total_submissions > 0 ? (assignment.completed_submissions / assignment.total_submissions) * 100 : 0}%`
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-400 whitespace-nowrap">
                                                    {assignment.completed_submissions || 0}/{assignment.total_submissions || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
                                                {assignment.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* New Assignment Modal */}
            <NewAssignmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleCreateAssignment}
                ensembleId={selectedEnsembleId}
            />
        </div>
    );
}
