import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon, PlusIcon, TrashIcon, CheckIcon } from 'lucide-react';
import { createTicketEvent, getEnsembles, createPerformance, createTicketType } from '../lib/opusApi';

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
    });

    const [performances, setPerformances] = useState([
        { performance_date: '', doors_open_time: '', start_time: '', end_time: '', capacity: '' }
    ]);

    const [ticketTypes, setTicketTypes] = useState([
        { name: 'Adult', price: '', seating_type: 'general_admission', quantity_available: '' },
        { name: 'Student', price: '', seating_type: 'general_admission', quantity_available: '' }
    ]);

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

    const handlePerformanceChange = (index, field, value) => {
        const updated = [...performances];
        updated[index][field] = value;
        setPerformances(updated);
    };

    const addPerformance = () => {
        setPerformances([...performances, { performance_date: '', doors_open_time: '', start_time: '', end_time: '', capacity: '' }]);
    };

    const removePerformance = (index) => {
        if (performances.length > 1) {
            setPerformances(performances.filter((_, i) => i !== index));
        }
    };

    const handleTicketTypeChange = (index, field, value) => {
        const updated = [...ticketTypes];
        updated[index][field] = value;
        setTicketTypes(updated);
    };

    const addTicketType = () => {
        setTicketTypes([...ticketTypes, { name: '', price: '', seating_type: 'general_admission', quantity_available: '' }]);
    };

    const removeTicketType = (index) => {
        if (ticketTypes.length > 1) {
            setTicketTypes(ticketTypes.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e, status = 'draft') => {
        e.preventDefault();
        setLoading(true);

        try {
            const directorId = localStorage.getItem('directorId');

            // Create the event
            const event = await createTicketEvent({
                ...formData,
                director_id: directorId,
                ensemble_id: formData.ensemble_id || null,
                status
            });

            // Create performances
            for (const perf of performances) {
                if (perf.performance_date && perf.start_time) {
                    await createPerformance({
                        ticket_event_id: event.id,
                        performance_date: perf.performance_date,
                        doors_open_time: perf.doors_open_time || null,
                        start_time: perf.start_time,
                        end_time: perf.end_time || null,
                        capacity: perf.capacity ? parseInt(perf.capacity) : null
                    });
                }
            }

            // Create ticket types
            for (const ticket of ticketTypes) {
                if (ticket.name && ticket.price) {
                    await createTicketType({
                        ticket_event_id: event.id,
                        name: ticket.name,
                        price: parseFloat(ticket.price),
                        seating_type: ticket.seating_type,
                        quantity_available: ticket.quantity_available ? parseInt(ticket.quantity_available) : null,
                        is_public: true,
                        sort_order: 0
                    });
                }
            }

            navigate('/director/tickets');
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

                {/* Performances */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Performances</h2>
                        <button
                            type="button"
                            onClick={addPerformance}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Add Show Time
                        </button>
                    </div>

                    <div className="space-y-4">
                        {performances.map((perf, index) => (
                            <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-white font-medium">Show {index + 1}</h3>
                                    {performances.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removePerformance(index)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Date *</label>
                                        <input
                                            type="date"
                                            value={perf.performance_date}
                                            onChange={(e) => handlePerformanceChange(index, 'performance_date', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Doors Open</label>
                                        <input
                                            type="time"
                                            value={perf.doors_open_time}
                                            onChange={(e) => handlePerformanceChange(index, 'doors_open_time', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Start Time *</label>
                                        <input
                                            type="time"
                                            value={perf.start_time}
                                            onChange={(e) => handlePerformanceChange(index, 'start_time', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">End Time</label>
                                        <input
                                            type="time"
                                            value={perf.end_time}
                                            onChange={(e) => handlePerformanceChange(index, 'end_time', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs text-gray-400 mb-1">Capacity (optional)</label>
                                        <input
                                            type="number"
                                            value={perf.capacity}
                                            onChange={(e) => handlePerformanceChange(index, 'capacity', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Leave blank for unlimited"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ticket Types */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Ticket Types</h2>
                        <button
                            type="button"
                            onClick={addTicketType}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Add Ticket Type
                        </button>
                    </div>

                    <div className="space-y-4">
                        {ticketTypes.map((ticket, index) => (
                            <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-white font-medium">Ticket Type {index + 1}</h3>
                                    {ticketTypes.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeTicketType(index)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Name *</label>
                                        <input
                                            type="text"
                                            value={ticket.name}
                                            onChange={(e) => handleTicketTypeChange(index, 'name', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="e.g., Adult, Student, VIP"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Price * ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={ticket.price}
                                            onChange={(e) => handleTicketTypeChange(index, 'price', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Seating Type</label>
                                        <select
                                            value={ticket.seating_type}
                                            onChange={(e) => handleTicketTypeChange(index, 'seating_type', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="general_admission">General Admission</option>
                                            <option value="reserved">Reserved Seating</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Quantity Available</label>
                                        <input
                                            type="number"
                                            value={ticket.quantity_available}
                                            onChange={(e) => handleTicketTypeChange(index, 'quantity_available', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Leave blank for unlimited"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
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
                        className="px-8 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <SaveIcon className="w-4 h-4" />
                                Save as Draft
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, 'published')}
                        disabled={loading || !formData.title}
                        className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? 'Publishing...' : (
                            <>
                                <CheckIcon className="w-4 h-4" />
                                Publish Event
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
