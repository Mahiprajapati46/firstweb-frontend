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
        <div className="bg-[#fdfaf5] min-h-screen pb-32 pt-12">
            <div className="container-custom max-w-7xl mx-auto px-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c19a6b]">Member Account</p>
                        <h1 className="text-6xl font-black text-primary tracking-tighter italic serif">Order Vault<span className="text-[#c19a6b]">.</span></h1>
                    </div>
                </div>

                {/* Filters & Search Placeholder */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-12">
                    <div className="flex-1 relative w-full">
                        <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c19a6b]" />
                        <input
                            type="text"
                            placeholder="SEARCH BY ORDER ID OR ITEM"
                            className="w-full bg-white border border-[#e5e5d1]/50 rounded-2xl px-14 py-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[#c19a6b] transition-all"
                        />
                    </div>
                    <button className="w-full md:w-auto px-8 py-4 bg-white border border-[#e5e5d1]/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary flex items-center justify-center gap-3">
                        <Filter size={14} /> Refine Vault
                    </button>
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-32 bg-white rounded-[2.5rem] border border-[#e5e5d1]/30 animate-pulse"></div>
                        ))
                    ) : orders.length > 0 ? (
                        orders.map((order) => (
                            <Link
                                key={order.order_id}
                                to={`/orders/${order.order_id}`}
                                className="group block bg-white border border-[#e5e5d1]/50 p-8 rounded-[3rem] hover:shadow-2xl hover:shadow-primary/5 transition-all duration-700 relative overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                    <div className="flex items-center gap-8">
                                        <div className="w-16 h-16 bg-[#fdfaf5] rounded-[1.5rem] flex items-center justify-center font-black text-primary text-xl shadow-inner border border-[#e5e5d1]/30 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                                            <Package size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <span className={getStatusStyles(order.status)}>{order.status}</span>
                                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest tabular-nums">#{order.order_id.slice(-8).toUpperCase()}</span>
                                            </div>
                                            <h3 className="text-xl font-black text-primary tracking-tight">Curation Processed</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#9f8170] italic">
                                                Sequenced on {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-12 border-t md:border-t-0 border-[#e5e5d1]/30 pt-6 md:pt-0">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Valuation</p>
                                            <p className="text-2xl font-black text-primary tabular-nums tracking-tighter italic">₹ {order.total}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-[#fdfaf5] border border-[#e5e5d1]/50 flex items-center justify-center text-[#c19a6b] group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:rotate-45">
                                            <ArrowUpRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="py-32 text-center bg-white rounded-[4rem] border border-dashed border-[#e5e5d1]/50 px-12 space-y-8">
                            <div className="w-20 h-20 bg-[#fdfaf5] rounded-[2rem] flex items-center justify-center text-gray-200 mx-auto">
                                <ShoppingBag size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-primary italic serif tracking-tighter">Your vault is currently empty.</h3>
                                <p className="text-[#9f8170] italic max-w-sm mx-auto">Discover our collection of hand-curated artisan products to begin your collection.</p>
                            </div>
                            <Link to="/products" className="inline-flex py-5 px-12 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all">Start Discovering</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Orders;
