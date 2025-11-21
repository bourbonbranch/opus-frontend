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

const CenterOnLoad = () => {
    const { centerView } = useControls();
    React.useEffect(() => {
        // Small timeout to ensure layout is ready
        setTimeout(() => {
            centerView({ scale: 0.5, duration: 0 });
        }, 100);
    }, []);
    return null;
};

export default function SeatingCanvas({
    riserSections,
    globalRows,
    isCurved,
    placedStudents,
    selectedSectionId,
    onSelectSection,
    onBackgroundClick
}) {
    // Calculate proper arc geometry for curved layout
    const calculateCurvedPositions = () => {
        if (!isCurved || riserSections.length === 0) return [];

        // Use same scaling as RiserSection (30px per foot)
        const scale = 30;
        const radius = 350; // Reduced radius to fit on screen (approx 12ft)

        // 1. Calculate width of each section in pixels
        // In a curved layout, the "width" is the chord length at the front of the riser.
        const sectionData = riserSections.map(section => {
            const widthPx = section.moduleWidth * scale;
            return { widthPx };
        });

        // 2. Calculate angles for each section
        // chord = 2 * r * sin(theta/2)
        // theta = 2 * asin(chord / 2r)
        const sectionAngles = sectionData.map(s => {
            const angleRad = 2 * Math.asin(s.widthPx / (2 * radius));
            const angleDeg = angleRad * (180 / Math.PI);
            return { angleDeg, angleRad, widthPx: s.widthPx };
        });

        // 3. Calculate total angle to center the arrangement
        const totalAngleDeg = sectionAngles.reduce((sum, s) => sum + s.angleDeg, 0);
        const startAngle = -totalAngleDeg / 2;

        return riserSections.map((section, index) => {
            const { angleDeg, angleRad } = sectionAngles[index];

            // Calculate the angle for the CENTER of this section
            // Start angle + sum of previous angles + half of current angle
            const prevAngles = sectionAngles.slice(0, index).reduce((sum, s) => sum + s.angleDeg, 0);
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

    return (
        <TransformWrapper
            initialScale={0.5}
            minScale={0.1}
            maxScale={3} // Limit zoom to 3x
            centerOnInit={true}
            limitToBounds={false}
            panning={{ disabled: false }} // Enable panning
            wheel={{ step: 0.1 }}
        >
            {({ centerView }) => (
                <>
                    <CenterOnLoad />
                    <Controls />

                    <TransformComponent
                        wrapperClass="w-full h-full"
                        contentClass="w-full h-full flex items-center justify-center"
                    >
                        <div
                            className="relative flex flex-col items-center justify-center"
                            onClick={(e) => {
                                // Only trigger if clicking directly on the background
                                if (e.target === e.currentTarget) {
                                    onBackgroundClick && onBackgroundClick();
                                }
                            }}
                            style={{
                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                                backgroundSize: '40px 40px',
                                backgroundPosition: 'center',
                                minWidth: '100%',
                                minHeight: '100%',
                                width: '2000px', // Give it a fixed large size for panning
                                height: '2000px',
                                cursor: 'default'
                            }}
                        >
                            {/* Content Wrapper - Centered by parent */}
                            <div className="relative flex flex-col items-center pointer-events-none">

                                {/* Riser Container */}
                                <div className="relative flex justify-center items-end mb-24 pointer-events-none">
                                    {riserSections.length > 0 && (
                                        <div className="relative pointer-events-none" style={{
                                            width: isCurved ? '1600px' : 'auto',
                                            height: isCurved ? '600px' : 'auto',
                                            marginBottom: isCurved ? '0' : '0',
                                            display: isCurved ? 'block' : 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'flex-end',
                                            gap: '0px' // Ensure no gap between straight sections
                                        }}>
                                            {riserSections.map((section, index) => {
                                                if (isCurved) {
                                                    const pos = positions[index];
                                                    return (
                                                        <div
                                                            key={section.id}
                                                            className="absolute pointer-events-auto"
                                                            style={{
                                                                left: `${800 + pos.x}px`,
                                                                bottom: `${pos.y}px`, // Use calculated y directly as bottom offset
                                                                transform: `translate(-50%, 0) rotate(${pos.rotation}deg)`,
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
                                                                wedgeAngle={pos.wedgeAngle}
                                                                radius={pos.radius}
                                                                angleRad={pos.angleRad}
                                                            />
                                                        </div>
                                                    );
                                                } else {
                                                    return (
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
                                                    );
                                                }
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Director / Stage Container */}
                                <div className="relative flex flex-col items-center justify-end pointer-events-none z-40">
                                    {/* Director Bubble */}
                                    <div className="relative z-20 flex flex-col items-center gap-1 mb-6">
                                        <div className="w-16 h-16 rounded-full bg-gray-900 border-2 border-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)] relative group cursor-help pointer-events-auto">
                                            <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse"></div>
                                            <User className="w-8 h-8 text-purple-100 relative z-10" />

                                            {/* Tooltip */}
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-purple-500/30">
                                                Director Position
                                            </div>
                                        </div>
                                        <div className="px-3 py-0.5 bg-gray-900/90 rounded-full border border-purple-500/30 backdrop-blur-sm">
                                            <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider">Director</span>
                                        </div>
                                    </div>

                                    {/* Screen/Stage Representation */}
                                    <div className="w-[600px] h-16 bg-gradient-to-t from-purple-900/40 to-transparent rounded-b-[100%] border-b-4 border-purple-500/50 flex items-end justify-center pb-2 shadow-[0_10px_40px_rgba(168,85,247,0.2)]">
                                        {/* Text removed as requested */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TransformComponent>

                    {/* DEBUG OVERLAY */}
                    <div className="absolute top-4 left-4 z-50 bg-black/80 text-green-400 p-4 rounded border border-green-500/30 font-mono text-xs pointer-events-none max-w-md overflow-auto max-h-96">
                        <div>isCurved: {String(isCurved)}</div>
                        <div>Sections: {riserSections.length}</div>
                        <div>GlobalRows: {globalRows}</div>
                        <div>Positions: {positions.length}</div>
                        {positions.map((p, i) => {
                            const section = riserSections[i];
                            return (
                                <div key={i} className="mt-2 border-t border-white/10 pt-1">
                                    <div>Idx: {i}</div>
                                    <div>x: {p.x.toFixed(2)}, y: {p.y.toFixed(2)}</div>
                                    <div>angleDeg: {p.wedgeAngle?.toFixed(2)}</div>
                                    <div>angleRad: {p.angleRad?.toFixed(4)}</div>
                                    <div>radius: {p.radius}</div>
                                    <div>depth: {section?.treadDepth}</div>
                                    <div>width: {section?.moduleWidth}</div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </TransformWrapper>
    );
}
