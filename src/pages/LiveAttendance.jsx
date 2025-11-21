import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAttendance, getRooms } from '../lib/opusApi';
import { ArrowLeftIcon, UserIcon, CheckCircleIcon, ClockIcon, RefreshCwIcon } from 'lucide-react';

export default function LiveAttendance() {
    const { roomId } = useParams();
    const [attendance, setAttendance] = useState([]);
    const [roomName, setRoomName] = useState('');
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        loadRoomInfo();
        loadAttendance();

        // Poll for updates every 5 seconds
        const interval = setInterval(() => {
            loadAttendance(true);
        }, 5000);

        return () => clearInterval(interval);
    }, [roomId]);

    const loadRoomInfo = async () => {
        try {
            const rooms = await getRooms();
            const room = rooms.find(r => r.id === parseInt(roomId));
            if (room) setRoomName(room.name);
        } catch (err) {
            console.error('Failed to load room info', err);
        }
    };

    const loadAttendance = async (isPolling = false) => {
        if (!isPolling) setLoading(true);
        try {
            const data = await getAttendance(roomId);
            setAttendance(data || []);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to load attendance', err);
        } finally {
            if (!isPolling) setLoading(false);
        }
    };

    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <Link
                            to="/director/rooms"
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-2"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            <span>Back to Rooms</span>
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-bold text-white flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <span>{roomName || 'Room'}</span>
                            <span className="text-purple-400 font-normal text-lg md:text-xl">Live Attendance</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <span className="text-green-400 text-sm font-medium">Live</span>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl md:text-3xl font-bold text-white">{attendance.length}</p>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Present</p>
                        </div>
                    </div>
                </div>

                {/* Attendance List */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h2 className="font-semibold text-white flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-purple-400" />
                            Students Checked In
                        </h2>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <RefreshCwIcon className="w-3 h-3" />
                            Updated {formatTime(lastUpdated)}
                        </span>
                    </div>

                    {loading && attendance.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">Loading attendance data...</div>
                    ) : attendance.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ClockIcon className="w-8 h-8 text-gray-500" />
                            </div>
                            <p className="text-gray-300 text-lg font-medium">Waiting for students...</p>
                            <p className="text-gray-500 text-sm mt-1">Students will appear here automatically as they enter.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/10">
                            {attendance.map((record) => (
                                <div key={record.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between animate-fade-in">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                                            {record.first_name[0]}{record.last_name[0]}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-lg">{record.first_name} {record.last_name}</p>
                                            <p className="text-gray-400 text-sm">{record.section || 'No Section'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-white font-medium">{formatTime(record.created_at)}</p>
                                            <p className="text-green-400 text-xs font-medium flex items-center justify-end gap-1">
                                                <CheckCircleIcon className="w-3 h-3" />
                                                Checked In
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
