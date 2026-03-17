import React from 'react';
import { X, ArrowRight, FileText, CheckCircle2, Clock, XCircle, AlertCircle, Tag, GitPullRequest, Hash, Layers, MessageSquare } from 'lucide-react';
import Button from '../ui/Button';

const RequestDetailsModal = ({ isOpen, onClose, request, type, categories = [] }) => {
    if (!isOpen || !request) return null;

    const isCategory = type === 'CATEGORY';

    const StatusBadge = ({ status }) => {
        const configs = {
            PENDING: { color: 'bg-amber-50 text-amber-600 border-slate-100', icon: Clock, label: 'Pending' },
            APPROVED: { color: 'bg-emerald-50 text-emerald-600 border-slate-100', icon: CheckCircle2, label: 'Approved' },
            REJECTED: { color: 'bg-rose-50 text-rose-600 border-slate-100', icon: XCircle, label: 'Rejected' },
        };
        const config = configs[status] || configs.PENDING;
        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest font-inter ${config.color}`}>
                <config.icon size={12} />
                {config.label}
            </div>
        );
    };

    const DetailRow = ({ label, value, icon: Icon }) => (
        <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 group">
            <div className="flex items-center gap-3">
                <div className="text-slate-300 group-hover:text-primary transition-colors">
                    <Icon size={14} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
            <span className="text-xs font-black text-slate-900 group-hover:text-primary transition-colors text-right max-w-[60%] truncate">
                {value || 'Top Level'}
            </span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            <div className="bg-white rounded-[3rem] w-full max-w-xl relative z-10 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                            {isCategory ? <Tag size={24} /> : <GitPullRequest size={24} />}
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase font-outfit">
                                {isCategory ? 'Category Request' : 'Change Request'}
                            </h2>
                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mt-1 font-inter">
                                ID: {request._id.slice(-12).toUpperCase()}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white border border-transparent hover:border-slate-200 rounded-2xl transition-all group shadow-sm bg-slate-100/50">
                        <X size={20} className="text-slate-400 group-hover:text-slate-900" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                    {/* Status & Date Info Bar */}
                    <div className="flex items-center justify-between bg-slate-50/50 px-6 py-4 rounded-2xl border border-slate-100">
                        <StatusBadge status={request.status} />
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Submitted</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase italic">
                                {request.createdAt ? new Date(request.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently'}
                            </p>
                        </div>
                    </div>

                    {/* Details Box */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Hash size={12} className="text-primary" />
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-inter">Core Details</h3>
                        </div>

                        <div className="p-6 bg-slate-50/30 border border-slate-100 rounded-[2rem] space-y-1">
                            {isCategory ? (
                                <>
                                    <DetailRow label="Category Name" value={request.name} icon={Tag} />
                                    <DetailRow
                                        label="Placement"
                                        value={request.parent_category_id?.name || 'Top Level'}
                                        icon={Layers}
                                    />
                                </>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(request.requested_changes || {}).map(([key, value]) => (
                                        <DetailRow
                                            key={key}
                                            label={key.replace('_', ' ')}
                                            value={Array.isArray(value) ? `${value.length} Items` : String(value)}
                                            icon={GitPullRequest}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reason / Narrative */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageSquare size={12} className="text-primary" />
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-inter">Justification</h3>
                        </div>
                        <div className="p-6 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden group">
                            <p className="text-sm font-medium text-slate-300 leading-relaxed italic relative z-10">
                                "{request.description || request.reason || 'No justification provided.'}"
                            </p>
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                                <MessageSquare size={120} className="text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Admin/Rejection Feedback */}
                    {request.status === 'REJECTED' && (request.rejection_reason || request.admin_note) && (
                        <div className="p-6 bg-rose-50/30 rounded-[2.5rem] border border-rose-100/50 space-y-4">
                            <div className="flex items-center gap-2 text-rose-500">
                                <XCircle size={16} />
                                <h3 className="text-[10px] font-black uppercase tracking-widest italic">Reviewer Feedback</h3>
                            </div>
                            <p className="text-sm font-black text-rose-900 bg-white p-6 rounded-2xl border border-rose-100 shadow-sm leading-relaxed">
                                {request.rejection_reason || request.admin_note}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                    <Button onClick={onClose} className="px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary text-white shadow-2xl shadow-primary/20 hover:bg-black transition-all hover:-translate-y-1 active:scale-95">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RequestDetailsModal;
