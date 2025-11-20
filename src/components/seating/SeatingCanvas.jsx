import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import RiserSection from './RiserSection';
import { User } from 'lucide-react';

export default function SeatingCanvas({
    riserSections,
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
            {({ zoomIn, zoomOut, resetTransform }) => (
                <TransformComponent
                    wrapperClass="w-full h-full"
                    contentClass="w-full h-full"
                >
                    <div
                        className="w-[5000px] h-[5000px] relative bg-grid-pattern"
                        style={{
                            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                            backgroundSize: '40px 40px' // 1 foot grid
                        }}
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            {/* Director Position */}
                            <div className="absolute left-1/2 top-[400px] -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
                                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                    <User className="w-6 h-6" />
                                </div>
                                <span className="text-xs uppercase tracking-widest font-semibold">Director</span>
                            </div>

                            {/* Riser Sections Container */}
                            <div className="flex justify-center items-end gap-1">
                                {riserSections.map((section, index) => {
                                    // Calculate rotation for curved layout
                                    // Center section is 0 deg
                                    // Sections to left are negative, right are positive
                                    // 8 degrees per section
                                    const centerIndex = (riserSections.length - 1) / 2;
                                    const rotation = isCurved ? (index - centerIndex) * 8 : 0;

                                    // Calculate offset for curved layout to keep them connected
                                    // This is a simplified calculation. Real geometry is harder.
                                    // For now, we just rotate them around a common center point far behind.

                                    return (
                                        <div
                                            key={section.id}
                                            style={{
                                                transform: isCurved
                                                    ? `rotate(${rotation}deg) translateY(${Math.abs(index - centerIndex) * 10}px)`
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
                        </div>
                    </div>
                </TransformComponent>
            )}
        </TransformWrapper>
    );
}
