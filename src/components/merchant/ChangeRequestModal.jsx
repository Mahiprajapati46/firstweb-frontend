import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRight, Lock, Layout, Info, AlertCircle } from 'lucide-react';
import merchantApi from '../../api/merchant';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { toast } from 'react-hot-toast';

const ChangeRequestModal = ({
    isOpen,
    onClose,
    entityType, // 'PRODUCT' or 'VARIANT'
    entityId,
    currentData,
    categories = []
}) => {
    const [loading, setLoading] = useState(false);
    const [proposedData, setProposedData] = useState({
        title: '',
        description: '',
        category_ids: [],
        sku: '',
        reason: ''
    });

    useEffect(() => {
        if (isOpen && currentData) {
            setProposedData({
                title: currentData.title || '',
                description: currentData.description || '',
                category_ids: currentData.category_ids || [],
                sku: currentData.sku || '',
                reason: ''
            });
        }
    }, [isOpen, currentData]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!proposedData.reason) {
            toast.error('Please provide a reason for this change request');
            return;
        }

        try {
            setLoading(true);
            const requested_changes = {};

            if (entityType === 'PRODUCT') {
                if (proposedData.title !== currentData.title) requested_changes.title = proposedData.title;
                if (proposedData.description !== currentData.description) requested_changes.description = proposedData.description;

                // Compare categories
                const currentCatIds = currentData.category_ids?.sort().join(',') || '';
                const proposedCatIds = proposedData.category_ids?.sort().join(',') || '';
                if (currentCatIds !== proposedCatIds) requested_changes.category_ids = proposedData.category_ids;
            } else {
                if (proposedData.sku !== currentData.sku) requested_changes.sku = proposedData.sku;
            }

            if (Object.keys(requested_changes).length === 0) {
                toast.error('No changes detected to request');
                return;
            }

            await merchantApi.submitChangeRequest({
                entity_type: entityType,
                entity_id: entityId,
                requested_changes,
                reason: proposedData.reason
            });

            toast.success('Change request submitted successfully');
            onClose();
        } catch (error) {
            toast.error(error.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    const isProduct = entityType === 'PRODUCT';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            <div className="bg-white rounded-[2.5rem] w-full max-w-5xl relative z-10 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 rounded-t-[2.5rem]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                            <Info size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Modify {isProduct ? 'Product' : 'Variant'} Request</h2>
                            <p className="text-slate-500 font-medium text-sm lowercase mt-0.5">Compare current values and propose your updates for admin review.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white border border-transparent hover:border-slate-200 rounded-2xl transition-all group">
                        <X size={20} className="text-slate-400 group-hover:text-slate-900" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                        {/* Current Values (Locked) */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <Lock size={14} className="text-slate-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Details (Reference)</span>
                            </div>

                            <div className="bg-slate-50 rounded-3xl p-6 space-y-6 border border-slate-100/50">
                                {isProduct ? (
                                    <>
                                        <div className="space-y-1.5 opacity-60">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</p>
                                            <div className="px-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900">
                                                {currentData.title}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 opacity-60">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</p>
                                            <div className="px-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 min-h-[100px]">
                                                {currentData.description}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 opacity-60">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categories</p>
                                            <div className="flex flex-wrap gap-2 p-2 bg-white border border-slate-100 rounded-2xl min-h-[50px]">
                                                {categories.filter(c => currentData.category_ids?.includes(c._id)).map(cat => (
                                                    <span key={cat._id} className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600">
                                                        {cat.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-1.5 opacity-60">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU</p>
                                        <div className="px-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900">
                                            {currentData.sku}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Middle Arrow Indicator */}
                        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-slate-100 rounded-full items-center justify-center text-primary shadow-lg z-10">
                            <ArrowRight size={20} />
                        </div>

                        {/* Proposed Values (Editable) */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <Check size={14} className="text-primary" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Proposed Updates (Editable)</span>
                            </div>

                            <div className="bg-white border border-primary/10 rounded-3xl p-6 space-y-6 shadow-xl shadow-primary/5 ring-4 ring-primary/5">
                                {isProduct ? (
                                    <>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">New Title</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                                value={proposedData.title}
                                                onChange={(e) => setProposedData({ ...proposedData, title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">New Description</label>
                                            <textarea
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/5 transition-all min-h-[100px] outline-none"
                                                value={proposedData.description}
                                                onChange={(e) => setProposedData({ ...proposedData, description: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">New Categories</label>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                {categories.map((cat) => (
                                                    <button
                                                        key={cat._id}
                                                        type="button"
                                                        onClick={() => {
                                                            const isSelected = proposedData.category_ids.includes(cat._id);
                                                            if (isSelected) {
                                                                setProposedData({ ...proposedData, category_ids: proposedData.category_ids.filter(id => id !== cat._id) });
                                                            } else {
                                                                setProposedData({ ...proposedData, category_ids: [...proposedData.category_ids, cat._id] });
                                                            }
                                                        }}
                                                        className={`relative px-3 py-2 rounded-xl border transition-all text-[10px] font-bold text-left ${proposedData.category_ids.includes(cat._id)
                                                            ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                                                            : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'
                                                            }`}
                                                    >
                                                        {cat.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">New SKU</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                            value={proposedData.sku}
                                            onChange={(e) => setProposedData({ ...proposedData, sku: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Reason for Change */}
                    <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 space-y-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={18} className="text-amber-600" />
                            <h3 className="text-sm font-black text-amber-900 uppercase tracking-wide">Requirement: Reason for Change</h3>
                        </div>
                        <p className="text-xs text-amber-700 font-medium">Please explain why you are requesting these updates. This helps the admin approve your request faster.</p>
                        <textarea
                            required
                            placeholder="e.g., Updating materials list to reflect new supplier standards..."
                            className="w-full px-5 py-4 bg-white border border-amber-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-amber-200/50 outline-none transition-all h-24"
                            value={proposedData.reason}
                            onChange={(e) => setProposedData({ ...proposedData, reason: e.target.value })}
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="p-8 border-t border-slate-50 flex items-center justify-end gap-4 bg-slate-50/30 rounded-b-[2.5rem]">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-200/50"
                    >
                        Discard Changes
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        loading={loading}
                        className="px-12 py-3 bg-primary hover:bg-accent text-white rounded-2xl font-black shadow-2xl shadow-primary/20 transition-all hover:-translate-y-0.5"
                    >
                        Submit Request for Review
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChangeRequestModal;
