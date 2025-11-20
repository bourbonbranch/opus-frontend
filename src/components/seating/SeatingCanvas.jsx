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
    isCurved,
    placedStudents,
    selectedSectionId,
    onSelectSection
}) {
    return (
        <TransformWrapper
            initialScale={0.8}
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
                    className="w-[3000px] h-[3000px] relative bg-grid-pattern flex items-center justify-center"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                >
                    <div className="flex flex-col items-center gap-12 p-20">
                        {/* Stage Marker */}
                        <div className="w-[800px] h-1 bg-purple-500/30 rounded-full flex items-center justify-center">
                            <span className="bg-gray-950 px-2 text-xs text-purple-400 uppercase tracking-widest font-semibold">Stage Front</span>
                        </div>

                        {/* Riser Sections Container */}
                        <div className="flex justify-center items-end gap-1 origin-bottom min-h-[300px]">
                            {riserSections.map((section, index) => {
                                const centerIndex = (riserSections.length - 1) / 2;
                                const rotation = isCurved ? (index - centerIndex) * 8 : 0;
                                const translateY = isCurved ? Math.abs(index - centerIndex) * 10 : 0;

                                return (
                                    <div
                                        key={section.id}
                                        style={{
                                            transform: isCurved
                                                ? `rotate(${rotation}deg) translateY(${translateY}px)`
                                                : 'none',
                                            transformOrigin: 'bottom center',
                                            zIndex: selectedSectionId === section.id ? 10 : 1
                                        }}
                                        className="transition-transform duration-300"
                                    >
                                        <RiserSection
                                            section={section}
                                            isSelected={selectedSectionId === section.id}
                                            onSelect={() => onSelectSection(section.id)}
                                            placedStudents={placedStudents.filter(s => s.sectionId === section.id)}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Director Position */}
                        <div className="flex flex-col items-center gap-2 opacity-50">
                            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                <User className="w-6 h-6" />
                            </div>
                            <span className="text-xs uppercase tracking-widest font-semibold">Director</span>
                        </div>
                    </div>
                </div>
            </TransformComponent>
        </TransformWrapper>
    );
}
