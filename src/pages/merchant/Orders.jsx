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
        setPage(1); // Reset to page 1 when filter changes
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

    const statusCounts = stats;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Orders & Fulfillment</h1>
                    <p className="text-slate-500 mt-1 font-medium italic lowercase">Manage your customer orders end-to-end.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by ID, customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Status Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['ALL', 'CONFIRMED', 'PACKED', 'SHIPPED', 'RETURN_REQUESTED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterStatus === status
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-100'
                            }`}
                    >
                        {status} {statusCounts[status] !== undefined && `(${statusCounts[status]})`}
                    </button>
                ))}
            </div>

            {/* Orders Feed */}
            <div className="space-y-4">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-28 bg-white rounded-3xl border border-slate-50 animate-pulse"></div>
                    ))
                ) : filteredOrders.length === 0 ? (
                    <div className="p-20 bg-white rounded-3xl border border-slate-100 text-center shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                            <ShoppingCart size={32} />
                        </div>
                        <p className="text-slate-500 font-bold">
                            {searchQuery ? 'No orders match your search.' : 'No orders found in this category.'}
                        </p>
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const StatusIcon = STATUS_CONFIG[order.status]?.icon || ShoppingCart;
                        return (
                            <div
                                key={order.sub_order_id}
                                onClick={() => navigate(`/merchant/orders/${order.sub_order_id}`)}
                                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${STATUS_CONFIG[order.status]?.color || 'bg-slate-50'}`}>
                                            <StatusIcon size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</span>
                                                <span className="text-sm font-black text-slate-900">#{order.sub_order_id.slice(-6)}</span>
                                            </div>
                                            <h3 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors">
                                                {order.customer?.name || 'Guest User'}
                                            </h3>
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} /> {new Date(order.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Package size={12} /> {order.items_count || 0} Items
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 justify-between md:justify-end">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Subtotal</p>
                                            <p className="text-2xl font-black text-slate-900">₹{order.total?.toLocaleString() || '0'}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider ${STATUS_CONFIG[order.status]?.color}`}>
                                                {STATUS_CONFIG[order.status]?.label || order.status}
                                            </div>
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                                <ArrowUpRight size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-8">
                    <button
                        onClick={() => {
                            const newPage = Math.max(1, page - 1);
                            setPage(newPage);
                            fetchOrders(newPage);
                        }}
                        disabled={page === 1 || loading}
                        className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 disabled:opacity-50 hover:bg-slate-50 transition-all"
                    >
                        PREVIOUS
                    </button>
                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => {
                                    setPage(p);
                                    fetchOrders(p);
                                }}
                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${page === p
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-100'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            const newPage = Math.min(totalPages, page + 1);
                            setPage(newPage);
                            fetchOrders(newPage);
                        }}
                        disabled={page === totalPages || loading}
                        className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 disabled:opacity-50 hover:bg-slate-50 transition-all"
                    >
                        NEXT
                    </button>
                </div>
            )}
        </div>
    );
};

export default Orders;
