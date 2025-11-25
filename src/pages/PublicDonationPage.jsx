import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DollarSign, Heart, MessageSquare, User, Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function PublicDonationPage() {
    const { campaignSlug, token } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [donationStep, setDonationStep] = useState('form'); // form, processing, success

    const [formData, setFormData] = useState({
        amount: '',
        customAmount: '',
        donorName: '',
        donorEmail: '',
        message: '',
        isAnonymous: false
    });

    useEffect(() => {
        loadData();
    }, [campaignSlug, token]);

    const loadData = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';
            const response = await fetch(`${API_URL}/api/public/fundraising/${campaignSlug}/${token}`);

            if (!response.ok) throw new Error('Campaign not found');

            const result = await response.json();
            setData(result);
        } catch (err) {
            console.error('Error loading donation page:', err);
            setError('Campaign not found or link is invalid.');
        } finally {
            setLoading(false);
        }
    };

    const handleDonate = async (e) => {
        e.preventDefault();
        setDonationStep('processing');

        try {
            const amount = formData.amount === 'custom' ? parseFloat(formData.customAmount) : parseFloat(formData.amount);
            if (!amount || amount < 0.50) throw new Error('Minimum donation is $0.50');

            const API_URL = import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';

            const response = await fetch(`${API_URL}/api/public/fundraising/${campaignSlug}/${token}/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount_cents: Math.round(amount * 100),
                    donor_name: formData.donorName,
                    donor_email: formData.donorEmail,
                    message: formData.message,
                    is_anonymous: formData.isAnonymous
                })
            });

            if (!response.ok) throw new Error('Payment failed');

            const result = await response.json();

            // In a real app, we would redirect to Stripe Checkout or confirm PaymentIntent here.
            // Since we are mocking, we just show success.
            if (result.clientSecret) {
                setDonationStep('success');
                // Refresh data to show new total
                loadData();
            }

        } catch (err) {
            console.error('Donation error:', err);
            alert(err.message);
            setDonationStep('form');
        }
    };

    const formatCurrency = (cents) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(cents / 100);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    const { campaign, participant } = data;
    const percent = Math.min(100, Math.round((participant.total_raised_cents / participant.personal_goal_cents) * 100));

    if (donationStep === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h1>
                    <p className="text-gray-600 mb-6">
                        Your donation to support <strong>{participant.first_name}</strong> has been received.
                    </p>
                    <button
                        onClick={() => setDonationStep('form')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Make another donation
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Hero Section */}
            <div className="bg-blue-900 text-white py-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">{campaign.name}</h1>
                    <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">{campaign.description}</p>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 max-w-2xl mx-auto border border-white/20">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold">
                                {participant.first_name[0]}
                            </div>
                            <div className="text-left">
                                <div className="text-sm text-blue-200">Supporting</div>
                                <div className="text-2xl font-bold">{participant.first_name} {participant.last_name}</div>
                                <div className="text-sm text-blue-200">{participant.section} • {campaign.ensemble_name}</div>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="mb-2">
                            <div className="flex justify-between text-sm mb-2">
                                <span>Raised: {formatCurrency(participant.total_raised_cents)}</span>
                                <span>Goal: {formatCurrency(participant.personal_goal_cents)}</span>
                            </div>
                            <div className="h-4 bg-black/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-400 transition-all duration-1000"
                                    style={{ width: `${percent}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Donation Form */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-8 md:p-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                            Make a Donation
                        </h2>

                        <form onSubmit={handleDonate} className="space-y-8">
                            {/* Amount Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Select Amount</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[25, 50, 100, 250].map((amt) => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, amount: amt.toString(), customAmount: '' })}
                                            className={`py-3 px-4 rounded-xl border-2 font-bold transition-all ${formData.amount === amt.toString()
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 hover:border-blue-300 text-gray-600'
                                                }`}
                                        >
                                            ${amt}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="number"
                                            placeholder="Other Amount"
                                            value={formData.customAmount}
                                            onChange={(e) => setFormData({ ...formData, amount: 'custom', customAmount: e.target.value })}
                                            className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${formData.amount === 'custom' ? 'border-blue-600' : 'border-gray-200'
                                                }`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Donor Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.donorName}
                                            onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            required
                                            value={formData.donorEmail}
                                            onChange={(e) => setFormData({ ...formData, donorEmail: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
                                    <textarea
                                        rows="3"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="Good luck!"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="anonymous"
                                    checked={formData.isAnonymous}
                                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="anonymous" className="text-gray-700">Make my donation anonymous</label>
                            </div>

                            <button
                                type="submit"
                                disabled={donationStep === 'processing'}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {donationStep === 'processing' ? 'Processing...' : 'Donate Now'}
                            </button>

                            <p className="text-center text-sm text-gray-500 mt-4">
                                Secure payment processing powered by Stripe.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
