import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    closestCenter,
    pointerWithin,
    rectIntersection
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { Users, Settings, ChevronRight, ChevronLeft, Wand2, RotateCcw, SaveIcon, FolderOpenIcon } from 'lucide-react';
import SeatingCanvas from '../components/seating/SeatingCanvas';
import StudentBank from '../components/seating/StudentBank';
import RiserConfigurationPanel from '../components/seating/RiserConfigurationPanel';
import AutoSeatingModal from '../components/seating/AutoSeatingModal';
import SaveConfigurationModal from '../components/seating/SaveConfigurationModal';
import { getEnsembles, getRoster, saveSeatingConfiguration, getSeatingConfigurations, getSeatingConfiguration } from '../lib/opusApi';
import { generateAutoSeating } from '../utils/autoSeating';

// Custom collision detection algorithm
const customCollisionDetection = (args) => {
    // Use pointerWithin for accurate detection on rotated/transformed elements
    // This checks if the pointer is actually within the element's visual bounds
    const pointerCollisions = pointerWithin(args);

    // Prioritize student bank if found
    const bankCollision = pointerCollisions.find(c => c.id === 'student-bank');
    if (bankCollision) return [bankCollision];

    // Return all pointer collisions for risers
    if (pointerCollisions.length > 0) return pointerCollisions;

    // Fallback to closestCenter if no pointer collisions
    return closestCenter(args);
};

export default function SeatingChart() {
    const [ensembles, setEnsembles] = useState([]);
    const [selectedEnsembleId, setSelectedEnsembleId] = useState(null);
    const [students, setStudents] = useState([]);
    const [placedStudents, setPlacedStudents] = useState([]);
    const [riserSections, setRiserSections] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [activeId, setActiveId] = useState(null);
    const [overSectionId, setOverSectionId] = useState(null); // Track which section is being dragged over

    // Global Settings State
    const [globalRows, setGlobalRows] = useState(3);
    const [globalModuleWidth, setGlobalModuleWidth] = useState(4); // feet
    const [globalTreadDepth, setGlobalTreadDepth] = useState(24); // inches
    const [isCurved, setIsCurved] = useState(true);
    const [isAutoSeatingModalOpen, setIsAutoSeatingModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [savedConfigurations, setSavedConfigurations] = useState([]);
    const [selectedConfigId, setSelectedConfigId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Reduced from 8 to make it easier to trigger
            },
        })
    );

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedEnsembleId) {
            loadSavedConfigurations();
        }
    }, [selectedEnsembleId]);

    const loadData = async () => {
        try {
            const ensemblesData = await getEnsembles();
            setEnsembles(ensemblesData);
            if (ensemblesData.length > 0) {
                setSelectedEnsembleId(ensemblesData[0].id);
                loadRoster(ensemblesData[0].id);
            }

            // Initial Riser Setup
            setRiserSections([
                { id: 1, name: 'Section 1', adaRow: null },
            ]);
        } catch (err) {
            console.error('Failed to load data:', err);
        }
    };

    const loadRoster = async (ensembleId) => {
        try {
            const rosterData = await getRoster(ensembleId);
            // Map roster to student format
            const sections = ['Soprano', 'Alto', 'Tenor', 'Bass'];
            const mappedStudents = rosterData.map(r => ({
                id: String(r.id), // Ensure ID is a string
                name: `${r.first_name} ${r.last_name}`,
                section: r.section || sections[Math.floor(Math.random() * sections.length)], // Use section from DB or random
                part: r.part || '', // Include part from DB
                originalData: r
            }));
            setStudents(mappedStudents);
        } catch (err) {
            console.error('Failed to load roster:', err);
        }
    };

    const loadSavedConfigurations = async () => {
        try {
            const configs = await getSeatingConfigurations(selectedEnsembleId);
            setSavedConfigurations(configs || []);
        } catch (err) {
            console.error('Failed to load configurations:', err);
        }
    };

    const handleSaveConfiguration = async ({ name, description }) => {
        try {
            const directorId = localStorage.getItem('directorId');
            const configData = {
                ensemble_id: selectedEnsembleId,
                name,
                description,
                global_rows: globalRows,
                global_module_width: globalModuleWidth,
                global_tread_depth: globalTreadDepth,
                is_curved: isCurved,
                created_by: parseInt(directorId),
                sections: riserSections.map(s => ({
                    section_id: s.id,
                    section_name: s.name,
                    ada_row: s.adaRow
                })),
                placements: placedStudents.map(p => ({
                    student_id: parseInt(p.studentId),
                    section_id: p.sectionId,
                    row: p.row,
                    position_index: p.index
                }))
            };

            await saveSeatingConfiguration(configData);
            await loadSavedConfigurations();
            alert('Configuration saved successfully!');
        } catch (err) {
            console.error('Error saving configuration:', err);
            throw err;
        }
    };

    const handleLoadConfiguration = async (configId) => {
        try {
            const config = await getSeatingConfiguration(configId);

            // Update global settings
            setGlobalRows(config.global_rows);
            setGlobalModuleWidth(parseFloat(config.global_module_width));
            setGlobalTreadDepth(parseFloat(config.global_tread_depth));
            setIsCurved(config.is_curved);

            // Update sections
            setRiserSections(config.sections.map(s => ({
                id: s.section_id,
                name: s.section_name,
                adaRow: s.ada_row
            })));

            // Update placements
            const placements = config.placements.map(p => {
                const student = students.find(s => String(s.id) === String(p.student_id));
                return {
                    studentId: String(p.student_id),
                    student: student || { id: String(p.student_id), name: `${p.first_name} ${p.last_name}` },
                    sectionId: p.section_id,
                    row: p.row,
                    index: p.position_index
                };
            });
            setPlacedStudents(placements);
            setSelectedConfigId(configId);

            alert('Configuration loaded successfully!');
        } catch (err) {
            console.error('Error loading configuration:', err);
            alert('Failed to load configuration: ' + err.message);
        }
    };

    const handleSelectSection = (id) => {
        // If clicking the same section, toggle config panel
        // If clicking different section, select it and ensure panel is open
        const newId = id === selectedSectionId ? null : id;
        setSelectedSectionId(newId);
        setIsConfigOpen(!!newId);
    };

    const handleAddSection = () => {
        setRiserSections(prev => {
            const newId = Math.max(...prev.map(s => s.id), 0) + 1;
            return [...prev, { id: newId, name: `Section ${newId}`, adaRow: null }];
        });
    };

    const getSectionColor = (voiceSection) => {
        switch (voiceSection) {
            case 'Soprano': return 'bg-pink-500';
            case 'Alto': return 'bg-purple-500';
            case 'Tenor': return 'bg-blue-500';
            case 'Bass': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const handleAutoPopulate = (layoutType) => {
        const placements = generateAutoSeating(
            students,
            placedStudents,
            riserSections,
            globalRows,
            globalModuleWidth,
            layoutType
        );

        // Apply placements to state (same format as manual drag-drop)
        setPlacedStudents(prev => [...prev, ...placements]);

        console.log(`Auto-populated ${placements.length} students using ${layoutType} layout`);
    };

    const handleDragStart = (event) => {
        console.log('Drag Start:', event.active.id);
        setActiveId(event.active.id);
    };

    const handleDragOver = (event) => {
        const { active, over } = event;

        if (!over) {
            setOverSectionId(null);
            return;
        }

        console.log('Drag Over:', { active: active.id, over: over.id });

        // Extract section ID from the over target
        const overId = String(over.id);

        // Check if hovering over a row (format: sectionId-row-rowNum)
        if (overId.includes('-row-')) {
            const sectionId = overId.split('-row-')[0];
            setOverSectionId(sectionId);
        } else {
            setOverSectionId(null);
        }
    };

    const handleDragEnd = (event) => {
        setOverSectionId(null); // Clear hover state
        const { active, over } = event;
        console.log('Drag End:', { active: active.id, over: over?.id });
        setActiveId(null);
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // 1️⃣ Removal: Drop on student bank
        if (overId === 'student-bank') {
            console.log('Removing student:', activeId);
            setPlacedStudents(prev => {
                const newPlaced = prev.filter(s => String(s.studentId) !== String(activeId));
                console.log('New placed students count:', newPlaced.length);
                return newPlaced;
            });
            return;
        }

        // Helper to get student info
        const getStudentInfo = (id) => {
            const fromBank = students.find(s => String(s.id) === String(id));
            if (fromBank) return { student: fromBank, studentId: fromBank.id };
            const fromPlaced = placedStudents.find(s => String(s.studentId) === String(id));
            if (fromPlaced && fromPlaced.student) return { student: fromPlaced.student, studentId: fromPlaced.studentId };
            return null;
        };

        const info = getStudentInfo(activeId);
        if (!info) return;

        // 2️⃣ Drop on a Row (Empty or End of Row)
        if (String(overId).includes('-row-')) {
            const parts = overId.split('-');
            const sectionId = parseInt(parts[0]);
            const row = parseInt(parts[2]);
            if (isNaN(sectionId) || isNaN(row)) return;

            setPlacedStudents(prev => {
                const filtered = prev.filter(s => String(s.studentId) !== String(info.studentId));
                // Append to end of row
                const studentsInRow = filtered.filter(s => s.sectionId === sectionId && s.row === row);
                const maxIdx = studentsInRow.length > 0 ? Math.max(...studentsInRow.map(s => s.index)) : -1;
                return [...filtered, { ...info, sectionId, row, index: maxIdx + 1 }];
            });
            return;
        }

        // 3️⃣ Reordering (Sorting) within a Row or Moving to another Row via Student Bubble
        const overStudent = placedStudents.find(s => String(s.studentId) === String(overId));
        if (overStudent) {
            setPlacedStudents(prev => {
                const activeIndex = prev.findIndex(s => String(s.studentId) === String(activeId));
                const overIndex = prev.findIndex(s => String(s.studentId) === String(overId));

                let newItems = [...prev];

                // If active item is new (from bank), insert it
                if (activeIndex === -1) {
                    // Insert before the overStudent
                    const newItem = { ...info, sectionId: overStudent.sectionId, row: overStudent.row, index: overStudent.index };
                    newItems.push(newItem);
                } else {
                    // Move existing item
                    newItems[activeIndex] = { ...newItems[activeIndex], sectionId: overStudent.sectionId, row: overStudent.row };
                }

                // Now re-index the target row to ensure correct order
                const targetSectionId = overStudent.sectionId;
                const targetRow = overStudent.row;

                // Get all students in this target row (excluding the active one for a moment)
                let rowStudents = newItems.filter(s => s.sectionId === targetSectionId && s.row === targetRow && String(s.studentId) !== String(info.studentId));

                // Find where the overStudent is in this filtered list
                const overStudentIndex = rowStudents.findIndex(s => String(s.studentId) === String(overId));

                // Insert active student at that index (or at end if not found)
                const insertIndex = overStudentIndex >= 0 ? overStudentIndex : rowStudents.length;

                // Reconstruct the row with the new student inserted
                const activeItem = { ...info, sectionId: targetSectionId, row: targetRow };
                rowStudents.splice(insertIndex, 0, activeItem);

                // Re-assign indices
                rowStudents.forEach((s, i) => s.index = i);

                // Merge back into the main list
                // 1. Remove all students of this row from the main list
                const otherStudents = newItems.filter(s => !(s.sectionId === targetSectionId && s.row === targetRow));
                // 2. Add the re-indexed row students
                return [...otherStudents, ...rowStudents];
            });
        }
    };

    // Determine if the active student is being dragged from the bank or from a riser
    const activeStudent = students.find(s => String(s.id) === String(activeId)) ||
        placedStudents.find(s => String(s.studentId) === String(activeId));
    const isPlaced = activeStudent && activeStudent.student; // Placed students have a nested 'student' object
    const studentData = isPlaced ? activeStudent.student : activeStudent;



    return (
        <div className="flex h-full bg-transparent text-white overflow-hidden">
            <DndContext
                sensors={sensors}
                collisionDetection={customCollisionDetection}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
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
                            {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
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
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            </div>
                            <StudentBank
                                students={students}
                                placedStudents={placedStudents}
                            />
                        </div>
                    </>
                )}

                {/* Main Canvas Area */}
                <div className="flex-1 relative overflow-hidden flex flex-col">
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
                            <h1 className="font-bold text-lg md:text-xl truncate">Seating Chart <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full ml-2">v2.0</span></h1>
                        </div>

                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                            <button
                                onClick={() => setPlacedStudents([])}
                                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-sm font-medium min-h-[44px] shadow-lg shadow-orange-500/20"
                                title="Reset - Return all students to bank"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span className="hidden sm:inline">Reset</span>
                            </button>

                            {/* Load Configuration Dropdown */}
                            {savedConfigurations.length > 0 && (
                                <select
                                    value={selectedConfigId || ''}
                                    onChange={(e) => e.target.value && handleLoadConfiguration(parseInt(e.target.value))}
                                    className="px-3 md:px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-medium min-h-[44px] hover:bg-white/20 transition-colors cursor-pointer"
                                >
                                    <option value="">Load Configuration...</option>
                                    {savedConfigurations.map(config => (
                                        <option key={config.id} value={config.id} className="bg-gray-800">
                                            {config.name} ({config.student_count} students)
                                        </option>
                                    ))}
                                </select>
                            )}

                            <button
                                onClick={() => setIsAutoSeatingModalOpen(true)}
                                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm font-medium min-h-[44px] shadow-lg shadow-green-500/20"
                            >
                                <Wand2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Auto-Populate</span>
                            </button>
                            <button
                                onClick={() => setIsConfigOpen(!isConfigOpen)}
                                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm font-medium min-h-[44px] ${isConfigOpen ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}
                            >
                                <Settings className="w-4 h-4" />
                                <span className="hidden sm:inline">Configuration</span>
                            </button>
                            <button
                                onClick={() => setIsSaveModalOpen(true)}
                                disabled={placedStudents.length === 0}
                                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-medium shadow-lg shadow-purple-500/20 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                                title={placedStudents.length === 0 ? "Place students before saving" : "Save configuration"}
                            >
                                <SaveIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">Save</span>
                            </button>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 relative bg-gray-950 overflow-hidden flex flex-col">
                        <SeatingCanvas
                            riserSections={riserSections}
                            globalRows={globalRows}
                            globalModuleWidth={globalModuleWidth}
                            globalTreadDepth={globalTreadDepth}
                            isCurved={isCurved}
                            placedStudents={placedStudents}
                            selectedSectionId={selectedSectionId}
                            overSectionId={overSectionId}
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
                        {console.log('SeatingChart Render:', { riserSections, globalModuleWidth, globalRows })}
                    </div>

                    {/* Configuration Panel */}
                    {isConfigOpen && (
                        <RiserConfigurationPanel
                            section={riserSections.find(r => r.id === selectedSectionId) || riserSections[0]}
                            allSections={riserSections}
                            globalRows={globalRows}
                            onGlobalRowsChange={setGlobalRows}
                            globalModuleWidth={globalModuleWidth}
                            onGlobalModuleWidthChange={setGlobalModuleWidth}
                            globalTreadDepth={globalTreadDepth}
                            onGlobalTreadDepthChange={setGlobalTreadDepth}
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

                <DragOverlay
                    zIndex={1000}
                    dropAnimation={null}
                    modifiers={[snapCenterToCursor]}
                >
                    {activeId && studentData ? (
                        /* Always render as bubble - CSS transform centers under cursor */
                        <div
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-2xl border-2 border-white/30 pointer-events-none"
                        >
                            {studentData.name.split(' ').map(n => n[0]).join('')}
                        </div>
                    ) : null}
                </DragOverlay>

                {/* Auto-Seating Modal */}
                <AutoSeatingModal
                    isOpen={isAutoSeatingModalOpen}
                    onClose={() => setIsAutoSeatingModalOpen(false)}
                    onSelectLayout={handleAutoPopulate}
                />

                {/* Save Configuration Modal */}
                <SaveConfigurationModal
                    isOpen={isSaveModalOpen}
                    onClose={() => setIsSaveModalOpen(false)}
                    onSave={handleSaveConfiguration}
                    ensembleName={ensembles.find(e => e.id === selectedEnsembleId)?.name || 'Ensemble'}
                />
            </DndContext >
        </div >
    );
}
