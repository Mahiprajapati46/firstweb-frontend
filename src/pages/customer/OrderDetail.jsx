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
    ChevronRight,
    AlertCircle,
    RotateCcw,
    XCircle,
    CheckCircle2
} from 'lucide-react';
import customerApi from '../../api/customer';
import toast from 'react-hot-toast';

// Simple Premium Modal Component
const ReturnModal = ({ isOpen, onClose, onSubmit, loading }) => {
    const [reason, setReason] = useState('');
    const [refundToCard, setRefundToCard] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-[3rem] border border-[#e5e5d1] shadow-2xl p-12 max-w-md w-full relative z-10 space-y-8 animate-in fade-in zoom-in duration-300">
                <div className="space-y-2">
                    <h3 className="text-3xl font-black text-primary tracking-tighter italic serif">Initiate Return</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">Provide details for your request</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#c19a6b]">Reason for Return</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please tell us why you wish to return this curation..."
                            className="w-full bg-[#fdfaf5] border border-[#e5e5d1]/50 rounded-2xl p-6 text-sm font-medium focus:outline-none focus:border-primary transition-colors min-h-[120px] resize-none"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#c19a6b]">Refund Preference</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setRefundToCard(false)}
                                className={`p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${!refundToCard ? 'bg-primary text-white border-primary' : 'bg-white text-[#9f8170] border-[#e5e5d1]/50'}`}
                            >
                                Wallet Credit
                            </button>
                            <button
                                onClick={() => setRefundToCard(true)}
                                className={`p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${refundToCard ? 'bg-primary text-white border-primary' : 'bg-white text-[#9f8170] border-[#e5e5d1]/50'}`}
                            >
                                Original Card
                            </button>
                        </div>
                        <p className="text-[8px] font-bold text-gray-400 italic">Note: Card refunds may take 5-10 business days. Wallet credits are instant upon approval.</p>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#9f8170] hover:text-primary transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={() => onSubmit({ reason, refundToCard })}
                        disabled={loading || !reason.trim()}
                        className="flex-[2] bg-primary text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                        {loading ? 'Processing...' : 'Submit Request'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);

    useEffect(() => {
        fetchOrderDetail();
    }, [orderId]);

    const fetchOrderDetail = async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const response = await customerApi.getOrderById(orderId);
            if (response.data) {
                setOrder(response.data);
            }
        } catch (error) {
            console.error('Fetch Order Detail Error:', error);
            if (!isSilent) toast.error('Failed to retrieve order details');
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!window.confirm('Are you certain you wish to cancel this curation? This action is irreversible.')) return;

        try {
            setActionLoading(true);
            const res = await customerApi.cancelOrder(orderId, { refund_to_card: false });
            toast.success(res.message || 'Curation successfully cancelled');
            fetchOrderDetail();
        } catch (error) {
            toast.error(error.message || 'Resolution failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReturnSubmit = async ({ reason, refundToCard }) => {
        try {
            setActionLoading(true);
            const res = await customerApi.requestReturn(orderId, { reason, refund_to_card: refundToCard });
            toast.success(res.message || 'Return request submitted');
            setShowReturnModal(false);
            fetchOrderDetail();
        } catch (error) {
            toast.error(error.message || 'Return initiation failed');
        } finally {
            setActionLoading(false);
        }
    };

    // Polling for live updates
    useEffect(() => {
        const terminalStates = ['DELIVERED', 'CANCELLED', 'RETURNED', 'RETURN_REJECTED'];

        if (!order || terminalStates.includes(order.status)) {
            return;
        }

        const interval = setInterval(() => {
            fetchOrderDetail(true);
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [order?.status]);

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

                            {/* Status Timeline Placeholder */}
                            <div className="relative pt-4 px-2">
                                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#fdfaf5]"></div>
                                <div className="flex justify-between relative">
                                    {[
                                        { label: 'Placed', matches: ['CREATED', 'CONFIRMED'] },
                                        { label: 'Packed', matches: ['PACKED'] },
                                        { label: 'Shipped', matches: ['SHIPPED', 'OUT_FOR_DELIVERY'] },
                                        { label: 'Delivered', matches: ['DELIVERED'] }
                                    ].map((step, i, arr) => {
                                        const statuses = ['CREATED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
                                        const currentIdx = statuses.indexOf(status);

                                        // Find the highest status index among the matches for this step
                                        const stepIndices = step.matches.map(s => statuses.indexOf(s));
                                        const minStepIdx = Math.min(...stepIndices);

                                        const isActive = (status === 'CANCELLED' || status === 'RETURNED' || status === 'RETURN_REQUESTED' || status === 'RETURN_REJECTED')
                                            ? false
                                            : currentIdx >= minStepIdx;

                                        return (
                                            <div key={i} className="flex flex-col items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full border-2 z-10 transition-all duration-1000 ${isActive ? 'bg-primary border-primary shadow-[0_0_10px_rgba(193,154,107,0.3)]' : 'bg-white border-[#e5e5d1]'}`}></div>
                                                <span className={`text-[8px] font-black uppercase tracking-widest transition-colors duration-1000 ${isActive ? 'text-primary' : 'text-gray-300'}`}>{step.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Status Specific Alerts */}
                            {(status === 'CANCELLED' || status === 'RETURN_REQUESTED' || status === 'RETURNED' || status === 'RETURN_REJECTED') && (
                                <div className="mt-10 p-6 bg-[#fdfaf5] border border-[#e5e5d1]/50 rounded-2xl flex items-start gap-4">
                                    <div className={`mt-1 ${status === 'CANCELLED' ? 'text-red-400' : status === 'RETURN_REJECTED' ? 'text-red-400' : 'text-[#c19a6b]'}`}>
                                        <AlertCircle size={18} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-primary">
                                            {status === 'CANCELLED' && 'Curation Revoked'}
                                            {status === 'RETURN_REQUESTED' && 'Return in Review'}
                                            {status === 'RETURNED' && 'Curation Returned'}
                                            {status === 'RETURN_REJECTED' && 'Return Refused'}
                                        </h4>
                                        <p className="text-[10px] font-medium text-[#9f8170] leading-relaxed italic">
                                            {status === 'CANCELLED' && 'This order has been successfully cancelled and refunded.'}
                                            {status === 'RETURN_REQUESTED' && `Your request for "${order.return_reason}" is being evaluated by the artisans.`}
                                            {status === 'RETURNED' && 'The curation has been returned and refunded to your account.'}
                                            {status === 'RETURN_REJECTED' && `Reason: ${order.return_rejection_reason || 'Does not meet return criteria.'}`}
                                        </p>
                                    </div>
                                </div>
                            )}
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

                        {/* Customer Actions */}
                        <div className="space-y-6">
                            {(['CREATED', 'CONFIRMED'].includes(status)) && (
                                <button
                                    onClick={handleCancelOrder}
                                    disabled={actionLoading}
                                    className="w-full bg-white p-8 rounded-[2rem] border border-red-100/50 flex items-center justify-between group hover:bg-red-50/30 transition-all duration-500"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-400 border border-red-100/50 group-hover:scale-110 transition-transform">
                                            <XCircle size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-sm font-black text-primary uppercase tracking-widest">Revoke Curation</h4>
                                            <p className="text-[10px] font-medium text-[#9f8170] italic">Cancel this order and receive an instant refund</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-red-200 group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}

                            {(status === 'DELIVERED') && (
                                <button
                                    onClick={() => setShowReturnModal(true)}
                                    disabled={actionLoading}
                                    className="w-full bg-white p-8 rounded-[2rem] border border-[#e5e5d1]/50 flex items-center justify-between group hover:bg-[#fdfaf5] transition-all duration-500"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-[#fdfaf5] rounded-2xl flex items-center justify-center text-[#c19a6b] border border-[#e5e5d1]/50 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                            <RotateCcw size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-sm font-black text-primary uppercase tracking-widest">Initiate Return</h4>
                                            <p className="text-[10px] font-medium text-[#9f8170] italic">Not satisfied? Return within the 7-day window</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-[#e5e5d1] group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ReturnModal
                isOpen={showReturnModal}
                onClose={() => setShowReturnModal(false)}
                onSubmit={handleReturnSubmit}
                loading={actionLoading}
            />
        </div>
    );
};

export default OrderDetail;
