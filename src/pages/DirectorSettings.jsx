import React, { useState, useEffect } from 'react';
import { Settings, CreditCard, CheckCircle, XCircle, ExternalLink, User, Mail, Shield } from 'lucide-react';

export default function DirectorSettings() {
    const [directorInfo, setDirectorInfo] = useState({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        role: '',
    });
    const [stripeStatus, setStripeStatus] = useState({
        connected: false,
        accountId: null,
        loading: true,
    });
    const [connecting, setConnecting] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';

    useEffect(() => {
        loadDirectorInfo();
        loadStripeStatus();
    }, []);

    const loadDirectorInfo = () => {
        const id = localStorage.getItem('directorId');
        const firstName = localStorage.getItem('directorFirstName') || '';
        const lastName = localStorage.getItem('directorLastName') || '';
        const email = localStorage.getItem('directorEmail') || '';
        const role = localStorage.getItem('directorRole') || 'Director';

        setDirectorInfo({ id, firstName, lastName, email, role });
    };

    const loadStripeStatus = async () => {
        try {
            const directorId = localStorage.getItem('directorId');
            if (!directorId) return;

            const response = await fetch(`${API_URL}/api/directors/${directorId}/stripe/status`);
            if (response.ok) {
                const data = await response.json();
                setStripeStatus({
                    connected: data.connected,
                    accountId: data.accountId,
                    loading: false,
                });
            } else {
                setStripeStatus({ connected: false, accountId: null, loading: false });
            }
        } catch (err) {
            console.error('Error loading Stripe status:', err);
            setStripeStatus({ connected: false, accountId: null, loading: false });
        }
    };

    const handleConnectStripe = async () => {
        setConnecting(true);
        try {
            const directorId = localStorage.getItem('directorId');
            const response = await fetch(`${API_URL}/api/directors/${directorId}/stripe/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: directorInfo.email,
                    return_url: window.location.origin + '/director/settings',
                }),
            });

            if (response.ok) {
                const data = await response.json();
                // Redirect to Stripe Connect onboarding
                window.location.href = data.url;
            } else {
                alert('Failed to initiate Stripe Connect. Please try again.');
            }
        } catch (err) {
            console.error('Error connecting Stripe:', err);
            alert('Error connecting to Stripe. Please try again.');
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnectStripe = async () => {
        if (!confirm('Are you sure you want to disconnect your Stripe account? This will disable payment processing.')) {
            return;
        }

        try {
            const directorId = localStorage.getItem('directorId');
            const response = await fetch(`${API_URL}/api/directors/${directorId}/stripe/disconnect`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setStripeStatus({ connected: false, accountId: null, loading: false });
                alert('Stripe account disconnected successfully.');
            } else {
                alert('Failed to disconnect Stripe account.');
            }
        } catch (err) {
            console.error('Error disconnecting Stripe:', err);
            alert('Error disconnecting Stripe account.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Settings className="w-8 h-8 text-purple-300" />
                        <h1 className="text-3xl font-bold text-white">Settings</h1>
                    </div>
                    <p className="text-gray-200">Manage your account and integrations</p>
                </div>

                {/* Account Information */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-300" />
                        Account Information
                    </h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                                    {directorInfo.firstName || 'Not set'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                                    {directorInfo.lastName || 'Not set'}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email
                            </label>
                            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                                {directorInfo.email || 'Not set'}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Role
                            </label>
                            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white capitalize">
                                {directorInfo.role}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stripe Integration */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-green-300" />
                        Payment Processing
                    </h2>

                    {stripeStatus.loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                            <p className="text-gray-300">Loading Stripe status...</p>
                        </div>
                    ) : stripeStatus.connected ? (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-green-500/20 border border-green-400/30 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-green-200 mb-1">Stripe Connected</h3>
                                    <p className="text-sm text-green-100">
                                        Your Stripe account is connected and ready to accept payments.
                                    </p>
                                    {stripeStatus.accountId && (
                                        <p className="text-xs text-green-200 mt-2 font-mono">
                                            Account ID: {stripeStatus.accountId}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <a
                                    href="https://dashboard.stripe.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all border border-white/20"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Open Stripe Dashboard
                                </a>
                                <button
                                    onClick={handleDisconnectStripe}
                                    className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-400/30 rounded-lg font-medium hover:bg-red-500/30 transition-all"
                                >
                                    Disconnect Account
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                                <XCircle className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-yellow-200 mb-1">Stripe Not Connected</h3>
                                    <p className="text-sm text-yellow-100">
                                        Connect your Stripe account to accept payments for fees, fundraising, and tickets.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <h4 className="font-medium text-white mb-2">What you'll need:</h4>
                                <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                                    <li>Business or personal information</li>
                                    <li>Bank account details for payouts</li>
                                    <li>Tax identification number (EIN or SSN)</li>
                                </ul>
                            </div>

                            <button
                                onClick={handleConnectStripe}
                                disabled={connecting}
                                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {connecting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Connecting...
                                    </span>
                                ) : (
                                    'Connect Stripe Account'
                                )}
                            </button>

                            <p className="text-xs text-gray-400 text-center">
                                By connecting, you agree to Stripe's{' '}
                                <a href="https://stripe.com/connect-account/legal" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">
                                    Connected Account Agreement
                                </a>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
