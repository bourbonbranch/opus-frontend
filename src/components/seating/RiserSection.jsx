import React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export default function RiserSection({ section, globalRows, globalModuleWidth, globalTreadDepth, isSelected, isOver, onSelect, placedStudents, wedgeAngle, radius, angleRad }) {
    const PIXELS_PER_FOOT = 30; // Reduced from 40 for smaller risers
    const PIXELS_PER_INCH = PIXELS_PER_FOOT / 12;

    const widthPx = globalModuleWidth * PIXELS_PER_FOOT;
    const depthPx = (globalTreadDepth * PIXELS_PER_INCH);

    // Generate rows using globalRows (including Floor/Row 0)
    const rows = Array.from({ length: globalRows + 1 }, (_, i) => globalRows - i);

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
        ${isSelected ? 'ring-2 ring-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)]' :
                    isOver ? 'ring-2 ring-green-400 shadow-[0_0_30px_rgba(74,222,128,0.4)]' :
                        'hover:bg-white/5'}
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
                    // For Floor (row 0), we project outwards from the first riser row
                    const effectiveRowNum = Math.max(1, rowNum);
                    const rowStartRadius = radius + ((effectiveRowNum - 1) * depthPx);
                    const rowEndRadius = radius + (effectiveRowNum * depthPx);

                    // If it's the floor (row 0), we might want it slightly wider or same as row 1
                    // For now, let's keep the geometry consistent with the riser structure
                    // But technically floor is "in front" or "below" row 1.
                    // In this visualization, rows stack vertically. Row 1 is bottom of stack?
                    // No, rows are rendered top-to-bottom in the map: 4, 3, 2, 1, 0.
                    // So Row 4 is top, Row 0 is bottom.

                    // Radius logic:
                    // Row 1 is at radius R.
                    // Row 2 is at R + depth.
                    // Row 0 (Floor) should be at R - depth? Or just below Row 1?
                    // The current logic: radius + ((rowNum - 1) * depthPx)
                    // Row 1: radius + 0
                    // Row 2: radius + depth
                    // Row 0: radius - depth

                    const rStart = radius + ((rowNum - 1) * depthPx);
                    const rEnd = radius + (rowNum * depthPx);

                    // Calculate CHORD lengths for the given angle at these radii
                    innerWidth = 2 * rStart * Math.sin(angleRad / 2);
                    outerWidth = 2 * rEnd * Math.sin(angleRad / 2);

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
                        globalModuleWidth={globalModuleWidth}
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

import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';

// ... (RiserSection component remains mostly the same, just imports changed)

function RiserRow({ section, rowNum, depthPx, widthPx, globalRows, globalModuleWidth, studentsInRow, getSectionColor, style, isWedge }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `${section.id}-row-${rowNum}`,
        data: { sectionId: section.id, row: rowNum }
    });

    const PIXELS_PER_FOOT = 40;
    const PIXELS_PER_INCH = PIXELS_PER_FOOT / 12;

    const marginInches = 6;
    const usableWidthInches = (globalModuleWidth * 12) - (marginInches * 2);

    // Fixed singer spacing (removed from UI)
    const singerSpacing = 18; // Reduced from 22 to allow more students per row

    // Calculate capacity
    let capacity = Math.floor(usableWidthInches / singerSpacing);

    // ADA adjustment
    if (section.adaRow === rowNum) {
        capacity = Math.max(1, capacity - 2);
    }

    return (
        <div
            ref={setNodeRef}
            className={`border-x border-t border-purple-500/30 relative box-border transition-colors
        ${isOver ? 'bg-purple-500/40' : (rowNum === 0 ? 'bg-white/5 hover:bg-white/10' : 'bg-gradient-to-b from-purple-900/20 to-purple-900/10 hover:from-purple-900/30 hover:to-purple-900/20')}
        ${rowNum === 0 ? 'border-b border-purple-500/30' : ''}
        ${rowNum === 1 ? 'border-b border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : ''}
      `}
            style={{
                height: Math.max(depthPx, 30), // Minimum 30px height
                minHeight: '30px',
                width: widthPx,
                ...style
            }}
        >
            {/* Row Label */}
            <div className={`absolute top-1/2 -translate-y-1/2 text-xs text-white/50 font-mono font-bold ${isWedge ? 'left-2' : '-left-8'}`}>
                {rowNum === 0 ? 'Floor' : `R${rowNum}`}
            </div>

            {/* Only show placed students, not empty spots */}
            <div className="w-full h-full flex items-center justify-center px-4 gap-1 pointer-events-auto">
                <SortableContext
                    items={studentsInRow.map(s => String(s.studentId))}
                    strategy={horizontalListSortingStrategy}
                >
                    {studentsInRow.map(student => (
                        <PlacedStudent
                            key={student.studentId}
                            student={student}
                            getSectionColor={getSectionColor}
                        />
                    ))}
                </SortableContext>

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

function PlacedStudent({ student, getSectionColor }) {
    const studentData = student.student || { name: `Student ${student.studentId}`, section: 'Unknown' };

    // Get color based on voice section
    const getAvatarColor = (section) => {
        switch (section) {
            case 'Soprano': return 'bg-pink-500';
            case 'Alto': return 'bg-purple-500';
            case 'Tenor': return 'bg-blue-500';
            case 'Bass': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    React.useEffect(() => {
        console.log('PlacedStudent mounted:', student.studentId);
    }, []);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: String(student.studentId),
        data: student
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition
    };

    const bubbleColor = getAvatarColor(studentData.section);

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className={`w-12 h-12 rounded-full ${bubbleColor} flex items-center justify-center opacity-30`}
            >
                <span className="text-sm font-bold text-white">
                    {studentData.name.split(' ').map(n => n[0]).join('')}
                </span>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`w-12 h-12 rounded-full ${bubbleColor} flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg border-2 border-white/20 hover:scale-110 transition-transform relative group z-10`}
            title={studentData.name}
        >
            {/* Hover Name Tag */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                {studentData.name}
                {studentData.part && <span className="ml-1">• {studentData.part}</span>}
            </div>

            <span className="text-sm font-bold text-white">
                {studentData.name.split(' ').map(n => n[0]).join('')}
            </span>
        </div>
    );
}
