import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Trash2, Save, MessageSquare,
    Calendar, CheckSquare, Music, FileText, MoreVertical,
    ChevronRight, ChevronDown, Send
} from 'lucide-react';
import { VITE_API_BASE_URL } from '../lib/opusApi';

export default function Planner() {
    const { pieceId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [piece, setPiece] = useState(null);
    const [sections, setSections] = useState([]);
    const [annotations, setAnnotations] = useState([]);
    const [plans, setPlans] = useState([]);
    const [expandedPlanId, setExpandedPlanId] = useState(null);
    const [planTasks, setPlanTasks] = useState({}); // { planId: [tasks] }
    const [loadingTasks, setLoadingTasks] = useState(false);

    // UI State
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('plans'); // plans, chat
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);

    // Modals
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedPlanForTask, setSelectedPlanForTask] = useState(null);
    const [newSection, setNewSection] = useState({ name: '', measure_start: '', measure_end: '' });
    const [newPlan, setNewPlan] = useState({ title: '', target_date: '' });
    const [newTask, setNewTask] = useState({
        description: '',
        piece_section_id: '',
        measure_start: '',
        measure_end: '',
        priority: 'medium'
    });

    useEffect(() => {
        fetchData();
    }, [pieceId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Piece Details (using existing files endpoint logic, but we need a specific one or filter)
            // Since we don't have a direct "get file by ID" endpoint exposed in index.js easily, 
            // we might need to fetch all files for the ensemble and find this one, OR add a specific endpoint.
            // For MVP, let's assume we can get it or pass it. 
            // Actually, we can't easily get it without an endpoint. 
            // Let's add a quick fetch to the files endpoint if we know the ensemble ID, but we don't.
            // Wait, the URL is /pieces/:pieceId/planner. We need to know the ensemble ID to fetch files?
            // The `ensemble_files` table has `id` as PK. We can add a GET /api/files/:id endpoint to index.js or planner-api.js
            // I'll add GET /api/files/:id to planner-api.js for convenience.

            const pieceRes = await fetch(`${VITE_API_BASE_URL}/api/files/${pieceId}`);
            if (!pieceRes.ok) throw new Error('Failed to fetch piece');
            const pieceData = await pieceRes.json();
            setPiece(pieceData);

            // 2. Fetch Sections
            const sectionsRes = await fetch(`${VITE_API_BASE_URL}/api/pieces/${pieceId}/sections`);
            const sectionsData = await sectionsRes.json();
            setSections(sectionsData);

            // 3. Fetch Annotations
            const annotationsRes = await fetch(`${VITE_API_BASE_URL}/api/pieces/${pieceId}/annotations`);
            const annotationsData = await annotationsRes.json();
            setAnnotations(annotationsData);

            // 4. Fetch Plans
            const plansRes = await fetch(`${VITE_API_BASE_URL}/api/pieces/${pieceId}/rehearsal-plans`);
            const plansData = await plansRes.json();
            setPlans(plansData);

        } catch (err) {
            console.error('Error fetching planner data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSection = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${VITE_API_BASE_URL}/api/pieces/${pieceId}/sections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSection)
            });
            const data = await res.json();
            setSections([...sections, data]);
            setShowSectionModal(false);
            setNewSection({ name: '', measure_start: '', measure_end: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddPlan = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${VITE_API_BASE_URL}/api/pieces/${pieceId}/rehearsal-plans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newPlan,
                    ensemble_id: piece.ensemble_id, // Assuming piece has ensemble_id
                    created_by: localStorage.getItem('directorId')
                })
            });
            const data = await res.json();
            setPlans([data, ...plans]);
            setShowPlanModal(false);
            setNewPlan({ title: '', target_date: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const handleTogglePlan = async (planId) => {
        if (expandedPlanId === planId) {
            // Collapse
            setExpandedPlanId(null);
        } else {
            // Expand and fetch tasks
            setExpandedPlanId(planId);
            if (!planTasks[planId]) {
                setLoadingTasks(true);
                try {
                    const res = await fetch(`${VITE_API_BASE_URL}/api/rehearsal-plans/${planId}/tasks`);
                    const data = await res.json();
                    setPlanTasks(prev => ({ ...prev, [planId]: data }));
                } catch (err) {
                    console.error('Error fetching tasks:', err);
                } finally {
                    setLoadingTasks(false);
                }
            }
        }
    };

    const handleOpenTaskModal = (planId) => {
        setSelectedPlanForTask(planId);
        setShowTaskModal(true);
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!selectedPlanForTask) return;

        try {
            const res = await fetch(`${VITE_API_BASE_URL}/api/rehearsal-plans/${selectedPlanForTask}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask)
            });
            const data = await res.json();

            // Update tasks for this plan
            setPlanTasks(prev => ({
                ...prev,
                [selectedPlanForTask]: [...(prev[selectedPlanForTask] || []), data]
            }));

            setShowTaskModal(false);
            setNewTask({
                description: '',
                piece_section_id: '',
                measure_start: '',
                measure_end: '',
                priority: 'medium'
            });
        } catch (err) {
            console.error('Error adding task:', err);
        }
    };

    const handleUpdateTaskStatus = async (taskId, planId, newStatus) => {
        try {
            const res = await fetch(`${VITE_API_BASE_URL}/api/rehearsal-tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();

            // Update task in state
            setPlanTasks(prev => ({
                ...prev,
                [planId]: prev[planId].map(t => t.id === taskId ? data : t)
            }));
        } catch (err) {
            console.error('Error updating task:', err);
        }
    };

    const handleDeleteTask = async (taskId, planId) => {
        try {
            await fetch(`${VITE_API_BASE_URL}/api/rehearsal-tasks/${taskId}`, {
                method: 'DELETE'
            });

            // Remove task from state
            setPlanTasks(prev => ({
                ...prev,
                [planId]: prev[planId].filter(t => t.id !== taskId)
            }));
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    const handleSectionChange = (sectionId) => {
        const section = sections.find(s => s.id === parseInt(sectionId));
        if (section) {
            setNewTask({
                ...newTask,
                piece_section_id: sectionId,
                measure_start: section.measure_start,
                measure_end: section.measure_end
            });
        } else {
            setNewTask({
                ...newTask,
                piece_section_id: '',
                measure_start: '',
                measure_end: ''
            });
        }
    };


    const handleAiChat = async (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        const userMsg = { role: 'user', content: chatMessage };
        setChatHistory([...chatHistory, userMsg]);
        setChatMessage('');
        setAiLoading(true);

        try {
            const res = await fetch(`${VITE_API_BASE_URL}/api/ai/planner-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    piece,
                    sections,
                    annotations,
                    user_message: chatMessage
                })
            });
            const data = await res.json();
            setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (err) {
            console.error(err);
            setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
        } finally {
            setAiLoading(false);
        }
    };

    if (loading) return <div className="text-white p-8">Loading Planner...</div>;
    if (!piece) return <div className="text-white p-8">Piece not found</div>;

    return (
        <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-gray-800 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">{piece.title}</h1>
                        <p className="text-xs text-gray-400">Score Study & Planner</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                        className={`p-2 rounded-lg ${leftPanelOpen ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                    >
                        <FileText className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setRightPanelOpen(!rightPanelOpen)}
                        className={`p-2 rounded-lg ${rightPanelOpen ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                    >
                        <CheckSquare className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">

                {/* LEFT PANEL: Sections */}
                {leftPanelOpen && (
                    <div className="w-80 bg-gray-800 border-r border-white/10 flex flex-col shrink-0">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h2 className="font-semibold text-white">Sections</h2>
                            <button onClick={() => setShowSectionModal(true)} className="text-blue-400 hover:text-blue-300">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {sections.map(section => (
                                <div key={section.id} className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 cursor-pointer group">
                                    <div className="flex justify-between items-start">
                                        <span className="text-white font-medium">{section.name}</span>
                                        <button className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        mm. {section.measure_start} - {section.measure_end}
                                    </div>
                                </div>
                            ))}
                            {sections.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-4">No sections defined</p>
                            )}
                        </div>
                    </div>
                )}

                {/* CENTER PANEL: Score Viewer */}
                <div className="flex-1 bg-gray-900 relative flex flex-col">
                    {/* Toolbar */}
                    <div className="h-10 bg-gray-800 border-b border-white/10 flex items-center px-4 gap-4">
                        <span className="text-xs text-gray-400">PDF Viewer Mode</span>
                        {/* Add annotation tools here later */}
                    </div>

                    {/* PDF Container */}
                    <div className="flex-1 relative bg-gray-900 overflow-hidden flex items-center justify-center">
                        {piece.storage_url && piece.storage_url.startsWith('data:application/pdf') ? (
                            <iframe
                                src={piece.storage_url}
                                className="w-full h-full"
                                title="Score PDF"
                            />
                        ) : (
                            <div className="text-center">
                                <p className="text-gray-400 mb-4">PDF preview not available</p>
                                <a href={piece.storage_url} download className="text-blue-400 hover:underline">Download File</a>
                            </div>
                        )}

                        {/* Overlay Annotations (Placeholder) */}
                        {/* In a real implementation, we'd map these to coordinates on top of a canvas or PDF wrapper */}
                    </div>
                </div>

                {/* RIGHT PANEL: Plans & Chat */}
                {rightPanelOpen && (
                    <div className="w-96 bg-gray-800 border-l border-white/10 flex flex-col shrink-0">
                        {/* Tabs */}
                        <div className="flex border-b border-white/10">
                            <button
                                onClick={() => setActiveTab('plans')}
                                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'plans' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
                            >
                                Rehearsal Plans
                            </button>
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'chat' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                            >
                                AI Assistant
                            </button>
                        </div>

                        {/* Plans Content */}
                        {activeTab === 'plans' && (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                    <h3 className="text-white font-medium">Plans</h3>
                                    <button onClick={() => setShowPlanModal(true)} className="text-purple-400 hover:text-purple-300">
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {plans.map(plan => {
                                        const isExpanded = expandedPlanId === plan.id;
                                        const tasks = planTasks[plan.id] || [];

                                        return (
                                            <div key={plan.id} className="bg-gray-700/50 rounded-lg overflow-hidden">
                                                {/* Plan Header */}
                                                <div
                                                    className="p-3 cursor-pointer hover:bg-gray-700/70 transition-colors"
                                                    onClick={() => handleTogglePlan(plan.id)}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div className="flex items-center gap-2">
                                                            {isExpanded ? (
                                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                                            ) : (
                                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                                            )}
                                                            <h4 className="text-white font-medium">{plan.title}</h4>
                                                        </div>
                                                        <span className="text-xs text-gray-400">
                                                            {plan.target_date && new Date(plan.target_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="ml-6 text-xs text-gray-500">
                                                        {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                                                    </div>
                                                </div>

                                                {/* Tasks List (when expanded) */}
                                                {isExpanded && (
                                                    <div className="border-t border-white/10 bg-gray-800/30">
                                                        <div className="p-3 border-b border-white/10 flex justify-between items-center">
                                                            <span className="text-xs text-gray-400 font-medium">TASKS</span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenTaskModal(plan.id);
                                                                }}
                                                                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                                Add Task
                                                            </button>
                                                        </div>

                                                        {loadingTasks && tasks.length === 0 ? (
                                                            <div className="p-4 text-center text-gray-500 text-sm">Loading tasks...</div>
                                                        ) : tasks.length === 0 ? (
                                                            <div className="p-4 text-center text-gray-500 text-sm">No tasks yet</div>
                                                        ) : (
                                                            <div className="p-2 space-y-2">
                                                                {tasks.map(task => {
                                                                    const sectionName = task.section_name ||
                                                                        (task.piece_section_id && sections.find(s => s.id === task.piece_section_id)?.name);

                                                                    return (
                                                                        <div key={task.id} className="bg-gray-700/50 rounded p-2 group">
                                                                            <div className="flex items-start gap-2">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={task.status === 'done'}
                                                                                    onChange={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleUpdateTaskStatus(
                                                                                            task.id,
                                                                                            plan.id,
                                                                                            task.status === 'done' ? 'planned' : 'done'
                                                                                        );
                                                                                    }}
                                                                                    className="mt-1 cursor-pointer"
                                                                                />
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className={`text-sm ${task.status === 'done' ? 'text-gray-500 line-through' : 'text-white'}`}>
                                                                                        {task.description}
                                                                                    </p>
                                                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                                                        {sectionName && (
                                                                                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                                                                                                {sectionName}
                                                                                            </span>
                                                                                        )}
                                                                                        {(task.measure_start || task.measure_end) && (
                                                                                            <span className="text-xs text-gray-400">
                                                                                                mm. {task.measure_start || '?'}-{task.measure_end || '?'}
                                                                                            </span>
                                                                                        )}
                                                                                        {task.priority && (
                                                                                            <span className={`text-xs px-2 py-0.5 rounded ${task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                                                                                                task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                                                                                    'bg-gray-500/20 text-gray-300'
                                                                                                }`}>
                                                                                                {task.priority}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleDeleteTask(task.id, plan.id);
                                                                                    }}
                                                                                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {plans.length === 0 && (
                                        <p className="text-gray-500 text-sm text-center">No rehearsal plans yet</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* AI Chat Content */}
                        {activeTab === 'chat' && (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {chatHistory.length === 0 && (
                                        <div className="text-center text-gray-500 mt-8">
                                            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p>Ask me about rehearsal strategies, score analysis, or warm-up ideas!</p>
                                        </div>
                                    )}
                                    {chatHistory.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'
                                                }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    {aiLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-700 rounded-lg p-3 text-sm text-gray-400">
                                                Thinking...
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 border-t border-white/10">
                                    <form onSubmit={handleAiChat} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={chatMessage}
                                            onChange={(e) => setChatMessage(e.target.value)}
                                            placeholder="Ask the assistant..."
                                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!chatMessage.trim() || aiLoading}
                                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg disabled:opacity-50"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showSectionModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-xl w-96 border border-white/10">
                        <h3 className="text-white font-bold mb-4">Add Section</h3>
                        <form onSubmit={handleAddSection} className="space-y-4">
                            <input
                                type="text" placeholder="Section Name (e.g. Intro)"
                                value={newSection.name} onChange={e => setNewSection({ ...newSection, name: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                required
                            />
                            <div className="flex gap-2">
                                <input
                                    type="number" placeholder="Start Measure"
                                    value={newSection.measure_start} onChange={e => setNewSection({ ...newSection, measure_start: e.target.value })}
                                    className="w-1/2 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                />
                                <input
                                    type="number" placeholder="End Measure"
                                    value={newSection.measure_end} onChange={e => setNewSection({ ...newSection, measure_end: e.target.value })}
                                    className="w-1/2 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowSectionModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPlanModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-xl w-96 border border-white/10">
                        <h3 className="text-white font-bold mb-4">New Rehearsal Plan</h3>
                        <form onSubmit={handleAddPlan} className="space-y-4">
                            <input
                                type="text" placeholder="Plan Title"
                                value={newPlan.title} onChange={e => setNewPlan({ ...newPlan, title: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                required
                            />
                            <input
                                type="date"
                                value={newPlan.target_date} onChange={e => setNewPlan({ ...newPlan, target_date: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowPlanModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showTaskModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-xl w-96 border border-white/10">
                        <h3 className="text-white font-bold mb-4">Add Task</h3>
                        <form onSubmit={handleAddTask} className="space-y-4">
                            <textarea
                                placeholder="Task description (e.g., Work on intonation in measures 45-60)"
                                value={newTask.description}
                                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white resize-none"
                                rows={3}
                                required
                            />

                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Link to Section (optional)</label>
                                <select
                                    value={newTask.piece_section_id}
                                    onChange={e => handleSectionChange(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                >
                                    <option value="">No section</option>
                                    {sections.map(section => (
                                        <option key={section.id} value={section.id}>
                                            {section.name} (mm. {section.measure_start}-{section.measure_end})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-400 mb-1 block">Start Measure</label>
                                    <input
                                        type="number"
                                        placeholder="Start"
                                        value={newTask.measure_start}
                                        onChange={e => setNewTask({ ...newTask, measure_start: e.target.value })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-400 mb-1 block">End Measure</label>
                                    <input
                                        type="number"
                                        placeholder="End"
                                        value={newTask.measure_end}
                                        onChange={e => setNewTask({ ...newTask, measure_end: e.target.value })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Priority</label>
                                <select
                                    value={newTask.priority}
                                    onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowTaskModal(false);
                                        setNewTask({
                                            description: '',
                                            piece_section_id: '',
                                            measure_start: '',
                                            measure_end: '',
                                            priority: 'medium'
                                        });
                                    }}
                                    className="px-4 py-2 text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                    Add Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
