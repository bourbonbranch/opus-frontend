import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Save } from 'lucide-react';

export default function EnsembleAttendance() {
    const { id } = useParams();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadAttendance();
    }, [id, date]);

    const loadAttendance = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';
            const response = await fetch(`${API_URL}/api/ensembles/${id}/attendance?date=${date}`);
            const data = await response.json();
            // Force default to 'present' if status is missing or null
            const recordsWithDefault = (data.records || []).map(r => ({
                ...r,
                status: r.status || 'present'
            }));
            setRecords(recordsWithDefault);
        } catch (error) {
            console.error('Error loading attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (memberId, status) => {
        setRecords(records.map(r =>
            r.id === memberId ? { ...r, status } : r
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';
            await fetch(`${API_URL}/api/ensembles/${id}/attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date,
                    records: records.map(r => ({
                        student_id: r.id,
                        status: r.status
                    }))
                })
            });
            alert('Attendance saved successfully');
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Calendar className="w-5 h-5 text-white/60" />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="px-4 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white"
                    />
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Attendance'}
                </button>
            </div>

            {/* Attendance List */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <div className="space-y-3">
                    {records.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div>
                                <p className="text-white font-medium">
                                    {member.first_name} {member.last_name}
                                </p>
                                <p className="text-white/60 text-sm">
                                    {member.section} {member.part && `- ${member.part}`}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleStatusChange(member.id, 'present')}
                                    className={`px-4 py-2 rounded-lg transition-colors ${member.status === 'present'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                                        }`}
                                >
                                    Present
                                </button>
                                <button
                                    onClick={() => handleStatusChange(member.id, 'absent')}
                                    className={`px-4 py-2 rounded-lg transition-colors ${member.status === 'absent'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                                        }`}
                                >
                                    Absent
                                </button>
                                <button
                                    onClick={() => handleStatusChange(member.id, 'excused')}
                                    className={`px-4 py-2 rounded-lg transition-colors ${member.status === 'excused'
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                                        }`}
                                >
                                    Excused
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {records.length === 0 && (
                    <div className="text-center py-12 text-white/60">
                        No members found for this ensemble
                    </div>
                )}
            </div>
        </div>
    );
}
