import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';

export default function EnsembleRoster() {
    const { id } = useParams();
    const { ensemble } = useOutletContext();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sectionFilter, setSectionFilter] = useState('');

    useEffect(() => {
        loadMembers();
    }, [id, sectionFilter]);

    const loadMembers = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';
            let url = `${API_URL}/api/ensembles/${id}/members`;
            if (sectionFilter) {
                url += `?section=${sectionFilter}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            setMembers(data || []);
        } catch (error) {
            console.error('Error loading members:', error);
        } finally {
            setLoading(false);
        }
    };

    const sections = [...new Set(members.map(m => m.section).filter(Boolean))];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <select
                        value={sectionFilter}
                        onChange={(e) => setSectionFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white"
                    >
                        <option value="">All Sections</option>
                        {sections.map(section => (
                            <option key={section} value={section}>{section}</option>
                        ))}
                    </select>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Member
                </button>
            </div>

            {/* Members Table */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                                Section
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                                Part
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {members.map((member) => (
                            <tr key={member.id} className="hover:bg-white/5">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-white font-medium">
                                        {member.first_name} {member.last_name}
                                    </div>
                                    {member.pronouns && (
                                        <div className="text-white/60 text-sm">{member.pronouns}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-white/80">
                                    {member.section || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-white/80">
                                    {member.part || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-white/80">
                                    {member.email || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded ${member.status === 'active'
                                            ? 'bg-green-500/20 text-green-300'
                                            : 'bg-gray-500/20 text-gray-300'
                                        }`}>
                                        {member.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {members.length === 0 && (
                    <div className="text-center py-12 text-white/60">
                        No members found
                    </div>
                )}
            </div>
        </div>
    );
}
