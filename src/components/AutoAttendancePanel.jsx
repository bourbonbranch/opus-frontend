import React, { useState, useEffect } from 'react';
import { Radio, Play, Square, Loader2 } from 'lucide-react';

export default function AutoAttendancePanel({ eventId }) {
    const [beacons, setBeacons] = useState([]);
    const [selectedBeacon, setSelectedBeacon] = useState('');
    const [status, setStatus] = useState({ is_active: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';

    useEffect(() => {
        loadBeacons();
        loadStatus();
    }, [eventId]);

    const loadBeacons = async () => {
        try {
            const response = await fetch(`${API_URL}/api/beacons`);
            const data = await response.json();
            setBeacons(data || []);
            if (data.length > 0 && !selectedBeacon) {
                setSelectedBeacon(data[0].identifier);
            }
        } catch (err) {
            console.error('Error loading beacons:', err);
        }
    };

    const loadStatus = async () => {
        try {
            const response = await fetch(`${API_URL}/api/events/${eventId}/auto-attendance/status`);
            const data = await response.json();
            setStatus(data);
            if (data.is_active && data.session) {
                setSelectedBeacon(data.session.identifier);
            }
        } catch (err) {
            console.error('Error loading status:', err);
        }
    };

    const handleStart = async () => {
        if (!selectedBeacon) {
            setError('Please select a beacon');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/events/${eventId}/auto-attendance/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ beacon_identifier: selectedBeacon })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to start auto-attendance');
            }

            await loadStatus();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/events/${eventId}/auto-attendance/stop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to stop auto-attendance');
            }

            await loadStatus();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = () => {
        if (status.is_active) {
            return (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Active
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm font-medium">
                Not Started
            </span>
        );
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Radio className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-semibold text-white">Auto Attendance</h3>
                </div>
                {getStatusBadge()}
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {!status.is_active ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Select Beacon
                        </label>
                        <select
                            value={selectedBeacon}
                            onChange={(e) => setSelectedBeacon(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            <option value="">Choose a beacon...</option>
                            {beacons.map((beacon) => (
                                <option key={beacon.id} value={beacon.identifier}>
                                    {beacon.label} ({beacon.identifier})
                                </option>
                            ))}
                        </select>
                        {beacons.length === 0 && (
                            <p className="text-xs text-gray-400 mt-2">
                                No beacons configured. Add beacons in Settings.
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={loading || !selectedBeacon}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Starting...
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5" />
                                Start Auto Attendance
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-green-300 text-sm font-medium mb-1">
                            Auto-attendance is active
                        </p>
                        <p className="text-green-400/70 text-xs">
                            Beacon: {status.session?.beacon_label || 'Unknown'}
                        </p>
                        <p className="text-green-400/70 text-xs">
                            Started: {status.session?.started_at ? new Date(status.session.started_at).toLocaleString() : 'Unknown'}
                        </p>
                    </div>

                    <button
                        onClick={handleStop}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Stopping...
                            </>
                        ) : (
                            <>
                                <Square className="w-5 h-5" />
                                Stop Auto Attendance
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
