import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Upload, File, Music } from 'lucide-react';

export default function EnsembleLibrary() {
    const { id } = useParams();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadData, setUploadData] = useState({
        title: '',
        file_type: 'sheet_music',
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

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

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file type
            if (file.type !== 'application/pdf') {
                alert('Please select a PDF file');
                return;
            }
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
            // Auto-fill title from filename if empty
            if (!uploadData.title) {
                setUploadData({ ...uploadData, title: file.name.replace('.pdf', '') });
            }
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert('Please select a file');
            return;
        }

        setUploading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';
            const directorId = localStorage.getItem('directorId');

            // Convert file to base64
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsDataURL(selectedFile);
            });

            const response = await fetch(`${API_URL}/api/ensembles/${id}/files`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: uploadData.title,
                    file_type: uploadData.file_type,
                    storage_url: base64,
                    file_size: selectedFile.size,
                    uploaded_by: directorId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            await loadFiles();
            setIsUploadModalOpen(false);
            setUploadData({ title: '', file_type: 'sheet_music' });
            setSelectedFile(null);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Library</h2>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
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

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-4">Upload File</h3>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={uploadData.title}
                                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    placeholder="e.g., Symphony No. 5"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    File Type
                                </label>
                                <select
                                    value={uploadData.file_type}
                                    onChange={(e) => setUploadData({ ...uploadData, file_type: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                >
                                    <option value="sheet_music">Sheet Music</option>
                                    <option value="audio">Audio</option>
                                    <option value="video">Video</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    PDF File
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileSelect}
                                    required
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700"
                                />
                                {selectedFile && (
                                    <p className="text-xs text-green-400 mt-2">
                                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                    </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                    PDF files only, max 10MB
                                </p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
