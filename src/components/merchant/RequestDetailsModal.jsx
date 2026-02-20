import React from 'react';
import { X, ArrowRight, FileText, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

const RequestDetailsModal = ({ isOpen, onClose, request }) => {
    if (!isOpen || !request) return null;

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

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl relative z-10 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 rounded-t-[2.5rem]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Request Details</h2>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-0.5">ID: {request._id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white border border-transparent hover:border-slate-200 rounded-2xl transition-all group">
                        <X size={20} className="text-slate-400 group-hover:text-slate-900" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                    {/* Status & Date */}
                    <div className="flex items-center justify-between">
                        <StatusBadge status={request.status} />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Submitted: {new Date(request.createdAt).toLocaleString()}
                        </p>
                    </div>

                    {/* Requested Changes */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <ArrowRight size={14} className="text-primary" />
                            Proposed Changes
                        </h3>
                        <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                            {Object.entries(request.requested_changes || {}).map(([key, value], idx) => (
                                <div key={key} className={`flex items-start p-4 ${idx !== 0 ? 'border-t border-slate-100' : ''}`}>
                                    <div className="w-1/3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{key}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900 break-all">
                                            {Array.isArray(value) ? value.join(', ') : String(value)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 space-y-3">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={16} className="text-amber-600" />
                            <h3 className="text-xs font-black text-amber-900 uppercase tracking-widest">Reason for Request</h3>
                        </div>
                        <p className="text-sm font-medium text-amber-800 leading-relaxed">
                            {request.reason}
                        </p>
                    </div>

                    {/* Admin Response (if rejected) */}
                    {request.status === 'REJECTED' && request.admin_note && (
                        <div className="bg-rose-50 rounded-3xl p-6 border border-rose-100 space-y-3">
                            <div className="flex items-center gap-2">
                                <XCircle size={16} className="text-rose-600" />
                                <h3 className="text-xs font-black text-rose-900 uppercase tracking-widest">Admin Feedback</h3>
                            </div>
                            <p className="text-sm font-medium text-rose-800 leading-relaxed">
                                {request.admin_note}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-50 flex justify-end bg-slate-50/30 rounded-b-[2.5rem]">
                    <Button onClick={onClose} variant="outline" className="px-8 rounded-xl font-bold">Close</Button>
                </div>
            </div>
        </div>
    );
};

export default RequestDetailsModal;
