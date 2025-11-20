import React, { useState, useRef } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Settings, Users, ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';
import StudentBank from '../components/seating/StudentBank';
import RiserConfigurationPanel from '../components/seating/RiserConfigurationPanel';
import SeatingCanvas from '../components/seating/SeatingCanvas';
import DraggableStudent from '../components/seating/DraggableStudent';

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

    // Riser State
    const [riserSections, setRiserSections] = useState([
        {
            id: 1,
            name: 'C',
            rows: 4,
            moduleWidth: 6,
            treadDepth: 24,
            singerSpacing: 22,
            centerGap: 3,
            adaRow: null,
            connectedTo: { sectionId: null, side: null }
        }
    ]);
    const [selectedSectionId, setSelectedSectionId] = useState(1);
    const [isCurved, setIsCurved] = useState(true);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (over) {
            const spotId = over.id;
            // Check if dropped on a valid spot (format: sectionId-row-index)
            if (typeof spotId === 'string' && spotId.includes('-')) {
                const [sectionId, row, index] = spotId.split('-').map(Number);

                if (!isNaN(sectionId) && !isNaN(row) && !isNaN(index)) {
                    setPlacedStudents(prev => {
                        // Remove student from previous position if they were already placed
                        const filtered = prev.filter(s => s.studentId !== active.id);

                        // Remove any student currently in the target spot (swap or replace?)
                        // For now, let's just replace (kick out the other student)
                        // Or better, if occupied, don't place (or swap).
                        // Let's implement simple replacement/placement.
                        const withoutOccupant = filtered.filter(s =>
                            !(s.sectionId === sectionId && s.row === row && s.index === index)
                        );

                        return [...withoutOccupant, {
                            studentId: active.id,
                            sectionId,
                            row,
                            index
                        }];
                    });
                }
            }
        }
    };

    const activeStudent = students.find(s => s.id === activeId) ||
        placedStudents.find(s => s.studentId === activeId);

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
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
                <div className="flex-1 flex flex-col relative">
                    {/* Toolbar */}
                    <div className="h-16 border-b border-white/10 bg-gray-800/50 backdrop-blur-xl flex items-center justify-between px-6 z-10">
                        <div className="flex items-center gap-4">
                            <h1 className="font-bold text-xl">Seating Chart</h1>
                            <div className="h-6 w-px bg-white/20 mx-2" />
                            <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
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

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium">
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
                            isCurved={isCurved}
                            placedStudents={placedStudents}
                            selectedSectionId={selectedSectionId}
                            onSelectSection={setSelectedSectionId}
                        />

                        {/* Zoom Controls overlay */}
                        <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-gray-800/80 backdrop-blur rounded-lg p-2 border border-white/10 shadow-xl">
                            <button className="p-2 hover:bg-white/10 rounded transition-colors" title="Zoom In">
                                <ZoomIn className="w-5 h-5" />
                            </button>
                            <button className="p-2 hover:bg-white/10 rounded transition-colors" title="Zoom Out">
                                <ZoomOut className="w-5 h-5" />
                            </button>
                            <button className="p-2 hover:bg-white/10 rounded transition-colors" title="Reset View">
                                <RotateCcw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Configuration Panel (Bottom or Overlay) */}
                    <div className="absolute top-20 right-6 w-80 bg-gray-800/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                        <RiserConfigurationPanel
                            section={riserSections.find(r => r.id === selectedSectionId)}
                            onUpdate={(updates) => {
                                setRiserSections(prev => prev.map(r =>
                                    r.id === selectedSectionId ? { ...r, ...updates } : r
                                ));
                            }}
                        />
                    </div>
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className="opacity-80 pointer-events-none">
                            {/* Render active student card */}
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
