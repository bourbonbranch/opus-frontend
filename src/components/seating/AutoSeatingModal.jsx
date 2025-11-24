import React from 'react';
import { X, Users } from 'lucide-react';

/**
 * Modal for selecting auto-seating layout type
 */
export default function AutoSeatingModal({ isOpen, onClose, onSelectLayout }) {
    if (!isOpen) return null;

    const layouts = [
        {
            key: 'SATB',
            name: 'SATB',
            description: 'Traditional: Soprano, Alto, Tenor, Bass (front to back)',
            icon: '🎵'
        },
        {
            key: 'STBA',
            name: 'STBA',
            description: 'Mixed: Soprano, Tenor, Bass, Alto (front to back)',
            icon: '🎼'
        },
        {
            key: 'SSAA',
            name: 'SSAA',
            description: 'Treble: Soprano and Alto only',
            icon: '👥'
        },
        {
            key: 'TTBB',
            name: 'TTBB',
            description: 'Bass: Tenor and Bass only',
            icon: '👥'
        }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl border border-white/10 shadow-2xl max-w-2xl w-full mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-purple-400" />
                        <h2 className="text-xl font-bold text-white">Auto-Populate Seating</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-white/70" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-white/70 mb-6">
                        Select a layout pattern to automatically place students on the risers based on their voice section.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {layouts.map(layout => (
                            <button
                                key={layout.key}
                                onClick={() => {
                                    onSelectLayout(layout.key);
                                    onClose();
                                }}
                                className="p-4 bg-gray-900/50 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/50 rounded-lg transition-all text-left group"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-3xl">{layout.icon}</span>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                                            {layout.name}
                                        </h3>
                                        <p className="text-sm text-white/60 mt-1">
                                            {layout.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-sm text-blue-200">
                            <strong>Note:</strong> Students already placed on risers will not be moved.
                            You can manually adjust placements after auto-population.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
