import React, { useState, useEffect, useMemo } from 'react';
import {
    PlusIcon, SearchIcon, UsersIcon, SendIcon, CheckCheckIcon,
    ClockIcon, MessageSquareIcon, ArrowLeftIcon, MegaphoneIcon,
    InboxIcon, EyeIcon
} from 'lucide-react';
import {
    getRoster, getEnsembles, getDirectorConversations,
    getConversationMessages, replyToConversation, sendMessage
} from '../lib/opusApi';

export default function Messages() {
    // --- STATE ---
    const [activeTab, setActiveTab] = useState('messages'); // 'messages' | 'announcements'
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [threadMessages, setThreadMessages] = useState([]);

    // Data Loading
    const [loading, setLoading] = useState(true);
    const [ensembles, setEnsembles] = useState([]);
    const [roster, setRoster] = useState([]);

    // Compose Modal
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [composeType, setComposeType] = useState(null); // 'announcement' | 'message' | null (selection step)

    // Compose Form Data
    const [recipientType, setRecipientType] = useState('all'); // 'all' | 'ensemble' | 'individual'
    const [selectedEnsembleId, setSelectedEnsembleId] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);

    // Filtered Conversations
    const filteredConversations = useMemo(() => {
        return conversations.filter(c => {
            if (activeTab === 'announcements') return c.type === 'announcement';
            return c.type === 'direct'; // or 'group' if we had it
        });
    }, [conversations, activeTab]);

    // Stats
    const stats = useMemo(() => {
        const unreadMsg = conversations
            .filter(c => c.type === 'direct')
            .reduce((acc, c) => acc + (c.unreadCount || 0), 0);

        const announcementCount = conversations.filter(c => c.type === 'announcement').length;

        return { unreadMsg, announcementCount };
    }, [conversations]);


    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const directorId = localStorage.getItem('directorId');

        try {
            // Load Ensembles (Critical for Compose)
            const ens = await getEnsembles().catch(err => {
                console.error("Failed to load ensembles:", err);
                return [];
            });
            setEnsembles(ens || []);

            // Load Conversations
            if (directorId) {
                const convs = await getDirectorConversations(directorId).catch(err => {
                    console.error("Failed to load conversations:", err);
                    return [];
                });
                setConversations(convs || []);
            }

            // Load Roster (Depends on Ensembles)
            if (ens && ens.length > 0) {
                const allStudents = [];
                // Use Promise.all for faster parallel roster fetching
                const rosterPromises = ens.map(e => getRoster(e.id).then(students =>
                    students.map(s => ({ ...s, ensemble_name: e.name }))
                ).catch(() => []));

                const results = await Promise.all(rosterPromises);
                allStudents.push(...results.flat());
                setRoster(allStudents);
            }
        } catch (err) {
            console.error('Critical error loading data', err);
        } finally {
            setLoading(false);
        }
    };

    const openConversation = async (conv) => {
        setSelectedConversation(conv);
        setThreadMessages([]);
        try {
            const msgs = await getConversationMessages(conv.id);
            setThreadMessages(msgs || []);
        } catch (err) {
            console.error('Failed to load thread', err);
        }
    };

    const handleSend = async () => {
        setSending(true);
        try {
            const directorId = localStorage.getItem('directorId');
            let recipientIds = [];
            let recipientsSummary = '';

            // Resolve Recipients
            if (composeType === 'announcement') {
                // Announcements usually go to Ensembles or All
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
                    // Custom selection for announcement
                    recipientIds = selectedRecipients;
                    recipientsSummary = `${selectedRecipients.length} Recipients`;
                }
            } else {
                // Direct Message
                if (recipientType === 'individual') {
                    if (selectedRecipients.length === 0) throw new Error('Select at least one student');
                    recipientIds = selectedRecipients;
                    recipientsSummary = selectedRecipients.length === 1
                        ? (() => {
                            const s = roster.find(r => r.id === selectedRecipients[0]);
                            return s ? `${s.first_name} ${s.last_name}` : 'Student';
                        })()
                        : `${selectedRecipients.length} Recipients`;
                } else {
                    // Fallback if they try to send DM to ensemble (treat as bulk DM or announcement?)
                    // For now, let's allow it but warn or force announcement?
                    // Implementation Plan said: Messages = Student<->Director.
                    // We'll treat bulk DMs as broadcast messages for now (type='direct' but to many).
                    // Or force them to use Announcement? Let's just create 'direct' conversations.
                    if (!selectedEnsembleId) throw new Error('Please select an ensemble');
                    const ensembleStudents = roster.filter(s => s.ensemble_id === parseInt(selectedEnsembleId));
                    recipientIds = ensembleStudents.map(s => s.id);
                    recipientsSummary = 'Group Message'; // or similar
                }
            }

            await sendMessage({
                director_id: directorId,
                ensemble_id: selectedEnsembleId || null,
                subject,
                content,
                recipients_summary: recipientsSummary,
                recipient_ids: recipientIds,
                type: composeType, // 'announcement' or 'direct'
                reply_enabled: composeType === 'direct' // Announcements disabled by default
            });

            await loadData();
            closeCompose();
        } catch (err) {
            alert('Failed to send: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    const handleReply = async (content) => {
        if (!selectedConversation) return;
        try {
            await replyToConversation(selectedConversation.id, content);
            // Optimistic update
            const newMsg = {
                id: Date.now(),
                content,
                sender: 'director',
                created_at: new Date().toISOString()
            };
            setThreadMessages(prev => [...prev, newMsg]);
            loadData(); // Refresh list order
        } catch (err) {
            alert('Failed to send reply');
        }
    };

    const closeCompose = () => {
        setIsComposeOpen(false);
        setComposeType(null);
        resetForm();
    };

    const resetForm = () => {
        setSubject('');
        setContent('');
        setRecipientType('all');
        setSelectedEnsembleId('');
        setSelectedRecipients([]);
    };

    const toggleRecipient = (id) => {
        setSelectedRecipients(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen text-white">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Communication Hub</h1>
                    <p className="text-gray-400">Manage announcements, messages, and group conversations.</p>
                </div>
                <button
                    onClick={() => setIsComposeOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 shadow-lg shadow-purple-500/20 transition-all"
                >
                    <PlusIcon className="w-5 h-5" />
                    New
                </button>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    icon={<InboxIcon className="w-6 h-6 text-blue-400" />}
                    label="Unread Messages"
                    value={stats.unreadMsg}
                    subtext="Across all threads"
                />
                <StatCard
                    icon={<MegaphoneIcon className="w-6 h-6 text-purple-400" />}
                    label="Active Announcements"
                    value={stats.announcementCount}
                    subtext="Broadcasts sent"
                />
                {/* Placeholder for future stat */}
                <StatCard
                    icon={<UsersIcon className="w-6 h-6 text-blue-400" />}
                    label="Total Recipients"
                    value={roster.length}
                    subtext="Active students"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[75vh]">

                {/* LEFT PANE: SEARCH & LIST */}
                <div className="lg:col-span-4 flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        <TabButton
                            active={activeTab === 'messages'}
                            onClick={() => setActiveTab('messages')}
                            label="Messages"
                            count={stats.unreadMsg > 0 ? stats.unreadMsg : null}
                        />
                        <TabButton
                            active={activeTab === 'announcements'}
                            onClick={() => setActiveTab('announcements')}
                            label="Announcements"
                        />
                    </div>

                    {/* Search */}
                    <div className="p-4 border-b border-white/10">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading ? (
                            <p className="text-center text-gray-500 py-8">Loading...</p>
                        ) : filteredConversations.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <p className="text-gray-400 mb-2">No {activeTab} found</p>
                                <button onClick={() => setIsComposeOpen(true)} className="text-purple-400 text-sm hover:underline">
                                    Create new
                                </button>
                            </div>
                        ) : (
                            filteredConversations.map(conv => (
                                <div
                                    key={conv.id}
                                    onClick={() => openConversation(conv)}
                                    className={`p-4 rounded-xl cursor-pointer transition-colors border group ${selectedConversation?.id === conv.id
                                        ? 'bg-purple-500/20 border-purple-500/50'
                                        : 'bg-transparent border-white/5 hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Avatar Bubble */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg flex-shrink-0 ${selectedConversation?.id === conv.id ? 'bg-purple-600' : 'bg-gradient-to-br from-gray-700 to-gray-600 group-hover:from-purple-600 group-hover:to-blue-600 transition-all'}`}>
                                            {getInitials(conv.studentName || conv.title)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className={`font-semibold text-sm truncate pr-2 ${conv.unreadCount > 0 ? 'text-white' : 'text-gray-300'}`}>
                                                    {conv.studentName || conv.title}
                                                </h3>
                                                <span className="text-xs text-gray-500 flex-shrink-0">
                                                    {new Date(conv.updatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 line-clamp-1">
                                                {conv.lastMessage || 'No messages'}
                                            </p>
                                            {conv.unreadCount > 0 && activeTab === 'messages' && (
                                                <span className="inline-block mt-2 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full">
                                                    {conv.unreadCount} NEW
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT PANE: DETAIL VIEW */}
                <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                    {selectedConversation ? (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-3">
                                        {selectedConversation.title}
                                        {selectedConversation.type === 'announcement' && (
                                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-lg border border-purple-500/30">
                                                Announcement
                                            </span>
                                        )}
                                    </h2>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {selectedConversation.ensembleName} • {new Date(selectedConversation.updatedAt).toLocaleString()}
                                    </p>
                                </div>

                                {selectedConversation.type === 'announcement' && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20 text-sm">
                                        <EyeIcon className="w-4 h-4" />
                                        <span>Seen 12/45</span> {/* Mock data for now, ideally fetch from backend */}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            {selectedConversation.type === 'announcement' ? (
                                // ANNOUNCEMENT VIEW (Read Only)
                                <div className="flex-1 overflow-y-auto p-8">
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                        <div className="prose prose-invert max-w-none">
                                            {/* Show the FIRST message as the Body, or construct from history */}
                                            {/* Usually announcements have the main body in the first message */}
                                            {threadMessages.length > 0 ? (
                                                threadMessages.slice().reverse().map((msg, i) => (
                                                    <div key={i} className="mb-6 last:mb-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xs">
                                                                DIR
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm">Director</p>
                                                                <p className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-200 whitespace-pre-wrap pl-10 text-lg leading-relaxed">{msg.content}</p>
                                                    </div>
                                                ))
                                            ) : <p className="text-gray-500">Loading content...</p>}
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-center">
                                        <p className="text-gray-500 text-sm italic">
                                            Replies are disabled for announcements.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                // MESSAGE VIEW (Interactive)
                                <ThreadView
                                    messages={threadMessages}
                                    onReply={handleReply}
                                />
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <MessageSquareIcon className="w-16 h-16 mb-4 opacity-20" />
                            <p>Select a {activeTab.slice(0, -1)} to view</p>
                        </div>
                    )}
                </div>
            </div>

            {/* COMPOSE MODAL */}
            {isComposeOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-white/20 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-xl font-bold">New Communication</h2>
                            <button onClick={closeCompose} className="text-gray-400 hover:text-white">&times;</button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 flex-1 overflow-y-auto">
                            {!composeType ? (
                                // STEP 1: CHOOSE TYPE
                                <div className="grid grid-cols-2 gap-6 h-full">
                                    <button
                                        onClick={() => { setComposeType('announcement'); setRecipientType('all'); }}
                                        className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all group"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <MegaphoneIcon className="w-8 h-8 text-purple-400" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-lg font-bold mb-1">Make Announcement</h3>
                                            <p className="text-sm text-gray-400">Broadcast to all students or specific ensembles. No replies.</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => { setComposeType('direct'); setRecipientType('individual'); }}
                                        className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all group"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <MessageSquareIcon className="w-8 h-8 text-blue-400" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-lg font-bold mb-1">Send Message</h3>
                                            <p className="text-sm text-gray-400">Direct message to individual students or small groups. Replies allowed.</p>
                                        </div>
                                    </button>
                                </div>
                            ) : (
                                // STEP 2: COMPOSE FORM
                                <div className="space-y-6">
                                    {/* Audience Context */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <button onClick={() => setComposeType(null)} className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
                                            <ArrowLeftIcon className="w-3 h-3" /> Back
                                        </button>
                                        <span className="text-gray-600">|</span>
                                        <span className={`text-sm font-bold uppercase tracking-wider ${composeType === 'announcement' ? 'text-purple-400' : 'text-blue-400'}`}>
                                            {composeType === 'announcement' ? 'Announcement' : 'Direct Message'}
                                        </span>
                                    </div>

                                    {/* Recipient Selection Logic */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-300">Audience</label>

                                        {/* Type Toggles based on Mode */}
                                        <div className="flex gap-3">
                                            {composeType === 'announcement' ? (
                                                <>
                                                    <TypeToggle current={recipientType} value="all" label="All Students" onClick={setRecipientType} />
                                                    <TypeToggle current={recipientType} value="ensemble" label="By Ensemble" onClick={setRecipientType} />
                                                    <TypeToggle current={recipientType} value="individual" label="Custom Selection" onClick={setRecipientType} />
                                                </>
                                            ) : (
                                                <>
                                                    <TypeToggle current={recipientType} value="individual" label="Individual Student" onClick={setRecipientType} />
                                                    <TypeToggle current={recipientType} value="ensemble" label="Ensemble Group" onClick={setRecipientType} />
                                                </>
                                            )}
                                        </div>

                                        {/* Interactive Selectors */}
                                        {recipientType === 'ensemble' && (
                                            <div className="mt-2">
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
                                            <div className="mt-2 p-4 bg-white/5 rounded-xl border border-white/10 max-h-48 overflow-y-auto">
                                                {/* Search Input inside dropdown area */}
                                                <input
                                                    type="text"
                                                    placeholder="Search students..."
                                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white mb-3"
                                                />
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
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Message Content */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                                        <input
                                            type="text"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="e.g. Schedule Change"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Body</label>
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            rows={6}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                            placeholder="Type your message..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        {composeType && (
                            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                                <button
                                    onClick={closeCompose}
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
                                            {composeType === 'announcement' ? 'Post Announcement' : 'Send Message'}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// --- HELPERS ---

const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
};

// --- SUBCOMPONENTS ---

function StatCard({ icon, label, value, subtext }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/5 rounded-xl">
                    {icon}
                </div>
                <span className="text-3xl font-bold text-white">{value}</span>
            </div>
            <h3 className="font-semibold text-gray-200">{label}</h3>
            <p className="text-sm text-gray-500">{subtext}</p>
        </div>
    );
}

function TabButton({ active, onClick, label, count }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors relative ${active
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
        >
            {label}
            {count > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] rounded-full">
                    {count}
                </span>
            )}
        </button>
    );
}

function TypeToggle({ current, value, label, onClick }) {
    const isSelected = current === value;
    return (
        <button
            onClick={() => onClick(value)}
            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${isSelected
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
        >
            {label}
        </button>
    );
}

function ThreadView({ messages, onReply }) {
    const [replyText, setReplyText] = useState('');
    const messagesEndRef = React.useRef(null);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, index) => {
                    const isMe = msg.sender === 'director';
                    return (
                        <div key={msg.id} className="group">
                            <div className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {/* Student Avatar (Left) */}
                                {!isMe && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-lg flex-shrink-0 mt-1">
                                        {getInitials(msg.senderName)}
                                    </div>
                                )}

                                <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${isMe ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white/10 text-gray-200 rounded-bl-none'}`}>
                                    {!isMe && <p className="text-xs font-bold text-gray-400 mb-1">{msg.senderName}</p>}
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    <p className={`text-[10px] mt-2 text-right ${isMe ? 'text-purple-200' : 'text-gray-500'}`}>
                                        {new Date(msg.created_at || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>

                                {/* Director Avatar (Right) - Optional but looks nice for symmetry if desired, or can omit */}
                                {isMe && (
                                    <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-xs font-bold text-white shadow-lg flex-shrink-0 mt-1">
                                        DIR
                                    </div>
                                )}
                            </div>

                            {/* Separator Line (except for last item) */}
                            {index < messages.length - 1 && (
                                <div className="h-px bg-white/5 my-6 mx-12" />
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onReply(replyText) && setReplyText('')}
                        placeholder="Type a reply..."
                        className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    />
                    <button
                        onClick={() => { onReply(replyText); setReplyText(''); }}
                        disabled={!replyText.trim()}
                        className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
