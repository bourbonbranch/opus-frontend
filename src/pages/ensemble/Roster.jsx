import React, { useState, useEffect, useRef } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { Plus, Upload, Edit, Trash2 } from 'lucide-react';
import { getRoster, addRosterMember, updateRosterMember, deleteRosterMember, importRoster, getEnsembleSections, getEnsembleParts } from '../../lib/opusApi';

export default function EnsembleRoster() {
    const { id } = useParams();
    const { ensemble } = useOutletContext();
    const fileInputRef = useRef(null);

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sectionFilter, setSectionFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [sections, setSections] = useState([]);
    const [parts, setParts] = useState([]);
    const [availableParts, setAvailableParts] = useState([]);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        section: '',
        part: '',
        pronouns: ''
    });

    useEffect(() => {
        loadMembers();
        loadSectionsAndParts();
    }, [id, sectionFilter]);

    // Update available parts when section changes
    useEffect(() => {
        if (formData.section) {
            const selectedSection = sections.find(s => s.name === formData.section);
            if (selectedSection) {
                const sectionParts = parts.filter(p => p.section_id === selectedSection.id);
                setAvailableParts(sectionParts);
            } else {
                setAvailableParts([]);
            }
        } else {
            setAvailableParts([]);
        }
    }, [formData.section, sections, parts]);

    const loadMembers = async () => {
        try {
            const data = await getRoster(id);
            setMembers(data || []);
        } catch (error) {
            console.error('Error loading members:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSectionsAndParts = async () => {
        try {
            const sectionsData = await getEnsembleSections(id);
            setSections(sectionsData || []);

            const partsData = await getEnsembleParts({ ensemble_id: id });
            setParts(partsData || []);
        } catch (error) {
            console.error('Error loading sections/parts:', error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target.result;
                const students = [];
                const rawLines = text.split('\n');
                let startIdx = 0;
                const headerMap = {
                    first_name: 0,
                    last_name: 1,
                    email: 2,
                    section: 3,
                    part: 4,
                    pronouns: 5,
                };

                // Detect header row
                if (rawLines.length > 0) {
                    const firstLine = rawLines[0].trim();
                    const firstCols = firstLine.split(',').map(p => p.trim().toLowerCase());
                    const headerKeywords = {
                        first_name: ['first name', 'first_name', 'firstname'],
                        last_name: ['last name', 'last_name', 'lastname'],
                        email: ['email'],
                        section: ['section'],
                        part: ['part'],
                        pronouns: ['pronoun', 'pronouns'],
                    };
                    const looksLikeHeader = firstCols.some(col =>
                        Object.values(headerKeywords).flat().includes(col)
                    );
                    if (looksLikeHeader) {
                        startIdx = 1;
                        firstCols.forEach((col, idx) => {
                            for (const [field, aliases] of Object.entries(headerKeywords)) {
                                if (aliases.includes(col)) {
                                    headerMap[field] = idx;
                                }
                            }
                        });
                    }
                }

                for (let i = startIdx; i < rawLines.length; i++) {
                    const line = rawLines[i].trim();
                    if (!line) continue;
                    const rawParts = line.split(',').map(p => p.trim());
                    while (rawParts.length < 6) rawParts.push('');
                    if (rawParts.length > 6) {
                        const extra = rawParts.slice(6).join(',');
                        rawParts[5] = rawParts[5] + (rawParts[5] ? ', ' : '') + extra;
                        rawParts.length = 6;
                    }
                    const student = {
                        first_name: rawParts[headerMap.first_name] || '',
                        last_name: rawParts[headerMap.last_name] || '',
                        email: rawParts[headerMap.email] || '',
                        section: rawParts[headerMap.section] || '',
                        part: rawParts[headerMap.part] || '',
                        pronouns: rawParts[headerMap.pronouns] || '',
                    };
                    if (student.first_name && student.last_name) {
                        students.push(student);
                    }
                }

                if (students.length === 0) {
                    alert('No valid students found in CSV. Format should be: First Name, Last Name, Email, Section, Part, Pronouns');
                    return;
                }

                if (confirm(`Found ${students.length} students. Import them?`)) {
                    await importRoster(id, students);
                    alert(`Successfully imported ${students.length} students!`);
                    loadMembers();
                }
            } catch (err) {
                console.error('Error parsing CSV:', err);
                alert('Failed to parse CSV: ' + err.message);
            } finally {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.readAsText(file);
    };

    const openAddModal = () => {
        setEditingStudent(null);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            section: '',
            part: '',
            pronouns: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (student) => {
        setEditingStudent(student);
        setFormData({
            firstName: student.first_name,
            lastName: student.last_name,
            email: student.email || '',
            section: student.section || '',
            part: student.part || '',
            pronouns: student.pronouns || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                section: formData.section,
                part: formData.part,
                pronouns: formData.pronouns
            };

            if (editingStudent) {
                await updateRosterMember(editingStudent.id, payload);
            } else {
                await addRosterMember({ ...payload, ensemble_id: id });
            }

            setIsModalOpen(false);
            loadMembers();
        } catch (error) {
            alert('Failed to save student: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (studentId) => {
        if (!confirm('Are you sure you want to remove this student from the roster?')) return;
        try {
            await deleteRosterMember(studentId);
            loadMembers();
        } catch (error) {
            alert('Failed to delete student: ' + error.message);
        }
    };

    const uniqueSections = [...new Set(members.map(m => m.section).filter(Boolean))];

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <select
                        value={sectionFilter}
                        onChange={(e) => setSectionFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white"
                    >
                        <option value="">All Sections</option>
                        {uniqueSections.map(section => (
                            <option key={section} value={section}>{section}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".csv"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <Upload className="w-4 h-4" />
                        Import CSV
                    </button>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Student
                    </button>
                </div>
            </div>

            {/* Members Table */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                {members.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-white/60 mb-4">No students in this ensemble yet</p>
                        <button
                            onClick={openAddModal}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                        >
                            Add Your First Student
                        </button>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                                    Section
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                                    Part
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                                    Pronouns
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {members.map((member) => (
                                <tr key={member.id} className="hover:bg-white/5">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                                <span className="text-sm font-semibold text-white">
                                                    {member.first_name?.[0]}{member.last_name?.[0]}
                                                </span>
                                            </div>
                                            <span className="font-medium text-white">
                                                {member.first_name} {member.last_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-white/80">
                                        {member.email || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {member.section && (
                                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
                                                {member.section}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {member.part && (
                                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full">
                                                {member.part}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-white/80 text-sm">
                                        {member.pronouns || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => openEditModal(member)}
                                            className="text-purple-300 hover:text-purple-200 mr-3"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(member.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-white/20">
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-xl font-semibold text-white">
                                {editingStudent ? 'Edit Student' : 'Add Student'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
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
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Section
                                </label>
                                <select
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value, part: '' })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
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
                                    value={formData.part}
                                    onChange={(e) => setFormData({ ...formData, part: e.target.value })}
                                    disabled={!formData.section}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50"
                                >
                                    <option value="">Select a part...</option>
                                    {availableParts.map((part) => (
                                        <option key={part.id} value={part.name}>
                                            {part.name}
                                        </option>
                                    ))}
                                </select>
                                {!formData.section && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Select a section first
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Pronouns
                                </label>
                                <input
                                    type="text"
                                    value={formData.pronouns}
                                    onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
                                    placeholder="e.g., he/him, she/her, they/them"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : (editingStudent ? 'Update' : 'Add Student')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
