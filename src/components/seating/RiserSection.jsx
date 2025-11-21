import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export default function RiserSection({ section, globalRows, isSelected, onSelect, placedStudents, wedgeAngle, radius, angleRad }) {
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
            className={`relative flex flex-col items-center cursor-pointer transition-all duration-200 border-2 border-red-500
        ${isSelected ? 'ring-2 ring-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : 'hover:bg-white/5'}
      `}
            style={{
                width: wedgeAngle ? 'auto' : widthPx, // Auto width for wedge to let rows dictate size
            }}
        >
            {/* Section Label */}
            <div className="absolute -top-8 font-bold text-white/50 text-lg">
                {section.name}
            </div>

            {rows.map(rowNum => {
                // Get students in this row
                const studentsInRow = placedStudents.filter(s => s.row === rowNum);

                // Calculate wedge geometry if applicable
                let rowStyle = {};
                let innerWidth = widthPx;
                let outerWidth = widthPx;

                if (wedgeAngle && radius && angleRad) {
                    const rowStartRadius = radius + ((rowNum - 1) * depthPx);
                    const rowEndRadius = radius + (rowNum * depthPx);

                    // Calculate CHORD lengths for the given angle at these radii
                    // chord = 2 * r * sin(theta/2)
                    // theta is angleRad
                    innerWidth = 2 * rowStartRadius * Math.sin(angleRad / 2);
                    outerWidth = 2 * rowEndRadius * Math.sin(angleRad / 2);

                    // Trapezoid clip path: Top is outer (wide), Bottom is inner (narrow)
                    const inset = (outerWidth - innerWidth) / 2;
                    const insetPercent = (inset / outerWidth) * 100;

                    rowStyle = {
                        width: outerWidth,
                        clipPath: `polygon(0 0, 100% 0, ${100 - insetPercent}% 100%, ${insetPercent}% 100%)`
                    };
                }

                return (
                    <RiserRow
                        key={rowNum}
                        section={section}
                        rowNum={rowNum}
                        depthPx={depthPx}
                        widthPx={wedgeAngle ? outerWidth : widthPx} // Use outer width for container
                        globalRows={globalRows}
                        studentsInRow={studentsInRow}
                        getSectionColor={getSectionColor}
                        style={rowStyle}
                        isWedge={!!wedgeAngle}
                    />
                );
            })}
        </div>
    );
}

function RiserRow({ section, rowNum, depthPx, widthPx, globalRows, studentsInRow, getSectionColor, style, isWedge }) {
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
            className={`border-x border-t border-purple-500/30 relative box-border transition-colors
        ${isOver ? 'bg-purple-500/40' : 'bg-gradient-to-b from-purple-900/20 to-purple-900/10 hover:from-purple-900/30 hover:to-purple-900/20'}
        ${rowNum === 1 ? 'border-b border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : ''}
      `}
            style={{
                height: Math.max(depthPx, 40), // Minimum 40px height
                minHeight: '40px',
                width: widthPx,
                ...style
            }}
        >
            {/* Row Label */}
            <div className={`absolute top-1/2 -translate-y-1/2 text-xs text-white/50 font-mono font-bold ${isWedge ? 'left-2' : '-left-8'}`}>
                R{rowNum}
            </div>

            {/* Only show placed students, not empty spots */}
            <div className="w-full h-full flex items-center justify-center px-4 gap-1">
                {studentsInRow.map(student => {
                    const studentData = student.student || { name: `Student ${student.studentId}`, section: 'Unknown' };
                    const sectionColor = getSectionColor(studentData.section).replace('bg-', 'border-');

                    return (
                        <div
                            key={student.studentId}
                            className={`w-12 h-12 rounded-full bg-gray-900 border-2 ${sectionColor} flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)] relative group z-10`}
                            title={studentData.name}
                        >
                            {/* Hover Name Tag */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/20 pointer-events-none z-50">
                                {studentData.name}
                            </div>

                            <span className="text-sm font-bold text-white">
                                {studentData.name.split(' ').map(n => n[0]).join('')}
                            </span>
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
