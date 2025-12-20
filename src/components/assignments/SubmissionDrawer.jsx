import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Play, Pause, Check, AlertCircle } from 'lucide-react';

export default function SubmissionDrawer({ isOpen, onClose, submission, onSave }) {
    const [score, setScore] = useState('');
    const [feedback, setFeedback] = useState('');
    const [status, setStatus] = useState('submitted');
    const [isPlaying, setIsPlaying] = useState(false);
    const [audio, setAudio] = useState(null);

    useEffect(() => {
        if (submission) {
            setScore(submission.score !== null ? submission.score : '');
            setFeedback(submission.feedback || '');
            setStatus(submission.status);
        }
    }, [submission]);

    useEffect(() => {
        if (submission?.audio_url) {
            const newAudio = new Audio(submission.audio_url);
            newAudio.onended = () => setIsPlaying(false);
            setAudio(newAudio);
        }
        return () => {
            if (audio) {
                audio.pause();
                setAudio(null);
            }
        };
    }, [submission?.audio_url]);

    const togglePlay = () => {
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSave = async () => {
        // If there's a score, automatically set status to graded
        const finalStatus = (score !== '' && score !== null) ? 'graded' : status;

        const payload = {
            score: score === '' ? null : parseFloat(score),
            feedback,
            status: finalStatus
        };

        console.log('[SubmissionDrawer] Saving submission', submission.id, 'with payload:', payload);

        await onSave(submission.id, payload);
        onClose();
    };

    if (!isOpen || !submission) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-gray-900 border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {submission.first_name} {submission.last_name}
                            </h2>
                            <p className="text-gray-400 text-sm">
                                {submission.section} • {submission.part}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Submission Content */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Submission</h3>

                            {submission.status === 'not_started' ? (
                                <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
                                    <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                                    <p className="text-gray-400">Student has not started this assignment</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Text Response */}
                                    {submission.text_response && (
                                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                            <p className="text-gray-300 whitespace-pre-wrap">{submission.text_response}</p>
                                        </div>
                                    )}

                                    {/* Audio Player */}
                                    {submission.audio_url && (
                                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={togglePlay}
                                                    className="w-12 h-12 flex items-center justify-center bg-purple-500 rounded-full hover:bg-purple-600 transition-colors"
                                                >
                                                    {isPlaying ? (
                                                        <Pause className="w-5 h-5 text-white" />
                                                    ) : (
                                                        <Play className="w-5 h-5 text-white ml-1" />
                                                    )}
                                                </button>
                                                <div className="flex-1">
                                                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-purple-500 w-0" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* File Attachment */}
                                    {submission.file_url && (
                                        <a
                                            href={submission.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors group"
                                        >
                                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-300">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <span className="text-white font-medium flex-1">View Attachment</span>
                                            <Download className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Grading */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Grading</h3>

                            {/* Status Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="not_started">Not Started</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="graded">Graded</option>
                                    <option value="late">Late</option>
                                    <option value="missing">Missing</option>
                                    <option value="excused">Excused</option>
                                </select>
                            </div>

                            {/* Score Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Score</label>
                                <input
                                    type="number"
                                    value={score}
                                    onChange={(e) => {
                                        setScore(e.target.value);
                                        // Auto-set status to 'graded' when score is entered
                                        if (e.target.value && status !== 'graded') {
                                            setStatus('graded');
                                        }
                                    }}
                                    placeholder="Enter score..."
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Feedback */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Feedback</label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Add feedback for student..."
                                    rows={4}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-white/10 bg-gray-900/50 backdrop-blur-xl">
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg shadow-purple-500/20"
                            >
                                Save Grade
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
