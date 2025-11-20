import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import { createTicketEvent, getEnsembles } from '../lib/opusApi';

export default function CreateEvent() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [ensembles, setEnsembles] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        program_notes: '',
        venue_name: '',
        venue_address: '',
        parking_instructions: '',
        dress_code: '',
        ensemble_id: '',
        status: 'draft'
    });

    React.useEffect(() => {
        loadEnsembles();
    }, []);

    const loadEnsembles = async () => {
        try {
            const data = await getEnsembles();
            setEnsembles(data || []);
            if (data && data.length > 0) {
                setFormData(prev => ({ ...prev, ensemble_id: data[0].id }));
            }
        } catch (err) {
            console.error('Failed to load ensembles:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e, status = 'draft') => {
        e.preventDefault();
        setLoading(true);

        try {
            const directorId = localStorage.getItem('directorId');
            const event = await createTicketEvent({
                ...formData,
                director_id: directorId,
                ensemble_id: formData.ensemble_id || null,
                status
            });

            navigate(`/director/tickets/events/${event.id}`);
        } catch (err) {
            alert('Failed to create event: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/director/tickets')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to Tickets
                </button>
                <h1 className="text-3xl font-bold text-white mb-2">Create Event</h1>
                <p className="text-gray-300">Set up a new ticketed event for your ensemble</p>
            </div>

            <form onSubmit={(e) => handleSubmit(e, 'draft')} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Event Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="e.g., Winter Concert 2024"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Subtitle
                            </label>
                            <input
                                type="text"
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="e.g., An Evening of Holiday Music"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Ensemble
                            </label>
                            <select
                                name="ensemble_id"
                                value={formData.ensemble_id}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">Select Ensemble...</option>
                                {ensembles.map(e => (
                                    <option key={e.id} value={e.id}>{e.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                placeholder="Brief description of the event..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Program Notes
                            </label>
                            <textarea
                                name="program_notes"
                                value={formData.program_notes}
                                onChange={handleChange}
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                placeholder="List of pieces, composers, performers..."
                            />
                        </div>
                    </div>
                </div>

                {/* Venue Info */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Venue Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Venue Name
                            </label>
                            <input
                                type="text"
                                name="venue_name"
                                value={formData.venue_name}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="e.g., Main Auditorium"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Venue Address
                            </label>
                            <textarea
                                name="venue_address"
                                value={formData.venue_address}
                                onChange={handleChange}
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                placeholder="Full address..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Parking Instructions
                            </label>
                            <textarea
                                name="parking_instructions"
                                value={formData.parking_instructions}
                                onChange={handleChange}
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                placeholder="Where to park, lot numbers, etc..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Dress Code
                            </label>
                            <input
                                type="text"
                                name="dress_code"
                                value={formData.dress_code}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="e.g., Concert black, Tuxedo, Formal"
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/director/tickets')}
                        className="px-6 py-3 rounded-xl font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !formData.title}
                        className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? 'Creating...' : (
                            <>
                                <SaveIcon className="w-4 h-4" />
                                Save as Draft
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
