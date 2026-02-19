import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Store,
    Shield,
    UserCheck,
    UserX,
    ExternalLink,
    Mail,
    RefreshCw,
    Search,
    Filter,
    ShieldAlert,
    Calendar,
    ChevronLeft,
    ChevronRight,
    MapPin,
    PhoneCall
} from 'lucide-react';
import adminApi from '../../api/admin';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import GovernanceModal from '../../components/ui/GovernanceModal';

const StatusBadge = ({ status }) => {
    const styles = {
        APPROVED: "bg-green-100 text-green-700 border-green-200",
        PENDING: "bg-amber-100 text-amber-700 border-amber-200",
        REJECTED: "bg-red-100 text-red-700 border-red-200",
        SUSPENDED: "bg-rose-100 text-rose-700 border-rose-200",
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${styles[status]}`}>
            {status}
        </span>
    );
};

const AdminMerchants = () => {
    const [merchants, setMerchants] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState({ isOpen: false, status: null, merchantId: null });

    const fetchMerchants = async (page = 1) => {
        setLoading(true);
        try {
            const response = await adminApi.getMerchants({
                status: statusFilter,
                page,
                limit: meta.limit
            });
            setMerchants(response.data.merchants || []);
            setMeta(response.data.pagination || { total: response.data.merchants?.length || 0, page: 1, limit: 10 });
        } catch (error) {
            console.error('Failed to fetch merchants:', error);
            toast.error('Sync error: Merchant registry unreachable');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMerchants(1);
    }, [statusFilter]);

    const handleStatusChange = async (id, status, reason) => {
        setActionLoading(id);
        try {
            await adminApi.updateMerchantStatus(id, status, reason);
            toast.success(`Merchant status updated to ${status}`);
            setModal({ isOpen: false, status: null, merchantId: null });
            fetchMerchants(meta.page);
        } catch (error) {
            toast.error(error.message || 'Moderation protocol failed');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredMerchants = merchants.filter(m =>
        m.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.owner_user_id?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m._id.includes(searchTerm)
    );

    if (loading && !merchants.length) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-accent">Syncing Merchant Global Registry...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tighter uppercase italic">Store Management</h1>
                    <p className="text-gray-400 font-medium text-sm mt-1">Manage, approve, and track all stores on the platform.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => fetchMerchants(meta.page)}
                    className="gap-2 bg-white border-gray-100 hover:border-accent transition-all uppercase text-[10px] font-black tracking-widest"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh List
                </Button>
            </div>

            {/* Filter Hub */}
            <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent transition-colors" size={18} />
                    <input
                        placeholder="Filter by Store Name, Email or ID..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all text-sm font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-1.5 p-1 bg-gray-50 rounded-2xl border border-gray-100 overflow-x-auto no-scrollbar">
                    {['', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest whitespace-nowrap ${statusFilter === f
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105 z-10'
                                : 'text-gray-400 hover:text-primary hover:bg-white border-transparent'
                                }`}
                        >
                            {f || 'ALL ENTITIES'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Merchant catalog */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap min-w-[1100px]">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 uppercase text-[10px] tracking-[0.2em] font-black border-b border-gray-100">
                                <th className="px-8 py-6">Store Name</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6 text-center">Joined Date</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredMerchants.map((m) => (
                                <tr key={m._id} className="hover:bg-gray-50/20 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-accent/5 text-accent rounded-2xl flex items-center justify-center border border-accent/10 group-hover:scale-105 transition-transform duration-500">
                                                <Store size={24} />
                                            </div>
                                            <div>
                                                <p className="font-black text-primary text-base tracking-tight leading-tight mb-1">{m.store_name}</p>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1.5">
                                                        <Mail size={12} className="text-gray-300" /> {m.owner_user_id?.email || 'SYSTEM_ERR'}
                                                    </p>
                                                    <p className="text-[10px] text-gray-300 font-mono font-black uppercase tracking-widest px-2 py-0.5 bg-gray-50 rounded border border-gray-100 italic">ID: {m._id.slice(-12)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <StatusBadge status={m.status} />
                                        {m.rejection_reason && m.status === 'REJECTED' && (
                                            <div className="mt-2 flex items-start gap-1.5 max-w-[200px]">
                                                <ShieldAlert size={12} className="text-rose-400 shrink-0 mt-0.5" />
                                                <p className="text-[10px] text-rose-500 font-bold italic line-clamp-2 leading-tight">
                                                    "{m.rejection_reason}"
                                                </p>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                                            <Calendar size={12} className="text-primary" />
                                            <span className="text-[10px] font-black text-primary font-mono">{new Date(m.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            {m.status === 'PENDING' && (
                                                <div className="flex gap-2 p-1 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                    <button
                                                        onClick={() => setModal({ isOpen: true, status: 'APPROVED', merchantId: m._id })}
                                                        disabled={actionLoading === m._id}
                                                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2"
                                                    >
                                                        <UserCheck size={14} /> Authorize
                                                    </button>
                                                    <button
                                                        onClick={() => setModal({ isOpen: true, status: 'REJECTED', merchantId: m._id })}
                                                        disabled={actionLoading === m._id}
                                                        className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2"
                                                    >
                                                        <UserX size={14} /> Deny
                                                    </button>
                                                </div>
                                            )}
                                            {m.status === 'APPROVED' && (
                                                <button
                                                    onClick={() => setModal({ isOpen: true, status: 'SUSPENDED', merchantId: m._id })}
                                                    disabled={actionLoading === m._id}
                                                    className="px-4 py-2 border border-amber-200 text-amber-600 hover:bg-amber-50 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                                                >
                                                    <Shield size={14} /> Suspend Access
                                                </button>
                                            )}
                                            {m.status === 'SUSPENDED' && (
                                                <button
                                                    onClick={() => setModal({ isOpen: true, status: 'APPROVED', merchantId: m._id })}
                                                    disabled={actionLoading === m._id}
                                                    className="px-4 py-2 border border-green-200 text-green-600 hover:bg-green-50 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                                                >
                                                    <UserCheck size={14} /> Restore Access
                                                </button>
                                            )}
                                            <Link
                                                to={`/admin/merchants/${m._id}`}
                                                className="h-10 w-10 p-0 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:border-accent hover:text-accent transition-all group/detail shadow-sm"
                                            >
                                                <ExternalLink size={16} className="text-gray-400 group-hover/detail:scale-110 transition-transform" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredMerchants.length === 0 && (
                        <div className="py-32 text-center bg-gray-50/10">
                            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-1000">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl shadow-gray-200 border border-gray-50">
                                    <Store size={32} className="text-gray-100" />
                                </div>
                                <div>
                                    <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs mb-1">No stores found</p>
                                    <p className="text-gray-300 text-[10px] font-bold italic">Try changing your filters or search term.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination Hub */}
                {meta.total > meta.limit && (
                    <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Indexing <span className="text-primary">{meta.total}</span> entities
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => fetchMerchants(meta.page - 1)}
                                disabled={meta.page <= 1 || loading}
                                className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary disabled:opacity-30 transition-all shadow-sm"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-black text-primary italic uppercase">Segment {meta.page}</span>
                            <button
                                onClick={() => fetchMerchants(meta.page + 1)}
                                disabled={meta.page * meta.limit >= meta.total || loading}
                                className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary disabled:opacity-30 transition-all shadow-sm"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <GovernanceModal
                isOpen={modal.isOpen}
                status={modal.status}
                loading={!!actionLoading}
                onClose={() => setModal({ isOpen: false, status: null, merchantId: null })}
                onConfirm={(reason) => handleStatusChange(modal.merchantId, modal.status, reason)}
            />
        </div>
    );
};

export default AdminMerchants;
