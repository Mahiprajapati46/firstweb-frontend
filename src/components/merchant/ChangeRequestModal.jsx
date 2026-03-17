import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRight, Lock, Layout, Info, AlertCircle, FileText, GitPullRequest } from 'lucide-react';
import merchantApi from '../../api/merchant';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { merchantSchemas } from '../../validations/merchant.schema';
import { toast } from 'react-hot-toast';
import SearchableSelect from '../ui/SearchableSelect';

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
        justification: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        if (isOpen && currentData) {
            setProposedData({
                title: currentData.title || '',
                description: currentData.description || '',
                category_ids: currentData.category_ids || [],
                sku: currentData.sku || '',
                justification: ''
            });
            setFieldErrors({});
        }
    }, [isOpen, currentData]);

    const handleBlur = (name, value) => {
        const schema = entityType === 'PRODUCT' ? merchantSchemas.productChangeRequest : merchantSchemas.variantChangeRequest;
        const dataToValidate = { ...proposedData, [name]: value };
        const result = schema.safeParse(dataToValidate);

        if (!result.success) {
            const fieldIssue = result.error.issues.find(i => i.path[0] === name);
            if (fieldIssue) {
                setFieldErrors(prev => ({ ...prev, [name]: fieldIssue.message }));
                return;
            }
        }
        setFieldErrors(prev => {
            const n = { ...prev };
            delete n[name];
            return n;
        });
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});

        // 1. Zod Validation
        const schema = entityType === 'PRODUCT' ? merchantSchemas.productChangeRequest : merchantSchemas.variantChangeRequest;
        const result = schema.safeParse(proposedData);

        if (!result.success) {
            const errors = {};
            result.error.issues.forEach(issue => {
                errors[issue.path[0]] = issue.message;
            });
            setFieldErrors(errors);
            toast.error('Please fix the validation errors');
            return;
        }

        try {
            setLoading(true);
            const requested_changes = {};

            // 2. Dirty Check (Redundancy Check)

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
                toast.error('No changes detected to request (Redundancy Check)');
                return;
            }

            await merchantApi.submitChangeRequest({
                entity_type: entityType,
                entity_id: entityId,
                requested_changes,
                reason: proposedData.justification
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

            <div className="bg-white rounded-[3rem] w-full max-w-xl relative z-10 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 rounded-t-[3rem]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                            <GitPullRequest size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase font-outfit">Request Change</h2>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mt-1 font-inter">Propose updates for review</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white border border-transparent hover:border-slate-200 rounded-2xl transition-all group shadow-sm bg-slate-100/50">
                        <X size={20} className="text-slate-400 group-hover:text-slate-900" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="space-y-6">
                        {/* Comparison Area */}
                        <div className="grid grid-cols-1 gap-4">
                            {/* Current Values (Reference) */}
                            <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem]">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Lock size={12} /> Current Details
                                </label>
                                <div className="space-y-4">
                                    {isProduct ? (
                                        <>
                                            <div className="flex justify-between items-center py-2 border-b border-slate-100/50">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title</span>
                                                <span className="text-xs font-black text-slate-900">{currentData.title}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-slate-100/50">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categories</span>
                                                <div className="flex gap-1">
                                                    {categories.filter(c => currentData.category_ids?.includes(c._id)).slice(0, 2).map(cat => (
                                                        <span key={cat._id} className="text-[8px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{cat.name}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100/50">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU</span>
                                            <span className="text-xs font-black text-slate-900">{currentData.sku}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Proposed Values */}
                            <div className="space-y-6">
                                {isProduct ? (
                                    <>
                                        <Input
                                            label="New Title"
                                            value={proposedData.title}
                                            onChange={(e) => setProposedData({ ...proposedData, title: e.target.value })}
                                            onBlur={(e) => handleBlur('title', e.target.value)}
                                            error={fieldErrors.title}
                                            placeholder="Enter updated title..."
                                            icon={<Layout size={18} className="text-slate-300" />}
                                        />
                                        <div className="space-y-4">
                                            <SearchableSelect
                                                options={categories}
                                                selectedValues={proposedData.category_ids}
                                                onSelect={(id) => {
                                                    const newCats = [...proposedData.category_ids, id];
                                                    setProposedData({ ...proposedData, category_ids: newCats });
                                                    handleBlur('category_ids', newCats);
                                                }}
                                                onRemove={(id) => {
                                                    const newCats = proposedData.category_ids.filter(val => val !== id);
                                                    setProposedData({ ...proposedData, category_ids: newCats });
                                                    handleBlur('category_ids', newCats);
                                                }}
                                                label="New Categories"
                                                error={fieldErrors.category_ids}
                                            />
                                        </div>
                                        <Input
                                            label="New Description"
                                            value={proposedData.description}
                                            onChange={(e) => setProposedData({ ...proposedData, description: e.target.value })}
                                            onBlur={(e) => handleBlur('description', e.target.value)}
                                            error={fieldErrors.description}
                                            multiline
                                            rows={3}
                                            placeholder="Update product description..."
                                            icon={<FileText size={18} className="text-slate-300" />}
                                        />
                                    </>
                                ) : (
                                    <Input
                                        label="New SKU Proposal"
                                        value={proposedData.sku}
                                        onChange={(e) => setProposedData({ ...proposedData, sku: e.target.value.toUpperCase() })}
                                        onBlur={(e) => handleBlur('sku', e.target.value.toUpperCase())}
                                        error={fieldErrors.sku}
                                        placeholder="Enter new SKU..."
                                        icon={<Lock size={18} className="text-slate-300" />}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Reason for Change */}
                        <Input
                            label="Reason for Change"
                            required
                            multiline
                            rows={3}
                            placeholder="Why are these changes necessary?"
                            icon={<AlertCircle size={18} className="text-slate-300" />}
                            value={proposedData.justification}
                            onChange={(e) => setProposedData({ ...proposedData, justification: e.target.value })}
                            onBlur={(e) => handleBlur('justification', e.target.value)}
                            error={fieldErrors.justification}
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
                        className="px-12 py-5 bg-primary hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 transition-all hover:-translate-y-1"
                    >
                        Send Request
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChangeRequestModal;
