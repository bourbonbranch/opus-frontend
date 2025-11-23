import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import DraggableStudent from './DraggableStudent';

export default function StudentBank({ students, placedStudents }) {
    const [search, setSearch] = useState('');
    const [filterSection, setFilterSection] = useState('All');

    const { setNodeRef, isOver } = useDroppable({
        id: 'student-bank',
    });

    const placedIds = new Set(placedStudents.map(s => s.studentId));

    const filteredStudents = students
        .filter(s => !placedIds.has(s.id))
        .filter(s =>
            (filterSection === 'All' || s.section === filterSection) &&
            s.name.toLowerCase().includes(search.toLowerCase())
        );

    const sections = ['All', 'Soprano', 'Alto', 'Tenor', 'Bass'];

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col h-full transition-colors ${isOver ? 'bg-purple-500/10' : ''}`}
        >
            <div className="p-4 space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                    {sections.map(section => (
                        <button
                            key={section}
                            onClick={() => setFilterSection(section)}
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                ${filterSection === section
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            {section}
                        </button>
                    ))}
                </div>

                <div className="flex justify-between text-xs text-gray-400 px-1">
                    <span>Unplaced: {filteredStudents.length}</span>
                    <span>Total: {students.length}</span>
                </div>
            </div>

            {/* Student List - Droppable Zone */}
            <div
                className={`flex-1 overflow-y-auto p-4 pt-0 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent transition-colors ${isOver ? 'border-2 border-purple-500/50 border-dashed rounded-lg m-2' : ''
                    }`}
            >
                {filteredStudents.map(student => (
                    <DraggableStudent key={student.id} student={student} />
                ))}

                {filteredStudents.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        {isOver ? 'Drop here to remove from riser' : 'No students found'}
                    </div>
                )}
            </div>
        </div>
    );
}
