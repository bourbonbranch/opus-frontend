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
    // Calculate proper arc geometry for curved layout
    const calculateCurvedPositions = () => {
        if (!isCurved || riserSections.length === 0) return [];

        const radius = 800; // Flatter curve (larger radius) for AMC feel

        // Calculate total width to center the arrangement
        let currentAngle = 0;
        const sectionAngles = riserSections.map(section => {
            const widthPx = section.moduleWidth * 40;
            // Angle subtended by this section: s = r * theta => theta = s / r
            const angleDeg = (widthPx / radius) * (180 / Math.PI);
            return angleDeg;
        });

        const totalAngle = sectionAngles.reduce((sum, a) => sum + a, 0);
        const startAngle = -totalAngle / 2;

        return riserSections.map((section, index) => {
            const widthPx = section.moduleWidth * 40;
            const sectionAngle = sectionAngles[index];

            // Center of this section is at startAngle + (sum of prev angles) + half this angle
            const prevAngles = sectionAngles.slice(0, index).reduce((sum, a) => sum + a, 0);
            const centerAngle = startAngle + prevAngles + (sectionAngle / 2);

            const angleRad = (centerAngle * Math.PI) / 180;

            // Position on arc
            // x = sin(angle) * radius
            // y = -cos(angle) * radius + radius (offset to start at 0)
            const x = Math.sin(angleRad) * radius;
            const y = -Math.cos(angleRad) * radius + radius;

            return {
                x,
                y,
                rotation: centerAngle // Rotate to face center
            };
        });
    };

    const positions = isCurved ? calculateCurvedPositions() : [];

    return (
        <TransformWrapper
            initialScale={0.6}
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
                    {/* Fixed center point */}
                    <div className="absolute" style={{ top: '2000px', left: '2000px' }}>

                        {/* Stage Front marker removed */}

                        {/* Riser Sections */}
                        {riserSections.length > 0 && (
                            <div className="relative" style={{ width: '1px', height: '1px' }}>
                                {riserSections.map((section, index) => {
                                    if (isCurved) {
                                        const pos = positions[index];
                                        return (
                                            <div
                                                key={section.id}
                                                className="absolute"
                                                style={{
                                                    left: `${pos.x}px`,
                                                    top: `${pos.y}px`,
                                                    transform: `translate(-50%, -100%) rotate(${pos.rotation}deg)`,
                                                    transformOrigin: 'center bottom',
                                                    zIndex: selectedSectionId === section.id ? 10 : 1
                                                }}
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
                                    } else {
                                        // Straight layout - side by side
                                        const totalWidth = riserSections.reduce((sum, s) => sum + (s.moduleWidth * 40), 0);
                                        const startX = -totalWidth / 2;
                                        const xOffset = riserSections.slice(0, index).reduce((sum, s) => sum + (s.moduleWidth * 40), 0);

                                        return (
                                            <div
                                                key={section.id}
                                                className="absolute"
                                                style={{
                                                    left: `${startX + xOffset}px`,
                                                    top: '0px',
                                                    transform: 'translateY(-100%)',
                                                    zIndex: selectedSectionId === section.id ? 10 : 1
                                                }}
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
                                    }
                                })}
                            </div>
                        )}



                        {/* Director / Screen Position - Fixed above risers */}
                        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '-300px' }}>
                            <div className="flex flex-col items-center gap-3">
                                {/* Screen/Stage Representation */}
                                <div className="w-[600px] h-12 bg-gradient-to-b from-purple-500/20 to-transparent rounded-t-3xl border-t border-purple-500/50 flex items-center justify-center mb-4">
                                    <span className="text-xs uppercase tracking-[0.5em] text-purple-300/50 font-light">Stage / Director</span>
                                </div>

                                {/* Director Bubble */}
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 rounded-full bg-gray-900 border-2 border-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)] z-20 relative">
                                        <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse"></div>
                                        <User className="w-8 h-8 text-purple-100 relative z-10" />
                                    </div>
                                    <div className="px-4 py-1 bg-gray-800/90 rounded-full border border-purple-500/30 backdrop-blur-sm">
                                        <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">Director</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Empty State */}
                        {riserSections.length === 0 && (
                            <div className="absolute left-1/2 top-0 -translate-x-1/2 text-center pt-20">
                                <div className="text-gray-400 text-lg font-medium bg-gray-900/80 px-8 py-6 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
                                    <p className="mb-4">Start building your seating chart</p>
                                    <div className="flex items-center justify-center gap-2 text-sm text-purple-300">
                                        <span>Click</span>
                                        <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded border border-green-600/30 font-bold">+ Add Section</span>
                                        <span>to begin</span>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </TransformComponent>
        </TransformWrapper>
    );
}
