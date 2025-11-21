import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Edit2 } from 'lucide-react';
import {
    getEnsembles,
    getEnsembleSections,
    getEnsembleParts,
    createEnsembleSection,
    createEnsemblePart,
    deleteEnsembleSection,
    deleteEnsemblePart,
} from '../lib/opusApi';

export default function EnsembleSettings() {
    const [ensembles, setEnsembles] = useState([]);
    const [selectedEnsembleId, setSelectedEnsembleId] = useState(null);
    const [sections, setSections] = useState([]);
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
    const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [newSectionName, setNewSectionName] = useState('');
    const [newPartName, setNewPartName] = useState('');

    useEffect(() => {
        loadEnsembles();
    }, []);

    useEffect(() => {
        if (selectedEnsembleId) {
            loadSectionsAndParts();
        }
    }, [selectedEnsembleId]);

    const loadEnsembles = async () => {
        try {
            const data = await getEnsembles();
            setEnsembles(data || []);
            if (data && data.length > 0) {
                setSelectedEnsembleId(data[0].id);
            }
        } catch (err) {
            console.error('Failed to load ensembles', err);
        } finally {
            setLoading(false);
        }
    };

    const loadSectionsAndParts = async () => {
        if (!selectedEnsembleId) return;
        try {
            const sectionsData = await getEnsembleSections(selectedEnsembleId);
            setSections(sectionsData || []);

            const partsData = await getEnsembleParts({ ensemble_id: selectedEnsembleId });
            setParts(partsData || []);
        } catch (err) {
            console.error('Failed to load sections/parts', err);
        }
    };

    const handleAddSection = async (e) => {
        e.preventDefault();
        try {
            await createEnsembleSection({
                ensemble_id: selectedEnsembleId,
                name: newSectionName,
                display_order: sections.length,
            });
            setNewSectionName('');
            setIsAddSectionModalOpen(false);
            loadSectionsAndParts();
        } catch (err) {
            alert('Failed to add section: ' + err.message);
        }
    };

    const handleAddPart = async (e) => {
        e.preventDefault();
        try {
            const section = sections.find((s) => s.id === selectedSectionId);
            const sectionParts = parts.filter((p) => p.section_id === selectedSectionId);

            await createEnsemblePart({
                section_id: selectedSectionId,
                name: newPartName,
                display_order: sectionParts.length,
            });
            setNewPartName('');
            setIsAddPartModalOpen(false);
            setSelectedSectionId(null);
            loadSectionsAndParts();
        } catch (err) {
            alert('Failed to add part: ' + err.message);
        }
    };

    const handleDeleteSection = async (sectionId) => {
        if (!confirm('Delete this section? All parts in this section will also be deleted.')) return;
        try {
            await deleteEnsembleSection(sectionId);
            loadSectionsAndParts();
        } catch (err) {
            alert('Failed to delete section: ' + err.message);
        }
    };

    const handleDeletePart = async (partId) => {
        if (!confirm('Delete this part?')) return;
        try {
            await deleteEnsemblePart(partId);
            loadSectionsAndParts();
        } catch (err) {
            alert('Failed to delete part: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <p className="text-gray-300">Loading...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2 drop-shadow-lg flex items-center gap-3">
                    <Settings className="w-8 h-8" />
                    Ensemble Settings
                </h1>
                <p className="text-sm md:text-base text-gray-200">Configure sections and parts for your ensemble</p>
            </div>

            {/* Ensemble Selector */}
            {ensembles.length > 1 && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-200 mb-2">Select Ensemble</label>
                    <select
                        value={selectedEnsembleId || ''}
                        onChange={(e) => setSelectedEnsembleId(parseInt(e.target.value))}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        {ensembles.map((ens) => (
                            <option key={ens.id} value={ens.id}>
                                {ens.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Sections & Parts */}
            <div className="bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/30 shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/20 flex items-center justify-between bg-white/5">
                    <h2 className="text-lg font-semibold text-white">Sections & Parts</h2>
                    <button
                        onClick={() => setIsAddSectionModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 min-h-[44px] bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add Section
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {sections.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-300 mb-4">No sections configured yet</p>
                            <button
                                onClick={() => setIsAddSectionModalOpen(true)}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
                            >
                                Add Your First Section
                            </button>
                        </div>
                    ) : (
                        sections.map((section) => {
                            const sectionParts = parts.filter((p) => p.section_id === section.id);
                            return (
                                <div key={section.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-white">{section.name}</h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedSectionId(section.id);
                                                    setIsAddPartModalOpen(true);
                                                }}
                                                className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors"
                                            >
                                                Add Part
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSection(section.id)}
                                                className="p-2 text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {sectionParts.length === 0 ? (
                                        <p className="text-sm text-gray-400">No parts configured</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {sectionParts.map((part) => (
                                                <div
                                                    key={part.id}
                                                    className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-400/30"
                                                >
                                                    <span className="text-sm font-medium">{part.name}</span>
                                                    <button
                                                        onClick={() => handleDeletePart(part.id)}
                                                        className="text-purple-300 hover:text-red-300 transition-colors"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Add Section Modal */}
            {isAddSectionModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-white/20">
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-xl font-semibold text-white">Add Section</h2>
                        </div>
                        <form onSubmit={handleAddSection} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-200 mb-2">Section Name</label>
                                <input
                                    type="text"
                                    value={newSectionName}
                                    onChange={(e) => setNewSectionName(e.target.value)}
                                    placeholder="e.g., Soprano, Trumpet, Violin"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddSectionModalOpen(false);
                                        setNewSectionName('');
                                    }}
                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
                                >
                                    Add Section
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Part Modal */}
            {isAddPartModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-white/20">
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-xl font-semibold text-white">Add Part</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Section: {sections.find((s) => s.id === selectedSectionId)?.name}
                            </p>
                        </div>
                        <form onSubmit={handleAddPart} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-200 mb-2">Part Name</label>
                                <input
                                    type="text"
                                    value={newPartName}
                                    onChange={(e) => setNewPartName(e.target.value)}
                                    placeholder="e.g., S1, S2, Alto 1"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddPartModalOpen(false);
                                        setNewPartName('');
                                        setSelectedSectionId(null);
                                    }}
                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
                                >
                                    Add Part
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
