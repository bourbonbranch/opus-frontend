import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Plus } from 'lucide-react';

export default function EnsembleMessages() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMessages();
    }, [id]);

    const loadMessages = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';
            const response = await fetch(`${API_URL}/api/ensembles/${id}/messages`);
            const data = await response.json();
            setMessages(data || []);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Messages</h2>
                <button
                    onClick={() => navigate('/director/messages')}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Compose to Ensemble
                </button>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                {messages.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="w-16 h-16 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60">No messages yet</p>
                        <p className="text-white/40 text-sm mt-2">Messages sent to this ensemble will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {messages.map((message) => (
                            <div key={message.id} className="p-4 bg-white/5 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-white font-medium">{message.subject}</h4>
                                    <span className="text-white/60 text-sm">
                                        {new Date(message.sent_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {message.audience && (
                                    <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                                        {message.audience}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
