import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { Save } from 'lucide-react';

export default function EnsembleSettings() {
    const { id } = useParams();
    const { ensemble, refreshEnsemble } = useOutletContext();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        short_code: '',
        type: '',
        color_hex: '',
        organization_name: '',
        level: '',
        size: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (ensemble) {
            setFormData({
                name: ensemble.name || '',
                description: ensemble.description || '',
                short_code: ensemble.short_code || '',
                type: ensemble.type || '',
                color_hex: ensemble.color_hex || '#8b5cf6',
                organization_name: ensemble.organization_name || '',
                level: ensemble.level || '',
                size: ensemble.size || ''
            });
        }
    }, [ensemble]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';
            const response = await fetch(`${API_URL}/api/ensembles/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Settings saved successfully');
                refreshEnsemble();
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Basic Information</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1">
                                Ensemble Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1">
                                Short Code
                            </label>
                            <input
                                type="text"
                                value={formData.short_code}
                                onChange={(e) => setFormData({ ...formData, short_code: e.target.value })}
                                placeholder="e.g., ChCh"
                                maxLength={10}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">
                                    Type
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                >
                                    <option value="choir">Choir</option>
                                    <option value="band">Band</option>
                                    <option value="orchestra">Orchestra</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">
                                    Color
                                </label>
                                <input
                                    type="color"
                                    value={formData.color_hex}
                                    onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
                                    className="w-full h-10 bg-white/5 border border-white/10 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
