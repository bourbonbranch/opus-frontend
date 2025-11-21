import React, { useState } from 'react';
import { Plus, Minus, Trash2, ChevronDown, ChevronUp, Settings, Layout } from 'lucide-react';

export default function RiserConfigurationPanel({
    section,
    allSections,
    globalRows,
    onGlobalRowsChange,
    isCurved,
    onToggleCurved,
    onAddSection,
    onRemoveLastSection,
    onUpdate,
    onRemove,
    onClose
}) {
    const [isMinimized, setIsMinimized] = useState(false);

    if (!section) return null;

    return (
        <div className={`absolute top-20 right-6 w-80 bg-gray-800/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 z-50 flex flex-col ${isMinimized ? 'h-14' : 'max-h-[calc(100vh-140px)]'}`}>
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-purple-400" />
                    <h3 className="font-semibold text-sm">Configuration</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <div className="overflow-y-auto flex-1 p-4 space-y-6">
                    {/* Global Settings */}
                    <div className="space-y-4 pb-4 border-b border-white/10">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Global Settings</h4>

                        {/* Layout Mode */}
                        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                            <button
                                onClick={() => onToggleCurved(false)}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${!isCurved ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Straight
                            </button>
                            <button
                                onClick={() => onToggleCurved(true)}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${isCurved ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Curved
                            </button>
                        </div>

                        {/* Rows */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300 flex justify-between">
                                <span>Rows (All Sections)</span>
                                <span className="text-purple-400 font-mono">{globalRows}</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onGlobalRowsChange(Math.max(2, globalRows - 1))}
                                    className="p-2 hover:bg-white/10 rounded-md border border-white/10 transition-colors disabled:opacity-50"
                                    disabled={globalRows <= 2}
                                >
                                    <Minus className="w-3 h-3" />
                                </button>
                                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 transition-all" style={{ width: `${((globalRows - 2) / 4) * 100}%` }} />
                                </div>
                                <button
                                    onClick={() => onGlobalRowsChange(Math.min(6, globalRows + 1))}
                                    className="p-2 hover:bg-white/10 rounded-md border border-white/10 transition-colors disabled:opacity-50"
                                    disabled={globalRows >= 6}
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        {/* Sections Control */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300 flex justify-between">
                                <span>Sections</span>
                                <span className="text-purple-400 font-mono">{allSections.length}</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onRemoveLastSection}
                                    className="p-2 hover:bg-white/10 rounded-md border border-white/10 transition-colors disabled:opacity-50"
                                    disabled={allSections.length <= 1}
                                >
                                    <Minus className="w-3 h-3" />
                                </button>
                                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 transition-all" style={{ width: `${(allSections.length / 8) * 100}%` }} />
                                </div>
                                <button
                                    onClick={onAddSection}
                                    className="p-2 hover:bg-white/10 rounded-md border border-white/10 transition-colors disabled:opacity-50"
                                    disabled={allSections.length >= 8}
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Section Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section {section.name}</h4>
                            <span className="text-xs text-gray-500">ID: {section.id}</span>
                        </div>

                        {/* Presets */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Presets</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => onUpdate({ moduleWidth: 6, treadDepth: 18 })}
                                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-left transition-colors"
                                >
                                    <div className="font-medium text-white">Wenger Std</div>
                                    <div className="text-[10px] text-gray-400">6' x 18"</div>
                                </button>
                                <button
                                    onClick={() => onUpdate({ moduleWidth: 4, treadDepth: 18 })}
                                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-left transition-colors"
                                >
                                    <div className="font-medium text-white">Wenger Short</div>
                                    <div className="text-[10px] text-gray-400">4' x 18"</div>
                                </button>
                            </div>
                        </div>

                        {/* Module Width */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Module Width</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[4, 6, 8].map(width => (
                                    <button
                                        key={width}
                                        onClick={() => onUpdate({ moduleWidth: width })}
                                        className={`py-2 rounded-lg text-xs font-medium border transition-all
                          ${section.moduleWidth === width
                                                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                                    >
                                        {width} ft
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tread Depth */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Tread Depth</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[18, 24].map(depth => (
                                    <button
                                        key={depth}
                                        onClick={() => onUpdate({ treadDepth: depth })}
                                        className={`py-2 rounded-lg text-xs font-medium border transition-all
                          ${section.treadDepth === depth
                                                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                                    >
                                        {depth}"
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Singer Spacing */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm text-gray-300">Singer Spacing</label>
                                <span className="text-xs text-gray-400">{section.singerSpacing}"</span>
                            </div>
                            <input
                                type="range"
                                min="18"
                                max="36"
                                step="1"
                                value={section.singerSpacing}
                                onChange={(e) => onUpdate({ singerSpacing: parseInt(e.target.value) })}
                                className="w-full accent-purple-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Center Gap */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm text-gray-300">Center Gap</label>
                                <span className="text-xs text-gray-400">{section.centerGap}"</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="12"
                                step="1"
                                value={section.centerGap}
                                onChange={(e) => onUpdate({ centerGap: parseInt(e.target.value) })}
                                className="w-full accent-purple-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* ADA Row */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">ADA Compliant Row</label>
                            <select
                                value={section.adaRow || ''}
                                onChange={(e) => onUpdate({ adaRow: e.target.value ? parseInt(e.target.value) : null })}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs focus:outline-none focus:border-purple-500"
                            >
                                <option value="">None</option>
                                {Array.from({ length: globalRows }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>Row {i + 1}</option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <button
                                onClick={onRemove}
                                className="w-full flex items-center justify-center gap-2 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-xs font-medium"
                            >
                                <Trash2 className="w-3 h-3" />
                                Remove Section
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
