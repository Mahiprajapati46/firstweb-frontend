import React, { useEffect, useState } from 'react';
import {
    HandCoins,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Filter,
    RefreshCw,
    User,
    Building2,
    CreditCard,
    Calendar,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    AlertCircle
} from 'lucide-react';
import adminApi from '../../api/admin';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const StatusBadge = ({ status }) => {
    const styles = {
        APPROVED: "bg-green-100 text-green-700 border-green-200",
        PENDING: "bg-orange-100 text-orange-700 border-orange-200",
        REJECTED: "bg-red-100 text-red-700 border-red-200",
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${styles[status]}`}>
            {status}
        </span>
    );
};

const AdminWithdrawals = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getWithdrawals(statusFilter);
            setRequests(response.data?.requests || []);
        } catch (error) {
            console.error('Failed to fetch withdrawals:', error);
            toast.error('Sync error: Withdrawal ledger unreachable');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, [statusFilter]);

    const handleApprove = async (id) => {
        const notes = prompt('Add administrative notes (optional):');
        if (notes === null) return;

        setActionLoading(id);
        try {
            await adminApi.approveWithdrawal(id, notes);
            toast.success('Withdrawal approved and processed');
            fetchWithdrawals();
        } catch (error) {
            toast.error(error.message || 'Approval protocol failed');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        const notes = prompt('MANDATORY: Reason for rejection?');
        if (notes === null) return;
        if (!notes.trim()) {
            toast.error('Rejection logic requires a specific reason');
            return;
        }

        setActionLoading(id);
        try {
            await adminApi.rejectWithdrawal(id, notes);
            toast.success('Request rejected and funds reversed');
            fetchWithdrawals();
        } catch (error) {
            toast.error(error.message || 'Rejection protocol failed');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredRequests = requests.filter(r =>
        r.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.user_id?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r._id.includes(searchTerm)
    );

    if (loading && !requests.length) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-accent">Syncing Withdrawal Ledger...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tighter uppercase italic">Settlement Governance</h1>
                    <p className="text-gray-400 font-medium text-sm mt-1">Audit and process marketplace liquidity disbursements.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchWithdrawals}
                    className="gap-2 bg-white border-gray-100 hover:border-accent transition-all uppercase text-[10px] font-black tracking-widest"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Sync
                </Button>
            </div>

            {/* Filter Hub */}
            <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent transition-colors" size={18} />
                    <input
                        placeholder="Search by Merchant or Request ID..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all text-sm font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-1.5 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                    {['', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest ${statusFilter === f
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105 z-10'
                                : 'text-gray-400 hover:text-primary hover:bg-white border-transparent'
                                }`}
                        >
                            {f || 'ALL REQUESTS'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Withdrawals Table */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap min-w-[1100px]">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 uppercase text-[10px] tracking-[0.2em] font-black border-b border-gray-100">
                                <th className="px-8 py-6">Request Identity</th>
                                <th className="px-8 py-6">Merchant details</th>
                                <th className="px-8 py-6">Destinaton (Bank)</th>
                                <th className="px-8 py-6 text-center">Amount</th>
                                <th className="px-8 py-6">Audit Status</th>
                                <th className="px-8 py-6 text-right">Moderation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredRequests.map((r) => (
                                <tr key={r._id} className="hover:bg-gray-50/20 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-accent/5 text-accent rounded-xl flex items-center justify-center border border-accent/10">
                                                <HandCoins size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-mono font-black uppercase italic">ID: {r._id.slice(-12)}</p>
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-300 font-bold mt-1">
                                                    <Calendar size={12} />
                                                    {new Date(r.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-primary font-black text-xs border border-gray-200">
                                                {r.user_id?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-black text-primary text-sm">{r.user_id?.name || 'Unknown'}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">{r.user_id?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-primary flex items-center gap-1.5">
                                                <Building2 size={12} className="text-gray-300" />
                                                {r.bank_details?.bank_name}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-mono font-bold tracking-tight">
                                                XXXX {r.bank_details?.account_number?.slice(-4)} | {r.bank_details?.ifsc_code}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <p className="text-lg font-black text-primary italic tracking-tight">₹{r.amount.toLocaleString()}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <StatusBadge status={r.status} />
                                        {r.admin_notes && (
                                            <div className="mt-2 flex items-start gap-1.5 max-w-[180px]">
                                                <MessageSquare size={12} className="text-gray-300 shrink-0 mt-0.5" />
                                                <p className="text-[10px] text-gray-400 font-bold italic line-clamp-2 leading-tight">
                                                    "{r.admin_notes}"
                                                </p>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            {r.status === 'PENDING' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(r._id)}
                                                        disabled={actionLoading === r._id}
                                                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-green-500/10 active:scale-95 flex items-center gap-2"
                                                    >
                                                        <CheckCircle size={14} /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(r._id)}
                                                        disabled={actionLoading === r._id}
                                                        className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-500/10 active:scale-95 flex items-center gap-2"
                                                    >
                                                        <XCircle size={14} /> Reject
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="p-2 text-gray-200">
                                                    <Clock size={20} />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredRequests.length === 0 && (
                        <div className="px-8 py-32 text-center bg-gray-50/10">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl shadow-gray-200 border border-gray-50">
                                    <HandCoins size={32} className="text-gray-100" />
                                </div>
                                <div>
                                    <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs mb-1">Treasury is silent</p>
                                    <p className="text-gray-300 text-[10px] font-bold italic">No withdrawal requests found in this sector.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminWithdrawals;
