import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Mail, Phone, MapPin, Edit, Plus, DollarSign,
    Calendar, Tag, FileText, Send, Trash2, Building2, User, Save, X
} from 'lucide-react';
import { VITE_API_BASE_URL } from '../lib/opusApi';

export default function DonorDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [donor, setDonor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [editForm, setEditForm] = useState({});
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        loadDonor();
    }, [id]);

    useEffect(() => {
        if (donor && isEditing) {
            setEditForm({
                first_name: donor.first_name || '',
                last_name: donor.last_name || '',
                organization_name: donor.organization_name || '',
                email: donor.email || '',
                phone: donor.phone || '',
                address_line1: donor.address_line1 || '',
                address_line2: donor.address_line2 || '',
                city: donor.city || '',
                state: donor.state || '',
                postal_code: donor.postal_code || '',
                country: donor.country || 'US',
                employer: donor.employer || '',
                preferred_contact_method: donor.preferred_contact_method || 'email',
                tags: donor.tags || [],
                notes: donor.notes || ''
            });
        }
    }, [donor, isEditing]);

    const loadDonor = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${VITE_API_BASE_URL}/api/donors/${id}`);
            const data = await response.json();
            setDonor(data);
        } catch (err) {
            console.error('Error loading donor:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !editForm.tags.includes(tagInput.trim())) {
            setEditForm(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setEditForm(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSaveEdit = async () => {
        try {
            setSaving(true);
            const response = await fetch(`${VITE_API_BASE_URL}/api/donors/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            if (response.ok) {
                await loadDonor();
                setIsEditing(false);
            } else {
                alert('Failed to update donor');
            }
        } catch (err) {
            console.error('Error updating donor:', err);
            alert('Failed to update donor');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditForm({});
    };

    const formatCurrency = (cents) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format((cents || 0) / 100);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const getDonorName = (donor) => {
        if (!donor) return '';
        if (donor.organization_name) return donor.organization_name;
        const name = [donor.first_name, donor.last_name].filter(Boolean).join(' ');
        return name || 'Anonymous Donor';
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        try {
            await fetch(`${VITE_API_BASE_URL}/api/donors/${id}/activities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ensembleId: donor.ensemble_id,
                    type: 'manual_log',
                    summary: newNote,
                    details: {}
                })
            });

            setNewNote('');
            loadDonor(); // Reload to show new activity
        } catch (err) {
            console.error('Error adding note:', err);
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'donation': return <DollarSign className="w-4 h-4 text-green-400" />;
            case 'ticket_purchase': return <Calendar className="w-4 h-4 text-blue-400" />;
            case 'email_sent': return <Mail className="w-4 h-4 text-purple-400" />;
            case 'manual_log': return <FileText className="w-4 h-4 text-gray-400" />;
            default: return <FileText className="w-4 h-4 text-gray-400" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white/60">Loading donor...</p>
                </div>
            </div>
        );
    }

    if (!donor) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-12 text-center">
                        <h3 className="text-xl font-semibold text-white mb-2">Donor Not Found</h3>
                        <p className="text-white/60 mb-6">This donor may have been deleted.</p>
                        <button
                            onClick={() => navigate('/director/donors')}
                            className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
                        >
                            Back to Donors
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/director/donors')}
                        className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Donors
                    </button>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{getDonorName(donor)}</h1>
                            <div className="flex items-center gap-4 text-white/60">
                                {donor.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        {donor.email}
                                    </div>
                                )}
                                {donor.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        {donor.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                                    >
                                        <Save className="w-4 h-4" />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit Form Modal */}
                {isEditing && (
                    <div className="mb-6 bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Edit Donor Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={editForm.first_name}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={editForm.last_name}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-white/80 mb-2">Organization Name</label>
                                <input
                                    type="text"
                                    name="organization_name"
                                    value={editForm.organization_name}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editForm.email}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={editForm.phone}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-white/80 mb-2">Address Line 1</label>
                                <input
                                    type="text"
                                    name="address_line1"
                                    value={editForm.address_line1}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-white/80 mb-2">Address Line 2</label>
                                <input
                                    type="text"
                                    name="address_line2"
                                    value={editForm.address_line2}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={editForm.city}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={editForm.state}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">Postal Code</label>
                                <input
                                    type="text"
                                    name="postal_code"
                                    value={editForm.postal_code}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-white/80 mb-2">Tags</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                        placeholder="Add tag"
                                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddTag}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {editForm.tags && editForm.tags.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full flex items-center gap-2"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="hover:text-white"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-white/80 mb-2">Notes</label>
                                <textarea
                                    name="notes"
                                    value={editForm.notes}
                                    onChange={handleEditChange}
                                    rows="4"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50 resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Three Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Donor Summary */}
                    <div className="space-y-6">
                        {/* Stats Card */}
                        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Giving Summary</h2>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm text-white/60 mb-1">Lifetime Giving</div>
                                    <div className="text-2xl font-bold text-green-400">
                                        {formatCurrency(donor.lifetime_donation_cents)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-white/60 mb-1">This Year</div>
                                    <div className="text-xl font-semibold text-white">
                                        {formatCurrency(donor.ytd_donation_cents)}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                    <div>
                                        <div className="text-xs text-white/60 mb-1">First Gift</div>
                                        <div className="text-sm text-white">{formatDate(donor.first_donation_at)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-white/60 mb-1">Last Gift</div>
                                        <div className="text-sm text-white">{formatDate(donor.last_donation_at)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info Card */}
                        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Contact Information</h2>
                            <div className="space-y-3 text-sm">
                                {donor.organization_name && (
                                    <div className="flex items-start gap-2">
                                        <Building2 className="w-4 h-4 text-white/40 mt-0.5" />
                                        <div>
                                            <div className="text-white/60">Organization</div>
                                            <div className="text-white">{donor.organization_name}</div>
                                        </div>
                                    </div>
                                )}
                                {(donor.first_name || donor.last_name) && (
                                    <div className="flex items-start gap-2">
                                        <User className="w-4 h-4 text-white/40 mt-0.5" />
                                        <div>
                                            <div className="text-white/60">Contact Person</div>
                                            <div className="text-white">{donor.first_name} {donor.last_name}</div>
                                        </div>
                                    </div>
                                )}
                                {(donor.address_line1 || donor.city) && (
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-white/40 mt-0.5" />
                                        <div>
                                            <div className="text-white/60">Address</div>
                                            <div className="text-white">
                                                {donor.address_line1 && <div>{donor.address_line1}</div>}
                                                {donor.address_line2 && <div>{donor.address_line2}</div>}
                                                {(donor.city || donor.state || donor.postal_code) && (
                                                    <div>
                                                        {donor.city}{donor.city && donor.state ? ', ' : ''}{donor.state} {donor.postal_code}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tags Card */}
                        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-white">Tags</h2>
                                <button className="text-pink-400 hover:text-pink-300">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {donor.tags && donor.tags.length > 0 ? (
                                    donor.tags.map((tag, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-white/40 text-sm">No tags yet</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Middle Column - Donations */}
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Donation History</h2>
                        {donor.donations && donor.donations.length > 0 ? (
                            <div className="space-y-3">
                                {donor.donations.map((donation) => (
                                    <div key={donation.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="text-lg font-semibold text-green-400">
                                                {formatCurrency(donation.amount_cents)}
                                            </div>
                                            <div className="text-xs text-white/60">
                                                {formatDate(donation.created_at)}
                                            </div>
                                        </div>
                                        {donation.campaign_name && (
                                            <div className="text-sm text-white mb-1">{donation.campaign_name}</div>
                                        )}
                                        {donation.student_first_name && (
                                            <div className="text-xs text-white/60">
                                                P2P for {donation.student_first_name} {donation.student_last_name}
                                            </div>
                                        )}
                                        {donation.message && (
                                            <div className="text-xs text-white/60 mt-2 italic">
                                                "{donation.message}"
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-white/40 text-center py-8">No donations yet</p>
                        )}
                    </div>

                    {/* Right Column - Activity Timeline */}
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Activity Timeline</h2>

                        {/* Add Note Form */}
                        <div className="mb-6">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add a note..."
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50 resize-none"
                                rows="3"
                            />
                            <button
                                onClick={handleAddNote}
                                disabled={!newNote.trim()}
                                className="mt-2 flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add Note
                            </button>
                        </div>

                        {/* Timeline */}
                        {donor.activities && donor.activities.length > 0 ? (
                            <div className="space-y-4">
                                {donor.activities.map((activity) => (
                                    <div key={activity.id} className="flex gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-white/5 rounded-full flex items-center justify-center">
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-white">{activity.summary}</div>
                                            <div className="text-xs text-white/40 mt-1">
                                                {formatDateTime(activity.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-white/40 text-center py-8 text-sm">No activity yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
