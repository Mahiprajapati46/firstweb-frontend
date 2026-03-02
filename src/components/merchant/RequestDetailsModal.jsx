import React from 'react';
import { X, ArrowRight, FileText, CheckCircle2, Clock, XCircle, AlertCircle, Tag, GitPullRequest, Hash, Layers, MessageSquare } from 'lucide-react';
import Button from '../ui/Button';

const RequestDetailsModal = ({ isOpen, onClose, request, type }) => {
    if (!isOpen || !request) return null;

    const isCategory = type === 'CATEGORY';

    const StatusBadge = ({ status }) => {
        const configs = {
            PENDING: { color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Clock, label: 'Pending' },
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
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none italic font-outfit uppercase">
                                {isCategory ? 'Category Request' : 'Change Request'}
                            </h2>
                            <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.2em] mt-2 flex items-center gap-1.5 font-inter">
                                <span className="text-primary italic">Request ID:</span> {request._id.slice(-12).toUpperCase()}
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
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-right">Date</p>
                            <p className="text-xs font-black text-slate-600 uppercase tracking-tighter italic">
                                {request.createdAt ? new Date(request.createdAt).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                                <span className="text-slate-300 mx-2">|</span>
                                {request.createdAt ? new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                            </p>
                        </div>
                    </div>

                    {/* Data Display */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 mb-4 italic">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                            Details
                        </h3>

                        {isCategory ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DetailRow label="Category Name" value={request.name} icon={Tag} />
                                <DetailRow label="Parent Category" value={request.parent_category_id?.name || 'Top Level'} icon={Layers} />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-slate-50/50 rounded-[2rem] border border-slate-100 overflow-hidden">
                                    <div className="px-8 py-5 border-b border-slate-100 bg-white flex items-center justify-between">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Requested Changes</p>
                                        <span className="text-[8px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10 uppercase tracking-widest italic">{request.entity_type} Mod</span>
                                    </div>
                                    <div className="divide-y divide-slate-100/50">
                                        {Object.entries(request.requested_changes || {}).map(([key, value]) => (
                                            <div key={key} className="flex items-center p-6 group hover:bg-white transition-colors">
                                                <div className="w-1/3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{key}</div>
                                                <div className="flex-1 text-sm font-black text-slate-900 group-hover:text-primary transition-colors italic">
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
                                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Reason</h3>
                            </div>
                            <p className="text-sm font-medium text-slate-300 leading-relaxed italic">
                                "{request.description || request.reason || 'No justification provided.'}"
                            </p>
                        </div>
                    </div>

                    {/* Admin Feedback */}
                    {request.status === 'REJECTED' && (request.rejection_reason || request.admin_note) && (
                        <div className="p-8 bg-rose-50/50 rounded-[2rem] border border-rose-100/50 space-y-5 relative overflow-hidden">
                            <div className="relative z-10 flex items-center gap-2 text-rose-600">
                                <XCircle size={18} />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Admin Notes</h3>
                            </div>
                            <div className="relative z-10 text-sm font-black text-rose-900 leading-relaxed p-6 bg-white rounded-2xl border border-rose-100/50 shadow-sm">
                                {request.rejection_reason || request.admin_note}
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-100/30 rounded-full" />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <Button onClick={onClose} className="px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-slate-900 border-slate-900 shadow-2xl shadow-slate-900/10 hover:bg-black transition-all">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RequestDetailsModal;
