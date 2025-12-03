import React, { useState, useEffect } from 'react';
import { XIcon, PlusIcon } from 'lucide-react';
import { getFeeDefinitions, createFeeDefinition, assignFee, bulkAssignFee } from '../../lib/opusApi';

export default function AssignFeeModal({ isOpen, onClose, ensembleId, studentIds, onSuccess }) {
    const [definitions, setDefinitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showNewDefinition, setShowNewDefinition] = useState(false);

    const [formData, setFormData] = useState({
        feeDefinitionId: '',
        amountCents: '',
        dueDate: '',
        notes: ''
    });

    // Split Payment State
    const [isSplitPayment, setIsSplitPayment] = useState(false);
    const [splitMonths, setSplitMonths] = useState(3);
    const [splitStartDate, setSplitStartDate] = useState('');

    const [newDefinition, setNewDefinition] = useState({
        name: '',
        description: '',
        amountCents: '',
        defaultDueDate: ''
    });

    useEffect(() => {
        if (isOpen && ensembleId) {
            loadDefinitions();
            // Default split start date to today
            setSplitStartDate(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen, ensembleId]);

    const loadDefinitions = async () => {
        try {
            const data = await getFeeDefinitions(ensembleId);
            setDefinitions(data || []);
        } catch (err) {
            console.error('Error loading fee definitions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDefinitionChange = (e) => {
        const defId = e.target.value;
        const def = definitions.find(d => d.id === parseInt(defId));

        setFormData(prev => ({
            ...prev,
            feeDefinitionId: defId,
            amountCents: def ? (def.amount_cents / 100).toFixed(2) : '',
            dueDate: def && def.default_due_date ? def.default_due_date.split('T')[0] : ''
        }));
    };

    const handleCreateDefinition = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const created = await createFeeDefinition({
                ensembleId,
                name: newDefinition.name,
                description: newDefinition.description,
                amountCents: Math.round(parseFloat(newDefinition.amountCents) * 100),
                defaultDueDate: newDefinition.defaultDueDate || null
            });

            setDefinitions(prev => [created, ...prev]);
            setFormData(prev => ({
                ...prev,
                feeDefinitionId: created.id,
                amountCents: (created.amount_cents / 100).toFixed(2),
                dueDate: created.default_due_date ? created.default_due_date.split('T')[0] : ''
            }));
            setShowNewDefinition(false);
        } catch (err) {
            alert('Failed to create fee type: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.feeDefinitionId) {
            alert('Please select a fee type');
            return;
        }

        try {
            setSubmitting(true);
            const totalAmountCents = Math.round(parseFloat(formData.amountCents) * 100);

            if (isSplitPayment && splitMonths > 1) {
                const monthlyAmountCents = Math.floor(totalAmountCents / splitMonths);
                const remainderCents = totalAmountCents % splitMonths;

                // Create assignments for each month
                for (let i = 0; i < splitMonths; i++) {
                    // Add remainder to first month
                    const currentAmountCents = i === 0 ? monthlyAmountCents + remainderCents : monthlyAmountCents;

                    // Calculate due date
                    const dueDate = new Date(splitStartDate);
                    dueDate.setMonth(dueDate.getMonth() + i);
                    const dueDateStr = dueDate.toISOString().split('T')[0];

                    const payload = {
                        ensembleId,
                        feeDefinitionId: parseInt(formData.feeDefinitionId),
                        amountCents: currentAmountCents,
                        dueDate: dueDateStr,
                        notes: `${formData.notes ? formData.notes + ' - ' : ''}Installment ${i + 1}/${splitMonths}`
                    };

                    if (Array.isArray(studentIds) && studentIds.length > 1) {
                        await bulkAssignFee({
                            ...payload,
                            studentIds
                        });
                    } else {
                        await assignFee({
                            ...payload,
                            studentId: Array.isArray(studentIds) ? studentIds[0] : studentIds
                        });
                    }
                }
            } else {
                // Single payment assignment
                const payload = {
                    ensembleId,
                    feeDefinitionId: parseInt(formData.feeDefinitionId),
                    amountCents: totalAmountCents,
                    dueDate: formData.dueDate || null,
                    notes: formData.notes
                };

                if (Array.isArray(studentIds) && studentIds.length > 1) {
                    await bulkAssignFee({
                        ...payload,
                        studentIds
                    });
                } else {
                    await assignFee({
                        ...payload,
                        studentId: Array.isArray(studentIds) ? studentIds[0] : studentIds
                    });
                }
            }

            onSuccess();
            onClose();
        } catch (err) {
            alert('Failed to assign fee: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-white/20 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">
                        Assign Fee {Array.isArray(studentIds) && studentIds.length > 1 ? `(${studentIds.length} students)` : ''}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {showNewDefinition ? (
                        <form onSubmit={handleCreateDefinition} className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
                            <h3 className="text-white font-medium mb-2">Create New Fee Type</h3>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newDefinition.name}
                                    onChange={e => setNewDefinition(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white"
                                    required
                                    placeholder="e.g. Uniform Fee"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Default Amount ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newDefinition.amountCents}
                                    onChange={e => setNewDefinition(prev => ({ ...prev, amountCents: e.target.value }))}
                                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Default Due Date</label>
                                <input
                                    type="date"
                                    value={newDefinition.defaultDueDate}
                                    onChange={e => setNewDefinition(prev => ({ ...prev, defaultDueDate: e.target.value }))}
                                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowNewDefinition(false)}
                                    className="flex-1 px-3 py-2 text-sm text-gray-300 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-500"
                                >
                                    Create Type
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form id="assign-form" onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Fee Type
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={formData.feeDefinitionId}
                                        onChange={handleDefinitionChange}
                                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    >
                                        <option value="">Select a fee type...</option>
                                        {definitions.map(def => (
                                            <option key={def.id} value={def.id}>
                                                {def.name} (${(def.amount_cents / 100).toFixed(2)})
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewDefinition(true)}
                                        className="px-3 bg-white/10 border border-white/10 rounded-lg text-white hover:bg-white/20"
                                        title="Create new fee type"
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Total Amount ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.amountCents}
                                        onChange={e => setFormData(prev => ({ ...prev, amountCents: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                                {!isSplitPayment && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-2">
                                            Due Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Split Payment Toggle */}
                            <div className="flex items-center gap-2 py-2">
                                <input
                                    type="checkbox"
                                    id="split-payment"
                                    checked={isSplitPayment}
                                    onChange={e => setIsSplitPayment(e.target.checked)}
                                    className="rounded border-gray-500 bg-gray-700 text-purple-600 focus:ring-purple-500"
                                />
                                <label htmlFor="split-payment" className="text-sm text-gray-200 select-none cursor-pointer">
                                    Split into monthly payments
                                </label>
                            </div>

                            {isSplitPayment && (
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-200 mb-2">
                                                Number of Months
                                            </label>
                                            <input
                                                type="number"
                                                min="2"
                                                max="12"
                                                value={splitMonths}
                                                onChange={e => setSplitMonths(parseInt(e.target.value) || 2)}
                                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-200 mb-2">
                                                First Payment Date
                                            </label>
                                            <input
                                                type="date"
                                                value={splitStartDate}
                                                onChange={e => setSplitStartDate(e.target.value)}
                                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        Estimated monthly payment: <span className="text-white font-medium">
                                            ${formData.amountCents ? (parseFloat(formData.amountCents) / splitMonths).toFixed(2) : '0.00'}
                                        </span>
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                                />
                            </div>
                        </form>
                    )}
                </div>

                {!showNewDefinition && (
                    <div className="p-6 border-t border-white/10 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="assign-form"
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Assigning...' : 'Assign Fee'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
