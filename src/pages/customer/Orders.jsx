import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Clock,
    ChevronRight,
    ShoppingBag,
    ArrowLeft,
    Search,
    Filter,
    Package,
    ArrowUpRight
} from 'lucide-react';
import customerApi from '../../api/customer';
import toast from 'react-hot-toast';

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await customerApi.getOrders();
            if (response.data) {
                setOrders(response.data);
            }
        } catch (error) {
            console.error('Fetch Orders Error:', error);
            toast.error('Failed to retrieve your order history');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status) => {
        const base = "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border";
        switch (status) {
            case 'CONFIRMED': return `${base} bg-emerald-50 text-emerald-600 border-emerald-100`;
            case 'CREATED': return `${base} bg-blue-50 text-blue-600 border-blue-100`;
            case 'SHIPPED': return `${base} bg-[#c19a6b10] text-[#c19a6b] border-[#c19a6b20]`;
            case 'DELIVERED': return `${base} bg-primary/10 text-primary border-primary/20`;
            case 'CANCELLED': return `${base} bg-red-50 text-red-600 border-red-100`;
            default: return `${base} bg-gray-50 text-gray-500 border-gray-100`;
        }
    };

    return (
        <div className="bg-[#f8f9fa] min-h-screen pt-12 pb-24">
            <div className="max-w-5xl mx-auto px-4 md:px-6 pt-8">
                {/* Header Section */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">Check the status of your recent orders and tracking.</p>
                </div>

                {/* Simplified Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse"></div>
                        ))
                    ) : orders.length > 0 ? (
                        orders.map((order) => (
                            <Link
                                key={order.order_id}
                                to={`/orders/${order.order_id}`}
                                className="group block bg-white border border-gray-100 p-4 md:p-6 rounded-2xl hover:shadow-md transition-all relative"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4 md:gap-6">
                                        {/* Order Preview Image */}
                                        <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center text-primary border border-gray-100 shrink-0 group-hover:bg-primary/5 transition-colors">
                                            {order.preview_image ? (
                                                <img src={order.preview_image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Package size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className={getStatusStyles(order.status)}>{order.status}</span>
                                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">ID: #{order.order_id.slice(-8).toUpperCase()}</span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-lg truncate mb-0.5">
                                                {order.status === 'DELIVERED' ? 'Order Delivered' : 'Order in Progress'}
                                            </h3>
                                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                                                Ordered on {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 border-gray-50 pt-4 md:pt-0">
                                        <div className="text-left md:text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                                            <p className="text-xl font-black text-gray-900 tabular-nums">₹{order.total}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-gray-200 px-6 space-y-6">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto">
                                <ShoppingBag size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
                                <p className="text-gray-500 text-sm max-w-xs mx-auto">You haven't placed any orders yet. Start shopping to fill your history.</p>
                            </div>
                            <Link to="/products" className="inline-flex py-3 px-8 bg-primary text-white rounded-xl font-bold text-sm transition-all hover:bg-secondary">
                                Start Shopping
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Orders;
