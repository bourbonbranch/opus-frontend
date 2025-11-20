import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UploadIcon, UsersIcon, PlusIcon } from 'lucide-react';
import { getRoster, addRosterMember } from '../lib/opusApi';

export default function Roster() {
  const { ensembleId } = useParams();
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ensembleId) {
      loadRoster();
    }
  }, [ensembleId]);

  const loadRoster = async () => {
    try {
      const data = await getRoster(ensembleId);
      setRoster(data || []);
    } catch (err) {
      console.error('Failed to load roster', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const students = [
    { id: 1, name: 'Emma Johnson', email: 'emma.j@school.edu', section: 'Soprano' },
    { id: 2, name: 'Olivia Smith', email: 'olivia.s@school.edu', section: 'Soprano' },
    { id: 3, name: 'Sarah Williams', email: 'sarah.w@school.edu', section: 'Alto' },
    { id: 4, name: 'Michael Chen', email: 'michael.c@school.edu', section: 'Tenor' },
    { id: 5, name: 'David Martinez', email: 'david.m@school.edu', section: 'Bass' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2 drop-shadow-lg">
            Roster Management
          </h1>
          <p className="text-gray-200">Manage your ensemble members</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-colors">
            <UploadIcon className="w-5 h-5" />
            Import CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-2xl shadow-purple-500/50 border border-white/20">
            <PlusIcon className="w-5 h-5" />
            Add Student
          </button>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/30 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/20 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-purple-300" />
            <h2 className="text-lg font-semibold text-white">Students</h2>
            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-sm font-medium rounded-full">
              {students.length}
            </span>
          </div>
        </div>

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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                        <span className="text-sm font-semibold text-white">
                          {student.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </span>
                      </div>
                      <span className="font-medium text-white">
                        {student.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{student.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-medium rounded-full border border-purple-400/30">
                      {student.section}
                    </span>
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
      </div>
    </div>
  );
}
