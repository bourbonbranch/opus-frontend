import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';

export default function EnsembleAssignments() {
    const { id } = useParams();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAssignments();
    }, [id]);

    const loadAssignments = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';
            const response = await fetch(`${API_URL}/api/ensembles/${id}/assignments`);
            const data = await response.json();
            setAssignments(data || []);
        } catch (error) {
            console.error('Error loading assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Assignments</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    <Plus className="w-4 h-4" />
                    New Assignment
                </button>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                {assignments.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60">No assignments yet</p>
                        <p className="text-white/40 text-sm mt-2">Create your first assignment to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {assignments.map((assignment) => (
                            <div key={assignment.id} className="p-4 bg-white/5 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-white font-medium">{assignment.title}</h4>
                                        {assignment.type && (
                                            <p className="text-white/60 text-sm capitalize">{assignment.type}</p>
                                        )}
                                    </div>
                                    {assignment.due_at && (
                                        <span className="text-white/60 text-sm">
                                            Due {new Date(assignment.due_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                {assignment.description && (
                                    <p className="text-white/70 text-sm mt-2">{assignment.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
