import React, { useState, useEffect } from 'react';
import { CalendarIcon, PlusIcon, MapPinIcon, ClockIcon, TrashIcon, RepeatIcon } from 'lucide-react';
import { getEnsembles, getEvents, createEvent, deleteEvent, getRooms } from '../lib/opusApi';

export function Events() {
    const [ensembles, setEnsembles] = useState([]);
    const [selectedEnsembleId, setSelectedEnsembleId] = useState(null);
    const [events, setEvents] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        name: '',
        type: 'rehearsal',
        room_id: '',
        start_time: '',
        end_time: '',
        description: '',
        is_recurring: false,
        recurrence_pattern: 'weekly',
        recurrence_days: [],
        recurrence_end_date: '',
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadEnsembles();
        loadRooms();
    }, []);

    useEffect(() => {
        if (selectedEnsembleId) {
            loadEvents();
        }
    }, [selectedEnsembleId]);

    const loadEnsembles = async () => {
        try {
            const data = await getEnsembles();
            setEnsembles(data || []);
            if (data && data.length > 0) {
                setSelectedEnsembleId(data[0].id);
            }
        } catch (err) {
            console.error('Failed to load ensembles', err);
        } finally {
            setLoading(false);
        }
    };

    const loadRooms = async () => {
        try {
            const data = await getRooms();
            setRooms(data || []);
        } catch (err) {
            console.error('Failed to load rooms', err);
        }
    };

    const loadEvents = async () => {
        if (!selectedEnsembleId) return;
        try {
            const data = await getEvents(selectedEnsembleId);
            setEvents(data || []);
        } catch (err) {
            console.error('Failed to load events', err);
        }
    };

    const generateRecurringEvents = () => {
        const events = [];
        const startDate = new Date(newEvent.start_time);
        const endDate = new Date(newEvent.end_time);
        const recurEndDate = new Date(newEvent.recurrence_end_date);

        const duration = endDate - startDate; // Duration in milliseconds

        let currentDate = new Date(startDate);

        while (currentDate <= recurEndDate) {
            const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

            // Check if this day matches the recurrence pattern
            if (newEvent.recurrence_pattern === 'daily' ||
                (newEvent.recurrence_pattern === 'weekly' && newEvent.recurrence_days.includes(dayOfWeek))) {

                const eventStart = new Date(currentDate);
                const eventEnd = new Date(currentDate.getTime() + duration);

                events.push({
                    ensemble_id: selectedEnsembleId,
                    room_id: newEvent.room_id || null,
                    name: newEvent.name,
                    type: newEvent.type,
                    start_time: eventStart.toISOString(),
                    end_time: eventEnd.toISOString(),
                    description: newEvent.description,
                });
            }

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return events;
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            if (newEvent.is_recurring) {
                // Generate and create multiple events
                const recurringEvents = generateRecurringEvents();

                if (recurringEvents.length === 0) {
                    alert('No events match your recurrence pattern. Please check your settings.');
                    setCreating(false);
                    return;
                }

                if (recurringEvents.length > 100) {
                    if (!confirm(`This will create ${recurringEvents.length} events. Continue?`)) {
                        setCreating(false);
                        return;
                    }
                }

                // Create all events
                for (const event of recurringEvents) {
                    await createEvent(event);
                }

                alert(`Successfully created ${recurringEvents.length} recurring events!`);
            } else {
                // Create single event
                await createEvent({
                    ensemble_id: selectedEnsembleId,
                    room_id: newEvent.room_id || null,
                    name: newEvent.name,
                    type: newEvent.type,
                    start_time: newEvent.start_time,
                    end_time: newEvent.end_time,
                    description: newEvent.description,
                });
            }

            setNewEvent({
                name: '',
                type: 'rehearsal',
                room_id: '',
                start_time: '',
                end_time: '',
                description: '',
                is_recurring: false,
                recurrence_pattern: 'weekly',
                recurrence_days: [],
                recurrence_end_date: '',
            });
            setIsAddModalOpen(false);
            loadEvents();
        } catch (err) {
            alert('Failed to create event: ' + err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            await deleteEvent(eventId);
            loadEvents();
        } catch (err) {
            alert('Failed to delete event: ' + err.message);
        }
    };

    const toggleRecurrenceDay = (day) => {
        if (newEvent.recurrence_days.includes(day)) {
            setNewEvent({
                ...newEvent,
                recurrence_days: newEvent.recurrence_days.filter(d => d !== day),
            });
        } else {
            setNewEvent({
                ...newEvent,
                recurrence_days: [...newEvent.recurrence_days, day],
            });
        }
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const getEventTypeColor = (type) => {
        const colors = {
            rehearsal: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
            concert: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
            performance: 'bg-pink-500/20 text-pink-300 border-pink-400/30',
            sectional: 'bg-green-500/20 text-green-300 border-green-400/30',
            other: 'bg-gray-500/20 text-gray-300 border-gray-400/30',
        };
        return colors[type] || colors.other;
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (loading) {
        return (
            <div className="p-8 max-w-6xl mx-auto">
                <p className="text-gray-300">Loading...</p>
            </div>
        );
    }

    if (ensembles.length === 0) {
        return (
            <div className="p-8 max-w-6xl mx-auto">
                <div className="text-center py-12 bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/30">
                    <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-4">No ensembles yet</p>
                    <p className="text-sm text-gray-400">Create an ensemble first to add events</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2 drop-shadow-lg">
                        Events & Schedule
                    </h1>
                    <p className="text-sm md:text-base text-gray-200">Manage rehearsals, concerts, and performances</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-2xl shadow-purple-500/50 border border-white/20"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Event</span>
                </button>
            </div>

            {/* Ensemble Selector */}
            {ensembles.length > 1 && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        Select Ensemble
                    </label>
                    <select
                        value={selectedEnsembleId || ''}
                        onChange={(e) => setSelectedEnsembleId(parseInt(e.target.value))}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        {ensembles.map((ens) => (
                            <option key={ens.id} value={ens.id}>
                                {ens.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Events List */}
            {events.length === 0 ? (
                <div className="text-center py-12 bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/30">
                    <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-4">No events scheduled yet</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
                    >
                        Schedule Your First Event
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/30 shadow-2xl p-6"
                        >
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                        <h3 className="text-lg sm:text-xl font-semibold text-white">{event.name}</h3>
                                        <span className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getEventTypeColor(event.type)}`}>
                                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                        </span>
                                    </div>
                                    {event.description && (
                                        <p className="text-gray-300 text-sm mb-3">{event.description}</p>
                                    )}
                                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-gray-200">
                                            <CalendarIcon className="w-5 h-5 text-purple-300 flex-shrink-0" />
                                            <span className="text-base">{formatDateTime(event.start_time)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-200">
                                            <ClockIcon className="w-5 h-5 text-blue-300 flex-shrink-0" />
                                            <span className="text-base">
                                                {formatTime(event.start_time)} - {formatTime(event.end_time)}
                                            </span>
                                        </div>
                                        {event.room_name && (
                                            <div className="flex items-center gap-2 text-gray-200">
                                                <MapPinIcon className="w-5 h-5 text-green-300 flex-shrink-0" />
                                                <span className="text-base">{event.room_name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 sm:flex-col">
                                    <button
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="p-2 min-h-[44px] min-w-[44px] bg-red-500/20 border border-red-400/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center"
                                        aria-label="Delete event"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Event Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-xl font-semibold text-white">Add New Event</h2>
                        </div>
                        <form onSubmit={handleAddEvent} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Event Name *
                                </label>
                                <input
                                    type="text"
                                    value={newEvent.name}
                                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                                    placeholder="e.g., Monday Rehearsal, Spring Concert"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Event Type *
                                    </label>
                                    <select
                                        value={newEvent.type}
                                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="rehearsal">Rehearsal</option>
                                        <option value="concert">Concert</option>
                                        <option value="performance">Performance</option>
                                        <option value="sectional">Sectional</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Room (for attendance tracking)
                                    </label>
                                    <select
                                        value={newEvent.room_id}
                                        onChange={(e) => setNewEvent({ ...newEvent, room_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">No room</option>
                                        {rooms.map((room) => (
                                            <option key={room.id} value={room.id}>
                                                {room.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Start Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={newEvent.start_time}
                                        onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        End Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={newEvent.end_time}
                                        onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Recurring Event Section */}
                            <div className="border-t border-white/10 pt-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newEvent.is_recurring}
                                        onChange={(e) => setNewEvent({ ...newEvent, is_recurring: e.target.checked })}
                                        className="w-5 h-5 rounded bg-white/5 border-white/10 text-purple-500 focus:ring-2 focus:ring-purple-500"
                                    />
                                    <div className="flex items-center gap-2">
                                        <RepeatIcon className="w-5 h-5 text-purple-300" />
                                        <span className="text-sm font-medium text-white">Recurring Event</span>
                                    </div>
                                </label>

                                {newEvent.is_recurring && (
                                    <div className="mt-4 space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-200 mb-2">
                                                Repeat Pattern
                                            </label>
                                            <select
                                                value={newEvent.recurrence_pattern}
                                                onChange={(e) => setNewEvent({ ...newEvent, recurrence_pattern: e.target.value })}
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="daily">Every Day</option>
                                                <option value="weekly">Specific Days of Week</option>
                                            </select>
                                        </div>

                                        {newEvent.recurrence_pattern === 'weekly' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                                    Select Days *
                                                </label>
                                                <div className="flex gap-2">
                                                    {dayNames.map((day, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() => toggleRecurrenceDay(index)}
                                                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${newEvent.recurrence_days.includes(index)
                                                                ? 'bg-purple-500 text-white'
                                                                : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            {day}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-200 mb-2">
                                                Repeat Until *
                                            </label>
                                            <input
                                                type="date"
                                                value={newEvent.recurrence_end_date}
                                                onChange={(e) => setNewEvent({ ...newEvent, recurrence_end_date: e.target.value })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                required={newEvent.is_recurring}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Description (optional)
                                </label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    placeholder="Add any notes or details about this event..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                />
                            </div>

                            {rooms.length === 0 && (
                                <div className="p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                                    <p className="text-sm text-yellow-200">
                                        💡 Tip: Add rooms in the Rooms page to enable automatic attendance tracking for events
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
                                >
                                    {creating ? 'Creating...' : newEvent.is_recurring ? 'Create Recurring Events' : 'Add Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
