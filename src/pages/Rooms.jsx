import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRooms, createRoom } from '../lib/opusApi';

const Rooms = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newRoomName, setNewRoomName] = useState('');
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

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newRoomName.trim()) return;
        setCreating(true);
        try {
            const directorId = localStorage.getItem('directorId');
            await createRoom({ name: newRoomName, director_id: directorId });
            setNewRoomName('');
            loadRooms();
        } catch (err) {
            alert('Failed to create room');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '20px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Manage Rooms</h1>
                    <Link to="/director/today" style={{ color: '#667eea', fontWeight: '600' }}>← Back to Dashboard</Link>
                </div>

                {/* Create Room Form */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>Add New Room</h2>
                    <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            placeholder="e.g. Choir Room 101"
                            style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                        />
                        <button
                            type="submit"
                            disabled={creating}
                            style={{
                                padding: '10px 20px',
                                background: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                fontWeight: 'bold',
                                cursor: creating ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {creating ? 'Creating...' : 'Create'}
                        </button>
                    </form>
                </div>

                {/* Room List */}
                {loading ? (
                    <p>Loading rooms...</p>
                ) : rooms.length === 0 ? (
                    <p style={{ color: '#666' }}>No rooms found. Create one above.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {rooms.map((room) => (
                            <div key={room.id} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{room.name}</h3>
                                        <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>ID: {room.id}</p>
                                    </div>
                                    <Link
                                        to={`/rooms/${room.id}/live`}
                                        style={{
                                            padding: '8px 15px',
                                            background: '#8b5cf6',
                                            color: 'white',
                                            textDecoration: 'none',
                                            borderRadius: '5px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            marginRight: '10px'
                                        }}
                                    >
                                        Live View
                                    </Link>
                                    <Link
                                        to={`/rooms/${room.id}/calibration`}
                                        style={{
                                            padding: '8px 15px',
                                            background: '#10b981',
                                            color: 'white',
                                            textDecoration: 'none',
                                            borderRadius: '5px',
                                            fontSize: '14px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Calibrate (QR)
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Rooms;
