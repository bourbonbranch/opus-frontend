import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, School, Calendar, Edit, Save, X, MessageSquare, UserCheck } from 'lucide-react';

export default function ProspectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [prospect, setProspect] = useState(null);
    const [communications, setCommunications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [newNote, setNewNote] = useState('');
    const [showConvert, setShowConvert] = useState(false);

    const directorId = localStorage.getItem('directorId');

    const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';

    useEffect(() => {
        loadProspect();
    }, [id]);

    const loadProspect = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/recruiting/prospects/${id}`);
            const data = await response.json();
            setProspect(data.prospect);
            setCommunications(data.communications || []);
            setFormData(data.prospect);
        } catch (err) {
            console.error('Error loading prospect:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`${API_URL}/api/recruiting/prospects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setEditing(false);
                loadProspect();
            }
        } catch (err) {
            console.error('Error updating prospect:', err);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        try {
            await fetch(`${API_URL}/api/recruiting/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prospect_ids: [id],
                    sent_by: directorId
                })
            });

            // Add note to communications
            const response = await fetch(`${API_URL}/api/recruiting/prospects/${id}`);
            const data = await response.json();
            setCommunications(data.communications || []);
            setNewNote('');
        } catch (err) {
            console.error('Error adding note:', err);
        }
    };

    const handleConvert = async (ensembleId) => {
        try {
            const response = await fetch(`${API_URL}/api/recruiting/prospects/${id}/convert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ensemble_id: ensembleId,
                    voice_part: prospect.voice_part,
                    section: prospect.voice_part
                })
            });

            if (response.ok) {
                alert('Prospect converted to student successfully!');
                navigate('/director/recruiting');
            }
        } catch (err) {
            console.error('Error converting prospect:', err);
            alert('Failed to convert prospect');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
                <div className="text-white text-xl">Loading prospect...</div>
            </div>
        );
    }

    if (!prospect) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
                <div className="text-white text-xl">Prospect not found</div>
            </div>
        );
    }

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
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/director/recruiting')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-white" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {prospect.first_name} {prospect.last_name}
                            </h1>
                            <p className="text-white/60">{prospect.email}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {editing ? (
                            <>
                                <button
                                    onClick={() => setEditing(false)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    Save
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => setShowConvert(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-lg shadow-green-500/20"
                                >
                                    <UserCheck className="w-4 h-4" />
                                    Convert to Student
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white/60 text-sm mb-1">Email</label>
                                    {editing ? (
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-white">
                                            <Mail className="w-4 h-4 text-white/40" />
                                            {prospect.email}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-white/60 text-sm mb-1">Phone</label>
                                    {editing ? (
                                        <input
                                            type="tel"
                                            value={formData.phone || ''}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-white">
                                            <Phone className="w-4 h-4 text-white/40" />
                                            {prospect.phone || '—'}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-white/60 text-sm mb-1">High School</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={formData.high_school || ''}
                                            onChange={(e) => setFormData({ ...formData, high_school: e.target.value })}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-white">
                                            <School className="w-4 h-4 text-white/40" />
                                            {prospect.high_school || '—'}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-white/60 text-sm mb-1">Graduation Year</label>
                                    {editing ? (
                                        <input
                                            type="number"
                                            value={formData.graduation_year || ''}
                                            onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-white">
                                            <Calendar className="w-4 h-4 text-white/40" />
                                            {prospect.graduation_year || '—'}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-white/60 text-sm mb-1">Voice Part</label>
                                    {editing ? (
                                        <select
                                            value={formData.voice_part || ''}
                                            onChange={(e) => setFormData({ ...formData, voice_part: e.target.value })}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        >
                                            <option value="">Select...</option>
                                            <option value="Soprano">Soprano</option>
                                            <option value="Alto">Alto</option>
                                            <option value="Tenor">Tenor</option>
                                            <option value="Bass">Bass</option>
                                        </select>
                                    ) : (
                                        <div className="text-white">{prospect.voice_part || '—'}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-white/60 text-sm mb-1">Interest Level</label>
                                    {editing ? (
                                        <select
                                            value={formData.interest_level}
                                            onChange={(e) => setFormData({ ...formData, interest_level: e.target.value })}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        >
                                            <option value="hot">Hot</option>
                                            <option value="warm">Warm</option>
                                            <option value="cold">Cold</option>
                                        </select>
                                    ) : (
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getInterestBadge(prospect.interest_level)}`}>
                                            {prospect.interest_level}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {prospect.notes && (
                                <div className="mt-4">
                                    <label className="block text-white/60 text-sm mb-1">Notes</label>
                                    {editing ? (
                                        <textarea
                                            value={formData.notes || ''}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            rows="3"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        />
                                    ) : (
                                        <div className="text-white/80">{prospect.notes}</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Communication History */}
                        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">Communication History</h2>

                            {/* Add Note */}
                            <div className="mb-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        placeholder="Add a note..."
                                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button
                                        onClick={handleAddNote}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Communications List */}
                            <div className="space-y-3">
                                {communications.length > 0 ? (
                                    communications.map((comm) => (
                                        <div key={comm.id} className="p-4 bg-white/5 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-white/60 text-sm capitalize">{comm.type}</span>
                                                <span className="text-white/40 text-xs">
                                                    {new Date(comm.sent_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {comm.subject && (
                                                <div className="text-white font-medium mb-1">{comm.subject}</div>
                                            )}
                                            {comm.message && (
                                                <div className="text-white/80 text-sm">{comm.message}</div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-white/40 py-8">
                                        No communications yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Quick Info</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-white/60 text-sm">Stage</div>
                                    <div
                                        className="mt-1 px-3 py-1 rounded-full text-sm font-medium inline-block"
                                        style={{
                                            backgroundColor: `${prospect.stage_color}20`,
                                            color: prospect.stage_color,
                                            borderColor: `${prospect.stage_color}40`,
                                            borderWidth: '1px'
                                        }}
                                    >
                                        {prospect.stage_name}
                                    </div>
                                </div>

                                {prospect.source && (
                                    <div>
                                        <div className="text-white/60 text-sm">Source</div>
                                        <div className="text-white">{prospect.source}</div>
                                        {prospect.source_detail && (
                                            <div className="text-white/60 text-xs">{prospect.source_detail}</div>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <div className="text-white/60 text-sm">Added</div>
                                    <div className="text-white">{new Date(prospect.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Convert Modal */}
                {showConvert && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-xl border border-white/10 p-6 max-w-md w-full mx-4">
                            <h2 className="text-2xl font-bold text-white mb-4">Convert to Student</h2>
                            <p className="text-white/60 mb-6">
                                This will add {prospect.first_name} {prospect.last_name} to your roster.
                            </p>

                            <div className="mb-6">
                                <label className="block text-white/80 text-sm font-medium mb-2">Select Ensemble</label>
                                <select
                                    id="ensemble-select"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Choose an ensemble...</option>
                                </select>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConvert(false)}
                                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        const select = document.getElementById('ensemble-select');
                                        if (select.value) {
                                            handleConvert(select.value);
                                            setShowConvert(false);
                                        } else {
                                            alert('Please select an ensemble');
                                        }
                                    }}
                                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                    Convert
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
