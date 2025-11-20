import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import SingerSpot from './SingerSpot';

export default function RiserSection({ section, globalRows, isSelected, onSelect, placedStudents }) {
    const PIXELS_PER_FOOT = 40;
    const PIXELS_PER_INCH = PIXELS_PER_FOOT / 12;

    const widthPx = section.moduleWidth * PIXELS_PER_FOOT;
    const depthPx = (section.treadDepth * PIXELS_PER_INCH);

    // Generate rows using globalRows
    const rows = Array.from({ length: globalRows }, (_, i) => globalRows - i);

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

            {rows.map(rowNum => (
                <div
                    key={rowNum}
                    className="w-full border-x border-t border-white/20 bg-white/5 relative box-border"
                    style={{
                        height: depthPx,
                        borderBottom: rowNum === 1 ? '1px solid rgba(255,255,255,0.2)' : 'none'
                    }}
                >
                    {/* Row Label */}
                    <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-xs text-white/30 font-mono">
                        R{rowNum}
                    </div>

                    {/* Singer Spots */}
                    <div className="w-full h-full flex items-center justify-center px-4">
                        {/* 
              Calculate capacity for this row.
              Width - margins / spacing
              Example: 6ft (72in) - 12in margins = 60in.
              Spacing 22in. 60/22 = ~2.7 -> 3 spots?
              Let's just fit as many as possible.
            */}
                        {renderSingerSpots(section, rowNum, widthPx, placedStudents)}
                    </div>
                </div>
            ))}
        </div>
    );
}

function renderSingerSpots(section, rowNum, widthPx, placedStudents) {
    const PIXELS_PER_FOOT = 40;
    const PIXELS_PER_INCH = PIXELS_PER_FOOT / 12;

    const marginInches = 6;
    const usableWidthInches = (section.moduleWidth * 12) - (marginInches * 2);

    // Capacity calculation
    let capacity = Math.floor(usableWidthInches / section.singerSpacing);

    // ADA adjustment
    if (section.adaRow === rowNum) {
        capacity = Math.max(1, capacity - 2);
    }

    const spots = Array.from({ length: capacity }, (_, i) => i + 1);

    return (
        <div className="flex justify-center gap-2 w-full">
            {spots.map(spotIndex => {
                const student = placedStudents.find(s => s.row === rowNum && s.index === spotIndex);
                const spotId = `${section.id}-${rowNum}-${spotIndex}`;

                return (
                    <SingerSpot
                        key={spotIndex}
                        id={spotId}
                        student={student}
                    />
                );
            })}
        </div>
    );
}
