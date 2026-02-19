import React, { useState } from 'react';
import { UserCheck, UserX, Shield, RefreshCw } from 'lucide-react';

const GovernanceModal = ({ isOpen, onClose, onConfirm, status, loading }) => {
    const [reason, setReason] = useState('');
    if (!isOpen) return null;

    const isNegative = status === 'REJECTED' || status === 'SUSPENDED';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className={`p-8 ${isNegative ? 'bg-rose-50' : 'bg-green-50'} border-b border-gray-50 flex items-center gap-4`}>
                    <div className={`p-3 rounded-2xl ${isNegative ? 'bg-rose-500 text-white' : 'bg-green-500 text-white'}`}>
                        {status === 'APPROVED' ? <UserCheck size={24} /> : status === 'REJECTED' ? <UserX size={24} /> : <Shield size={24} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-primary tracking-tight uppercase italic">{status === 'APPROVED' ? 'Approve' : status === 'REJECTED' ? 'Reject' : 'Suspend'} Store</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Please confirm this action</p>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Reason for {status.toLowerCase()}</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={isNegative ? "Please explain why you are taking this action..." : "Add any notes here (optional)..."}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-primary focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all min-h-[120px] outline-none"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all font-mono"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onConfirm(reason)}
                            disabled={loading || (isNegative && !reason.trim())}
                            className={`flex-1 px-6 py-3 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${loading || (isNegative && !reason.trim()) ? 'bg-gray-200 cursor-not-allowed shadow-none' :
                                isNegative ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-green-500 hover:bg-green-600 shadow-green-500/20'
                                }`}
                        >
                            {loading ? <RefreshCw size={14} className="animate-spin" /> : 'Confirm Change'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GovernanceModal;
