import React from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import RiserSection from './RiserSection';
import { User, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const Controls = () => {
    const { zoomIn, zoomOut, resetTransform } = useControls();
    return (
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-gray-800/80 backdrop-blur rounded-lg p-2 border border-white/10 shadow-xl z-50">
            <button onClick={() => zoomIn()} className="p-2 hover:bg-white/10 rounded transition-colors" title="Zoom In">
                <ZoomIn className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => zoomOut()} className="p-2 hover:bg-white/10 rounded transition-colors" title="Zoom Out">
                <ZoomOut className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => resetTransform()} className="p-2 hover:bg-white/10 rounded transition-colors" title="Reset View">
                <RotateCcw className="w-5 h-5 text-white" />
            </button>
        </div>
    );
};

export default function SeatingCanvas({
    riserSections,
    globalRows,
    isCurved,
    placedStudents,
    selectedSectionId,
    onSelectSection
}) {
    return (
        <TransformWrapper
            initialScale={1}
            initialPositionX={0}
            initialPositionY={0}
            minScale={0.1}
            maxScale={4}
            centerOnInit
            limitToBounds={false}
            wheel={{ step: 0.1 }}
        >
            <Controls />
            <TransformComponent
                wrapperClass="w-full h-full"
                contentClass="w-full h-full"
            >
                <div
                    className="w-[4000px] h-[4000px] relative"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                >
                    {/* Center everything at canvas center */}
                    <div className="absolute" style={{ top: '2000px', left: '2000px', transform: 'translate(-50%, -50%)' }}>

                        {/* Stage Front Line */}
                        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '-300px' }}>
                            <div className="w-[600px] h-1 bg-purple-500/30 rounded-full flex items-center justify-center">
                                <span className="bg-gray-950 px-3 py-1 text-xs text-purple-400 uppercase tracking-widest font-semibold">Stage Front</span>
                            </div>
                        </div>

                        {/* Riser Sections - Horizontal Layout */}
                        {riserSections.length > 0 && (
                            <div className="flex items-end justify-center gap-1">
                                {riserSections.map((section, index) => {
                                    // Calculate angle for curved layout
                                    const totalSections = riserSections.length;
                                    const centerIndex = (totalSections - 1) / 2;
                                    const offsetFromCenter = index - centerIndex;

                                    // For curved: each section rotates around bottom center
                                    // Angle increases from center outward
                                    const rotationAngle = isCurved ? offsetFromCenter * 8 : 0;

                                    return (
                                        <div
                                            key={section.id}
                                            style={{
                                                transform: isCurved ? `rotate(${rotationAngle}deg)` : 'none',
                                                transformOrigin: 'bottom center',
                                                zIndex: selectedSectionId === section.id ? 10 : 1
                                            }}
                                            className="transition-transform duration-300"
                                        >
                                            <RiserSection
                                                section={section}
                                                globalRows={globalRows}
                                                isSelected={selectedSectionId === section.id}
                                                onSelect={() => onSelectSection(section.id)}
                                                placedStudents={placedStudents.filter(s => s.sectionId === section.id)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Director Position - Below risers */}
                        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: riserSections.length > 0 ? '400px' : '100px' }}>
                            <div className="flex flex-col items-center gap-2 opacity-60">
                                <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                                    <User className="w-7 h-7 text-white" />
                                </div>
                                <span className="text-sm uppercase tracking-widest font-semibold text-white">Director</span>
                            </div>
                        </div>

                        {/* Empty State */}
                        {riserSections.length === 0 && (
                            <div className="absolute left-1/2 top-0 -translate-x-1/2 text-center">
                                <div className="text-gray-500 text-lg">
                                    Click "Add Section" to start building your seating chart
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </TransformComponent>
        </TransformWrapper>
    );
}
