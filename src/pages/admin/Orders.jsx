import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    Filter,
    ChevronDown,
    MoreVertical,
    Eye,
    ShoppingCart,
    Calendar,
    DollarSign,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowRight,
    RefreshCw
} from 'lucide-react';
import adminApi from '../../api/admin';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const query = {
                page: pagination.page,
                limit: pagination.limit
            };

            if (filter !== 'ALL') {
                query.status = filter;
            }

            // Note: API doesn't support generic search yet, but we can add customer_id if we have a search mechanism
            // For now, we rely on status filters

            const response = await adminApi.getOrders(query);
            setOrders(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [pagination.page, filter]);

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            CREATED: 'bg-blue-50 text-blue-600 border-blue-100',
            CONFIRMED: 'bg-indigo-50 text-indigo-600 border-indigo-100',
            PACKED: 'bg-purple-50 text-purple-600 border-purple-100',
            SHIPPED: 'bg-amber-50 text-amber-600 border-amber-100',
            DELIVERED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            CANCELLED: 'bg-red-50 text-red-600 border-red-100',
            RETURN_REQUESTED: 'bg-orange-50 text-orange-600 border-orange-100',
            RETURNED: 'bg-gray-50 text-gray-600 border-gray-100'
        };

        const icons = {
            CREATED: <ShoppingCart size={12} />,
            CONFIRMED: <CheckCircle2 size={12} />,
            PACKED: <Package size={12} />,
            SHIPPED: <Truck size={12} />,
            DELIVERED: <CheckCircle2 size={12} />,
            CANCELLED: <XCircle size={12} />,
            RETURN_REQUESTED: <RefreshCw size={12} />,
            RETURNED: <RefreshCw size={12} />
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${styles[status] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                {icons[status] || <Clock size={12} />}
                {status?.replace('_', ' ')}
            </span>
        );
    };

    const tabs = [
        { id: 'ALL', label: 'All Orders' },
        { id: 'CREATED', label: 'New' },
        { id: 'CONFIRMED', label: 'Confirmed' },
        { id: 'SHIPPED', label: 'Shipped' },
        { id: 'DELIVERED', label: 'Completed' },
        { id: 'CANCELLED', label: 'Cancelled' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight">Order Management</h1>
                    <p className="text-gray-400 font-bold mt-1">Track and manage platform-wide orders</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon={RefreshCw} onClick={fetchOrders}>
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filter Hub */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 p-2 overflow-x-auto">
                <div className="flex items-center gap-2 min-w-max">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setFilter(tab.id);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${filter === tab.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-100'
                                : 'text-gray-400 hover:bg-gray-50 hover:text-primary scale-95 hover:scale-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                                <th className="text-left py-6 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                                <th className="text-left py-6 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                <th className="text-left py-6 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="text-left py-6 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                                <th className="text-center py-6 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</th>
                                <th className="text-center py-6 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="text-right py-6 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-50">
                                            <ShoppingCart size={48} className="text-gray-300" />
                                            <p className="text-gray-400 font-bold text-sm">No orders found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-8">
                                            <div className="font-bold text-primary group-hover:text-accent transition-colors">
                                                #{order.order_number || order._id.slice(-8).toUpperCase()}
                                            </div>
                                        </td>
                                        <td className="py-4 px-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400">
                                                    {order.user_id?.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-primary">{order.user_id?.full_name || 'Unknown User'}</div>
                                                    <div className="text-xs font-medium text-gray-400">{order.user_id?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-8">
                                            <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                                <Calendar size={14} className="text-gray-300" />
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-400 pl-6">
                                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="py-4 px-8">
                                            <div className="font-black text-primary">
                                                {order.pricing?.currency} {order.pricing?.total?.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="py-4 px-8 text-center">
                                            <span className={`inline-flex px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${order.payment?.status === 'SUCCESS' ? 'bg-green-50 text-green-600' :
                                                order.payment?.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-red-50 text-red-600'
                                                }`}>
                                                {order.payment?.status || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-8 text-center">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="py-4 px-8 text-right">
                                            <Link
                                                to={`/admin/orders/${order._id}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all shadow-sm group-hover:shadow-md"
                                            >
                                                View <ArrowRight size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-gray-50 flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-400">
                        Showing {orders.length} of {pagination.total} orders
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="text-xs py-2 h-auto"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.pages}
                            className="text-xs py-2 h-auto"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
