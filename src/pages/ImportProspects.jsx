import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Download, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function ImportProspects() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [results, setResults] = useState(null);

    let directorId = localStorage.getItem('directorId');

    // Fallback: if no directorId, try to set it to 1 (for testing)
    if (!directorId || directorId === 'null' || directorId === 'undefined') {
        console.warn('No directorId found in localStorage, using fallback ID 1');
        directorId = '1';
        localStorage.setItem('directorId', '1');
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setResults(null);
        } else {
            alert('Please select a valid CSV file');
        }
    };

    const parseCSV = (text) => {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) return [];

        // Parse CSV line handling quoted values
        const parseLine = (line) => {
            const values = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];

                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());
            return values;
        };

        const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z_]/g, '_'));
        const prospects = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseLine(lines[i]);
            const prospect = {};

            headers.forEach((header, index) => {
                if (values[index] && values[index].trim()) {
                    prospect[header] = values[index].replace(/^"|"$/g, ''); // Remove surrounding quotes
                }
            });

            // Only add if has required fields
            if (prospect.first_name && prospect.last_name && prospect.email) {
                prospects.push(prospect);
            }
        }

        return prospects;
    };

    const handleImport = async () => {
        if (!file) return;

        setImporting(true);

        try {
            const text = await file.text();
            console.log('CSV text:', text.substring(0, 200)); // First 200 chars

            const prospects = parseCSV(text);
            console.log('Parsed prospects:', prospects);
            console.log('Director ID:', directorId);
            console.log('API URL:', import.meta.env.VITE_API_URL);

            const url = `${import.meta.env.VITE_API_URL}/api/recruiting/prospects/bulk-import`;
            console.log('Fetching:', url);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    director_id: parseInt(directorId),
                    prospects
                })
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Success data:', data);
            setResults(data);
        } catch (err) {
            console.error('Full error:', err);
            console.error('Error name:', err.name);
            console.error('Error message:', err.message);
            console.error('Error stack:', err.stack);
            alert(`Failed to import CSV: ${err.message}\n\nCheck browser console (F12) for details.`);
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = () => {
        const template = `first_name,last_name,email,phone,high_school,graduation_year,gpa,voice_part,instrument,years_experience,interest_level,source,notes
John,Doe,john.doe@example.com,555-1234,Lincoln High School,2025,3.8,Tenor,Piano,8,hot,Honor Choir,Great audition
Jane,Smith,jane.smith@example.com,555-5678,Washington High,2026,3.9,Soprano,Violin,6,warm,Festival,Interested in scholarship`;

        const blob = new Blob([template], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'prospects-template.csv';
        a.click();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/director/recruiting')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Import Prospects from CSV</h1>
                        <p className="text-white/60">Bulk import prospects from a CSV file</p>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        CSV Format Instructions
                    </h2>
                    <div className="text-white/80 space-y-2 text-sm">
                        <p><strong>Required columns:</strong> first_name, last_name, email</p>
                        <p><strong>Optional columns:</strong> phone, high_school, graduation_year, gpa, voice_part, instrument, years_experience, interest_level, source, notes</p>
                        <p><strong>Interest levels:</strong> hot, warm, cold</p>
                        <p><strong>Voice parts:</strong> Soprano, Alto, Tenor, Bass</p>
                    </div>
                    <button
                        onClick={downloadTemplate}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Download Template
                    </button>
                </div>

                {/* Upload Section */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-8 mb-6">
                    <div className="text-center">
                        <div className="mb-6">
                            <FileText className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">Upload CSV File</h3>
                            <p className="text-white/60">Select a CSV file to import prospects</p>
                        </div>

                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="csv-upload"
                        />
                        <label
                            htmlFor="csv-upload"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer"
                        >
                            <Upload className="w-5 h-5" />
                            Choose CSV File
                        </label>

                        {file && (
                            <div className="mt-6 p-4 bg-white/5 rounded-lg">
                                <p className="text-white mb-4">
                                    <strong>Selected file:</strong> {file.name}
                                </p>
                                <button
                                    onClick={handleImport}
                                    disabled={importing}
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {importing ? 'Importing...' : 'Import Prospects'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results */}
                {results && (
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Import Results</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-green-300 mb-2">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-semibold">Imported</span>
                                </div>
                                <div className="text-3xl font-bold text-white">{results.imported}</div>
                            </div>

                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-yellow-300 mb-2">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="font-semibold">Skipped</span>
                                </div>
                                <div className="text-3xl font-bold text-white">{results.skipped}</div>
                            </div>

                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-red-300 mb-2">
                                    <XCircle className="w-5 h-5" />
                                    <span className="font-semibold">Errors</span>
                                </div>
                                <div className="text-3xl font-bold text-white">{results.errors}</div>
                            </div>
                        </div>

                        {results.details?.skipped?.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-white font-semibold mb-2">Skipped Prospects:</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {results.details.skipped.map((item, index) => (
                                        <div key={index} className="p-3 bg-yellow-500/10 rounded-lg text-sm">
                                            <div className="text-white">{item.prospect.first_name} {item.prospect.last_name} ({item.prospect.email})</div>
                                            <div className="text-yellow-300">{item.reason}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {results.details?.errors?.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-white font-semibold mb-2">Errors:</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {results.details.errors.map((item, index) => (
                                        <div key={index} className="p-3 bg-red-500/10 rounded-lg text-sm">
                                            <div className="text-white">{item.prospect.first_name} {item.prospect.last_name}</div>
                                            <div className="text-red-300">{item.error}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => navigate('/director/recruiting')}
                            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                        >
                            View Imported Prospects
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
