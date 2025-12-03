import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MusicIcon, CheckIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { createEnsemble } from '../lib/opusApi';

export default function AddEnsemble() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: 'choir',
    school: '',
    level: 'high-school',
    size: '',
  });
  const [sections, setSections] = useState([
    { id: 1, name: 'Soprano', parts: ['Soprano 1', 'Soprano 2'] },
    { id: 2, name: 'Alto', parts: ['Alto 1', 'Alto 2'] },
    { id: 3, name: 'Tenor', parts: ['Tenor 1', 'Tenor 2'] },
    { id: 4, name: 'Bass', parts: ['Bass 1', 'Bass 2'] }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const directorId = localStorage.getItem('directorId');
      if (!directorId) {
        navigate('/signup');
        return;
      }

      await createEnsemble({
        ...formData,
        director_id: parseInt(directorId),
        sections: sections.map(s => ({
          name: s.name,
          parts: s.parts
        }))
      });

      // Navigate to dashboard
      navigate('/director/today');
    } catch (err) {
      console.error('Create ensemble error:', err);
      setError(err.message || 'Failed to create ensemble');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Section Management
  const addSection = () => {
    setSections([...sections, { id: Date.now(), name: '', parts: [] }]);
  };

  const removeSection = (id) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const updateSectionName = (id, name) => {
    setSections(sections.map(s => s.id === id ? { ...s, name } : s));
  };

  // Part Management
  const addPart = (sectionId) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, parts: [...s.parts, ''] };
      }
      return s;
    }));
  };

  const removePart = (sectionId, index) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const newParts = [...s.parts];
        newParts.splice(index, 1);
        return { ...s, parts: newParts };
      }
      return s;
    }));
  };

  const updatePartName = (sectionId, index, value) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const newParts = [...s.parts];
        newParts[index] = value;
        return { ...s, parts: newParts };
      }
      return s;
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-xl">
              <MusicIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Opus</h1>
          </div>

          {/* Add Ensemble Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Create your ensemble</h2>
            <p className="text-gray-300 mb-6">Tell us about your choir, band, or orchestra</p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Basic Information</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Ensemble Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="e.g., Varsity Choir, Concert Band"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Ensemble Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    >
                      <option value="choir">Choir</option>
                      <option value="band">Band</option>
                      <option value="orchestra">Orchestra</option>
                      <option value="jazz-band">Jazz Band</option>
                      <option value="marching-band">Marching Band</option>
                      <option value="chamber">Chamber Ensemble</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Level
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    >
                      <option value="elementary">Elementary</option>
                      <option value="middle-school">Middle School</option>
                      <option value="high-school">High School</option>
                      <option value="college">College</option>
                      <option value="community">Community</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    School or Organization
                  </label>
                  <input
                    type="text"
                    name="school"
                    value={formData.school}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="e.g., Lincoln High School"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Approximate Size
                  </label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  >
                    <option value="">Select size</option>
                    <option value="1-25">1-25 members</option>
                    <option value="26-50">26-50 members</option>
                    <option value="51-75">51-75 members</option>
                    <option value="76-100">76-100 members</option>
                    <option value="100+">100+ members</option>
                  </select>
                </div>
              </div>

              {/* Sections & Parts Configuration */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="text-lg font-semibold text-white">Sections & Parts</h3>
                  <button
                    type="button"
                    onClick={addSection}
                    className="text-sm text-purple-300 hover:text-purple-200 flex items-center gap-1"
                  >
                    <PlusIcon className="w-4 h-4" /> Add Section
                  </button>
                </div>

                <div className="space-y-4">
                  {sections.map((section) => (
                    <div key={section.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="text"
                          value={section.name}
                          onChange={(e) => updateSectionName(section.id, e.target.value)}
                          placeholder="Section Name (e.g. Soprano)"
                          className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeSection(section.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          title="Remove Section"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="pl-4 border-l-2 border-white/10 space-y-2">
                        {section.parts.map((part, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={part}
                              onChange={(e) => updatePartName(section.id, index, e.target.value)}
                              placeholder="Part Name (e.g. Soprano 1)"
                              className="flex-1 px-3 py-1.5 bg-black/20 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => removePart(section.id, index)}
                              className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <TrashIcon className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addPart(section.id)}
                          className="text-xs text-blue-300 hover:text-blue-200 flex items-center gap-1 mt-2"
                        >
                          <PlusIcon className="w-3 h-3" /> Add Part
                        </button>
                      </div>
                    </div>
                  ))}

                  {sections.length === 0 && (
                    <div className="text-center py-8 text-gray-400 bg-white/5 rounded-xl border border-dashed border-white/10">
                      No sections defined. Click "Add Section" to start.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => navigate('/director/today')}
                  className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow-xl hover:shadow-purple-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'Creating...'
                  ) : (
                    <>
                      <span>Create Ensemble</span>
                      <CheckIcon className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
