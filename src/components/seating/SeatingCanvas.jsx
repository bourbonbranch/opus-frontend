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

        const totalSections = riserSections.length;
        const arcAngle = 120; // Total arc span in degrees
        const anglePerSection = arcAngle / Math.max(1, totalSections - 1);
        const radius = 400; // Arc radius in pixels

        return riserSections.map((section, index) => {
            // Calculate angle for this section (centered at 0)
            const centerIndex = (totalSections - 1) / 2;
            const angleOffset = (index - centerIndex) * anglePerSection;
            const angleRad = (angleOffset * Math.PI) / 180;

            // Position on arc
            const x = Math.sin(angleRad) * radius;
            const y = -Math.cos(angleRad) * radius + radius; // Offset so arc opens toward director

            return {
                x,
                y,
                rotation: angleOffset // Tangent to arc
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

                        {/* Stage Front Line - Always visible */}
                        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '-400px' }}>
                            <div className="w-[800px] h-2 bg-purple-500/40 rounded-full flex items-center justify-center">
                                <span className="bg-gray-950 px-4 py-1 text-sm text-purple-300 uppercase tracking-widest font-bold">Stage Front</span>
                            </div>
                        </div>

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

                        {/* Director Position - Fixed below risers, always visible */}
                        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '300px' }}>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-400/50 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.3)] backdrop-blur">
                                    <User className="w-8 h-8 text-purple-300" />
                                </div>
                                <span className="text-sm uppercase tracking-widest font-bold text-purple-300 bg-gray-950/80 px-3 py-1 rounded-full">Director</span>
                            </div>
                        </div>

                        {/* Empty State */}
                        {riserSections.length === 0 && (
                            <div className="absolute left-1/2 top-0 -translate-x-1/2 text-center">
                                <div className="text-gray-400 text-lg font-medium bg-gray-900/50 px-6 py-4 rounded-lg border border-white/10">
                                    Click <span className="text-green-400 font-bold">"Add Section"</span> to start building your seating chart
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </TransformComponent>
        </TransformWrapper>
    );
}
