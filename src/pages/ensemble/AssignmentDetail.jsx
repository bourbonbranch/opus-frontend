import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, Clock, FileText, CheckCircle,
    Users, Download, Play, MessageSquare, MoreVertical, AlertCircle
} from 'lucide-react';
import { getAssignment, updateSubmission, deleteAssignment } from '../../lib/opusApi';
import SubmissionDrawer from '../../components/assignments/SubmissionDrawer';

export default function AssignmentDetail() {
    const { id, assignmentId } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('submissions'); // 'overview', 'submissions', 'settings'
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        loadAssignmentData();
    }, [assignmentId]);

    const loadAssignmentData = async () => {
        try {
            setLoading(true);
            const data = await getAssignment(assignmentId);
            setAssignment(data);
        } catch (err) {
            console.error('Failed to load assignment:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'submitted': return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'late': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
            case 'missing': return 'bg-red-500/20 text-red-300 border-red-500/30';
            case 'excused': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const handleGrade = (submission) => {
        setSelectedSubmission(submission);
        setIsDrawerOpen(true);
    };

    const handleSaveGrade = async (submissionId, data) => {
        try {
            await updateSubmission(submissionId, data);
            await loadAssignmentData(); // Reload to show updated grade
        } catch (err) {
            console.error('Failed to save grade:', err);
            alert('Failed to save grade. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">Assignment not found</p>
                <button
                    onClick={() => navigate(`/director/ensembles/${id}/assignments`)}
                    className="mt-4 text-purple-400 hover:text-purple-300"
                >
                    Back to Assignments
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <button
                        onClick={() => navigate(`/director/ensembles/${id}/assignments`)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Assignments
                    </button>
                    <h1 className="text-3xl font-bold text-white">{assignment.title}</h1>
                    <div className="flex items-center gap-4 mt-2 text-gray-400">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Due {new Date(assignment.due_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(assignment.due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${assignment.status === 'active' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                'bg-gray-500/20 text-gray-300 border-gray-500/30'
                            }`}>
                            {assignment.status}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10">
                <div className="flex gap-6">
                    {['overview', 'submissions', 'settings'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2 space-y-6">
                            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-gray-300 whitespace-pre-wrap">{assignment.description || 'No description provided.'}</p>
                                </div>
                            </div>

                            {assignment.attachments && assignment.attachments.length > 0 && (
                                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Attachments</h3>
                                    <div className="space-y-2">
                                        {assignment.attachments.map((file, idx) => (
                                            <a
                                                key={idx}
                                                href={file.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                                            >
                                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-white font-medium">{file.file_name}</div>
                                                    <div className="text-xs text-gray-400 uppercase">{file.file_type}</div>
                                                </div>
                                                <Download className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Stats</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-400">Completion</span>
                                            <span className="text-white">
                                                {Math.round((assignment.submissions?.filter(s => s.status === 'submitted').length || 0) / (assignment.submissions?.length || 1) * 100)}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                                style={{ width: `${(assignment.submissions?.filter(s => s.status === 'submitted').length || 0) / (assignment.submissions?.length || 1) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <div className="p-3 bg-white/5 rounded-lg text-center">
                                            <div className="text-2xl font-bold text-white">
                                                {assignment.submissions?.filter(s => s.status === 'submitted').length || 0}
                                            </div>
                                            <div className="text-xs text-gray-400">Submitted</div>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-lg text-center">
                                            <div className="text-2xl font-bold text-white">
                                                {assignment.submissions?.filter(s => s.status === 'missing').length || 0}
                                            </div>
                                            <div className="text-xs text-gray-400">Missing</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'submissions' && (
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Student</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Section</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Submitted</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Score</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {assignment.submissions?.map((submission) => (
                                    <tr key={submission.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">
                                                {submission.first_name} {submission.last_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {submission.section}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(submission.status)} capitalize`}>
                                                {submission.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {submission.score !== null ? submission.score : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleGrade(submission);
                                                }}
                                                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                                            >
                                                Grade
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Assignment Settings</h3>

                            <div className="space-y-4">
                                <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-300">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-white font-medium">Edit Details</div>
                                            <div className="text-sm text-gray-400">Update title, description, or due date</div>
                                        </div>
                                    </div>
                                    <ArrowLeft className="w-5 h-5 text-gray-500 rotate-180 group-hover:text-white transition-colors" />
                                </button>

                                <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
                                            <Download className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-white font-medium">Clone Assignment</div>
                                            <div className="text-sm text-gray-400">Create a copy of this assignment</div>
                                        </div>
                                    </div>
                                    <ArrowLeft className="w-5 h-5 text-gray-500 rotate-180 group-hover:text-white transition-colors" />
                                </button>

                                <div className="pt-4 border-t border-white/10">
                                    <button
                                        onClick={async () => {
                                            if (confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
                                                try {
                                                    await deleteAssignment(assignment.id);
                                                    navigate(`/director/ensembles/${id}/assignments`);
                                                } catch (err) {
                                                    console.error('Failed to delete assignment:', err);
                                                    alert('Failed to delete assignment');
                                                }
                                            }
                                        }}
                                        className="w-full flex items-center justify-between p-4 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors group border border-red-500/20"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-500/20 rounded-lg text-red-300">
                                                <AlertCircle className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-red-300 font-medium">Delete Assignment</div>
                                                <div className="text-sm text-red-400/70">Permanently remove this assignment and all submissions</div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Grading Drawer */}
            <SubmissionDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                submission={selectedSubmission}
                onSave={handleSaveGrade}
            />
        </div>
    );
}
