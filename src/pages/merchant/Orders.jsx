import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    ShoppingCart,
    Package,
    ChevronRight,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    ArrowUpRight,
    AlertCircle,
    RotateCcw
} from 'lucide-react';
import merchantApi from '../../api/merchant';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
    CREATED: { label: 'New', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: Clock },
    CONFIRMED: { label: 'Confirmed', color: 'bg-indigo-50 text-indigo-600 border-indigo-200', icon: CheckCircle },
    PACKED: { label: 'Packed', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Package },
    SHIPPED: { label: 'Shipped', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: Truck },
    DELIVERED: { label: 'Delivered', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: CheckCircle },
    CANCELLED: { label: 'Cancelled', color: 'bg-rose-50 text-rose-600 border-rose-200', icon: XCircle },
    RETURN_REQUESTED: { label: 'Return Requested', color: 'bg-orange-50 text-orange-600 border-orange-200', icon: AlertCircle },
    RETURNED: { label: 'Returned', color: 'bg-purple-50 text-purple-600 border-purple-200', icon: RotateCcw },
    RETURN_REJECTED: { label: 'Return Rejected', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
};

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({ ALL: 0 });

    useEffect(() => {
        setPage(1);
        fetchOrders(1);
    }, [filterStatus]);

    const fetchOrders = async (targetPage = page) => {
        try {
            setLoading(true);
            const params = {
                page: targetPage,
                limit: 10,
                ...(filterStatus !== 'ALL' && { status: filterStatus })
            };
            const response = await merchantApi.getOrders(params);
            setOrders(response.data || []);
            setTotalPages(response.pagination?.pages || 1);
            setStats(response.stats || { ALL: 0 });
        } catch (error) {
            console.error('Failed to load orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            order.sub_order_id?.toLowerCase().includes(query) ||
            order.customer?.name?.toLowerCase().includes(query) ||
            order.customer?.phone?.includes(query)
        );
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary tracking-tight">Order Fulfillment</h1>
                    <p className="text-gray-500 mt-1">Manage and track your customer transactions in real-time.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find by ID, customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all shadow-sm w-72"
                        />
                    </div>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                {['ALL', 'CONFIRMED', 'PACKED', 'SHIPPED', 'RETURN_REQUESTED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${filterStatus === status
                            ? 'bg-primary text-white border-primary shadow-xl scale-[1.02]'
                            : 'bg-white text-gray-400 hover:text-accent border-gray-100'
                            }`}
                    >
                        {status} {stats[status] !== undefined && <span className={`ml-2 ${filterStatus === status ? 'text-accent' : 'text-gray-300'}`}>({stats[status]})</span>}
                    </button>
                ))}
            </div>

            {/* Orders Feed */}
            <div className="space-y-4">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-32 card-premium animate-pulse"></div>
                    ))
                ) : filteredOrders.length === 0 ? (
                    <div className="py-24 card-premium text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6 shadow-inner">
                            <ShoppingCart size={40} />
                        </div>
                        <p className="text-sm font-black text-primary uppercase tracking-widest opacity-40">
                            {searchQuery ? 'No cryptographic matches found' : 'Queue currently empty'}
                        </p>
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const StatusIcon = STATUS_CONFIG[order.status]?.icon || ShoppingCart;
                        return (
                            <div
                                key={order.sub_order_id}
                                onClick={() => navigate(`/merchant/orders/${order.sub_order_id}`)}
                                className="card-premium p-8 hover:border-accent hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 group-hover:bg-accent/10 transition-colors"></div>

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                    <div className="flex items-center gap-8">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg overflow-hidden ${STATUS_CONFIG[order.status]?.color || 'bg-gray-50'}`}>
                                            {order.preview_image ? (
                                                <img src={order.preview_image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <StatusIcon size={28} />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol</span>
                                                <span className="text-sm font-black text-primary">#{order.sub_order_id.slice(-8).toUpperCase()}</span>
                                            </div>
                                            <h3 className="text-xl font-black text-primary leading-tight group-hover:text-accent transition-colors">
                                                {order.customer?.name || 'Authorized Guest'}
                                            </h3>
                                            <div className="flex items-center gap-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={12} className="text-accent" /> {new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Package size={12} className="text-accent" /> {order.items_count || 0} Assets
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-10 justify-between md:justify-end">
                                        <div className="text-right group/tax relative">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Taxation</p>
                                            <p className="text-lg font-black text-primary tracking-tight">₹{order.tax_details?.total_tax?.toLocaleString() || '0'}</p>
                                            {/* Tax Breakdown Tooltip */}
                                            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white p-4 rounded-xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover/tax:opacity-100 group-hover/tax:visible transition-all z-50">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                        <span>CGST</span>
                                                        <span className="text-primary">₹{order.tax_details?.cgst?.toLocaleString() || '0'}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                        <span>SGST</span>
                                                        <span className="text-primary">₹{order.tax_details?.sgst?.toLocaleString() || '0'}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                        <span>IGST</span>
                                                        <span className="text-primary">₹{order.tax_details?.igst?.toLocaleString() || '0'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Settlement</p>
                                            <p className="text-3xl font-black text-primary tracking-tight">₹{order.total?.toLocaleString() || '0'}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${STATUS_CONFIG[order.status]?.color}`}>
                                                {STATUS_CONFIG[order.status]?.label || order.status}
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-accent group-hover:text-white group-hover:shadow-lg group-hover:shadow-accent/20 transition-all">
                                                <ChevronRight size={24} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-8">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const newPage = Math.max(1, page - 1);
                            setPage(newPage);
                            fetchOrders(newPage);
                        }}
                        disabled={page === 1 || loading}
                        className="px-8 py-3 bg-white border border-gray-100 rounded-xl text-xs font-black uppercase tracking-widest text-primary disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        Previous
                    </button>
                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => {
                                    setPage(p);
                                    fetchOrders(p);
                                }}
                                className={`w-11 h-11 rounded-xl text-xs font-black transition-all ${page === p
                                    ? 'bg-primary text-white shadow-xl scale-110'
                                    : 'bg-white text-gray-400 hover:text-accent border border-gray-100 hover:border-accent shadow-sm'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const newPage = Math.min(totalPages, page + 1);
                            setPage(newPage);
                            fetchOrders(newPage);
                        }}
                        disabled={page === totalPages || loading}
                        className="px-8 py-3 bg-white border border-gray-100 rounded-xl text-xs font-black uppercase tracking-widest text-primary disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Orders;
