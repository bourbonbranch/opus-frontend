import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Upload, File, Music } from 'lucide-react';

export default function EnsembleLibrary() {
    const { id } = useParams();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFiles();
    }, [id]);

    const loadFiles = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';
            const response = await fetch(`${API_URL}/api/ensembles/${id}/files`);
            const data = await response.json();
            setFiles(data || []);
        } catch (error) {
            console.error('Error loading files:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Library</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload File
                </button>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                {files.length === 0 ? (
                    <div className="text-center py-12">
                        <File className="w-16 h-16 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60">No files yet</p>
                        <p className="text-white/40 text-sm mt-2">Upload sheet music, recordings, or other files</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {files.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                <div className="flex items-center gap-3">
                                    {file.file_type === 'audio' ? (
                                        <Music className="w-5 h-5 text-purple-400" />
                                    ) : (
                                        <File className="w-5 h-5 text-blue-400" />
                                    )}
                                    <div>
                                        <p className="text-white font-medium">{file.title}</p>
                                        {file.file_type && (
                                            <p className="text-white/60 text-sm uppercase">{file.file_type}</p>
                                        )}
                                    </div>
                                </div>
                                {file.created_at && (
                                    <span className="text-white/60 text-sm">
                                        {new Date(file.created_at).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
