import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react'; // We need to install this package

const RoomCalibration = () => {
    const { roomId } = useParams();
    const [scanning, setScanning] = useState(false);
    const [beaconFound, setBeaconFound] = useState(null);

    // URL for this page to be opened on mobile
    const mobileUrl = window.location.href;

    const startScan = async () => {
        setScanning(true);
        setBeaconFound(null);

        // Check if Web Bluetooth is available
        if (navigator.bluetooth) {
            try {
                const device = await navigator.bluetooth.requestDevice({
                    acceptAllDevices: true,
                    optionalServices: ['battery_service'] // Example service
                });
                setBeaconFound({ name: device.name || 'Unknown Device', id: device.id });
            } catch (error) {
                console.error(error);
                alert('Bluetooth scan failed or cancelled: ' + error.message);
            } finally {
                setScanning(false);
            }
        } else {
            // Simulation for non-supported browsers
            setTimeout(() => {
                setBeaconFound({ name: 'Simulated Beacon', id: '00:11:22:33:44:55' });
                setScanning(false);
            }, 2000);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#111827', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Room Calibration</h1>
                <p style={{ color: '#9ca3af', marginBottom: '30px' }}>Room ID: {roomId}</p>

                {/* QR Code Section */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', display: 'inline-block', marginBottom: '30px' }}>
                    <QRCodeSVG value={mobileUrl} size={200} />
                    <p style={{ color: '#333', marginTop: '10px', fontSize: '14px', fontWeight: '600' }}>Scan with phone to calibrate</p>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <p style={{ marginBottom: '10px' }}>Or calibrate from this device:</p>
                    <button
                        onClick={startScan}
                        disabled={scanning}
                        style={{
                            padding: '15px 30px',
                            background: scanning ? '#4b5563' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            cursor: scanning ? 'wait' : 'pointer',
                            width: '100%'
                        }}
                    >
                        {scanning ? 'Scanning for Beacons...' : 'Start Bluetooth Scan'}
                    </button>
                </div>

                {beaconFound && (
                    <div style={{ background: '#065f46', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                        <p style={{ fontWeight: 'bold', margin: 0 }}>✅ Beacon Detected!</p>
                        <p style={{ margin: '5px 0 0', fontSize: '14px', opacity: 0.8 }}>{beaconFound.name} ({beaconFound.id})</p>
                    </div>
                )}

                <Link to="/rooms" style={{ color: '#9ca3af', textDecoration: 'underline' }}>← Back to Rooms</Link>
            </div>
        </div>
    );
};

export default RoomCalibration;
