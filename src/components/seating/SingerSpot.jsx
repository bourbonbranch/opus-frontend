import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export default function SingerSpot({ id, student }) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });

    const getSectionColor = (section) => {
        switch (section) {
            case 'Soprano': return 'bg-pink-500';
            case 'Alto': return 'bg-purple-500';
            case 'Tenor': return 'bg-blue-500';
            case 'Bass': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div
            ref={setNodeRef}
            className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200
        ${isOver ? 'bg-white/20 scale-125 ring-2 ring-white' : 'bg-white/5 border border-white/10'}
        ${student ? 'border-none' : ''}
      `}
        >
            {student ? (
                <div className={`w-full h-full rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${getSectionColor(student.section)}`}>
                    {student.name.split(' ').map(n => n[0]).join('')}
                </div>
            ) : (
                <div className="w-1 h-1 rounded-full bg-white/20" />
            )}
        </div>
    );
}
