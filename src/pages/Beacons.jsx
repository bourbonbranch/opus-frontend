import React, { useState, useEffect } from 'react';
import { Radio, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export default function Beacons() {
    const [beacons, setBeacons] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingBeacon, setEditingBeacon] = useState(null);
    const [formData, setFormData] = useState({
        identifier: '',
        label: '',
        room_id: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';

    useEffect(() => {
        loadBeacons();
        loadRooms();
    }, []);

    const loadBeacons = async () => {
        try {
            const response = await fetch(`${API_URL}/api/beacons`);
            const data = await response.json();
            setBeacons(data || []);
        } catch (err) {
            console.error('Error loading beacons:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadRooms = async () => {
        try {
            const response = await fetch(`${API_URL}/api/rooms`);
            const data = await response.json();
            setRooms(data || []);
        } catch (err) {
            console.error('Error loading rooms:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingBeacon
                ? `${API_URL}/api/beacons/${editingBeacon.id}`
                : `${API_URL}/api/beacons`;

            const method = editingBeacon ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                loadBeacons();
                handleCloseModal();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to save beacon');
            }
        } catch (err) {
            alert('Failed to save beacon: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this beacon?')) return;

        try {
            const response = await fetch(`${API_URL}/api/beacons/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadBeacons();
            } else {
                alert('Failed to delete beacon');
            }
        } catch (err) {
            alert('Failed to delete beacon: ' + err.message);
        }
    };

    const handleEdit = (beacon) => {
        setEditingBeacon(beacon);
        setFormData({
            identifier: beacon.identifier,
            label: beacon.label,
            room_id: beacon.room_id || ''
        });
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingBeacon(null);
        setFormData({
            identifier: '',
            label: '',
            room_id: ''
        });
    };

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <p className="text-gray-300">Loading...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Radio className="w-8 h-8 text-blue-400" />
                        Beacons
                    </h1>
                    <p className="text-gray-400 mt-1">Manage BLE beacons for auto-attendance</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Add Beacon
                </button>
            </div>

            {/* Info Card */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-300 text-sm">
                    💡 <strong>Tip:</strong> Configure physical BLE beacons (iBeacons) with unique identifiers.
                    Students' phones will automatically detect these beacons and check in when they enter the room.
                </p>
            </div>

            {/* Beacons List */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                {beacons.length === 0 ? (
                    <div className="p-12 text-center">
                        <Radio className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-300 mb-2">No beacons configured</p>
                        <p className="text-gray-400 text-sm">Add your first beacon to enable auto-attendance</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Label
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Identifier
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Room
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {beacons.map((beacon) => (
                                    <tr key={beacon.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-white">{beacon.label}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <code className="text-xs text-gray-300 bg-white/5 px-2 py-1 rounded">
                                                {beacon.identifier}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-300">
                                                {beacon.room_name || <span className="text-gray-500">No room</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(beacon)}
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4 text-blue-400" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(beacon.id)}
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-white/20">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">
                                {editingBeacon ? 'Edit Beacon' : 'Add Beacon'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Label *
                                </label>
                                <input
                                    type="text"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    placeholder="e.g., Choir Room A, Band Hall"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Beacon Identifier (UUID) *
                                </label>
                                <input
                                    type="text"
                                    value={formData.identifier}
                                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                    placeholder="e.g., TEST_BEACON_UUID or UUID:MAJOR:MINOR"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Enter the unique identifier from your physical beacon device
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Associated Room (optional)
                                </label>
                                <select
                                    value={formData.room_id}
                                    onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">No room</option>
                                    {rooms.map((room) => (
                                        <option key={room.id} value={room.id}>
                                            {room.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
                                >
                                    <Save className="w-4 h-4 inline mr-2" />
                                    {editingBeacon ? 'Update' : 'Add'} Beacon
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
