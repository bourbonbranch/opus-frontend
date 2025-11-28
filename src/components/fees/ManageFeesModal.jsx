import React, { useState, useEffect } from 'react';
import { XIcon, PlusIcon, DollarSignIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import { getMemberFees } from '../../lib/opusApi';
import AssignFeeModal from './AssignFeeModal';
import RecordPaymentModal from './RecordPaymentModal';

export default function ManageFeesModal({ isOpen, onClose, student, ensembleId }) {
    const [fees, setFees] = useState({ assignments: [], summary: {} });
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [paymentAssignment, setPaymentAssignment] = useState(null);

    useEffect(() => {
        if (isOpen && student) {
            loadFees();
        }
    }, [isOpen, student]);

    const loadFees = async () => {
        try {
            setLoading(true);
            const data = await getMemberFees(student.id);
            setFees(data || { assignments: [], summary: {} });
        } catch (err) {
            console.error('Error loading fees:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !student) return null;

    const { summary, assignments } = fees;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-white/20 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Manage Fees</h2>
                        <p className="text-gray-400">{student.first_name} {student.last_name}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <p className="text-sm text-gray-400 mb-1">Total Assigned</p>
                            <p className="text-2xl font-bold text-white">
                                ${(summary.total_assigned_cents / 100 || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <p className="text-sm text-gray-400 mb-1">Total Paid</p>
                            <p className="text-2xl font-bold text-green-400">
                                ${(summary.total_paid_cents / 100 || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <p className="text-sm text-gray-400 mb-1">Balance Due</p>
                            <p className="text-2xl font-bold text-pink-400">
                                ${(summary.total_balance_cents / 100 || 0).toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/* Assignments List */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-white">Fee Assignments</h3>
                            <button
                                onClick={() => setShowAssignModal(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors text-sm font-medium"
                            >
                                <PlusIcon className="w-4 h-4" /> Assign Fee
                            </button>
                        </div>

                        {loading ? (
                            <p className="text-gray-400 text-center py-8">Loading fees...</p>
                        ) : assignments.length === 0 ? (
                            <p className="text-gray-400 text-center py-8 bg-white/5 rounded-xl border border-white/10 border-dashed">
                                No fees assigned yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {assignments.map(assignment => (
                                    <div key={assignment.id} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-medium text-white">{assignment.fee_name}</h4>
                                                <p className="text-sm text-gray-400">{assignment.fee_description}</p>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-medium border ${assignment.status === 'paid' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                                    assignment.status === 'partial' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                                        'bg-pink-500/20 text-pink-300 border-pink-500/30'
                                                }`}>
                                                {assignment.status.toUpperCase().replace('_', ' ')}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                            <div>
                                                <span className="text-gray-500 block">Amount</span>
                                                <span className="text-gray-200">${(assignment.amount_cents / 100).toFixed(2)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block">Paid</span>
                                                <span className="text-green-400">${(assignment.paid_cents / 100).toFixed(2)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block">Balance</span>
                                                <span className="text-pink-400 font-medium">${(assignment.balance_cents / 100).toFixed(2)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block">Due Date</span>
                                                <span className="text-gray-200">
                                                    {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : '-'}
                                                </span>
                                            </div>
                                        </div>

                                        {assignment.balance_cents > 0 && (
                                            <div className="flex justify-end pt-2 border-t border-white/5">
                                                <button
                                                    onClick={() => setPaymentAssignment(assignment)}
                                                    className="text-sm text-green-400 hover:text-green-300 font-medium flex items-center gap-1"
                                                >
                                                    <DollarSignIcon className="w-4 h-4" /> Record Payment
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sub-modals */}
            <AssignFeeModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                ensembleId={ensembleId}
                studentIds={[student.id]}
                onSuccess={loadFees}
            />

            <RecordPaymentModal
                isOpen={!!paymentAssignment}
                onClose={() => setPaymentAssignment(null)}
                assignment={paymentAssignment}
                onSuccess={loadFees}
            />
        </div>
    );
}
