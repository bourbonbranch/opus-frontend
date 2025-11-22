import React from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import RiserSection from './RiserSection';
import { User, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const Controls = () => {
    const { zoomIn, zoomOut, centerView } = useControls();
    return (
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-gray-800/80 backdrop-blur rounded-lg p-2 border border-white/10 shadow-xl z-50">
            <button onClick={() => zoomIn()} className="p-2 hover:bg-white/10 rounded transition-colors" title="Zoom In">
                <ZoomIn className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => zoomOut()} className="p-2 hover:bg-white/10 rounded transition-colors" title="Zoom Out">
                <ZoomOut className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => centerView({ scale: 0.5, duration: 500 })} className="p-2 hover:bg-white/10 rounded transition-colors" title="Recenter View">
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
    onSelectSection,
    onBackgroundClick,
    isDragging
}) {
    // Calculate dynamic radius to prevent wrapping
    const calculateRadius = () => {
        if (!isCurved || riserSections.length === 0) return 600;

        const scale = 30;
        const totalWidthPx = riserSections.reduce((sum, section) => sum + (section.moduleWidth * scale), 0);

        // Maximum allowed arc angle in degrees (e.g., 100 degrees)
        const MAX_ARC_ANGLE = 100;
        const maxAngleRad = MAX_ARC_ANGLE * (Math.PI / 180);

        // Arc length formula: s = r * theta
        // We approximate total chord length as arc length for safety
        // r = s / theta
        const minRadius = totalWidthPx / maxAngleRad;

        // Return the larger of the base radius (900) or the calculated minimum radius
        return Math.max(900, minRadius);
    };

    const radius = calculateRadius();

    // Calculate proper arc geometry for curved layout
    const calculateCurvedPositions = () => {
        if (!isCurved || riserSections.length === 0) return [];

        // Use same scaling as RiserSection (30px per foot)
        const scale = 30;
        const PIXELS_PER_INCH = scale / 12;

        // 1. Calculate width of each section in pixels
        // In a curved layout, the "width" is the chord length at the front of the riser.
        const sectionData = riserSections.map(section => {
            const widthPx = section.moduleWidth * scale;
            const gapPx = (section.centerGap || 0) * PIXELS_PER_INCH;
            return { widthPx, gapPx };
        });

        // 2. Calculate angles for each section and gap
        // chord = 2 * r * sin(theta/2)
        // theta = 2 * asin(chord / 2r)
        const sectionAngles = sectionData.map(s => {
            const angleRad = 2 * Math.asin(s.widthPx / (2 * radius));
            const angleDeg = angleRad * (180 / Math.PI);

            // Calculate gap angle
            // We treat gap as a chord on the same radius
            const gapAngleRad = 2 * Math.asin(s.gapPx / (2 * radius));
            const gapAngleDeg = gapAngleRad * (180 / Math.PI);

            return { angleDeg, angleRad, widthPx: s.widthPx, gapAngleDeg, gapAngleRad };
        });

        // 3. Calculate total angle to center the arrangement
        // Total angle includes gaps between sections (n-1 gaps)
        // We assume the gap is AFTER the section, except for the last one
        const totalAngleDeg = sectionAngles.reduce((sum, s, i) => {
            const isLast = i === sectionAngles.length - 1;
            return sum + s.angleDeg + (isLast ? 0 : s.gapAngleDeg);
        }, 0);

        const startAngle = -totalAngleDeg / 2;

        return riserSections.map((section, index) => {
            const { angleDeg, angleRad, gapAngleDeg } = sectionAngles[index];

            // Calculate the angle for the CENTER of this section
            // Start angle + sum of previous (angles + gaps) + half of current angle
            const prevAngles = sectionAngles.slice(0, index).reduce((sum, s) => sum + s.angleDeg + s.gapAngleDeg, 0);

            const centerAngleDeg = startAngle + prevAngles + (angleDeg / 2);
            const centerAngleRad = centerAngleDeg * (Math.PI / 180);

            // Position calculation:
            // We want the CORNERS of the section to be on the circle of radius R.
            // Since the riser is a straight chord, its center is closer to the origin than R.
            // Distance to chord center (apothem) = R * cos(theta/2)
            const apothem = radius * Math.cos(angleRad / 2);

            // Position the center of the chord at the apothem distance
            const x = Math.sin(centerAngleRad) * apothem;
            const y = Math.cos(centerAngleRad) * apothem;

            return {
                x,
                y,
                rotation: centerAngleDeg,
                wedgeAngle: angleDeg,
                radius,
                angleRad
            };
        });
    };

    const positions = isCurved ? calculateCurvedPositions() : [];
    const [initStatus, setInitStatus] = React.useState('Pending');

    // Layout constants for centering
    const directorY = 400; // Director position relative to center of curvature (Increased gap)
    const visualCenterOffset = ((radius + directorY) / 2) + 100; // Center the group (Risers + Director) with slight downward shift

    // Final global offsets to center the entire layout in the 1500×1500 canvas
    const offsetX = 0; // Horizontal offset (already centered via left: 50%)
    const offsetY = -200; // Vertical offset to move entire layout down for better centering

    return (
        <TransformWrapper
            initialScale={0.5}
            minScale={0.1}
            maxScale={3} // Limit zoom to 3x
            limitToBounds={false}
            panning={{ disabled: isDragging, excluded: ['dnd-draggable'] }} // Disable panning when dragging
            wheel={{ step: 0.1 }}
            onInit={(ref) => {
                ref.centerView({ scale: 0.5, duration: 0 });
            }}
        >
            {({ centerView }) => (
                <>
                    <Controls />

                    <TransformComponent
                        wrapperClass="w-full h-full"
                        contentClass="w-full h-full flex items-center justify-center"
                    >
                        <div
                            style={{
                                width: '1500px',
                                height: '1500px',
                                position: 'relative',
                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                                backgroundSize: '40px 40px',
                                backgroundPosition: 'center',
                                cursor: 'default'
                            }}
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    onBackgroundClick && onBackgroundClick();
                                }
                            }}
                        >
                            {/* Director Group - ABSOLUTE CENTER */}
                            <div
                                className="absolute left-1/2 -translate-x-1/2 translate-y-1/2 z-20 flex flex-col items-center gap-1 pointer-events-auto"
                                style={{
                                    bottom: `calc(50% + ${directorY - visualCenterOffset + offsetY}px)`
                                }}
                            >
                                <div className="w-16 h-16 rounded-full bg-gray-900 border-2 border-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)] relative group cursor-help">
                                    <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse"></div>
                                    <User className="w-8 h-8 text-purple-100 relative z-10" />
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-purple-500/30">
                                        Director Position
                                    </div>
                                </div>
                                <div className="px-3 py-0.5 bg-gray-900/90 rounded-full border border-purple-500/30 backdrop-blur-sm">
                                    <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider">Director</span>
                                </div>
                            </div>

                            {/* Stage Representation - Behind Director */}
                            <div
                                className="absolute left-1/2 -translate-x-1/2 translate-y-1/2 w-[600px] h-16 bg-gradient-to-t from-purple-900/40 to-transparent rounded-b-[100%] border-b-4 border-purple-500/50 flex items-end justify-center pb-2 shadow-[0_10px_40px_rgba(168,85,247,0.2)] pointer-events-none"
                                style={{
                                    bottom: `calc(50% + ${directorY - visualCenterOffset + offsetY}px)`
                                }}
                            >
                            </div>

                            {/* Risers */}
                            {riserSections.length > 0 && (
                                <>
                                    {isCurved ? (
                                        // CURVED LAYOUT
                                        riserSections.map((section, index) => {
                                            const pos = positions[index];
                                            // Calculate depth offset for Row 0
                                            // RiserSection renders Row 0 at the bottom, but our radius calculation is for Row 1 (Front of Riser)
                                            // Row 1 is depthPx above Row 0.
                                            // So we need to shift the whole component down (inwards) by depthPx so that Row 1 aligns with the arc.
                                            const scale = 30;
                                            const PIXELS_PER_INCH = scale / 12;
                                            const depthPx = (section.treadDepth * PIXELS_PER_INCH);

                                            return (
                                                <div
                                                    key={section.id}
                                                    className="absolute pointer-events-auto"
                                                    style={{
                                                        left: `calc(50% + ${pos.x + offsetX}px)`,
                                                        bottom: `calc(50% + ${pos.y - visualCenterOffset - depthPx + offsetY}px)`,
                                                        transform: `translate(-50%, 0) rotate(${pos.rotation}deg)`,
                                                        transformOrigin: `center calc(100% - ${depthPx}px)`, // Pivot around Row 1 (Front of Riser)
                                                        zIndex: selectedSectionId === section.id ? 10 : 1
                                                    }}
                                                >
                                                    <RiserSection
                                                        section={section}
                                                        globalRows={globalRows}
                                                        isSelected={selectedSectionId === section.id}
                                                        onSelect={() => onSelectSection(section.id)}
                                                        placedStudents={placedStudents.filter(s => s.sectionId === section.id)}
                                                        wedgeAngle={pos.wedgeAngle}
                                                        radius={pos.radius}
                                                        angleRad={pos.angleRad}
                                                    />
                                                </div>
                                            );
                                        })
                                    ) : (
                                        // STRAIGHT LAYOUT
                                        <div
                                            className="absolute left-1/2 bottom-1/2 flex justify-center items-end pointer-events-none"
                                            style={{
                                                transform: 'translate(-50%, 0)',
                                                paddingBottom: '120px', // Distance from Director center
                                                gap: '0px'
                                            }}
                                        >
                                            {riserSections.map((section) => (
                                                <div
                                                    key={section.id}
                                                    className="pointer-events-auto"
                                                    style={{
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
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </TransformComponent>

                </>
            )}
        </TransformWrapper>
    );
}
