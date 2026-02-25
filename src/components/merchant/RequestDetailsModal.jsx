import React from 'react';
import { X, ArrowRight, FileText, CheckCircle2, Clock, XCircle, AlertCircle, Tag, GitPullRequest, Hash, Layers, MessageSquare } from 'lucide-react';
import Button from '../ui/Button';

const RequestDetailsModal = ({ isOpen, onClose, request, type }) => {
    if (!isOpen || !request) return null;

    const isCategory = type === 'CATEGORY';

    const StatusBadge = ({ status }) => {
        const configs = {
            PENDING: { color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Clock, label: 'Pending Review' },
            APPROVED: { color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle2, label: 'Approved' },
            REJECTED: { color: 'bg-rose-50 text-rose-600 border-rose-200', icon: XCircle, label: 'Rejected' },
        };
        const config = configs[status] || configs.PENDING;
        return (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-black uppercase tracking-wider ${config.color}`}>
                <config.icon size={14} />
                {config.label}
            </div>
        );
    };

    const DetailRow = ({ label, value, icon: Icon }) => (
        <div className="flex items-start p-6 bg-slate-50/50 border border-slate-100 rounded-3xl group hover:border-primary/20 transition-all">
            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-all mr-4 shadow-sm">
                <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm font-bold text-slate-900 break-all">{value || 'N/A'}</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            <div className="bg-white rounded-[3rem] w-full max-w-2xl relative z-10 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white border border-slate-200 rounded-[1.25rem] flex items-center justify-center text-primary shadow-sm">
                            {isCategory ? <Tag size={28} /> : <GitPullRequest size={28} />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                                {isCategory ? 'Category Suggestion' : 'Modification Request'}
                            </h2>
                            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mt-2 flex items-center gap-1.5">
                                <span className="text-primary">#</span>{request._id}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white border border-transparent hover:border-slate-200 rounded-2xl transition-all group shadow-sm bg-slate-100/50">
                        <X size={20} className="text-slate-400 group-hover:text-slate-900" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                    {/* Status & Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                        <StatusBadge status={request.status} />
                        <div className="flex flex-col items-end">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Date of Submission</p>
                            <p className="text-xs font-bold text-slate-600">
                                {new Date(request.createdAt).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>

                    {/* Data Display */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            Request Details
                        </h3>

                        {isCategory ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DetailRow label="Category Name" value={request.name} icon={Tag} />
                                <DetailRow label="System Slug" value={request.slug} icon={Hash} />
                                <DetailRow label="Parent Category" value={request.parent_category_id?.name || 'Top Level'} icon={Layers} />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DetailRow label="Entity Type" value={request.entity_type} icon={FileText} />
                                    <DetailRow label="Target ID" value={request.entity_id} icon={Hash} />
                                </div>
                                <div className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-white/50">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Field Modifications</p>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {Object.entries(request.requested_changes || {}).map(([key, value]) => (
                                            <div key={key} className="flex items-center p-5 group hover:bg-white/50 transition-colors">
                                                <div className="w-1/3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{key}</div>
                                                <div className="flex-1 text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                                                    {Array.isArray(value) ? value.join(', ') : String(value)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Justification / Reason */}
                    <div className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <MessageSquare size={80} className="text-white" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertCircle size={14} className="text-primary" />
                                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Merchant Justification</h3>
                            </div>
                            <p className="text-sm font-medium text-slate-300 leading-relaxed italic">
                                "{request.description || request.reason || 'No justification provided.'}"
                            </p>
                        </div>
                    </div>

                    {/* Admin Feedback */}
                    {request.status === 'REJECTED' && (request.rejection_reason || request.admin_note) && (
                        <div className="p-8 bg-rose-50 rounded-[2rem] border border-rose-100 space-y-4">
                            <div className="flex items-center gap-2 text-rose-600">
                                <XCircle size={16} />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Administrative Feedback</h3>
                            </div>
                            <div className="text-sm font-bold text-rose-900 leading-relaxed p-4 bg-white/50 rounded-2xl border border-rose-100/50">
                                {request.rejection_reason || request.admin_note}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                    <Button onClick={onClose} className="px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs bg-slate-900 border-slate-900 shadow-xl shadow-slate-900/10">
                        Dismiss
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RequestDetailsModal;
