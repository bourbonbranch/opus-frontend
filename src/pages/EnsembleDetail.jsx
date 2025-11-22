import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Settings, Plus, Trash2, Users, ArrowLeft } from 'lucide-react';
import {
    getEnsembles,
    getEnsembleSections,
    getEnsembleParts,
    createEnsembleSection,
    createEnsemblePart,
    deleteEnsembleSection,
    deleteEnsemblePart,
    getRoster,
} from '../lib/opusApi';

export default function EnsembleDetail() {
    const { ensembleId } = useParams();
    const navigate = useNavigate();
    const [ensemble, setEnsemble] = useState(null);
    const [sections, setSections] = useState([]);
    const [parts, setParts] = useState([]);
    const [roster, setRoster] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
    const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [newSectionName, setNewSectionName] = useState('');
    const [newPartName, setNewPartName] = useState('');

    useEffect(() => {
        loadEnsembleData();
    }, [ensembleId]);

    const loadEnsembleData = async () => {
        try {
            const ensembles = await getEnsembles();
            const currentEnsemble = ensembles.find((e) => e.id === parseInt(ensembleId));
            setEnsemble(currentEnsemble);

            const sectionsData = await getEnsembleSections(ensembleId);
            setSections(sectionsData || []);

            const partsData = await getEnsembleParts({ ensemble_id: ensembleId });
            setParts(partsData || []);

            const rosterData = await getRoster(ensembleId);
            setRoster(rosterData || []);
        } catch (err) {
            console.error('Failed to load ensemble data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSection = async (e) => {
        e.preventDefault();
        try {
            await createEnsembleSection({
                ensemble_id: ensembleId,
                name: newSectionName,
                display_order: sections.length,
            });
            setNewSectionName('');
            setIsAddSectionModalOpen(false);
            loadEnsembleData();
        } catch (err) {
            alert('Failed to add section: ' + err.message);
        }
    };

    const handleAddPart = async (e) => {
        e.preventDefault();
        try {
            const sectionParts = parts.filter((p) => p.section_id === selectedSectionId);
            await createEnsemblePart({
                section_id: selectedSectionId,
                name: newPartName,
                display_order: sectionParts.length,
            });
            setNewPartName('');
            setIsAddPartModalOpen(false);
            setSelectedSectionId(null);
            loadEnsembleData();
        } catch (err) {
            alert('Failed to add part: ' + err.message);
        }
    };

    const handleDeleteSection = async (sectionId) => {
        if (!confirm('Delete this section? All parts in this section will also be deleted.')) return;
        try {
            await deleteEnsembleSection(sectionId);
            loadEnsembleData();
        } catch (err) {
            alert('Failed to delete section: ' + err.message);
        }
    };

    const handleDeletePart = async (partId) => {
        if (!confirm('Delete this part?')) return;
        try {
            await deleteEnsemblePart(partId);
            loadEnsembleData();
        } catch (err) {
            alert('Failed to delete part: ' + err.message);
        }
    };

    const handleDeleteEnsemble = async () => {
        if (!confirm('Are you sure you want to delete this ensemble? This action cannot be undone.')) return;

        // Double confirmation for safety
        const ensembleName = ensemble?.name || 'this ensemble';
        const confirmation = prompt(`To confirm deletion, please type "${ensembleName}" below:`);

        if (confirmation !== ensembleName) {
            alert('Ensemble name did not match. Deletion cancelled.');
            return;
        }

        try {
            await import('../lib/opusApi').then(mod => mod.deleteEnsemble(ensembleId));
            navigate('/director/today');
        } catch (err) {
            alert('Failed to delete ensemble: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="p-8 max-w-6xl mx-auto">
                <p className="text-gray-300">Loading...</p>
            </div>
        );
    }

    if (!ensemble) {
        return (
            <div className="p-8 max-w-6xl mx-auto">
                <p className="text-gray-300">Ensemble not found</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <Link
                    to="/director/today"
                    className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
                <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2 drop-shadow-lg">
                    {ensemble.name}
                </h1>
                <p className="text-sm md:text-base text-gray-200">
                    {ensemble.type} • {roster.length} members
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-3xl rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-purple-400" />
                        <div>
                            <p className="text-sm text-gray-300">Total Members</p>
                            <p className="text-2xl font-bold text-white">{roster.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/10 backdrop-blur-3xl rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                        <Settings className="w-8 h-8 text-blue-400" />
                        <div>
                            <p className="text-sm text-gray-300">Sections</p>
                            <p className="text-2xl font-bold text-white">{sections.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/10 backdrop-blur-3xl rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                        <Settings className="w-8 h-8 text-green-400" />
                        <div>
                            <p className="text-sm text-gray-300">Parts</p>
                            <p className="text-2xl font-bold text-white">{parts.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sections & Parts Configuration */}
            <div className="bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/30 shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/20 flex items-center justify-between bg-white/5">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Sections & Parts</h2>
                        <p className="text-sm text-gray-400">Configure sections and parts for this ensemble</p>
                    </div>
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

            {/* Danger Zone */}
            <div className="mt-8 bg-red-500/10 backdrop-blur-3xl rounded-2xl border border-red-500/30 shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-red-500/20 flex items-center gap-2 bg-red-500/5">
                    <Trash2 className="w-5 h-5 text-red-400" />
                    <h2 className="text-lg font-semibold text-red-100">Danger Zone</h2>
                </div>
                <div className="p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-medium mb-1">Delete Ensemble</h3>
                        <p className="text-sm text-red-200/70">
                            Permanently delete this ensemble and all its data (roster, events, etc). This action cannot be undone.
                        </p>
                    </div>
                    <button
                        onClick={handleDeleteEnsemble}
                        className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl font-medium hover:bg-red-500/30 hover:text-red-200 transition-all"
                    >
                        Delete Ensemble
                    </button>
                </div>
            </div>
        </div>
    );
}
