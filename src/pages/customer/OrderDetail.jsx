import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Package,
    MapPin,
    CreditCard,
    Truck,
    Calendar,
    Receipt,
    ExternalLink,
    ChevronRight
} from 'lucide-react';
import customerApi from '../../api/customer';
import toast from 'react-hot-toast';

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetail();
    }, [orderId]);

    const fetchOrderDetail = async () => {
        try {
            setLoading(true);
            const response = await customerApi.getOrderById(orderId);
            if (response.data) {
                setOrder(response.data);
            }
        } catch (error) {
            console.error('Fetch Order Detail Error:', error);
            toast.error('Failed to retrieve order details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container-custom max-w-5xl mx-auto px-6 py-20 animate-pulse">
                <div className="h-12 bg-gray-100 rounded-full w-64 mb-16"></div>
                <div className="space-y-8">
                    <div className="h-64 bg-white rounded-[3rem] border border-[#e5e5d1]/30"></div>
                    <div className="h-96 bg-white rounded-[3rem] border border-[#e5e5d1]/30"></div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="bg-[#fdfaf5] min-h-screen flex items-center justify-center">
                <div className="text-center space-y-6">
                    <h2 className="text-3xl font-black text-primary italic serif">Order not found.</h2>
                    <Link to="/orders" className="text-sm font-black text-[#c19a6b] uppercase tracking-widest">Return to Vault</Link>
                </div>
            </div>
        );
    }

    const {
        pricing = {},
        shipping_address_snapshot = {},
        payment = {},
        order_number = 'N/A',
        createdAt,
        status
    } = order;

    return (
        <div className="bg-[#fdfaf5] min-h-screen pb-32 pt-12">
            <div className="container-custom max-w-5xl mx-auto px-6">
                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-16">
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#c19a6b] hover:text-primary transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Vault
                    </button>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c19a6b]">Curation Reference</p>
                        <h1 className="text-4xl font-black text-primary tracking-tighter tabular-nums">#{order_number}</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    {/* Main Content: Items & Status */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Status Timeline Placeholder */}
                        <div className="bg-white p-10 rounded-[3rem] border border-[#e5e5d1]/50 shadow-sm relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-primary tracking-tight italic">Curation Lifecycle</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">Status: {status}</p>
                                </div>
                                <div className="w-12 h-12 bg-[#fdfaf5] rounded-2xl flex items-center justify-center text-[#c19a6b] border border-[#e5e5d1]/50 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                    <Package size={20} />
                                </div>
                            </div>

                            {/* Decorative Timeline */}
                            <div className="relative pt-4 px-2">
                                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#fdfaf5]"></div>
                                <div className="flex justify-between relative">
                                    {['Placed', 'Processing', 'Shipped', 'Delivered'].map((step, i) => (
                                        <div key={i} className="flex flex-col items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full border-2 z-10 ${i === 0 ? 'bg-primary border-primary shadow-[0_0_10px_rgba(0,0,0,0.1)]' : 'bg-white border-[#e5e5d1]'}`}></div>
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${i === 0 ? 'text-primary' : 'text-gray-300'}`}>{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-black text-primary tracking-tighter italic serif">Itemized Selection</h3>
                            <div className="bg-white rounded-[3.5rem] border border-[#e5e5d1]/50 overflow-hidden divide-y divide-[#e5e5d1]/30 shadow-sm">
                                {order.sub_orders?.map((sub) => (
                                    sub.items.map((item, i) => (
                                        <div key={`${sub.merchant_id}-${i}`} className="p-10 flex flex-col md:flex-row md:items-center gap-8 group hover:bg-[#fdfaf5] transition-colors relative">
                                            <div className="w-20 h-20 bg-[#fdfaf5] rounded-2xl overflow-hidden shrink-0 border border-[#e5e5d1]/30">
                                                <img src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1999'} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <Link to={`/products/${item.product?.slug || '#'}`} className="text-lg font-black text-primary tracking-tight hover:text-[#c19a6b] transition-colors stretched-link">
                                                        {item.product_name}
                                                    </Link>
                                                    <span className="px-3 py-1 bg-[#fdfaf5] border border-[#e5e5d1]/50 rounded-lg text-[8px] font-black uppercase tracking-widest text-[#9f8170] z-10 relative">{item.variant_label}</span>
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#9f8170] italic">Quantity: {item.quantity}</p>
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                                                    Managed by <span className="text-[#c19a6b]">Artisan #{item.merchant_id?.slice(-4).toUpperCase()}</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-primary tabular-nums tracking-tighter">₹ {item.price * item.quantity}</p>
                                                <p className="text-[10px] font-bold text-gray-300 uppercase italic">₹ {item.price} ea.</p>
                                            </div>
                                        </div>
                                    ))
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Details & Value */}
                    <div className="lg:col-span-1 space-y-10">
                        {/* Summary Card */}
                        <div className="bg-white p-10 rounded-[3rem] border border-[#e5e5d1]/50 shadow-xl space-y-10">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c19a6b]">Valuation</p>
                                <h4 className="text-3xl font-black text-primary tracking-tighter italic">Curation Value</h4>
                            </div>

                            <div className="space-y-6 border-y border-[#e5e5d1]/30 py-10">
                                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-[#9f8170]">
                                    <span>Subtotal</span>
                                    <span className="text-primary tabular-nums">₹ {pricing?.subtotal || 0}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-[#9f8170]">
                                    <span>Logistics</span>
                                    <span className="text-emerald-500 italic">Complimentary</span>
                                </div>
                                {pricing?.discount > 0 && (
                                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-emerald-500">
                                        <span>Coupon Reward</span>
                                        <span className="tabular-nums">- ₹ {pricing?.discount}</span>
                                    </div>
                                )}
                                {pricing?.amount_paid_via_wallet > 0 && (
                                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-[#c19a6b]">
                                        <span>Wallet Credit</span>
                                        <span className="tabular-nums">- ₹ {pricing?.amount_paid_via_wallet}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <span className="text-xs font-black uppercase tracking-widest text-[#c19a6b]">Net Total</span>
                                <span className="text-4xl font-black text-primary tracking-tighter tabular-nums italic">₹ {pricing?.total || 0}</span>
                            </div>
                        </div>

                        {/* Info Sections */}
                        <div className="space-y-6">
                            <div className="p-8 bg-white rounded-[2.5rem] border border-[#e5e5d1]/50 space-y-6">
                                <div className="flex items-center gap-4 text-primary">
                                    <div className="w-10 h-10 bg-[#fdfaf5] rounded-xl flex items-center justify-center border border-[#e5e5d1]/50">
                                        <MapPin size={18} />
                                    </div>
                                    <h4 className="text-xs font-black uppercase tracking-widest">Delivery Vault</h4>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-black text-primary">{shipping_address_snapshot.name}</p>
                                    <p className="text-xs font-medium text-[#9f8170] leading-relaxed italic">
                                        {shipping_address_snapshot.line1}, {shipping_address_snapshot.line2 && `${shipping_address_snapshot.line2}, `}
                                        {shipping_address_snapshot.city}, {shipping_address_snapshot.state} - {shipping_address_snapshot.pincode}
                                    </p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pt-2">{shipping_address_snapshot.phone}</p>
                                </div>
                            </div>

                            <div className="p-8 bg-white rounded-[2.5rem] border border-[#e5e5d1]/50 space-y-6">
                                <div className="flex items-center gap-4 text-primary">
                                    <div className="w-10 h-10 bg-[#fdfaf5] rounded-xl flex items-center justify-center border border-[#e5e5d1]/50">
                                        <Receipt size={18} />
                                    </div>
                                    <h4 className="text-xs font-black uppercase tracking-widest">Resolution</h4>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-primary uppercase tracking-widest">{payment?.provider || 'Secure Pay'}</p>
                                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest italic">{payment?.status || 'Confirmed'}</p>
                                    </div>
                                    <button className="p-4 bg-[#fdfaf5] rounded-xl text-[#c19a6b] hover:bg-primary hover:text-white transition-all">
                                        <ExternalLink size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
