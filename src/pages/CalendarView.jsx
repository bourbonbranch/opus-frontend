import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import {
    CalendarIcon,
    PlusIcon,
    DownloadIcon,
    LinkIcon,
    TrashIcon,
    XIcon,
    ClockIcon,
    MapPinIcon,
    RepeatIcon,
    UploadIcon,
    FileSpreadsheetIcon
} from 'lucide-react';
import { getEnsembles, getEvents, getCalendarItems, createCalendarItem, deleteCalendarItem, getTicketEvents, createEvent, deleteEvent, getRooms } from '../lib/opusApi';
import AutoAttendancePanel from '../components/AutoAttendancePanel';

export function CalendarView() {
    const [ensembles, setEnsembles] = useState([]);
    const [selectedEnsembleId, setSelectedEnsembleId] = useState(null);
    const [events, setEvents] = useState([]);
    const [ticketEvents, setTicketEvents] = useState([]);
    const [calendarItems, setCalendarItems] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importPreview, setImportPreview] = useState([]);
    const [importing, setImporting] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '',
        type: 'reminder',
        date: '',
        description: '',
        color: '#8b5cf6',
    });
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
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isEventDetailModalOpen, setIsEventDetailModalOpen] = useState(false);
    const calendarRef = useRef(null);

    useEffect(() => {
        loadEnsembles();
        loadRooms();
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

    const loadRooms = async () => {
        try {
            const data = await getRooms();
            setRooms(data || []);
        } catch (err) {
            console.error('Failed to load rooms', err);
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

    const generateRecurringEvents = () => {
        const events = [];
        const startDate = new Date(newEvent.start_time);
        const endDate = new Date(newEvent.end_time);
        const recurEndDate = new Date(newEvent.recurrence_end_date);

        const duration = endDate - startDate;

        let currentDate = new Date(startDate);

        while (currentDate <= recurEndDate) {
            const dayOfWeek = currentDate.getDay();

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

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return events;
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            if (newEvent.is_recurring) {
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

                for (const event of recurringEvents) {
                    await createEvent(event);
                }

                alert(`Successfully created ${recurringEvents.length} recurring events!`);
            } else {
                await createEvent({
                    ensemble_id: selectedEnsembleId,
                    room_id: newEvent.room_id || null,
                    name: newEvent.name,
                    type: newEvent.type,
                    start_time: new Date(newEvent.start_time).toISOString(),
                    end_time: new Date(newEvent.end_time).toISOString(),
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
            setIsAddEventModalOpen(false);
            loadCalendarData();
        } catch (err) {
            alert('Failed to create event: ' + err.message);
        } finally {
            setCreating(false);
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

    const handleDeleteEvent = async (eventId) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            await deleteEvent(eventId);
            loadCalendarData();
        } catch (err) {
            alert('Failed to delete event: ' + err.message);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImportFile(file);
        const reader = new FileReader();

        reader.onload = (event) => {
            const text = event.target.result;
            parseCSV(text);
        };

        reader.readAsText(file);
    };

    const parseCSV = (text) => {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            alert('CSV file must have at least a header row and one data row');
            return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const events = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const event = {};

            headers.forEach((header, index) => {
                event[header] = values[index] || '';
            });

            // Validate required fields
            if (event.name && event.start_time) {
                events.push({
                    name: event.name,
                    type: event.type || 'rehearsal',
                    start_time: event.start_time,
                    end_time: event.end_time || event.start_time,
                    description: event.description || '',
                    room_id: event.room_id || null,
                });
            }
        }

        setImportPreview(events);
    };

    const handleBulkImport = async () => {
        if (importPreview.length === 0) {
            alert('No events to import');
            return;
        }

        if (!confirm(`Import ${importPreview.length} events?`)) return;

        setImporting(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';

            // Create events one by one (or use bulk endpoint if available)
            for (const event of importPreview) {
                await createEvent({
                    ensemble_id: selectedEnsembleId,
                    ...event
                });
            }

            alert(`Successfully imported ${importPreview.length} events!`);
            setIsImportModalOpen(false);
            setImportFile(null);
            setImportPreview([]);
            loadCalendarData();
        } catch (err) {
            console.error('Error importing events:', err);
            alert('Failed to import events: ' + err.message);
        } finally {
            setImporting(false);
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
        } else if (event.extendedProps.isEvent) {
            // Open event detail modal
            setSelectedEvent({
                id: event.extendedProps.eventId,
                title: event.title,
                type: event.extendedProps.type,
                description: event.extendedProps.description,
                room: event.extendedProps.room,
                start: event.start,
                end: event.end
            });
            setIsEventDetailModalOpen(true);
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

    const ensureUTC = (dateStr) => {
        if (!dateStr) return null;
        if (typeof dateStr !== 'string') return dateStr;
        // If it looks like a date string but has no timezone info (no Z, no +HH:MM, no -HH:MM)
        // assume it is UTC and append Z.
        if (!dateStr.includes('Z') && !dateStr.match(/[+-]\d{2}:?\d{2}$/)) {
            return dateStr + 'Z';
        }
        return dateStr;
    };

    const getCalendarEvents = () => {
        const allEvents = [];

        // Add events from events table
        events.forEach(event => {
            allEvents.push({
                id: `event-${event.id}`,
                title: event.name,
                start: ensureUTC(event.start_time),
                end: ensureUTC(event.end_time),
                backgroundColor: getEventTypeColor(event.type),
                borderColor: getEventTypeColor(event.type),
                extendedProps: {
                    isEvent: true,
                    eventId: event.id,
                    type: event.type,
                    description: event.description,
                    room: event.room_name,
                },
            });
        });

        // Add ticket events
        ticketEvents.forEach(event => {
            if (event.ensemble_id && event.ensemble_id !== selectedEnsembleId) return;
            if (!event.performances || !Array.isArray(event.performances)) return;

            event.performances.forEach(perf => {
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
                    backgroundColor: '#ec4899',
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

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
                    >
                        <UploadIcon className="w-5 h-5" />
                        <span>Import</span>
                    </button>
                    <button
                        onClick={() => setIsSyncModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
                    >
                        <LinkIcon className="w-5 h-5" />
                        <span>Sync</span>
                    </button>
                    <button
                        onClick={() => setIsAddEventModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-2xl shadow-blue-500/50 border border-white/20"
                    >
                        <ClockIcon className="w-5 h-5" />
                        <span>Add Event</span>
                    </button>
                    <button
                        onClick={() => setIsAddItemModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-2xl shadow-purple-500/50 border border-white/20"
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
                    plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
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

            {/* Add Event Modal */}
            {isAddEventModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">Add Event</h2>
                            <button
                                onClick={() => setIsAddEventModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
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
                                        Room (for attendance)
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

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddEventModalOpen(false)}
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

            {/* Import Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl max-w-4xl w-full shadow-2xl border border-white/20 max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">Import Events from Spreadsheet</h2>
                            <button
                                onClick={() => {
                                    setIsImportModalOpen(false);
                                    setImportFile(null);
                                    setImportPreview([]);
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 border-b border-white/10 bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Upload CSV File
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="csv-upload"
                                        />
                                        <label
                                            htmlFor="csv-upload"
                                            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-black/20 border border-white/10 border-dashed rounded-lg text-gray-300 hover:bg-black/30 hover:text-white cursor-pointer transition-colors"
                                        >
                                            <FileSpreadsheetIcon className="w-5 h-5" />
                                            {importFile ? importFile.name : 'Click to upload CSV'}
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Required columns: name, start_time. Optional: end_time, type, description, room_id.
                                    </p>
                                </div>
                                {importPreview.length > 0 && (
                                    <button
                                        onClick={handleBulkImport}
                                        disabled={importing}
                                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg disabled:opacity-50"
                                    >
                                        {importing ? 'Importing...' : `Import ${importPreview.length} Events`}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {importPreview.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <UploadIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Upload a CSV file to preview events here.</p>
                                    <div className="mt-4 text-sm bg-white/5 p-4 rounded-lg inline-block text-left">
                                        <p className="font-mono text-xs text-gray-500 mb-2">Example CSV Format:</p>
                                        <pre className="font-mono text-xs text-gray-300">
                                            name,start_time,end_time,type,description<br />
                                            Spring Concert,2024-05-15T19:00:00,2024-05-15T21:00:00,concert,Annual spring performance<br />
                                            Weekly Rehearsal,2024-05-20T15:30:00,2024-05-20T17:00:00,rehearsal,Regular practice
                                        </pre>
                                    </div>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-white/5 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Event Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Start Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {importPreview.map((event, index) => (
                                            <tr key={index} className="hover:bg-white/5">
                                                <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{event.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getEventTypeColor(event.type)}`}>
                                                        {event.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                                    {new Date(event.start_time).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-gray-300 text-sm truncate max-w-xs">
                                                    {event.description}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
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

            {/* Event Detail Modal */}
            {isEventDetailModalOpen && selectedEvent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl border border-white/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white">{selectedEvent.title}</h2>
                                <p className="text-gray-400 text-sm mt-1">
                                    {selectedEvent.start && new Date(selectedEvent.start).toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsEventDetailModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Event Details */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-300">
                                    <ClockIcon className="w-5 h-5 text-purple-400" />
                                    <div>
                                        <p className="text-sm text-gray-400">Type</p>
                                        <p className="font-medium capitalize">{selectedEvent.type}</p>
                                    </div>
                                </div>
                                {selectedEvent.room && (
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <MapPinIcon className="w-5 h-5 text-purple-400" />
                                        <div>
                                            <p className="text-sm text-gray-400">Location</p>
                                            <p className="font-medium">{selectedEvent.room}</p>
                                        </div>
                                    </div>
                                )}
                                {selectedEvent.description && (
                                    <div className="text-gray-300">
                                        <p className="text-sm text-gray-400 mb-1">Description</p>
                                        <p>{selectedEvent.description}</p>
                                    </div>
                                )}
                            </div>

                            {/* Auto Attendance Panel */}
                            <AutoAttendancePanel eventId={selectedEvent.id} />

                            {/* Delete Button */}
                            <button
                                onClick={() => {
                                    if (confirm(`Delete "${selectedEvent.title}"?`)) {
                                        handleDeleteEvent(selectedEvent.id);
                                        setIsEventDetailModalOpen(false);
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                            >
                                <TrashIcon className="w-5 h-5" />
                                Delete Event
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
