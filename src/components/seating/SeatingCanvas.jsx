import React from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import RiserSection from './RiserSection';
import { User, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const Controls = () => {
    const { zoomIn, zoomOut, zoomToElement } = useControls();
    return (
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-gray-800/80 backdrop-blur rounded-lg p-2 border border-white/10 shadow-xl z-50">
            <button onClick={() => zoomIn()} className="p-2 hover:bg-white/10 rounded transition-colors" title="Zoom In">
                <ZoomIn className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => zoomOut()} className="p-2 hover:bg-white/10 rounded transition-colors" title="Zoom Out">
                <ZoomOut className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => zoomToElement('center-target', 0.5, 500)} className="p-2 hover:bg-white/10 rounded transition-colors" title="Recenter View">
                <RotateCcw className="w-5 h-5 text-white" />
            </button>
        </div>
    );
};

export default function SeatingCanvas({
    riserSections,
    globalRows,
    globalModuleWidth,
    globalTreadDepth,
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
        const totalWidthPx = riserSections.reduce((sum, section) => sum + (globalModuleWidth * scale), 0);

        // Maximum allowed arc angle in degrees (e.g., 100 degrees)
        const MAX_ARC_ANGLE = 100;
        const maxAngleRad = MAX_ARC_ANGLE * (Math.PI / 180);

        // Arc length formula: s = r * theta
        // We approximate total chord length as arc length for safety
        const minRadius = totalWidthPx / maxAngleRad;

        // Add buffer for safety
        return Math.max(900, minRadius * 1.2);
    };

    const radius = calculateRadius();

    // Calculate proper arc geometry for curved layout
    const calculateCurvedPositions = () => {
        if (!isCurved || riserSections.length === 0) return [];

        const scale = 30;

        return riserSections.map((section, index) => {
            const widthPx = globalModuleWidth * scale;

            // Chord length = width of this section
            const chord = widthPx;

            // Calculate the angle subtended by this chord
            // Using formula: theta = 2 * arcsin(chord / (2 * radius))
            const angleRad = 2 * Math.asin(chord / (2 * radius));
            const angleDeg = angleRad * (180 / Math.PI);

            // centerGap is always 0 now (removed from UI)
            const gapAngleRad = 0;
            const gapAngleDeg = 0;

            return { angleDeg, angleRad, widthPx, gapAngleDeg, gapAngleRad };
        });
    };

    const positions = (() => {
        if (!isCurved || riserSections.length === 0) return [];

        const sectionAngles = calculateCurvedPositions();

        // Calculate total angle to center the arrangement
        const totalAngleDeg = sectionAngles.reduce((sum, s, i) => {
            const isLast = i === sectionAngles.length - 1;
            return sum + s.angleDeg + (isLast ? 0 : s.gapAngleDeg);
        }, 0);

        const startAngle = -totalAngleDeg / 2;

        return riserSections.map((section, index) => {
            const { angleDeg, angleRad, gapAngleDeg } = sectionAngles[index];

            // Calculate the angle for the CENTER of this section
            const prevAngles = sectionAngles.slice(0, index).reduce((sum, s) => sum + s.angleDeg + s.gapAngleDeg, 0);
            const centerAngle = startAngle + prevAngles + angleDeg / 2;

            // Calculate apothem (perpendicular distance from center to chord midpoint)
            const apothem = radius * Math.cos(angleRad / 2);

            // Convert polar to Cartesian
            const centerAngleRad = centerAngle * (Math.PI / 180);
            const x = Math.sin(centerAngleRad) * apothem;
            const y = Math.cos(centerAngleRad) * apothem;

            return {
                x,
                y,
                rotation: centerAngle,
                wedgeAngle: angleDeg,
                radius,
                angleRad
            };
        });
    })();
    const [initStatus, setInitStatus] = React.useState('Pending');

    // Layout constants for centering
    const directorY = 500; // Director position relative to center of curvature
    const visualCenterOffset = ((radius + directorY) / 2) + 100; // Center the group (Risers + Director) with slight downward shift

    // Calculate offsets for CSS positioning (Top/Left relative to center)
    // Positive Y in our math is "Up", so it becomes Negative Top in CSS.
    // We shift everything so that 'visualCenterOffset' is at (0,0).

    const getPositionStyle = (x, y_math) => {
        // y_math is distance from center of curvature (0,0)
        // We want to shift so visualCenterOffset is at screen center
        // y_screen = y_math - visualCenterOffset
        // css_top = -y_screen
        const y_screen = y_math - visualCenterOffset;
        return {
            left: `${x}px`,
            top: `${-y_screen}px`
        };
    };

    return (
        <div className="relative w-full h-full bg-gray-900">
            <TransformWrapper
                initialScale={0.75}
                minScale={0.1}
                maxScale={4}
                centerOnInit={true}
                limitToBounds={false}
                panning={{ disabled: isDragging, excluded: ['dnd-draggable'] }}
                wheel={{ step: 0.1 }}
            >
                {({ centerView, zoomIn, zoomOut, resetTransform, zoomToElement }) => (
                    <>
                        {/* Controls */}
                        <div className="absolute top-4 right-6 z-[100]">
                            <Controls />
                        </div>

                        <TransformComponent
                            wrapperClass="w-full h-full"
                            contentClass="w-full h-full flex items-center justify-center"
                        >
                            {/* Background click handler */}
                            <div
                                className="absolute inset-0 z-0"
                                onClick={onBackgroundClick}
                            />
                            {/* Zero-size container at the exact center of the viewport */}
                            <div className="relative w-0 h-0">

                                {/* Director Group */}
                                <div
                                    id="center-target"
                                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1 pointer-events-auto"
                                    style={getPositionStyle(0, directorY)}
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

                                {/* Stage Representation */}
                                <div
                                    className="absolute -translate-x-1/2 -translate-y-1/2 w-[600px] h-16 bg-gradient-to-t from-purple-900/40 to-transparent rounded-b-[100%] border-b-4 border-purple-500/50 flex items-end justify-center pb-2 shadow-[0_10px_40px_rgba(168,85,247,0.2)] pointer-events-none"
                                    style={getPositionStyle(0, directorY)}
                                >
                                </div>

                                {/* Risers */}
                                {riserSections.length > 0 && (
                                    <>
                                        {isCurved ? (
                                            // CURVED LAYOUT
                                            riserSections.map((section, index) => {
                                                const pos = positions[index];
                                                const scale = 30;
                                                const PIXELS_PER_INCH = scale / 12;
                                                const depthPx = (globalTreadDepth * PIXELS_PER_INCH);

                                                const style = getPositionStyle(pos.x, pos.y);

                                                return (
                                                    <div
                                                        key={section.id}
                                                        className="absolute pointer-events-auto"
                                                        style={{
                                                            left: style.left,
                                                            top: style.top,
                                                            transform: `translate(-50%, -100%) rotate(${pos.rotation}deg) translateY(${depthPx}px)`,
                                                            transformOrigin: `center calc(100% - ${depthPx}px)`,
                                                            zIndex: selectedSectionId === section.id ? 10 : 1
                                                        }}
                                                    >
                                                        <RiserSection
                                                            section={section}
                                                            globalRows={globalRows}
                                                            globalModuleWidth={globalModuleWidth}
                                                            globalTreadDepth={globalTreadDepth}
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
                                                className="absolute flex justify-center items-end pointer-events-none"
                                                style={{
                                                    left: '0px',
                                                    top: `${-(120 - visualCenterOffset)}px`,
                                                    transform: `translate(-50%, -100%) translateY(${getPositionStyle(0, directorY).top}) translateY(-120px)`,
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
        </div>
    );
}
