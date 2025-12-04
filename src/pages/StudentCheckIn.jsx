import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, MapPinIcon } from 'lucide-react';
import { logAttendance } from '../lib/opusApi';

export default function StudentCheckIn() {
    const { roomId } = useParams();
    const [status, setStatus] = useState('scanning'); // scanning, success, error
    const [message, setMessage] = useState('Verifying location...');

    useEffect(() => {
        // Simulate the check-in process
        // In a real app, this would verify the beacon signal or geolocation
        const checkIn = async () => {
            try {
                // Simulate delay for "scanning"
                await new Promise(resolve => setTimeout(resolve, 2000));

                // For now, we'll just simulate a successful check-in
                // In production, we'd need the student's ID (from auth or local storage)
                // Since we don't have student auth yet, we'll just show a success message
                // and log a "guest" attendance or similar if needed

                setStatus('success');
                setMessage('You are checked in!');
            } catch (err) {
                setStatus('error');
                setMessage('Failed to verify location. Please try again.');
            }
        };

        checkIn();
    }, [roomId]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex flex-col items-center justify-center p-6 text-white">
            <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl text-center">

                {status === 'scanning' && (
                    <div className="animate-pulse">
                        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MapPinIcon className="w-10 h-10 text-blue-400 animate-bounce" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Checking In...</h2>
                        <p className="text-gray-300">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="animate-fade-in">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircleIcon className="w-10 h-10 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Success!</h2>
                        <p className="text-gray-300 mb-6">{message}</p>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-sm text-gray-400">Room ID</p>
                            <p className="font-mono text-lg font-semibold">{roomId}</p>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="animate-fade-in">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircleIcon className="w-10 h-10 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Check-in Failed</h2>
                        <p className="text-gray-300 mb-6">{message}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

            </div>

            <p className="mt-8 text-gray-400 text-sm">Novus Attendance System</p>
        </div>
    );
}
