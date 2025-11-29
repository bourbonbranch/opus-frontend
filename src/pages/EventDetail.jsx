import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowLeft, Edit2 } from 'lucide-react';
import AutoAttendancePanel from '../components/AutoAttendancePanel';

export default function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';

    useEffect(() => {
        loadEventData();
        // Poll for attendance updates every 5 seconds
        const interval = setInterval(() => {
            loadAttendance();
        }, 5000);
        return () => clearInterval(interval);
    }, [id, refreshKey]);

    const loadEventData = async () => {
        try {
            const [eventRes, attendanceRes] = await Promise.all([
                fetch(`${API_URL}/api/events/${id}`),
                fetch(`${API_URL}/api/events/${id}/attendance`)
            ]);

            if (eventRes.ok) {
                const eventData = await eventRes.json();
                setEvent(eventData);
            }

            if (attendanceRes.ok) {
                const attendanceData = await attendanceRes.json();
                setAttendance(attendanceData);
            }
        } catch (err) {
            console.error('Error loading event data:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadAttendance = async () => {
        try {
            const response = await fetch(`${API_URL}/api/events/${id}/attendance`);
            if (response.ok) {
                const data = await response.json();
                setAttendance(data);
            }
        } catch (err) {
            console.error('Error loading attendance:', err);
        }
    };

    const handleStatusChange = async (studentId, newStatus) => {
        try {
            const response = await fetch(`${API_URL}/api/events/${id}/attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student_id: studentId,
                    status: newStatus
                })
            });

            if (response.ok) {
                loadAttendance();
            }
        } catch (err) {
            console.error('Error updating attendance:', err);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            present: 'bg-green-500/20 text-green-300 border-green-500/30',
            absent: 'bg-red-500/20 text-red-300 border-red-500/30',
            late: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
            excused: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            unmarked: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.unmarked}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getSourceBadge = (source) => {
        if (!source) return null;

        const isAuto = source === 'auto_beacon';
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${isAuto ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-500/20 text-gray-400'
                }`}>
                {isAuto ? '🤖 Auto' : '✋ Manual'}
            </span>
        );
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const getAttendanceStats = () => {
        const stats = {
            present: attendance.filter(a => a.status === 'present').length,
            absent: attendance.filter(a => a.status === 'absent').length,
            late: attendance.filter(a => a.status === 'late').length,
            excused: attendance.filter(a => a.status === 'excused').length,
            unmarked: attendance.filter(a => a.status === 'unmarked').length,
            total: attendance.length
        };
        return stats;
    };

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <p className="text-gray-300">Loading...</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <p className="text-gray-300">Event not found</p>
            </div>
        );
    }

    const stats = getAttendanceStats();

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/director/calendar')}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-300" />
                </button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white">{event.name}</h1>
                    <p className="text-gray-400 mt-1">{event.type}</p>
                </div>
            </div>

            {/* Event Info Card */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <div>
                            <p className="text-xs text-gray-400">Date</p>
                            <p className="text-white">{formatDateTime(event.start_time)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-green-400" />
                        <div>
                            <p className="text-xs text-gray-400">Duration</p>
                            <p className="text-white">
                                {new Date(event.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                {' - '}
                                {new Date(event.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    {event.room_name && (
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-purple-400" />
                            <div>
                                <p className="text-xs text-gray-400">Location</p>
                                <p className="text-white">{event.room_name}</p>
                            </div>
                        </div>
                    )}
                </div>
                {event.description && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-gray-300 text-sm">{event.description}</p>
                    </div>
                )}
            </div>

            {/* Auto Attendance Panel */}
            <AutoAttendancePanel eventId={id} />

            {/* Attendance Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <p className="text-green-300 text-2xl font-bold">{stats.present}</p>
                    <p className="text-green-400/70 text-sm">Present</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-300 text-2xl font-bold">{stats.absent}</p>
                    <p className="text-red-400/70 text-sm">Absent</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <p className="text-yellow-300 text-2xl font-bold">{stats.late}</p>
                    <p className="text-yellow-400/70 text-sm">Late</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-blue-300 text-2xl font-bold">{stats.excused}</p>
                    <p className="text-blue-400/70 text-sm">Excused</p>
                </div>
                <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-4">
                    <p className="text-gray-300 text-2xl font-bold">{stats.unmarked}</p>
                    <p className="text-gray-400/70 text-sm">Unmarked</p>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-blue-400" />
                        <h2 className="text-xl font-semibold text-white">Attendance</h2>
                        <span className="text-gray-400 text-sm">({stats.total} students)</span>
                    </div>
                    <button
                        onClick={() => setRefreshKey(k => k + 1)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
                    >
                        Refresh
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Student
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Part
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Source
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {attendance.map((student) => (
                                <tr key={student.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-white">
                                            {student.first_name} {student.last_name}
                                        </div>
                                        {student.email && (
                                            <div className="text-xs text-gray-400">{student.email}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-300">
                                            {student.section} {student.part}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(student.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getSourceBadge(student.source)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={student.status}
                                            onChange={(e) => handleStatusChange(student.id, e.target.value)}
                                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="unmarked">Unmarked</option>
                                            <option value="present">Present</option>
                                            <option value="absent">Absent</option>
                                            <option value="late">Late</option>
                                            <option value="excused">Excused</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
