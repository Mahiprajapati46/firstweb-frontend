import React, { useState, useEffect } from 'react';
import {
    History,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    User,
    Activity,
    Calendar,
    ArrowUpRight,
    RefreshCcw
} from 'lucide-react';
import adminApi from '../../api/admin';
import toast from 'react-hot-toast';

const AuditLogs = () => {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0 });
    const [filters, setFilters] = useState({
        action: '',
        target_type: ''
    });

    useEffect(() => {
        fetchLogs();
    }, [meta.page, filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getAuditLogs({
                page: meta.page,
                limit: meta.limit,
                ...filters
            });
            setLogs(response.data || []);
            setMeta(prev => ({ ...prev, total: response.meta?.total || 0 }));
        } catch (error) {
            toast.error(error.message || 'Failed to fetch audit logs');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setMeta(prev => ({ ...prev, page: 1 }));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActionColor = (action) => {
        if (action.includes('BLOCK') || action.includes('DELETE') || action.includes('REJECT')) return 'text-red-500 bg-red-50';
        if (action.includes('CREATE') || action.includes('APPROVE')) return 'text-emerald-500 bg-emerald-50';
        if (action.includes('UPDATE')) return 'text-amber-500 bg-amber-50';
        return 'text-[#c19a6b] bg-[#c19a6b10]';
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight">Audit Trail</h1>
                    <p className="text-gray-500 mt-2 font-medium">Immutable record of all administrative interventions.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-premium p-4 flex items-center gap-4">
                    <div className="p-2 bg-[#c19a6b15] text-[#c19a6b] rounded-lg">
                        <Activity size={20} />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#c19a6b] mb-1">Action Type</label>
                        <select
                            name="action"
                            value={filters.action}
                            onChange={handleFilterChange}
                            className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-primary text-sm"
                        >
                            <option value="">All Actions</option>
                            <option value="BLOCK_USER">Block User</option>
                            <option value="UNBLOCK_USER">Unblock User</option>
                            <option value="APPROVE_MERCHANT">Approve Merchant</option>
                            <option value="REJECT_MERCHANT">Reject Merchant</option>
                            <option value="UPDATE_SETTINGS">Update Settings</option>
                            <option value="REVIEW_PRODUCT">Review Product</option>
                        </select>
                    </div>
                </div>

                <div className="card-premium p-4 flex items-center gap-4">
                    <div className="p-2 bg-[#9f817015] text-[#9f8170] rounded-lg">
                        <Filter size={20} />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#9f8170] mb-1">Target Resource</label>
                        <select
                            name="target_type"
                            value={filters.target_type}
                            onChange={handleFilterChange}
                            className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-primary text-sm"
                        >
                            <option value="">All Resources</option>
                            <option value="USER">User</option>
                            <option value="MERCHANT">Merchant</option>
                            <option value="PRODUCT">Product</option>
                            <option value="SETTINGS">Settings</option>
                            <option value="COUPON">Coupon</option>
                        </select>
                    </div>
                </div>

                <div className="card-premium p-4 flex items-center gap-4 bg-primary group overflow-hidden relative">
                    <div className="flex-1 relative z-10">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Audits</label>
                        <p className="text-2xl font-black text-white">{meta.total}</p>
                    </div>
                    <History className="text-[#c19a6b] opacity-20 group-hover:scale-110 transition-transform duration-500" size={48} />
                </div>
            </div>

            {/* Logs Table */}
            <div className="card-premium overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Timestamp</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Administrator</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Action</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Target</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-4">
                                            <div className="h-4 bg-gray-100 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-[#f5f5dc20] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Calendar size={14} />
                                                <span className="text-xs font-bold">{formatDate(log.createdAt)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#c19a6b20] flex items-center justify-center text-[#c19a6b] font-black text-xs uppercase">
                                                    {log.admin_user_id?.full_name?.charAt(0) || 'A'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-primary">{log.admin_user_id?.full_name || 'Admin'}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">{log.admin_user_id?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getActionColor(log.action)}`}>
                                                {log.action.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-black uppercase tracking-widest border border-gray-200">
                                                    {log.target_type}
                                                </span>
                                                <span className="text-xs font-bold text-gray-400 truncate max-w-[100px]">ID: {log.target_id.slice(-6)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-[#c19a6b] transition-colors rounded-lg hover:bg-[#c19a6b10]">
                                                <ArrowUpRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <History size={48} className="mx-auto text-gray-100 mb-4" />
                                        <p className="text-gray-400 font-bold tracking-tight">No governance activity recorded.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && logs.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-400">
                            Showing <span className="text-primary">{(meta.page - 1) * meta.limit + 1}</span> to <span className="text-primary">{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="text-primary">{meta.total}</span> audits
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setMeta(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={meta.page === 1}
                                className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-[#c19a6b] hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="text-xs font-black px-4 text-primary uppercase tracking-widest">Page {meta.page}</span>
                            <button
                                onClick={() => setMeta(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={meta.page * meta.limit >= meta.total}
                                className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-[#c19a6b] hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
