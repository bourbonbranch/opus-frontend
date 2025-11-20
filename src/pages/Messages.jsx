
import React, { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, UsersIcon, SendIcon, CheckCheckIcon, ClockIcon } from 'lucide-react';
import { getRoster, getEnsembles, getMessages, sendMessage } from '../lib/opusApi';

export default function Messages() {
    const [messages, setMessages] = useState([]);
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [ensembles, setEnsembles] = useState([]);
    const [roster, setRoster] = useState([]);

    // Compose state
    const [recipientType, setRecipientType] = useState('all'); // 'all', 'ensemble', 'individual'
    const [selectedEnsembleId, setSelectedEnsembleId] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const directorId = localStorage.getItem('directorId');
            if (directorId) {
                const msgs = await getMessages(directorId);
                setMessages(msgs || []);
            }

            const ens = await getEnsembles();
            setEnsembles(ens || []);

            // Fetch all students for individual selection
            if (ens.length > 0) {
                const allStudents = [];
                for (const e of ens) {
                    const students = await getRoster(e.id);
                    allStudents.push(...students.map(s => ({ ...s, ensemble_name: e.name })));
                }
                setRoster(allStudents);
            }
        } catch (err) {
            console.error('Failed to load data', err);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);

        try {
            const directorId = localStorage.getItem('directorId');
            let recipientIds = [];
            let recipientsSummary = '';

            if (recipientType === 'all') {
                recipientIds = roster.map(s => s.id);
                recipientsSummary = 'All Students';
            } else if (recipientType === 'ensemble') {
                if (!selectedEnsembleId) throw new Error('Please select an ensemble');
                const ensembleStudents = roster.filter(s => s.ensemble_id === parseInt(selectedEnsembleId));
                recipientIds = ensembleStudents.map(s => s.id);
                const ensembleName = ensembles.find(e => e.id === parseInt(selectedEnsembleId))?.name;
                recipientsSummary = ensembleName || 'Ensemble';
            } else {
                recipientIds = selectedRecipients;
                recipientsSummary = `${selectedRecipients.length} Recipients`;
            }

            await sendMessage({
                director_id: directorId,
                ensemble_id: selectedEnsembleId || null,
                subject,
                content,
                recipients_summary: recipientsSummary,
                recipient_ids: recipientIds
            });

            await loadData(); // Refresh list
            setIsComposeOpen(false);
            resetForm();
        } catch (err) {
            alert('Failed to send message: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    const resetForm = () => {
        setSubject('');
        setContent('');
        setRecipientType('all');
        setSelectedEnsembleId('');
        setSelectedRecipients([]);
    };

    const toggleRecipient = (studentId) => {
        if (selectedRecipients.includes(studentId)) {
            setSelectedRecipients(selectedRecipients.filter(id => id !== studentId));
        } else {
            setSelectedRecipients([...selectedRecipients, studentId]);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
                    <p className="text-gray-300">Communicate with students and parents</p>
                </div>
                <button
                    onClick={() => setIsComposeOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg shadow-purple-500/30"
                >
                    <PlusIcon className="w-5 h-5" />
                    New Message
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Message List */}
                <div className="lg:col-span-3 space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-gray-400">No messages sent yet</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
                                            <UsersIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">{msg.subject}</h3>
                                            <p className="text-sm text-gray-400">To: {msg.recipients_summary}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-400 flex items-center gap-1">
                                        <ClockIcon className="w-3 h-3" />
                                        {new Date(msg.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-300 mb-4 line-clamp-2">{msg.content}</p>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1.5 text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                                        <CheckCheckIcon className="w-4 h-4" />
                                        <span>{msg.read_count} / {msg.total_count} Read</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Compose Modal */}
            {isComposeOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-white/20 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">New Message</h2>
                            <button onClick={() => setIsComposeOpen(false)} className="text-gray-400 hover:text-white">
                                &times;
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Recipient Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-300">Send To</label>
                                <div className="flex gap-3">
                                    {['all', 'ensemble', 'individual'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setRecipientType(type)}
                                            className={`flex - 1 py - 2 px - 4 rounded - lg border text - sm font - medium transition - all capitalize ${recipientType === type
                                                    ? 'bg-purple-600 border-purple-500 text-white'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                } `}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>

                                {recipientType === 'ensemble' && (
                                    <div className="mt-4">
                                        <select
                                            value={selectedEnsembleId}
                                            onChange={(e) => setSelectedEnsembleId(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">Select Ensemble...</option>
                                            {ensembles.map(e => (
                                                <option key={e.id} value={e.id}>{e.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {recipientType === 'individual' && (
                                    <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 max-h-48 overflow-y-auto">
                                        <div className="sticky top-0 bg-gray-900/95 backdrop-blur pb-2 mb-2 border-b border-white/10">
                                            <div className="relative">
                                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input
                                                    type="text"
                                                    placeholder="Search students..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            {roster.map(student => (
                                                <label key={student.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRecipients.includes(student.id)}
                                                        onChange={() => toggleRecipient(student.id)}
                                                        className="rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-700"
                                                    />
                                                    <div>
                                                        <p className="text-white text-sm font-medium">{student.first_name} {student.last_name}</p>
                                                        <p className="text-xs text-gray-500">{student.ensemble_name}</p>
                                                    </div>
                                                </label>
                                            ))}
                                            {roster.length === 0 && <p className="text-gray-500 text-center py-2">No students found</p>}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="e.g. Rehearsal Reminder"
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={6}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="Type your message here..."
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                            <button
                                onClick={() => setIsComposeOpen(false)}
                                className="px-6 py-3 rounded-xl font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={sending || !subject || !content}
                                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {sending ? 'Sending...' : (
                                    <>
                                        <SendIcon className="w-4 h-4" />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
