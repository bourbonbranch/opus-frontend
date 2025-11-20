import React, { useState } from 'react';
import { MapPinIcon, RadioIcon, PlusIcon } from 'lucide-react';
import { getRooms, createRoom } from '../lib/opusApi';

export function RoomSetup() {
    const [rooms, setRooms] = useState([
        {
            id: 1,
            name: 'Main Rehearsal Hall',
            location: 'Building A, Room 101',
            radius: 50,
            beaconThreshold: -65,
            isCalibrated: true,
        },
        {
            id: 2,
            name: 'Practice Room 2',
            location: 'Building B, Room 205',
            radius: 30,
            beaconThreshold: null,
            isCalibrated: false,
        },
    ]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleAddRoom = () => {
        setIsAddModalOpen(true);
    };

    const handleCalibrate = (roomId) => {
        // Open calibration modal or navigate to calibration page
        alert(`Calibrating room ${roomId}`);
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
                    onClick={handleAddRoom}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-2xl shadow-purple-500/50 border border-white/20"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add Room
                </button>
            </div>

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
                                <p className="text-sm text-gray-300">{room.location}</p>
                            </div>
                            {room.isCalibrated && (
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
                                        value={room.radius}
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
                                            room.beaconThreshold
                                                ? `${room.beaconThreshold} dBm`
                                                : 'Not set'
                                        }
                                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        {!room.isCalibrated && (
                            <button
                                onClick={() => handleCalibrate(room.id)}
                                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg"
                            >
                                Start Calibration
                            </button>
                        )}
                        {room.isCalibrated && (
                            <button
                                onClick={() => handleCalibrate(room.id)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
                            >
                                Recalibrate Room
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
