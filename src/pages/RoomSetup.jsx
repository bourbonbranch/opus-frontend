import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, RadioIcon, PlusIcon } from 'lucide-react';
import { getRooms, createRoom } from '../lib/opusApi';

export function RoomSetup() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomLocation, setNewRoomLocation] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        try {
            const data = await getRooms();
            setRooms(data || []);
        } catch (err) {
            console.error('Failed to load rooms', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        if (!newRoomName.trim()) return;

        setCreating(true);
        try {
            const directorId = localStorage.getItem('directorId');
            await createRoom({
                name: newRoomName,
                director_id: parseInt(directorId),
            });
            setNewRoomName('');
            setNewRoomLocation('');
            setIsAddModalOpen(false);
            loadRooms();
        } catch (err) {
            alert('Failed to create room: ' + err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleCalibrate = (roomId) => {
        // Navigate to calibration page or show modal
        alert(`Calibration for room ${roomId} - This would open the QR code calibration flow`);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-white mb-2 drop-shadow-lg">
                        Room Setup
                    </h1>
                    <p className="text-gray-200">
                        Configure rehearsal spaces and beacon calibration
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-2xl shadow-purple-500/50 border border-white/20"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add Room
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-300">Loading rooms...</p>
                </div>
            ) : rooms.length === 0 ? (
                <div className="text-center py-12 bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/30">
                    <MapPinIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-4">No rooms yet</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
                    >
                        Create Your First Room
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            className="bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/30 shadow-2xl p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">
                                        {room.name}
                                    </h3>
                                    {room.location && (
                                        <p className="text-sm text-gray-300">{room.location}</p>
                                    )}
                                </div>
                                {room.beacon_uuid && (
                                    <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm font-medium rounded-full border border-green-400/50">
                                        Calibrated
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                                        <MapPinIcon className="w-4 h-4" />
                                        Geofence Radius
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={room.radius || 50}
                                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            readOnly
                                        />
                                        <span className="text-sm text-gray-300">meters</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                                        <RadioIcon className="w-4 h-4" />
                                        Beacon Threshold
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={
                                                room.beacon_uuid
                                                    ? `${room.beacon_major || -65} dBm`
                                                    : 'Not set'
                                            }
                                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Link
                                    to={`/rooms/${room.id}/live`}
                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-colors text-center"
                                >
                                    Live View
                                </Link>
                                {!room.beacon_uuid ? (
                                    <Link
                                        to={`/rooms/${room.id}/calibration`}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg text-center"
                                    >
                                        Start Calibration
                                    </Link>
                                ) : (
                                    <Link
                                        to={`/rooms/${room.id}/calibration`}
                                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-colors text-center"
                                    >
                                        Recalibrate
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Room Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-white/20">
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-xl font-semibold text-white">Add New Room</h2>
                        </div>
                        <form onSubmit={handleAddRoom} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Room Name
                                </label>
                                <input
                                    type="text"
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    placeholder="e.g., Main Rehearsal Hall"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Location (optional)
                                </label>
                                <input
                                    type="text"
                                    value={newRoomLocation}
                                    onChange={(e) => setNewRoomLocation(e.target.value)}
                                    placeholder="e.g., Building A, Room 101"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
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
                                    {creating ? 'Creating...' : 'Add Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
