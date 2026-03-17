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
    CheckCircle2,
    ShoppingBag,
    ShieldCheck,
    Sparkles,
    Star,
    FileText
} from 'lucide-react';
import customerApi from '../../api/customer';
import toast from 'react-hot-toast';
import ReviewModal from '../../components/customer/ReviewModal';

// Simple Premium Modal Component
const CancelModal = ({ isOpen, onClose, onSubmit, loading, stripePortion }) => {
    const [refundToCard, setRefundToCard] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose}></div>
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Cancel Order</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XCircle size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-sm text-gray-600">Are you sure you want to cancel this order? This action cannot be undone.</p>

                    {stripePortion > 0 && (
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Refund Preference (for ₹{stripePortion.toLocaleString()})</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setRefundToCard(false)}
                                    className={`p-3 rounded-lg border text-xs font-bold transition-all ${!refundToCard ? 'bg-[#24b47e] text-white border-[#24b47e]' : 'bg-white text-gray-600 border-gray-200'}`}
                                >
                                    Wallet (Instant)
                                </button>
                                <button
                                    onClick={() => setRefundToCard(true)}
                                    className={`p-3 rounded-lg border text-xs font-bold transition-all ${refundToCard ? 'bg-[#24b47e] text-white border-[#24b47e]' : 'bg-white text-gray-600 border-gray-200'}`}
                                >
                                    Card (5-7 Days)
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-400 italic">Note: Any portion paid via wallet will be refunded to your wallet instantly.</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Keep Order
                    </button>
                    <button
                        onClick={() => onSubmit({ refundToCard })}
                        disabled={loading}
                        className="flex-[2] bg-red-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-red-600 transition-all"
                    >
                        {loading ? 'Processing...' : 'Confirm Cancellation'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReturnModal = ({ isOpen, onClose, onSubmit, loading }) => {
    const [reason, setReason] = useState('');
    const [refundToCard, setRefundToCard] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose}></div>
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Return Items</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XCircle size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reason for return</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please explain why you want to return these items..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-[#24b47e] transition-colors min-h-[100px] resize-none"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Refund Method</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setRefundToCard(false)}
                                className={`p-3 rounded-lg border text-xs font-bold transition-all ${!refundToCard ? 'bg-[#24b47e] text-white border-[#24b47e]' : 'bg-white text-gray-600 border-gray-200'}`}
                            >
                                Wallet
                            </button>
                            <button
                                onClick={() => setRefundToCard(true)}
                                className={`p-3 rounded-lg border text-xs font-bold transition-all ${refundToCard ? 'bg-[#24b47e] text-white border-[#24b47e]' : 'bg-white text-gray-600 border-gray-200'}`}
                            >
                                Original Card
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSubmit({ reason, refundToCard })}
                        disabled={loading || !reason.trim()}
                        className="flex-[2] bg-[#24b47e] text-white py-3 rounded-xl text-sm font-bold hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                        {loading ? 'Submitting...' : 'Confirm Return'}
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
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedItemForReview, setSelectedItemForReview] = useState(null);
    const [myReviews, setMyReviews] = useState([]);
    const [invoiceLoading, setInvoiceLoading] = useState(false);

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

    const fetchMyReviews = async () => {
        try {
            const res = await customerApi.getMyReviews();
            if (res.data) setMyReviews(res.data);
        } catch (error) {
            console.error('Fetch Reviews Error:', error);
        }
    };

    useEffect(() => {
        if (order?.status === 'DELIVERED') {
            fetchMyReviews();
        }
    }, [order?.status]);

    const handleCancelOrder = () => {
        const walletPortion = order?.pricing?.amount_paid_via_wallet || 0;
        const total = order?.pricing?.total || 0;
        const stripePortion = total - walletPortion;

        if (stripePortion > 0) {
            setShowCancelModal(true);
        } else {
            if (window.confirm('Are you certain you wish to cancel this order? It will be refunded to your wallet instantly.')) {
                executeCancellation({ refundToCard: false });
            }
        }
    };

    const executeCancellation = async ({ refundToCard }) => {
        try {
            setActionLoading(true);
            const res = await customerApi.cancelOrder(orderId, { refund_to_card: refundToCard });
            toast.success(res.message || 'Order successfully cancelled');
            setShowCancelModal(false);
            fetchOrderDetail();
        } catch (error) {
            toast.error(error.message || 'Cancellation failed');
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

    const handleDownloadInvoice = async () => {
        try {
            setInvoiceLoading(true);
            await customerApi.downloadInvoice(orderId, order?.order_number);
            toast.success('Invoice downloaded successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to download invoice');
        } finally {
            setInvoiceLoading(false);
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
        created_at,
        status,
        sub_orders = []
    } = order;

    // Professional Green Palette (Meesho/Myntra style)
    const statusGreen = '#24b47e';

    return (
        <div className="bg-[#f2f4f7] min-h-screen pb-20">
            {/* Minimal Sticky Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 py-4 px-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-bold">Back</span>
                    </button>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Order #{order_number}</p>
                            <p className="text-xs font-medium text-gray-500">{new Date(created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        {['CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED'].includes(status) && (
                            <button
                                onClick={handleDownloadInvoice}
                                disabled={invoiceLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-[#24b47e]/10 text-[#24b47e] rounded-xl text-xs font-bold hover:bg-[#24b47e]/20 transition-all disabled:opacity-50"
                            >
                                <FileText size={16} />
                                {invoiceLoading ? 'Downloading...' : 'Invoice'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN: Tracking & Items */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 📈 Vertical Live Tracking */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-8">Order Status</h3>

                            <div className="space-y-0 relative">
                                {[
                                    { label: 'Order Placed', desc: 'We have received your order', icon: CheckCircle2, statuses: ['CREATED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] },
                                    { label: 'Order Packed', desc: 'Item is ready for shipping', icon: Package, statuses: ['PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] },
                                    { label: 'Shipped', desc: 'In transit to your location', icon: Truck, statuses: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] },
                                    { label: 'Out for Delivery', desc: 'Arriving today', icon: MapPin, statuses: ['OUT_FOR_DELIVERY', 'DELIVERED'] },
                                    { label: 'Delivered', desc: 'Handed over to customer', icon: ShoppingBag, statuses: ['DELIVERED'] }
                                ].map((step, i, arr) => {
                                    const isReached = step.statuses.includes(status);
                                    const isLastReached = i < arr.length - 1 && arr[i + 1].statuses.includes(status);

                                    return (
                                        <div key={i} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isReached ? 'bg-[#24b47e] border-[#24b47e] text-white shadow-md' : 'bg-white border-gray-200 text-gray-300'
                                                        }`}
                                                >
                                                    <step.icon size={18} />
                                                </div>
                                                {i < arr.length - 1 && (
                                                    <div className={`w-0.5 h-12 transition-all duration-500 ${isLastReached ? 'bg-[#24b47e]' : 'bg-gray-100'}`}></div>
                                                )}
                                            </div>
                                            <div className="pt-1.5 pb-8">
                                                <h4 className={`text-sm font-bold ${isReached ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</h4>
                                                <p className={`text-xs mt-1 ${isReached ? 'text-gray-500' : 'text-gray-300'}`}>{step.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Canceled/Returned Status/Refund Banner */}
                            {['CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'RETURN_REJECTED'].includes(status) && (
                                <div className={`mt-4 p-4 rounded-xl border flex items-start gap-4 ${status === 'CANCELLED' || status === 'RETURNED' ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                                    {status === 'CANCELLED' || status === 'RETURNED' ? (
                                        <ShieldCheck size={20} className="text-[#24b47e] shrink-0 mt-0.5" />
                                    ) : (
                                        <AlertCircle size={20} className="text-orange-500 shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <h4 className={`text-sm font-bold ${status === 'CANCELLED' || status === 'RETURNED' ? 'text-green-900' : 'text-orange-900'}`}>
                                            {status === 'CANCELLED' ? 'Refund Processed' :
                                                status === 'RETURNED' ? 'Return Completed' :
                                                    status === 'RETURN_REQUESTED' ? 'Return Under Review' : 'Return Rejected'}
                                        </h4>

                                        <div className="mt-2 space-y-2">
                                            <p className={`text-xs ${status === 'CANCELLED' || status === 'RETURNED' ? 'text-green-700' : 'text-orange-700'}`}>
                                                {order.refund_details?.message || (status === 'CANCELLED' ? 'Order has been cancelled and refund initiated.' : '')}
                                                {status === 'RETURN_REQUESTED' && 'We are reviewing your return request. We will update you shortly.'}
                                                {status === 'RETURN_REJECTED' && 'Your return request was not approved.'}
                                            </p>

                                            {(order.refund_details?.destination) && (
                                                <div className="flex gap-6 mt-3 pt-3 border-t border-black/5">
                                                    <div>
                                                        <p className="text-[10px] uppercase font-bold text-gray-400">Refund To</p>
                                                        <p className="text-xs font-bold text-gray-700">{order.refund_details.destination}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase font-bold text-gray-400">Timeline</p>
                                                        <p className="text-xs font-bold text-gray-700">{order.refund_details.timeline}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 📦 Items List */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-50">
                                <h3 className="text-sm font-bold text-gray-900">Products in this order</h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {sub_orders.map((sub) => (
                                    sub.items.map((item, i) => (
                                        <div key={`${sub.merchant_id}-${i}`} className="p-6 flex items-center gap-6 hover:bg-gray-50/50 transition-colors">
                                            <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                                                <img
                                                    src={item.images?.[0] || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'}
                                                    className="w-full h-full object-cover"
                                                    alt={item.product_name}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Link to={`/products/${item.product?.slug || '#'}`} className="text-sm font-bold text-gray-900 hover:text-[#24b47e] transition-colors block truncate">
                                                    {item.product_name}
                                                </Link>
                                                {item.variant_label ? (
                                                    <p className="text-xs text-gray-500 mt-1">Variant: {item.variant_label}</p>
                                                ) : item.variant?.attributes ? (
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {Object.entries(item.variant.attributes).map(([key, val]) => (
                                                            <span key={key} className="text-[10px] text-gray-500 font-medium">
                                                                {key}: {val}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : null}
                                                <p className="text-xs text-gray-400 mt-0.5">Quantity: {item.quantity}</p>

                                                {status === 'DELIVERED' && (
                                                    <div className="mt-3">
                                                        {myReviews.find(r => r.order_item_id === item.order_item_id) ? (
                                                            <div className="bg-emerald-50/30 rounded-lg p-3 border border-emerald-100/50 mb-2">
                                                                <div className="flex items-center gap-2 mb-1.5">
                                                                    <div className="flex gap-0.5 text-emerald-500">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <Star key={i} size={10} fill={i < myReviews.find(r => r.order_item_id === item.order_item_id).rating ? "currentColor" : "none"} />
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">Your Experience</span>
                                                                </div>
                                                                <p className="text-[11px] text-gray-600 line-clamp-2 italic">
                                                                    "{myReviews.find(r => r.order_item_id === item.order_item_id).comment}"
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedItemForReview(item);
                                                                    setShowReviewModal(true);
                                                                }}
                                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-600 hover:text-white transition-all w-fit border border-emerald-100"
                                                            >
                                                                <Star size={12} /> Rate Item
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-base font-bold text-gray-900">₹{((item.base_price || item.price) * item.quantity).toLocaleString()}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">₹{(item.base_price || item.price).toLocaleString()} each (excl. GST)</p>
                                            </div>
                                        </div>
                                    ))
                                ))}
                            </div>
                        </div>

                        {/* 🛠️ Clear Customer Actions */}
                        {(['CREATED', 'CONFIRMED'].includes(status)) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={handleCancelOrder}
                                    disabled={actionLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 py-4 rounded-xl text-sm font-bold hover:bg-red-50 transition-all disabled:opacity-50"
                                >
                                    <XCircle size={18} />
                                    Cancel Order
                                </button>
                                <button
                                    onClick={() => navigate('/contact')}
                                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 py-4 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                                >
                                    <RotateCcw size={18} />
                                    Help & Support
                                </button>
                            </div>
                        )}

                        {(status === 'DELIVERED') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setShowReturnModal(true)}
                                    disabled={actionLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-white border border-[#24b47e] text-[#24b47e] py-4 rounded-xl text-sm font-bold hover:bg-green-50 transition-all disabled:opacity-50"
                                >
                                    <RotateCcw size={18} />
                                    Return Items
                                </button>
                                <button
                                    onClick={() => navigate('/contact')}
                                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 py-4 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                                >
                                    <RotateCcw size={18} />
                                    Help & Support
                                </button>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Summary & Details */}
                    <div className="space-y-6">

                        {/* 📦 Delivery & Payment Address */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Delivery Address</h4>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-gray-900">{shipping_address_snapshot.name}</p>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        {shipping_address_snapshot.line1}, {shipping_address_snapshot.line2 && `${shipping_address_snapshot.line2}, `}
                                        {shipping_address_snapshot.city}, {shipping_address_snapshot.state} - {shipping_address_snapshot.pincode}
                                    </p>
                                    <p className="text-xs text-gray-500 pt-2 font-medium">📞 {shipping_address_snapshot.phone}</p>
                                </div>
                            </div>

                            <hr className="border-gray-50" />

                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Payment Details</h4>
                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#24b47e] shadow-sm">
                                        <CreditCard size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">{payment?.provider || 'Secure Online Payment'}</p>
                                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-tight">Paid Successfully</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 💰 Order Summary */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Total Summary</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Order Subtotal</span>
                                    <span className="font-medium text-gray-900">₹{(pricing?.subtotal || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Shipping</span>
                                    <span className="text-[#24b47e] font-bold">Free</span>
                                </div>
                                {pricing?.discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Discount</span>
                                        <span className="text-red-500 font-medium">- ₹{pricing.discount.toLocaleString()}</span>
                                    </div>
                                )}

                                {pricing?.tax > 0 && (
                                    <div className="pt-2 space-y-1.5 mt-1 border-t border-gray-50">
                                        {sub_orders.some(so => so.tax_details?.cgst > 0) ? (
                                            <>
                                                <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                                    <span>Tax Breakdown</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>CGST</span>
                                                    <span>₹{sub_orders.reduce((acc, so) => acc + (so.tax_details?.cgst || 0), 0).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>SGST</span>
                                                    <span>₹{sub_orders.reduce((acc, so) => acc + (so.tax_details?.sgst || 0), 0).toFixed(2)}</span>
                                                </div>
                                            </>
                                        ) : sub_orders.some(so => so.tax_details?.igst > 0) ? (
                                            <>
                                                <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                                    <span>Tax Breakdown</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>IGST</span>
                                                    <span>₹{sub_orders.reduce((acc, so) => acc + (so.tax_details?.igst || 0), 0).toFixed(2)}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Tax</span>
                                                <span className="font-medium text-gray-900">₹{pricing.tax.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {pricing?.amount_paid_via_wallet > 0 && (
                                    <div className="flex justify-between text-sm pt-2 border-t border-gray-50">
                                        <span className="text-gray-500 italic">Paid via Wallet</span>
                                        <span className="font-medium text-[#24b47e]">- ₹{pricing.amount_paid_via_wallet.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-base font-bold pt-4 border-t border-gray-100">
                                    <span className="text-gray-900">Final Total</span>
                                    <span className="text-[#24b47e]">₹{(pricing?.total || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CancelModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onSubmit={executeCancellation}
                loading={actionLoading}
                stripePortion={(order?.pricing?.total || 0) - (order?.pricing?.amount_paid_via_wallet || 0)}
            />
            <ReturnModal
                isOpen={showReturnModal}
                onClose={() => setShowReturnModal(false)}
                onSubmit={handleReturnSubmit}
                loading={actionLoading}
            />
            <ReviewModal
                isOpen={!!selectedItemForReview}
                onClose={() => setSelectedItemForReview(null)}
                orderItem={selectedItemForReview}
                onSuccess={() => {
                    fetchMyReviews();
                    fetchOrderDetail(true);
                }}
            />
        </div>
    );
};

export default OrderDetail;
