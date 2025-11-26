import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function NewAssignmentModal({ isOpen, onClose, onSave, ensembleId }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'memorization',
        due_date: '',
        due_time: '23:59',
        target_type: 'all',
        target_value: '',
        submission_required: true,
        grading_type: 'completion',
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Combine date and time
        const dueAt = new Date(`${formData.due_date}T${formData.due_time}`);

        // Get director ID safely
        const directorId = localStorage.getItem('directorId');

        if (!directorId) {
            alert('Session expired. Please log in again.');
            return;
        }

        if (!ensembleId) {
            alert('Error: No ensemble selected. Please refresh the page.');
            return;
        }

        const assignmentData = {
            ensemble_id: ensembleId,
            title: formData.title,
            description: formData.description,
            type: formData.type,
            due_at: dueAt.toISOString(),
            status: 'active',
            submission_required: formData.submission_required,
            grading_type: formData.grading_type,
            created_by: parseInt(directorId),
            targets: [{
                target_type: formData.target_type,
                target_value: formData.target_value || null,
            }],
            attachments: []
        };

        await onSave(assignmentData);
        handleClose();
    };

    const handleClose = () => {
        setFormData({
            title: '',
            description: '',
            type: 'memorization',
            due_date: '',
            due_time: '23:59',
            target_type: 'all',
            target_value: '',
            submission_required: true,
            grading_type: 'completion',
        });
        setStep(1);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">New Assignment</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Memorize Gloria mm. 12-24"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Add instructions or notes..."
                            rows={4}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Type *
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="memorization">🧠 Memorization</option>
                            <option value="recording">🎤 Recording</option>
                            <option value="written">✍️ Written Response</option>
                            <option value="check-in">✓ Check-in / Task</option>
                            <option value="other">📋 Other</option>
                        </select>
                    </div>

                    {/* Due Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Due Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Due Time
                            </label>
                            <input
                                type="time"
                                value={formData.due_time}
                                onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    {/* Assign To */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Assign To *
                        </label>
                        <select
                            value={formData.target_type}
                            onChange={(e) => setFormData({ ...formData, target_type: e.target.value, target_value: '' })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">All Students</option>
                            <option value="section">By Section</option>
                            <option value="part">By Part</option>
                        </select>
                    </div>

                    {/* Section/Part Selection */}
                    {(formData.target_type === 'section' || formData.target_type === 'part') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {formData.target_type === 'section' ? 'Section' : 'Part'}
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.target_value}
                                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                                placeholder={formData.target_type === 'section' ? 'e.g., Soprano' : 'e.g., S1'}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    )}

                    {/* Grading Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Grading
                        </label>
                        <select
                            value={formData.grading_type}
                            onChange={(e) => setFormData({ ...formData, grading_type: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="completion">Completion Only (Complete/Missing)</option>
                            <option value="score">Score (0-100)</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-3 text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg shadow-purple-500/20"
                        >
                            Create Assignment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
