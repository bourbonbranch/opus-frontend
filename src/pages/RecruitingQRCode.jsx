import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, Download, Copy, Check } from 'lucide-react';
import QRCodeLib from 'qrcode';

export default function RecruitingQRCode() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [qrImageUrl, setQrImageUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        expires_at: ''
    });

    const directorId = localStorage.getItem('directorId');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recruiting/qr-codes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    director_id: directorId,
                    created_by: directorId,
                    form_config: {
                        fields: ['first_name', 'last_name', 'email', 'phone', 'high_school', 'graduation_year', 'voice_part'],
                        required: ['first_name', 'last_name', 'email', 'graduation_year']
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                setQrCode(data);

                // Generate QR code image
                const qrDataUrl = await QRCodeLib.toDataURL(data.url, {
                    width: 400,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                setQrImageUrl(qrDataUrl);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to create QR code');
            }
        } catch (err) {
            console.error('Error creating QR code:', err);
            alert('Failed to create QR code');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(qrCode.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadQRCode = () => {
        const link = document.createElement('a');
        link.download = `${formData.name.replace(/\s+/g, '-')}-qr-code.png`;
        link.href = qrImageUrl;
        link.click();
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
                        <h1 className="text-3xl font-bold text-white mb-2">Generate Recruiting QR Code</h1>
                        <p className="text-white/60">Create a QR code for conferences, festivals, and workshops</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Form */}
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-2">
                                    Event Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., ACDA 2024, State Honor Choir"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Add details about this recruiting event..."
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-2">Expiration Date (Optional)</label>
                                <input
                                    type="date"
                                    name="expires_at"
                                    value={formData.expires_at}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50"
                            >
                                <QrCode className="w-5 h-5" />
                                {loading ? 'Generating...' : 'Generate QR Code'}
                            </button>
                        </form>

                        {qrCode && (
                            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <p className="text-green-300 text-sm font-medium mb-2">✓ QR Code Generated Successfully!</p>
                                <p className="text-white/60 text-xs">
                                    Scans: {qrCode.scan_count} | Submissions: {qrCode.submission_count}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* QR Code Display */}
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        {qrCode ? (
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-lg">
                                    <img src={qrImageUrl} alt="QR Code" className="w-full" />
                                </div>

                                <div>
                                    <label className="block text-white/80 text-sm font-medium mb-2">Shareable Link</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={qrCode.url}
                                            readOnly
                                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                        />
                                        <button
                                            onClick={copyToClipboard}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                        >
                                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={downloadQRCode}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    <Download className="w-5 h-5" />
                                    Download QR Code
                                </button>

                                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                    <h3 className="text-blue-300 font-medium mb-2">How to Use</h3>
                                    <ul className="text-white/60 text-sm space-y-1">
                                        <li>• Print the QR code on flyers or posters</li>
                                        <li>• Display it at your booth or table</li>
                                        <li>• Students scan with their phone camera</li>
                                        <li>• They fill out a quick form</li>
                                        <li>• Automatically added to your prospects!</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-white/40">
                                <div className="text-center">
                                    <QrCode className="w-24 h-24 mx-auto mb-4 opacity-20" />
                                    <p>Generate a QR code to get started</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
