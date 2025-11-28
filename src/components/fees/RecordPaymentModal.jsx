import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import { recordFeePayment } from '../../lib/opusApi';

export default function RecordPaymentModal({ isOpen, onClose, assignment, onSuccess }) {
    const [amount, setAmount] = useState(assignment ? (assignment.balance_cents / 100).toFixed(2) : '');
    const [method, setMethod] = useState('cash');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await recordFeePayment({
                feeAssignmentId: assignment.id,
                amountCents: Math.round(parseFloat(amount) * 100),
                paymentProvider: 'offline', // or 'cash', 'check' etc. stored in DB as provider or notes
                notes: `Method: ${method}. ${notes}`
            });
            onSuccess();
            onClose();
        } catch (err) {
            alert('Failed to record payment: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !assignment) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-white/20">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Record Payment</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <p className="text-sm text-gray-400">Paying for</p>
                        <p className="text-white font-medium">{assignment.fee_name}</p>
                        <div className="flex justify-between mt-2 text-sm">
                            <span className="text-gray-400">Balance Due:</span>
                            <span className="text-white">${(assignment.balance_cents / 100).toFixed(2)}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Payment Amount ($)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Payment Method
                        </label>
                        <select
                            value={method}
                            onChange={e => setMethod(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="cash">Cash</option>
                            <option value="check">Check</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                            placeholder="Check #1234..."
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Recording...' : 'Record Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
