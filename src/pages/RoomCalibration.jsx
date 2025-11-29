import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { updateRoom } from '../lib/opusApi';
import { ArrowLeftIcon, BluetoothIcon, CheckCircleIcon, SaveIcon } from 'lucide-react';

const RoomCalibration = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [scanning, setScanning] = useState(false);
    const [beaconFound, setBeaconFound] = useState(null);
    const [saving, setSaving] = useState(false);

    // URL for student check-in (this would be the student-facing page)
    // For now, we'll point to a generic check-in page with the room ID
    const checkInUrl = `${window.location.origin}/checkin/${roomId}`;

    const startScan = async () => {
        console.log('Starting beacon scan...');
        setScanning(true);
        setBeaconFound(null);

        // Check if Web Bluetooth is available
        if (navigator.bluetooth) {
            console.log('Web Bluetooth API is available');
            try {
                console.log('Requesting Bluetooth device...');
                const device = await navigator.bluetooth.requestDevice({
                    acceptAllDevices: true,
                    optionalServices: ['battery_service'] // Example service
                });
                console.log('Device found:', device);
                setBeaconFound({
                    name: device.name || 'Unknown Device',
                    id: device.id,
                    uuid: device.id, // Using ID as UUID for now
                    major: 1,
                    minor: 1
                });
            } catch (error) {
                console.error('Bluetooth scan error:', error);
                if (error.name === 'NotFoundError') {
                    alert('No Bluetooth devices found. Make sure Bluetooth is enabled and devices are nearby.');
                } else if (error.name === 'NotAllowedError') {
                    alert('Bluetooth access was denied. Please allow Bluetooth access and try again.');
                } else {
                    alert('Bluetooth scan failed: ' + error.message);
                }
                setScanning(false);
            }
        } else {
            // Simulation for non-supported browsers
            console.log('Web Bluetooth not supported, using simulation mode');
            alert('Web Bluetooth is not supported in this browser. Using simulation mode for testing.');
            setTimeout(() => {
                setBeaconFound({
                    name: 'Simulated Beacon',
                    id: '00:11:22:33:44:55',
                    uuid: '00:11:22:33:44:55',
                    major: 1,
                    minor: 1
                });
                setScanning(false);
            }, 2000);
        }
    };

    const handleSave = async () => {
        if (!beaconFound) return;
        setSaving(true);
        try {
            await updateRoom(roomId, {
                beacon_uuid: beaconFound.uuid,
                beacon_major: beaconFound.major,
                beacon_minor: beaconFound.minor
            });
            alert('Room calibrated successfully!');
            navigate('/director/rooms');
        } catch (err) {
            alert('Failed to save calibration: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-8 flex flex-col items-center justify-center text-white">
            <div className="max-w-md w-full text-center space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Room Calibration</h1>
                    <p className="text-gray-300">Room ID: {roomId}</p>
                </div>

                {/* QR Code Section */}
                <div className="bg-white p-6 rounded-2xl shadow-2xl inline-block">
                    <QRCodeSVG value={checkInUrl} size={200} />
                    <p className="text-gray-900 mt-4 font-semibold text-sm">Scan to Check In</p>
                </div>

                <div className="space-y-4">
                    <p className="text-gray-300">Or calibrate beacon for this room:</p>

                    <button
                        onClick={startScan}
                        disabled={scanning || beaconFound}
                        className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${scanning
                            ? 'bg-gray-700 cursor-wait'
                            : beaconFound
                                ? 'bg-green-600/20 text-green-400 border border-green-500/50'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30'
                            }`}
                    >
                        {scanning ? (
                            'Scanning...'
                        ) : beaconFound ? (
                            <>
                                <CheckCircleIcon className="w-6 h-6" />
                                Beacon Found
                            </>
                        ) : (
                            <>
                                <BluetoothIcon className="w-6 h-6" />
                                Start Bluetooth Scan
                            </>
                        )}
                    </button>

                    {beaconFound && (
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-left animate-fade-in">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-bold text-white">{beaconFound.name}</p>
                                    <p className="text-sm text-gray-400 font-mono">{beaconFound.id}</p>
                                </div>
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg border border-green-500/30">
                                    Signal Strong
                                </span>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                {saving ? 'Saving...' : (
                                    <>
                                        <SaveIcon className="w-5 h-5" />
                                        Save Calibration
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                <Link
                    to="/director/rooms"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to Rooms
                </Link>
            </div>
        </div>
    );
};

export default RoomCalibration;
