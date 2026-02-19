import React, { useEffect, useState } from 'react';
import {
    CheckCircle,
    XCircle,
    ExternalLink,
    Eye,
    Search,
    Filter,
    CheckSquare,
    MoreVertical,
    AlertCircle,
    Trash2,
    Power,
    Package,
    RefreshCw,
    MessageSquare,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import adminApi from '../../api/admin';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';

const StatusBadge = ({ status }) => {
    const styles = {
        APPROVED: "bg-green-100 text-green-700 border-green-200",
        PENDING: "bg-orange-100 text-orange-700 border-orange-200",
        REJECTED: "bg-red-100 text-red-700 border-red-200",
        DRAFT: "bg-gray-100 text-gray-500 border-gray-200",
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${styles[status] || styles.DRAFT}`}>
            {status}
        </span>
    );
};

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(''); // Use empty string for ALL as per API

    const fetchProducts = async (page = 1) => {
        setLoading(true);
        try {
            const response = await adminApi.getAdminProducts({
                status: statusFilter,
                page,
                limit: meta.limit
            });
            setProducts(response.data || []);
            setMeta(response.meta);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Sync error: Catalog retrieval failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(1);
    }, [statusFilter]);

    const handleReview = async (id, action) => {
        let reason = '';
        if (action === 'REJECT') {
            reason = prompt('Reason for rejection?');
            if (reason === null) return; // User cancelled
            if (!reason.trim()) {
                toast.error('Rejection reason is mandatory');
                return;
            }
        } else if (!window.confirm(`Mark this product as ${action === 'APPROVE' ? 'APPROVED' : 'REJECTED'}?`)) {
            return;
        }

        setActionLoading(id);
        try {
            await adminApi.reviewProduct(id, { action, rejection_reason: reason });
            toast.success(`Product ${action === 'APPROVE' ? 'Approved' : 'Rejected'}`);
            fetchProducts(meta.page);
        } catch (error) {
            toast.error(error.message || 'Review protocol failed');
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleStatus = async (id) => {
        if (!window.confirm('Toggle availability status for this product?')) return;
        setActionLoading(id);
        try {
            await adminApi.toggleProductActive(id);
            toast.success('Availability state toggled');
            fetchProducts(meta.page);
        } catch (error) {
            toast.error(error.message || 'Status transition failed');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('DANGER: Permanently delete this product and all associated assets? This cannot be undone.')) return;
        setActionLoading(id);
        try {
            await adminApi.deleteProductPermanently(id);
            toast.success('Product purged from system');
            fetchProducts(meta.page);
        } catch (error) {
            toast.error(error.message || 'Purge sequence failed');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p._id.includes(searchTerm)
    );

    if (loading && !products.length) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-accent">Syncing Global Catalog...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tighter uppercase italic">Product Governance</h1>
                    <p className="text-gray-400 font-medium text-sm mt-1">Audit, regulate, and curate marketplace listings.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => fetchProducts(meta.page)}
                        className="gap-2 bg-white border-gray-100 hover:border-accent transition-all uppercase text-[10px] font-black tracking-widest"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Sync
                    </Button>
                </div>
            </div>

            {/* Filter Hub */}
            <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent transition-colors" size={18} />
                    <Input
                        placeholder="Filter by Title or System ID..."
                        className="pl-12 bg-gray-50/50 border-gray-100 focus:bg-white transition-all text-sm font-bold"
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
                            {f || 'ALL ENTITIES'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Catalog Grid */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 uppercase text-[10px] tracking-[0.2em] font-black border-b border-gray-100">
                                <th className="px-8 py-6">Listing Identity</th>
                                <th className="px-8 py-6">Status Hub</th>
                                <th className="px-8 py-6">Value (Base)</th>
                                <th className="px-8 py-6">Operational State</th>
                                <th className="px-8 py-6 text-right">Moderation Hub</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProducts.map((p) => (
                                <tr key={p._id} className="hover:bg-gray-50/20 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                                {p.images?.length > 0 ? (
                                                    <img src={p.images[0]} alt="" className="object-cover w-full h-full" />
                                                ) : (
                                                    <Package size={24} className="text-gray-200" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-primary text-base tracking-tight leading-tight mb-1">
                                                    {p.title}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] text-gray-400 font-mono font-black uppercase tracking-widest px-2 py-0.5 bg-gray-50 rounded border border-gray-100 italic">ID: {p._id.slice(-12)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <StatusBadge status={p.status} />
                                        {p.rejection_reason && (
                                            <div className="mt-2 flex items-start gap-1.5 max-w-[200px]">
                                                <MessageSquare size={12} className="text-rose-400 shrink-0 mt-0.5" />
                                                <p className="text-[10px] text-rose-500 font-bold italic line-clamp-2 leading-tight">
                                                    "{p.rejection_reason}"
                                                </p>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-lg font-black text-primary italic">₹{p.pricing?.min_price?.toLocaleString() || 0}</p>
                                        <p className="text-[10px] text-gray-300 uppercase font-black tracking-tighter">Market Floor</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${p.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-wider ${p.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                                {p.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-3 pr-2">
                                            {p.status === 'PENDING' && (
                                                <div className="flex gap-1.5 p-1 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                    <button
                                                        onClick={() => handleReview(p._id, 'APPROVE')}
                                                        disabled={actionLoading === p._id}
                                                        className="p-2.5 text-green-500 hover:bg-green-50 rounded-lg transition-all"
                                                        title="Authorize Listing"
                                                    >
                                                        <CheckCircle size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReview(p._id, 'REJECT')}
                                                        disabled={actionLoading === p._id}
                                                        className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                        title="Reject Application"
                                                    >
                                                        <XCircle size={20} />
                                                    </button>
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(p._id)}
                                                    disabled={actionLoading === p._id}
                                                    className={`p-2.5 rounded-xl border transition-all ${p.is_active ? 'text-amber-500 border-amber-50 hover:bg-amber-50' : 'text-emerald-500 border-emerald-50 hover:bg-emerald-50'}`}
                                                    title={p.is_active ? "Deactivate" : "Activate"}
                                                >
                                                    <Power size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p._id)}
                                                    disabled={actionLoading === p._id}
                                                    className="p-2.5 text-gray-300 hover:text-rose-600 border border-transparent hover:border-rose-50 hover:bg-rose-50 rounded-xl transition-all"
                                                    title="Purge Permanently"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-32 text-center bg-gray-50/10">
                                        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-1000">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl shadow-gray-200 border border-gray-50">
                                                <Search size={32} className="text-gray-100" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs mb-1">No matches in catalog</p>
                                                <p className="text-gray-300 text-[10px] font-bold italic">Adjust filters to re-index governance results.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Hub */}
                    {meta.total > meta.limit && (
                        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Indexing <span className="text-primary">{meta.total}</span> entries
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => fetchProducts(meta.page - 1)}
                                    disabled={meta.page <= 1 || loading}
                                    className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary disabled:opacity-30 disabled:hover:text-gray-400 transition-all shadow-sm"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-xs font-black text-primary italic uppercase tracking-tighter">Segment {meta.page}</span>
                                <button
                                    onClick={() => fetchProducts(meta.page + 1)}
                                    disabled={meta.page * meta.limit >= meta.total || loading}
                                    className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary disabled:opacity-30 disabled:hover:text-gray-400 transition-all shadow-sm"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminProducts;
