import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export default function RiserSection({ section, globalRows, isSelected, onSelect, placedStudents }) {
    const PIXELS_PER_FOOT = 40;
    const PIXELS_PER_INCH = PIXELS_PER_FOOT / 12;

    const widthPx = section.moduleWidth * PIXELS_PER_FOOT;
    const depthPx = (section.treadDepth * PIXELS_PER_INCH);

    // Generate rows using globalRows
    const rows = Array.from({ length: globalRows }, (_, i) => globalRows - i);

    const getSectionColor = (voiceSection) => {
        switch (voiceSection) {
            case 'Soprano': return 'bg-pink-500';
            case 'Alto': return 'bg-purple-500';
            case 'Tenor': return 'bg-blue-500';
            case 'Bass': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
            className={`relative flex flex-col items-center cursor-pointer transition-all duration-200
        ${isSelected ? 'ring-2 ring-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : 'hover:bg-white/5'}
      `}
            style={{
                width: widthPx,
            }}
        >
            {/* Section Label */}
            <div className="absolute -top-8 font-bold text-white/50 text-lg">
                {section.name}
            </div>

            {rows.map(rowNum => {
                // Get students in this row
                const studentsInRow = placedStudents.filter(s => s.row === rowNum);

                return (
                    <RiserRow
                        key={rowNum}
                        section={section}
                        rowNum={rowNum}
                        depthPx={depthPx}
                        widthPx={widthPx}
                        globalRows={globalRows}
                        studentsInRow={studentsInRow}
                        getSectionColor={getSectionColor}
                    />
                );
            })}
        </div>
    );
}

function RiserRow({ section, rowNum, depthPx, widthPx, globalRows, studentsInRow, getSectionColor }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `${section.id}-row-${rowNum}`,
        data: { sectionId: section.id, row: rowNum }
    });

    const PIXELS_PER_FOOT = 40;
    const PIXELS_PER_INCH = PIXELS_PER_FOOT / 12;

    const marginInches = 6;
    const usableWidthInches = (section.moduleWidth * 12) - (marginInches * 2);

    // Calculate capacity
    let capacity = Math.floor(usableWidthInches / section.singerSpacing);

    // ADA adjustment
    if (section.adaRow === rowNum) {
        capacity = Math.max(1, capacity - 2);
    }

    return (
        <div
            ref={setNodeRef}
            className={`w-full border-x border-t border-white/20 relative box-border transition-colors
        ${isOver ? 'bg-purple-500/20' : 'bg-white/5'}
        ${rowNum === 1 ? 'border-b' : ''}
      `}
            style={{
                height: depthPx,
            }}
        >
            {/* Row Label */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-xs text-white/30 font-mono">
                R{rowNum}
            </div>

            {/* Only show placed students, not empty spots */}
            <div className="w-full h-full flex items-center justify-center px-4 gap-2">
                {studentsInRow.map(student => {
                    const studentData = student.student || { name: `Student ${student.studentId}`, section: 'Unknown' };

                    return (
                        <div
                            key={student.studentId}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${getSectionColor(studentData.section)}`}
                            title={studentData.name}
                        >
                            {studentData.name.split(' ').map(n => n[0]).join('')}
                        </div>
                    );
                })}

                {/* Show capacity hint when hovering */}
                {isOver && studentsInRow.length < capacity && (
                    <div className="text-xs text-purple-300 opacity-70">
                        Drop here ({studentsInRow.length}/{capacity})
                    </div>
                )}
            </div>
        </div>
    );
}
