import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
    CalendarIcon,
    PlusIcon,
    DownloadIcon,
    LinkIcon,
    TrashIcon,
    XIcon
} from 'lucide-react';
import { getEnsembles, getEvents, getCalendarItems, createCalendarItem, deleteCalendarItem, getTicketEvents } from '../lib/opusApi';

export function CalendarView() {
    const [ensembles, setEnsembles] = useState([]);
    const [selectedEnsembleId, setSelectedEnsembleId] = useState(null);
    const [events, setEvents] = useState([]);
    const [ticketEvents, setTicketEvents] = useState([]);
    const [calendarItems, setCalendarItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '',
        type: 'reminder',
        date: '',
        description: '',
        color: '#8b5cf6',
    });
    const [creating, setCreating] = useState(false);
    const calendarRef = useRef(null);

    useEffect(() => {
        loadEnsembles();
    }, []);

    useEffect(() => {
        if (selectedEnsembleId) {
            loadCalendarData();
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

    const loadCalendarData = async () => {
        if (!selectedEnsembleId) return;
        try {
            const [eventsData, ticketEventsData, calendarItemsData] = await Promise.all([
                getEvents(selectedEnsembleId),
                getTicketEvents(),
                getCalendarItems(selectedEnsembleId)
            ]);
            setEvents(eventsData || []);
            setTicketEvents(ticketEventsData || []);
            setCalendarItems(calendarItemsData || []);
        } catch (err) {
            console.error('Failed to load calendar data', err);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const directorId = localStorage.getItem('directorId');
            await createCalendarItem({
                director_id: parseInt(directorId),
                ensemble_id: selectedEnsembleId,
                title: newItem.title,
                type: newItem.type,
                date: newItem.date,
                description: newItem.description,
                color: newItem.color,
            });
            setNewItem({
                title: '',
                type: 'reminder',
                date: '',
                description: '',
                color: '#8b5cf6',
            });
            setIsAddItemModalOpen(false);
            loadCalendarData();
        } catch (err) {
            alert('Failed to create calendar item: ' + err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await deleteCalendarItem(itemId);
            loadCalendarData();
        } catch (err) {
            alert('Failed to delete calendar item: ' + err.message);
        }
    };

    const handleDateClick = (arg) => {
        setNewItem({
            ...newItem,
            date: arg.dateStr,
        });
        setIsAddItemModalOpen(true);
    };

    const handleEventClick = (clickInfo) => {
        const event = clickInfo.event;
        if (event.extendedProps.isCalendarItem) {
            if (confirm(`Delete "${event.title}"?`)) {
                handleDeleteItem(event.extendedProps.itemId);
            }
        }
    };

    const getCalendarEvents = () => {
        const allEvents = [];

        // Add events from events table (Calendar Events)
        events.forEach(event => {
            allEvents.push({
                id: `event-${event.id}`,
                title: event.name,
                start: event.start_time,
                end: event.end_time,
                backgroundColor: getEventTypeColor(event.type),
                borderColor: getEventTypeColor(event.type),
                extendedProps: {
                    type: event.type,
                    description: event.description,
                    room: event.room_name,
                },
            });
        });

        // Add ticket events (Performances)
        ticketEvents.forEach(event => {
            if (event.ensemble_id && event.ensemble_id !== selectedEnsembleId) return;
            if (!event.performances || !Array.isArray(event.performances)) return;

            event.performances.forEach(perf => {
                // Combine date and time
                // perf.performance_date is YYYY-MM-DD (or Date object)
                // perf.start_time is HH:MM:SS

                const dateStr = typeof perf.performance_date === 'string'
                    ? perf.performance_date.split('T')[0]
                    : new Date(perf.performance_date).toISOString().split('T')[0];

                const startDateTime = `${dateStr}T${perf.start_time}`;
                const endDateTime = perf.end_time ? `${dateStr}T${perf.end_time}` : null;

                allEvents.push({
                    id: `perf-${perf.id}`,
                    title: `🎫 ${event.title}`,
                    start: startDateTime,
                    end: endDateTime,
                    backgroundColor: '#ec4899', // Pink for performances
                    borderColor: '#ec4899',
                    extendedProps: {
                        type: 'performance',
                        description: `Performance for ${event.title}. ${event.venue_name ? `at ${event.venue_name}` : ''}`,
                        ticketEventId: event.id
                    },
                });
            });
        });

        // Add calendar items
        calendarItems.forEach(item => {
            allEvents.push({
                id: `item-${item.id}`,
                title: `${getItemIcon(item.type)} ${item.title}`,
                start: item.date,
                allDay: true,
                backgroundColor: item.color || '#8b5cf6',
                borderColor: item.color || '#8b5cf6',
                extendedProps: {
                    isCalendarItem: true,
                    itemId: item.id,
                    type: item.type,
                    description: item.description,
                },
            });
        });

        return allEvents;
    };

    const getEventTypeColor = (type) => {
        const colors = {
            rehearsal: '#3b82f6',
            concert: '#8b5cf6',
            performance: '#ec4899',
            sectional: '#10b981',
            other: '#6b7280',
        };
        return colors[type] || colors.other;
    };

    const getItemIcon = (type) => {
        const icons = {
            reminder: '🔔',
            deadline: '⏰',
            holiday: '🎉',
            note: '📝',
            birthday: '🎂',
            other: '📌',
        };
        return icons[type] || icons.other;
    };

    const exportToGoogleCalendar = () => {
        alert('Google Calendar export coming soon! This will generate an .ics file you can import to Google Calendar.');
    };

    const exportToOutlook = () => {
        alert('Outlook export coming soon! This will generate an .ics file you can import to Outlook/Microsoft 365.');
    };

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <p className="text-gray-300">Loading...</p>
            </div>
        );
    }

    if (ensembles.length === 0) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="text-center py-12 bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/30">
                    <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-4">No ensembles yet</p>
                    <p className="text-sm text-gray-400">Create an ensemble first to use the calendar</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2 drop-shadow-lg">
                        Calendar
                    </h1>
                    <p className="text-sm md:text-base text-gray-200">View all events, rehearsals, and important dates</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setIsSyncModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
                    >
                        <LinkIcon className="w-5 h-5" />
                        <span>Sync Calendar</span>
                    </button>
                    <button
                        onClick={() => setIsAddItemModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-2xl shadow-purple-500/50 border border-white/20"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Add Item</span>
                    </button>
                </div>
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

            {/* Calendar */}
            <div className="bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/30 shadow-2xl p-6">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    events={getCalendarEvents()}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    height="auto"
                    eventTimeFormat={{
                        hour: 'numeric',
                        minute: '2-digit',
                        meridiem: 'short',
                    }}
                />
            </div>

            {/* Add Calendar Item Modal */}
            {isAddItemModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-white/20">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">Add Calendar Item</h2>
                            <button
                                onClick={() => setIsAddItemModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddItem} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={newItem.title}
                                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                    placeholder="e.g., Submit Budget, Spring Break"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Type *
                                </label>
                                <select
                                    value={newItem.type}
                                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="reminder">🔔 Reminder</option>
                                    <option value="deadline">⏰ Deadline</option>
                                    <option value="holiday">🎉 Holiday</option>
                                    <option value="note">📝 Note</option>
                                    <option value="birthday">🎂 Birthday</option>
                                    <option value="other">📌 Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={newItem.date}
                                    onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Color
                                </label>
                                <div className="flex gap-2">
                                    {['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'].map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setNewItem({ ...newItem, color })}
                                            className={`w-10 h-10 rounded-lg transition-all ${newItem.color === color ? 'ring-2 ring-white scale-110' : ''
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Description (optional)
                                </label>
                                <textarea
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    placeholder="Add any notes..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddItemModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
                                >
                                    {creating ? 'Adding...' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Sync Calendar Modal */}
            {isSyncModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-white/20">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">Sync Calendar</h2>
                            <button
                                onClick={() => setIsSyncModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-gray-300 text-sm mb-4">
                                Export your calendar to sync with Google Calendar, Outlook, or other calendar apps.
                            </p>

                            <button
                                onClick={exportToGoogleCalendar}
                                className="w-full flex items-center gap-3 px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                                    <span className="text-2xl">📅</span>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-medium">Google Calendar</p>
                                    <p className="text-sm text-gray-400">Export to Google Calendar</p>
                                </div>
                                <DownloadIcon className="w-5 h-5 text-gray-400" />
                            </button>

                            <button
                                onClick={exportToOutlook}
                                className="w-full flex items-center gap-3 px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                    <span className="text-2xl">📧</span>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-medium">Outlook / Microsoft 365</p>
                                    <p className="text-sm text-gray-400">Export to Outlook Calendar</p>
                                </div>
                                <DownloadIcon className="w-5 h-5 text-gray-400" />
                            </button>

                            <div className="pt-4 border-t border-white/10">
                                <p className="text-xs text-gray-400">
                                    💡 Tip: After exporting, you can import the .ics file into any calendar app that supports iCalendar format.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
