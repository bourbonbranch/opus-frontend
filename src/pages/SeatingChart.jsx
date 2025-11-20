import React, { useState } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { Settings, Users, Plus } from 'lucide-react';
import StudentBank from '../components/seating/StudentBank';
import RiserConfigurationPanel from '../components/seating/RiserConfigurationPanel';
import SeatingCanvas from '../components/seating/SeatingCanvas';

// Mock Data
const MOCK_STUDENTS = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Student ${i + 1}`,
    section: ['Soprano', 'Alto', 'Tenor', 'Bass'][Math.floor(Math.random() * 4)],
}));

export default function SeatingChart() {
    const [students, setStudents] = useState(MOCK_STUDENTS);
    const [placedStudents, setPlacedStudents] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    // Global Riser Settings
    const [globalRows, setGlobalRows] = useState(4);

    // Riser Sections - Start empty
    const [riserSections, setRiserSections] = useState([]);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [isCurved, setIsCurved] = useState(true);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    const handleAddSection = () => {
        const newId = riserSections.length > 0 ? Math.max(...riserSections.map(r => r.id)) + 1 : 1;
        setRiserSections(prev => [...prev, {
            id: newId,
            name: String(newId),
            moduleWidth: 6,
            treadDepth: 24,
            singerSpacing: 22,
            centerGap: 3,
            adaRow: null,
        }]);
        setSelectedSectionId(newId);
        setIsConfigOpen(true);
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (over) {
            const dropId = over.id;

            // Check if dropped on a row (format: sectionId-row-rowNum)
            if (typeof dropId === 'string' && dropId.includes('-row-')) {
                const parts = dropId.split('-');
                const sectionId = parseInt(parts[0]);
                const row = parseInt(parts[3]);

                if (!isNaN(sectionId) && !isNaN(row)) {
                    // Get student data
                    const student = students.find(s => s.id === active.id);

                    if (student) {
                        setPlacedStudents(prev => {
                            // Remove student from previous position if already placed
                            const filtered = prev.filter(s => s.studentId !== active.id);

                            // Calculate next available index in this row
                            const studentsInRow = filtered.filter(s => s.sectionId === sectionId && s.row === row);
                            const nextIndex = studentsInRow.length + 1;

                            return [...filtered, {
                                studentId: active.id,
                                sectionId,
                                row,
                                index: nextIndex,
                                student: student // Include full student data
                            }];
                        });
                    }
                }
            }
        }
    };

    const activeStudent = students.find(s => s.id === activeId) ||
        placedStudents.find(s => s.studentId === activeId);

    return (
        <div className="flex h-full bg-transparent text-white overflow-hidden">
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {/* Sidebar - Student Bank */}
                <div className={`transition-all duration-300 border-r border-white/10 bg-gray-800/50 backdrop-blur-xl flex flex-col ${isSidebarOpen ? 'w-80' : 'w-16'}`}>
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        {isSidebarOpen && <h2 className="font-semibold text-lg">Students</h2>}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <Users className="w-5 h-5" />
                        </button>
                    </div>

                    {isSidebarOpen && (
                        <StudentBank
                            students={students}
                            placedStudents={placedStudents}
                        />
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col relative min-w-0">
                    {/* Toolbar */}
                    <div className="h-16 border-b border-white/10 bg-gray-800/50 backdrop-blur-xl flex items-center justify-between px-6 z-10 shrink-0">
                        <div className="flex items-center gap-4 min-w-0">
                            <h1 className="font-bold text-xl truncate">Seating Chart</h1>
                            <div className="h-6 w-px bg-white/20 mx-2 shrink-0" />
                            <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 shrink-0">
                                <button
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${!isCurved ? 'bg-purple-600 text-white' : 'hover:bg-white/10'}`}
                                    onClick={() => setIsCurved(false)}
                                >
                                    Straight
                                </button>
                                <button
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isCurved ? 'bg-purple-600 text-white' : 'hover:bg-white/10'}`}
                                    onClick={() => setIsCurved(true)}
                                >
                                    Curved
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                onClick={handleAddSection}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Add Section
                            </button>
                            <button
                                onClick={() => setIsConfigOpen(!isConfigOpen)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${isConfigOpen ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}
                            >
                                <Settings className="w-4 h-4" />
                                Configuration
                            </button>
                            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-medium shadow-lg shadow-purple-500/20">
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 relative bg-gray-950 overflow-hidden">
                        <SeatingCanvas
                            riserSections={riserSections}
                            globalRows={globalRows}
                            isCurved={isCurved}
                            placedStudents={placedStudents}
                            selectedSectionId={selectedSectionId}
                            onSelectSection={(id) => {
                                setSelectedSectionId(id);
                                setIsConfigOpen(true);
                            }}
                        />
                    </div>

                    {/* Configuration Panel */}
                    {isConfigOpen && (
                        <div className="absolute top-20 right-6 w-80 bg-gray-800/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-[calc(100vh-140px)] flex flex-col z-20">
                            <div className="p-4 border-b border-white/10 bg-white/5">
                                <h3 className="font-semibold mb-4">Global Settings</h3>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-300">Rows (All Sections)</label>
                                    <div className="flex items-center justify-between bg-white/5 rounded-lg p-1 border border-white/10">
                                        <button
                                            onClick={() => setGlobalRows(Math.max(2, globalRows - 1))}
                                            className="p-2 hover:bg-white/10 rounded-md transition-colors disabled:opacity-50"
                                            disabled={globalRows <= 2}
                                        >
                                            -
                                        </button>
                                        <span className="font-mono font-medium">{globalRows}</span>
                                        <button
                                            onClick={() => setGlobalRows(Math.min(6, globalRows + 1))}
                                            className="p-2 hover:bg-white/10 rounded-md transition-colors disabled:opacity-50"
                                            disabled={globalRows >= 6}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {selectedSectionId && (
                                <div className="flex-1 overflow-y-auto">
                                    <RiserConfigurationPanel
                                        section={riserSections.find(r => r.id === selectedSectionId)}
                                        globalRows={globalRows}
                                        onUpdate={(updates) => {
                                            setRiserSections(prev => prev.map(r =>
                                                r.id === selectedSectionId ? { ...r, ...updates } : r
                                            ));
                                        }}
                                        onRemove={() => {
                                            setRiserSections(prev => prev.filter(r => r.id !== selectedSectionId));
                                            setSelectedSectionId(riserSections.length > 1 ? riserSections[0].id : null);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className="opacity-80 pointer-events-none">
                            <div className={`px-3 py-2 rounded-lg shadow-xl border border-white/20 text-sm font-medium text-white w-40
                 ${activeStudent?.section === 'Soprano' ? 'bg-pink-500' :
                                    activeStudent?.section === 'Alto' ? 'bg-purple-500' :
                                        activeStudent?.section === 'Tenor' ? 'bg-blue-500' : 'bg-green-500'}`}
                            >
                                {activeStudent?.name}
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
