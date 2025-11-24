import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GripVertical } from 'lucide-react';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function ProspectCard({ prospect, isDragging }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: `prospect-${prospect.id}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getInterestColor = (level) => {
        const colors = {
            hot: 'border-red-500/50 bg-red-500/10',
            warm: 'border-orange-500/50 bg-orange-500/10',
            cold: 'border-blue-500/50 bg-blue-500/10'
        };
        return colors[level] || colors.warm;
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-gray-800/50 backdrop-blur-xl rounded-lg border border-white/10 p-4 mb-3 cursor-move hover:border-purple-500/50 transition-all ${getInterestColor(prospect.interest_level)}`}
            {...attributes}
            {...listeners}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <h3 className="text-white font-semibold">
                        {prospect.first_name} {prospect.last_name}
                    </h3>
                    <p className="text-white/60 text-sm">{prospect.email}</p>
                </div>
                <GripVertical className="w-4 h-4 text-white/40" />
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
                {prospect.voice_part && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                        {prospect.voice_part}
                    </span>
                )}
                {prospect.high_school && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                        {prospect.high_school}
                    </span>
                )}
                {prospect.graduation_year && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full">
                        Class of {prospect.graduation_year}
                    </span>
                )}
            </div>
        </div>
    );
}

function PipelineStage({ stage, prospects }) {
    const { setNodeRef } = useDroppable({
        id: `stage-${stage.id}`,
    });

    const prospectIds = prospects.map(p => `prospect-${p.id}`);

    return (
        <div className="flex-1 min-w-[280px]">
            <div
                ref={setNodeRef}
                className="rounded-lg border-2 p-4 h-full"
                style={{
                    borderColor: stage.color,
                    backgroundColor: `${stage.color}10`
                }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-semibold">{stage.name}</h2>
                    <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white">
                        {prospects.length}
                    </span>
                </div>

                <SortableContext items={prospectIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2 min-h-[200px]">
                        {prospects.map((prospect) => (
                            <ProspectCard key={prospect.id} prospect={prospect} />
                        ))}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}

export default function RecruitingPipeline() {
    const navigate = useNavigate();
    const [pipeline, setPipeline] = useState({ stages: [] });
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState(null);

    const directorId = localStorage.getItem('directorId');
    const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        loadPipeline();
    }, []);

    const loadPipeline = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${API_URL}/api/recruiting/pipeline?director_id=${directorId}`
            );
            const data = await response.json();
            setPipeline(data);
        } catch (err) {
            console.error('Error loading pipeline:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        // Parse IDs
        const activeProspectId = parseInt(active.id.replace('prospect-', ''));

        let targetStageId;
        if (over.id.startsWith('stage-')) {
            targetStageId = parseInt(over.id.replace('stage-', ''));
        } else if (over.id.startsWith('prospect-')) {
            // Dropped on another prospect, find their stage
            const overProspectId = parseInt(over.id.replace('prospect-', ''));
            const stage = pipeline.stages.find(s => s.prospects.some(p => p.id === overProspectId));
            if (stage) targetStageId = stage.id;
        }

        if (!targetStageId) return;

        // Optimistic update
        const newPipeline = { ...pipeline };
        const sourceStage = newPipeline.stages.find(s => s.prospects.some(p => p.id === activeProspectId));
        const destStage = newPipeline.stages.find(s => s.id === targetStageId);

        if (sourceStage && destStage && sourceStage.id !== destStage.id) {
            const prospect = sourceStage.prospects.find(p => p.id === activeProspectId);
            sourceStage.prospects = sourceStage.prospects.filter(p => p.id !== activeProspectId);
            destStage.prospects.push(prospect);
            setPipeline(newPipeline);

            // API Update
            try {
                await fetch(
                    `${API_URL}/api/recruiting/prospects/${activeProspectId}/stage`,
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ stage_id: targetStageId })
                    }
                );
            } catch (err) {
                console.error('Error updating stage:', err);
                loadPipeline(); // Revert on error
            }
        }
    };

    const activeProspect = activeId
        ? pipeline.stages.flatMap(s => s.prospects).find(p => `prospect-${p.id}` === activeId)
        : null;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
                <div className="text-white text-xl">Loading pipeline...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/director/recruiting')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Recruiting Pipeline</h1>
                        <p className="text-white/60">Drag prospects between stages to update their status</p>
                    </div>
                </div>

                {/* Pipeline Board */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {pipeline.stages.map((stage) => (
                            <PipelineStage
                                key={stage.id}
                                stage={stage}
                                prospects={stage.prospects || []}
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {activeProspect ? (
                            <div className="bg-gray-800 rounded-lg border border-purple-500 p-4 shadow-2xl">
                                <h3 className="text-white font-semibold">
                                    {activeProspect.first_name} {activeProspect.last_name}
                                </h3>
                                <p className="text-white/60 text-sm">{activeProspect.email}</p>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
}
