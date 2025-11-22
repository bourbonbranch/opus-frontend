import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor, closestCenter } from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { Settings, Users, Plus, Loader } from 'lucide-react';
import StudentBank from '../components/seating/StudentBank';
import RiserConfigurationPanel from '../components/seating/RiserConfigurationPanel';
import SeatingCanvas from '../components/seating/SeatingCanvas';
import { getEnsembles, getRoster } from '../lib/opusApi';

export default function SeatingChart() {
    const [students, setStudents] = useState([]);
    const [placedStudents, setPlacedStudents] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [ensembles, setEnsembles] = useState([]);
    const [selectedEnsembleId, setSelectedEnsembleId] = useState(null);

    // Global Riser Settings
    const [globalRows, setGlobalRows] = useState(4);

    // Riser Sections - Start with one section for visibility
    const [riserSections, setRiserSections] = useState([{
        id: 1,
        name: '1',
        moduleWidth: 6,
        treadDepth: 24,
        singerSpacing: 22,
        centerGap: 0,
        adaRow: null,
    }]);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [isCurved, setIsCurved] = useState(true);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    // Fetch Ensembles and Roster
    useEffect(() => {
        async function loadData() {
            try {
                const ensemblesData = await getEnsembles();
                setEnsembles(ensemblesData);

                if (ensemblesData.length > 0) {
                    const firstEnsembleId = ensemblesData[0].id;
                    setSelectedEnsembleId(firstEnsembleId);

                    const rosterData = await getRoster(firstEnsembleId);
                    // Map roster to student format
                    const sections = ['Soprano', 'Alto', 'Tenor', 'Bass'];
                    const mappedStudents = rosterData.map(r => ({
                        id: r.id,
                        name: `${r.first_name} ${r.last_name}`,
                        section: r.section || sections[Math.floor(Math.random() * sections.length)], // Use section from DB or random
                        part: r.part || '', // Include part from DB
                        originalData: r
                    }));
                    setStudents(mappedStudents);
                }
            } catch (error) {
                console.error("Failed to load roster:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const handleAddSection = () => {
        const newId = riserSections.length > 0 ? Math.max(...riserSections.map(r => r.id)) + 1 : 1;
        let newSection = {
            id: newId,
            name: String(newId),
            moduleWidth: 6,
            treadDepth: 24,
            singerSpacing: 22,
            centerGap: 0,
            adaRow: null,
        };

        // Copy settings from last section if it exists
        if (riserSections.length > 0) {
            const lastSection = riserSections[riserSections.length - 1];
            newSection = {
                ...lastSection,
                id: newId,
                name: String(newId),
            };
        }

        setRiserSections(prev => [...prev, newSection]);
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
                const row = parseInt(parts[2]); // Fixed index: 0=id, 1=row, 2=num

                if (!isNaN(sectionId) && !isNaN(row)) {
                    // Get student data - compare as strings to avoid type mismatch
                    const student = students.find(s => String(s.id) === String(active.id));

                    if (student) {
                        setPlacedStudents(prev => {
                            // Remove student from previous position if already placed
                            // Use String comparison for ID check
                            const filtered = prev.filter(s => String(s.studentId) !== String(active.id));

                            // Calculate next available index in this row
                            const studentsInRow = filtered.filter(s => s.sectionId === sectionId && s.row === row);
                            const nextIndex = studentsInRow.length + 1;

                            return [...filtered, {
                                studentId: student.id, // Store original ID type
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

    const activeStudent = students.find(s => String(s.id) === String(activeId)) ||
        placedStudents.find(s => String(s.studentId) === String(activeId));

    // Determine if the active student is being dragged from the bank or from a riser
    const isPlaced = activeStudent && activeStudent.student; // Placed students have a nested 'student' object
    const studentData = isPlaced ? activeStudent.student : activeStudent;

    return (
        <div className="flex h-full bg-transparent text-white overflow-hidden">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {/* Sidebar - Student Bank (Desktop) */}
                <div className={`hidden md:flex transition-all duration-300 border-r border-white/10 bg-gray-800/50 backdrop-blur-xl flex-col ${isSidebarOpen ? 'w-80' : 'w-16'}`}>
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        {isSidebarOpen && <h2 className="font-semibold text-lg">Students</h2>}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Toggle student bank"
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

                {/* Mobile Student Bank Overlay */}
                {isSidebarOpen && (
                    <>
                        <div
                            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                        <div className="md:hidden fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-gray-800/95 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                <h2 className="font-semibold text-lg">Students</h2>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                    aria-label="Close student bank"
                                >
                                    <Users className="w-6 h-6" />
                                </button>
                            </div>
                            <StudentBank
                                students={students}
                                placedStudents={placedStudents}
                            />
                        </div>
                    </>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col relative min-w-0">
                    {/* Toolbar */}
                    <div className="h-16 border-b border-white/10 bg-gray-800/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
                        <div className="flex items-center gap-2 md:gap-4 min-w-0">
                            {/* Mobile Student Bank Toggle */}
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                aria-label="Toggle student bank"
                            >
                                <Users className="w-6 h-6" />
                            </button>
                            <h1 className="font-bold text-lg md:text-xl truncate">Seating Chart</h1>
                        </div>

                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                            <button
                                onClick={() => setIsConfigOpen(!isConfigOpen)}
                                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm font-medium min-h-[44px] ${isConfigOpen ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}
                            >
                                <Settings className="w-4 h-4" />
                                <span className="hidden sm:inline">Configuration</span>
                            </button>
                            <button className="px-3 md:px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-medium shadow-lg shadow-purple-500/20 min-h-[44px]">
                                <span className="hidden sm:inline">Export</span>
                                <span className="sm:hidden">Save</span>
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
                            onBackgroundClick={() => {
                                setSelectedSectionId(null);
                                setIsConfigOpen(false);
                            }}
                            isDragging={!!activeId}
                        />
                    </div>

                    {/* Configuration Panel */}
                    {isConfigOpen && (
                        <RiserConfigurationPanel
                            section={riserSections.find(r => r.id === selectedSectionId) || riserSections[0]}
                            allSections={riserSections}
                            globalRows={globalRows}
                            onGlobalRowsChange={setGlobalRows}
                            isCurved={isCurved}
                            onToggleCurved={setIsCurved}
                            onAddSection={handleAddSection}
                            onRemoveLastSection={() => {
                                if (riserSections.length > 0) {
                                    const lastSection = riserSections[riserSections.length - 1];
                                    setRiserSections(prev => prev.filter(r => r.id !== lastSection.id));
                                    if (selectedSectionId === lastSection.id) {
                                        setSelectedSectionId(riserSections.length > 1 ? riserSections[0].id : null);
                                    }
                                }
                            }}
                            onUpdate={(updates) => {
                                setRiserSections(prev => prev.map(r =>
                                    r.id === selectedSectionId ? { ...r, ...updates } : r
                                ));
                            }}
                            onRemove={() => {
                                setRiserSections(prev => prev.filter(r => r.id !== selectedSectionId));
                                setSelectedSectionId(riserSections.length > 1 ? riserSections[0].id : null);
                            }}
                            onClose={() => setIsConfigOpen(false)}
                        />
                    )}
                </div>

                <DragOverlay modifiers={[snapCenterToCursor]} zIndex={1000} dropAnimation={null}>
                    {activeId && studentData ? (
                        isPlaced ? (
                            // Render as Circle (Placed Student)
                            <div className={`w-12 h-12 rounded-full bg-gray-900 border-2 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]
                                ${studentData.section === 'Soprano' ? 'border-pink-500' :
                                    studentData.section === 'Alto' ? 'border-purple-500' :
                                        studentData.section === 'Tenor' ? 'border-blue-500' : 'border-green-500'}`}
                            >
                                <span className="text-sm font-bold text-white">
                                    {studentData.name.split(' ').map(n => n[0]).join('')}
                                </span>
                            </div>
                        ) : (
                            // Render as Card (Bank Student)
                            <div className="opacity-80 pointer-events-none">
                                <div className={`px-3 py-2 rounded-lg shadow-xl border border-white/20 text-sm font-medium text-white w-40
                                    ${studentData.section === 'Soprano' ? 'bg-pink-500' :
                                        studentData.section === 'Alto' ? 'bg-purple-500' :
                                            studentData.section === 'Tenor' ? 'bg-blue-500' : 'bg-green-500'}`}
                                >
                                    {studentData.name}
                                </div>
                            </div>
                        )
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
