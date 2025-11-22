import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export default function DraggableStudent({ student }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: student.id,
        data: student
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    const getSectionColor = (section) => {
        switch (section) {
            case 'Soprano': return 'bg-pink-500/20 text-pink-200 border-pink-500/30';
            case 'Alto': return 'bg-purple-500/20 text-purple-200 border-purple-500/30';
            case 'Tenor': return 'bg-blue-500/20 text-blue-200 border-blue-500/30';
            case 'Bass': return 'bg-green-500/20 text-green-200 border-green-500/30';
            default: return 'bg-gray-500/20 text-gray-200 border-gray-500/30';
        }
    };

    const getAvatarColor = (section) => {
        switch (section) {
            case 'Soprano': return 'bg-pink-500';
            case 'Alto': return 'bg-purple-500';
            case 'Tenor': return 'bg-blue-500';
            case 'Bass': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className={`p-3 rounded-xl border opacity-30 ${getSectionColor(student.section)}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${getAvatarColor(student.section)}`}>
                        {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="font-medium text-sm">{student.name}</div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            onPointerDown={(e) => {
                e.stopPropagation();
                listeners.onPointerDown(e);
            }}
            className={`p-3 rounded-xl border hover:bg-white/5 transition-colors cursor-grab active:cursor-grabbing dnd-draggable ${getSectionColor(student.section)}`}
        >
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${getAvatarColor(student.section)}`}>
                    {student.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                    <div className="font-medium text-sm">{student.name}</div>
                    <div className="text-xs opacity-70">
                        {student.section}
                        {student.part && <span className="ml-1">• {student.part}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
