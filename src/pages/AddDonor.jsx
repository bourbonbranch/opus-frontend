import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { VITE_API_BASE_URL } from '../lib/opusApi';

export default function AddDonor() {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [ensembles, setEnsembles] = useState([]);
    const [loadingEnsembles, setLoadingEnsembles] = useState(true);
    const [formData, setFormData] = useState({
        ensembleId: localStorage.getItem('currentEnsembleId') || localStorage.getItem('ensembleId') || '',
        firstName: '',
        lastName: '',
        organizationName: '',
        email: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
        employer: '',
        preferredContactMethod: 'email',
        tags: [],
        notes: ''
    });
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        loadEnsembles();
    }, []);

    const loadEnsembles = async () => {
        try {
            const directorId = localStorage.getItem('directorId');
            if (!directorId) return;

            const response = await fetch(`${VITE_API_BASE_URL}/api/ensembles?directorId=${directorId}`);
            const data = await response.json();

            if (Array.isArray(data)) {
                setEnsembles(data);
                // If no ensemble selected and we have ensembles, select the first one
                if (!formData.ensembleId && data.length > 0) {
                    setFormData(prev => ({ ...prev, ensembleId: data[0].id }));
                }
            }
        } catch (err) {
            console.error('Error loading ensembles:', err);
        } finally {
            setLoadingEnsembles(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email) {
            alert('Email is required');
            return;
        }

        if (!formData.ensembleId) {
            alert('Please select an ensemble');
            return;
        }

        try {
            setSaving(true);
            const response = await fetch(`${VITE_API_BASE_URL}/api/donors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ensembleId: parseInt(formData.ensembleId),
                    email: formData.email,
                    firstName: formData.firstName || null,
                    lastName: formData.lastName || null,
                    organizationName: formData.organizationName || null,
                    phone: formData.phone || null,
                    address: {
                        line1: formData.addressLine1 || null,
                        line2: formData.addressLine2 || null,
                        city: formData.city || null,
                        state: formData.state || null,
                        postalCode: formData.postalCode || null,
                        country: formData.country
                    },
                    tags: formData.tags,
                    notes: formData.notes || null
                })
            });

            if (response.ok) {
                const donor = await response.json();
                navigate(`/director/donors/${donor.id}`);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to create donor');
            }
        } catch (err) {
            console.error('Error creating donor:', err);
            alert('Failed to create donor');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/director/donors')}
                        className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Donors
                    </button>
                    <h1 className="text-3xl font-bold text-white mb-2">Add New Donor</h1>
                    <p className="text-white/60">Create a new donor record manually</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Ensemble <span className="text-pink-400">*</span>
                                </label>
                                <select
                                    name="ensembleId"
                                    value={formData.ensembleId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pink-500/50"
                                >
                                    <option value="">Select an ensemble...</option>
                                    {ensembles.map(ensemble => (
                                        <option key={ensemble.id} value={ensemble.id}>
                                            {ensemble.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Organization Name
                                </label>
                                <input
                                    type="text"
                                    name="organizationName"
                                    value={formData.organizationName}
                                    onChange={handleChange}
                                    placeholder="Optional - for corporate donors"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Contact Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Email <span className="text-pink-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Preferred Contact Method
                                </label>
                                <select
                                    name="preferredContactMethod"
                                    value={formData.preferredContactMethod}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pink-500/50"
                                >
                                    <option value="email">Email</option>
                                    <option value="phone">Phone</option>
                                    <option value="mail">Mail</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Address</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Address Line 1
                                </label>
                                <input
                                    type="text"
                                    name="addressLine1"
                                    value={formData.addressLine1}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Address Line 2
                                </label>
                                <input
                                    type="text"
                                    name="addressLine2"
                                    value={formData.addressLine2}
                                    onChange={handleChange}
                                    placeholder="Apt, Suite, etc."
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="CA"
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Tags</h2>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    placeholder="Add tag (e.g., parent, alumni, sponsor)"
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
                                {formData.tags.map((tag, idx) => (
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
                    </div>

                    {/* Notes */}
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Notes</h2>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Add any additional notes about this donor..."
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50 resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/director/donors')}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Create Donor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
