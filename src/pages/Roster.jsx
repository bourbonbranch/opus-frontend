import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadIcon, UsersIcon, PlusIcon } from 'lucide-react';
import { getEnsembles, getRoster, addRosterMember, importRoster, getEnsembleSections, getEnsembleParts } from '../lib/opusApi';

export default function Roster() {
  const navigate = useNavigate();
  const fileInputRef = React.useRef(null);
  const [ensembles, setEnsembles] = useState([]);
  const [selectedEnsembleId, setSelectedEnsembleId] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    section: '',
    part: '',
    pronouns: '',
  });
  const [adding, setAdding] = useState(false);
  const [sections, setSections] = useState([]);
  const [parts, setParts] = useState([]);
  const [availableParts, setAvailableParts] = useState([]);

  useEffect(() => {
    loadEnsembles();
  }, []);

  useEffect(() => {
    if (selectedEnsembleId) {
      loadRoster();
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

  const loadRoster = async () => {
    if (!selectedEnsembleId) return;
    try {
      const data = await getRoster(selectedEnsembleId);
      setRoster(data || []);
    } catch (err) {
      console.error('Failed to load roster', err);
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

  // Update available parts when section changes
  useEffect(() => {
    if (newStudent.section) {
      const selectedSection = sections.find(s => s.name === newStudent.section);
      if (selectedSection) {
        const sectionParts = parts.filter(p => p.section_id === selectedSection.id);
        setAvailableParts(sectionParts);
      } else {
        setAvailableParts([]);
      }
    } else {
      setAvailableParts([]);
      // Clear part if section is cleared
      if (newStudent.part) {
        setNewStudent(prev => ({ ...prev, part: '' }));
      }
    }
  }, [newStudent.section, sections, parts]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n');
        const students = [];

        // Skip header if it exists (heuristic: checks if first line contains "name" or "email")
        let startIndex = 0;
        if (lines[0] && (lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('email'))) {
          startIndex = 1;
        }

        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Simple CSV parsing (handles basic commas)
          // Format: FirstName, LastName, Email, Section, Part, Pronouns
          const parts = line.split(',').map(p => p.trim());

          if (parts.length >= 2) {
            students.push({
              first_name: parts[0],
              last_name: parts[1],
              email: parts[2] || '',
              section: parts[3] || '',
              part: parts[4] || '',
              pronouns: parts[5] || ''
            });
          }
        }

        if (students.length === 0) {
          alert('No valid students found in CSV. Format should be: First Name, Last Name, Email, Section, Part, Pronouns');
          return;
        }

        if (confirm(`Found ${students.length} students. Import them?`)) {
          await importRoster(selectedEnsembleId, students);
          alert(`Successfully imported ${students.length} students!`);
          loadRoster();
        }
      } catch (err) {
        console.error('Error parsing CSV:', err);
        alert('Failed to parse CSV: ' + err.message);
      } finally {
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addRosterMember({
        ensemble_id: selectedEnsembleId,
        first_name: newStudent.firstName,
        last_name: newStudent.lastName,
        email: newStudent.email,
        section: newStudent.section,
        part: newStudent.part,
        pronouns: newStudent.pronouns,
      });
      setNewStudent({ firstName: '', lastName: '', email: '', section: '', part: '', pronouns: '' });
      setIsAddModalOpen(false);
      loadRoster();
    } catch (err) {
      alert('Failed to add student: ' + err.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <p className="text-gray-300">Loading...</p>
      </div>
    );
  }

  if (ensembles.length === 0) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="text-center py-12 bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/30">
          <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-4">No ensembles yet</p>
          <button
            onClick={() => navigate('/add-ensemble')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
          >
            Create Your First Ensemble
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2 drop-shadow-lg">
            Roster Management
          </h1>
          <p className="text-sm md:text-base text-gray-200">Manage your ensemble members</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
          >
            <UploadIcon className="w-5 h-5" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-2xl shadow-purple-500/50 border border-white/20"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Ensemble Selector */}
      {ensembles.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Select Ensemble
          </label>
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

      <div className="bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/30 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/20 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-purple-300" />
            <h2 className="text-lg font-semibold text-white">Students</h2>
            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-sm font-medium rounded-full">
              {roster.length}
            </span>
          </div>
        </div>

        {roster.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-300 mb-4">No students in this ensemble yet</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              Add Your First Student
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Part
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Pronouns
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {roster.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                          <span className="text-sm font-semibold text-white">
                            {student.first_name?.[0]}{student.last_name?.[0]}
                          </span>
                        </div>
                        <span className="font-medium text-white">
                          {student.first_name} {student.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{student.email}</td>
                    <td className="px-6 py-4">
                      {student.section && (
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-medium rounded-full border border-purple-400/30">
                          {student.section}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {student.part && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm font-medium rounded-full border border-blue-400/30">
                          {student.part}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {student.pronouns || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-purple-300 hover:text-purple-200 font-medium text-sm">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-white/20">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Add Student</h2>
            </div>
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={newStudent.firstName}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, firstName: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={newStudent.lastName}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, lastName: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Section
                </label>
                <select
                  value={newStudent.section}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, section: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a section...</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.name}>
                      {section.name}
                    </option>
                  ))}
                </select>
                {sections.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    No sections configured. Add sections in Ensemble Settings.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Part
                </label>
                <select
                  value={newStudent.part}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, part: e.target.value })
                  }
                  disabled={!newStudent.section}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select a part...</option>
                  {availableParts.map((part) => (
                    <option key={part.id} value={part.name}>
                      {part.name}
                    </option>
                  ))}
                </select>
                {!newStudent.section && (
                  <p className="text-xs text-gray-400 mt-1">
                    Select a section first
                  </p>
                )}
                {newStudent.section && availableParts.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    No parts configured for this section
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Pronouns
                </label>
                <input
                  type="text"
                  value={newStudent.pronouns}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, pronouns: e.target.value })
                  }
                  placeholder="e.g., he/him, she/her, they/them"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
