import React, { useState, useEffect, useRef } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { MapPin, Plus, Radio } from 'lucide-react';
import { getRooms, createRoom } from '../../lib/opusApi';

export default function EnsembleRooms() {
    const { id } = useParams();
    const { ensemble } = useOutletContext();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: ''
    });

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        try {
            const data = await getRooms();
            setRooms(data || []);
        } catch (error) {
            console.error('Error loading rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const directorId = localStorage.getItem('directorId');
            await createRoom({
                name: formData.name,
                director_id: parseInt(directorId)
            });
            setIsModalOpen(false);
            setFormData({ name: '', location: '' });
            loadRooms();
        } catch (error) {
            alert('Failed to create room: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Rooms</h2>
                    <p className="text-white/60 mt-1">Manage rehearsal spaces for this ensemble</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Room
                </button>
            </div>

            {/* Rooms List */}
            {loading ? (
                <div className="text-white/60 text-center py-12">Loading rooms...</div>
            ) : rooms.length === 0 ? (
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-12 text-center">
                    <MapPin className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No rooms yet</h3>
                    <p className="text-white/60 mb-6">Create your first rehearsal space</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                        Create Room
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">
                                        {room.name}
                                    </h3>
                                    {room.location && (
                                        <p className="text-sm text-white/60">{room.location}</p>
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
                                    <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                        <MapPin className="w-4 h-4" />
                                        Geofence Radius
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={room.radius || 50}
                                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                            readOnly
                                        />
                                        <span className="text-sm text-white/60">meters</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                        <Radio className="w-4 h-4" />
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
                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-colors text-center"
                                >
                                    Live View
                                </Link>
                                {!room.beacon_uuid ? (
                                    <Link
                                        to={`/rooms/${room.id}/calibration`}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all text-center"
                                    >
                                        Start Calibration
                                    </Link>
                                ) : (
                                    <Link
                                        to={`/rooms/${room.id}/calibration`}
                                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-colors text-center"
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
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-white/20">
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-xl font-semibold text-white">Add New Room</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Room Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Main Rehearsal Hall"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Location (optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g., Building A, Room 101"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Creating...' : 'Add Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
