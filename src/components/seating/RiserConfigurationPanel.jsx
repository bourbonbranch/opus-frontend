import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';

export default function RiserConfigurationPanel({ section, onUpdate, onRemove }) {
    if (!section) return null;

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/10 bg-white/5">
                <h3 className="font-semibold text-lg">Section {section.name}</h3>
                <p className="text-xs text-gray-400">Configure riser properties</p>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto">
                {/* Rows Control */}
                <div className="space-y-2">
                    <label className="text-sm text-gray-300">Rows</label>
                    <div className="flex items-center justify-between bg-white/5 rounded-lg p-1 border border-white/10">
                        <button
                            onClick={() => onUpdate({ rows: Math.max(2, section.rows - 1) })}
                            className="p-2 hover:bg-white/10 rounded-md transition-colors disabled:opacity-50"
                            disabled={section.rows <= 2}
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-mono font-medium">{section.rows}</span>
                        <button
                            onClick={() => onUpdate({ rows: Math.min(6, section.rows + 1) })}
                            className="p-2 hover:bg-white/10 rounded-md transition-colors disabled:opacity-50"
                            disabled={section.rows >= 6}
                        >
                            <Plus className="w-4 h-4" />
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
                                className={`py-2 rounded-lg text-sm font-medium border transition-all
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
                                className={`py-2 rounded-lg text-sm font-medium border transition-all
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
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    >
                        <option value="">None</option>
                        {Array.from({ length: section.rows }, (_, i) => (
                            <option key={i + 1} value={i + 1}>Row {i + 1}</option>
                        ))}
                    </select>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <button
                        onClick={onRemove}
                        className="w-full flex items-center justify-center gap-2 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                        Remove Section
                    </button>
                </div>
            </div>
        </div>
    );
}
