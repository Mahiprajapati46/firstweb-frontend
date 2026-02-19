import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    MapPin,
    Phone,
    Package,
    CheckCircle,
    Truck,
    FileText,
    Clock,
    AlertCircle,
    Info,
    Mail,
    Home,
    MapPinned,
    X,
    ExternalLink,
    RotateCcw
} from 'lucide-react';
import merchantApi from '../../api/merchant';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
    CREATED: { label: 'New', color: 'bg-blue-50 text-blue-600', icon: Clock },
    CONFIRMED: { label: 'Confirmed', color: 'bg-indigo-50 text-indigo-600', icon: CheckCircle },
    PACKED: { label: 'Packed', color: 'bg-amber-50 text-amber-600', icon: Package },
    SHIPPED: { label: 'Shipped', color: 'bg-emerald-50 text-emerald-600', icon: Truck },
    DELIVERED: { label: 'Delivered', color: 'bg-slate-100 text-slate-600', icon: CheckCircle },
    CANCELLED: { label: 'Cancelled', color: 'bg-rose-50 text-rose-600', icon: AlertCircle },
    RETURN_REQUESTED: { label: 'Return Requested', color: 'bg-orange-50 text-orange-600', icon: AlertCircle },
    RETURNED: { label: 'Returned', color: 'bg-purple-50 text-purple-600', icon: RotateCcw },
    RETURN_REJECTED: { label: 'Return Rejected', color: 'bg-red-50 text-red-600', icon: AlertCircle },
};

// Shipping Modal Component
const ShippingModal = ({ isOpen, onClose, onSubmit, processing }) => {
    const [formData, setFormData] = useState({
        courier_name: '',
        tracking_id: '',
        tracking_url: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.courier_name || !formData.tracking_id) {
            toast.error('Courier name and tracking ID are required');
            return;
        }
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-slate-900">Shipping Details</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-black text-slate-700 mb-2">Courier Name *</label>
                        <input
                            type="text"
                            value={formData.courier_name}
                            onChange={(e) => setFormData({ ...formData, courier_name: e.target.value })}
                            placeholder="e.g., BlueDart, DTDC, Delhivery"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black text-slate-700 mb-2">Tracking ID *</label>
                        <input
                            type="text"
                            value={formData.tracking_id}
                            onChange={(e) => setFormData({ ...formData, tracking_id: e.target.value })}
                            placeholder="Enter tracking number"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black text-slate-700 mb-2">Tracking URL (Optional)</label>
                        <input
                            type="url"
                            value={formData.tracking_url}
                            onChange={(e) => setFormData({ ...formData, tracking_url: e.target.value })}
                            placeholder="https://tracking.example.com/..."
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <Button
                            type="submit"
                            loading={processing}
                            className="flex-1 bg-primary text-white hover:bg-accent px-6 py-3 rounded-xl font-bold transition-all"
                        >
                            Mark as Shipped
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Return Rejection Modal
const RejectReturnModal = ({ isOpen, onClose, onSubmit, processing }) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }
        onSubmit(reason);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-slate-900">Reject Return Request</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-black text-slate-700 mb-2">Rejection Reason *</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., Product not in original condition, missing accessories..."
                            rows={4}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium resize-none"
                            required
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <Button
                            type="submit"
                            loading={processing}
                            className="flex-1 bg-rose-500 text-white hover:bg-rose-600 px-6 py-3 rounded-xl font-bold transition-all"
                        >
                            Reject Return
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    useEffect(() => {
        fetchOrderDetail();
    }, [id]);

    const fetchOrderDetail = async () => {
        try {
            setLoading(true);
            const response = await merchantApi.getOrderDetail(id);
            console.log('Order detail full response:', response);
            console.log('Order detail data:', response.data);
            setOrder(response.data);
        } catch (error) {
            console.error('Failed to load order - Full error:', error);
            console.error('Error response:', error.response);
            console.error('Error data:', error.response?.data);
            console.error('Error message:', error.message);
            toast.error(error.response?.data?.message || error.message || 'Failed to load order details');
            // Don't navigate away, show error state instead
        } finally {
            setLoading(false);
        }
    };

    const handlePack = async () => {
        try {
            setProcessing(true);
            await merchantApi.packOrder(id);
            toast.success('Order marked as PACKED');
            fetchOrderDetail();
        } catch (error) {
            toast.error(error.message || 'Failed to pack order');
        } finally {
            setProcessing(false);
        }
    };

    const handleShip = async (shippingData) => {
        try {
            setProcessing(true);
            await merchantApi.shipOrder(id, shippingData);
            toast.success('Order marked as SHIPPED');
            setShowShippingModal(false);
            fetchOrderDetail();
        } catch (error) {
            toast.error(error.message || 'Failed to ship order');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeliver = async () => {
        try {
            setProcessing(true);
            await merchantApi.deliverOrder(id);
            toast.success('Order marked as DELIVERED');
            fetchOrderDetail();
        } catch (error) {
            toast.error(error.message || 'Failed to deliver order');
        } finally {
            setProcessing(false);
        }
    };

    const handleApproveReturn = async () => {
        if (!confirm('Are you sure you want to approve this return? This will initiate a refund to the customer.')) return;
        try {
            setProcessing(true);
            await merchantApi.approveReturn(id);
            toast.success('Return approved and refund initiated');
            fetchOrderDetail();
        } catch (error) {
            toast.error(error.message || 'Failed to approve return');
        } finally {
            setProcessing(false);
        }
    };

    const handleRejectReturn = async (reason) => {
        try {
            setProcessing(true);
            await merchantApi.rejectReturn(id, reason);
            toast.success('Return request rejected');
            setShowRejectModal(false);
            fetchOrderDetail();
        } catch (error) {
            toast.error(error.message || 'Failed to reject return');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.2em]">Loading Order...</div>;
    if (!order) return (
        <div className="p-20 text-center">
            <p className="text-rose-500 font-black uppercase tracking-[0.2em] mb-4">Order Not Found</p>
            <button onClick={() => navigate('/merchant/orders')} className="text-primary font-bold hover:underline">
                ← Back to Orders
            </button>
        </div>
    );

    const StatusIcon = STATUS_CONFIG[order.status]?.icon || Clock;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Modals */}
            <ShippingModal
                isOpen={showShippingModal}
                onClose={() => setShowShippingModal(false)}
                onSubmit={handleShip}
                processing={processing}
            />
            <RejectReturnModal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                onSubmit={handleRejectReturn}
                processing={processing}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/merchant/orders')}
                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sub-Order</span>
                            <span className="text-sm font-black text-slate-900">#{order.sub_order_id.slice(-8).toUpperCase()}</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Details</h1>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider ${STATUS_CONFIG[order.status]?.color} shadow-lg`}>
                    {STATUS_CONFIG[order.status]?.label || order.status}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Action Buttons */}
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                    <StatusIcon size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">Fulfillment Actions</h2>
                                    <p className="text-slate-400 text-sm font-medium">Update order status as you progress.</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                {order.status === 'CONFIRMED' && (
                                    <Button
                                        onClick={handlePack}
                                        loading={processing}
                                        className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 rounded-xl font-bold transition-all"
                                    >
                                        <Package size={16} className="inline mr-2" />
                                        Mark as Packed
                                    </Button>
                                )}
                                {order.status === 'PACKED' && (
                                    <Button
                                        onClick={() => setShowShippingModal(true)}
                                        loading={processing}
                                        className="bg-primary text-white hover:bg-accent px-6 py-3 rounded-xl font-bold transition-all"
                                    >
                                        <Truck size={16} className="inline mr-2" />
                                        Mark as Shipped
                                    </Button>
                                )}
                                {order.status === 'SHIPPED' && (
                                    <Button
                                        onClick={handleDeliver}
                                        loading={processing}
                                        className="bg-emerald-500 text-white hover:bg-emerald-600 px-6 py-3 rounded-xl font-bold transition-all"
                                    >
                                        <CheckCircle size={16} className="inline mr-2" />
                                        Confirm Delivery
                                    </Button>
                                )}
                                {order.status === 'RETURN_REQUESTED' && (
                                    <>
                                        <Button
                                            onClick={handleApproveReturn}
                                            loading={processing}
                                            className="bg-emerald-500 text-white hover:bg-emerald-600 px-6 py-3 rounded-xl font-bold transition-all"
                                        >
                                            <CheckCircle size={16} className="inline mr-2" />
                                            Approve Return
                                        </Button>
                                        <Button
                                            onClick={() => setShowRejectModal(true)}
                                            loading={processing}
                                            className="bg-rose-500 text-white hover:bg-rose-600 px-6 py-3 rounded-xl font-bold transition-all"
                                        >
                                            <X size={16} className="inline mr-2" />
                                            Reject Return
                                        </Button>
                                    </>
                                )}
                                {['DELIVERED', 'CANCELLED', 'RETURNED', 'RETURN_REJECTED'].includes(order.status) && (
                                    <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-400/10 px-4 py-2 rounded-xl">
                                        <CheckCircle size={18} />
                                        {order.status === 'RETURNED' ? 'Return Completed' : 'Order Completed'}
                                    </div>
                                )}
                            </div>
                        </div>
                        <Package size={200} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
                    </div>

                    {/* Return Reason Alert */}
                    {order.status === 'RETURN_REQUESTED' && order.return_reason && (
                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="font-black text-orange-900 mb-1">Customer Return Reason:</p>
                                    <p className="text-sm text-orange-700 font-medium">{order.return_reason}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Rejection Reason Alert */}
                    {order.status === 'RETURN_REJECTED' && order.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                            <div className="flex items-start gap-3">
                                <X className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="font-black text-red-900 mb-1">Return Rejection Reason:</p>
                                    <p className="text-sm text-red-700 font-medium">{order.rejection_reason}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                <Package size={16} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Order Items</h2>
                        </div>
                        <div className="space-y-3">
                            {order.items && order.items.length > 0 ? (
                                order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-slate-900">{item.product_name}</p>
                                            {item.variant_label && (
                                                <p className="text-xs text-slate-500 font-medium">{item.variant_label}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Qty: {item.quantity}</p>
                                            <p className="text-sm font-black text-slate-900">₹{item.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-400 py-8 font-medium italic">No items found</p>
                            )}
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                            <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Subtotal</p>
                            <p className="text-2xl font-black text-slate-900">₹{order.total.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shipping_address && Object.keys(order.shipping_address).length > 0 && (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                    <MapPin size={16} />
                                </div>
                                <h2 className="text-lg font-black text-slate-900 tracking-tight">Shipping Address</h2>
                            </div>
                            <div className="space-y-3 text-sm text-slate-700 font-medium leading-relaxed">
                                {order.shipping_address.name && (
                                    <div className="flex items-start gap-2">
                                        <User size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                        <p className="font-bold text-slate-900">{order.shipping_address.name}</p>
                                    </div>
                                )}
                                {order.shipping_address.phone && (
                                    <div className="flex items-start gap-2">
                                        <Phone size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                        <p>{order.shipping_address.phone}</p>
                                    </div>
                                )}
                                {order.shipping_address.address_line1 && (
                                    <div className="flex items-start gap-2">
                                        <Home size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p>{order.shipping_address.address_line1}</p>
                                            {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                                        </div>
                                    </div>
                                )}
                                {(order.shipping_address.city || order.shipping_address.state || order.shipping_address.postal_code) && (
                                    <div className="flex items-start gap-2">
                                        <MapPinned size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                        <p>
                                            {[order.shipping_address.city, order.shipping_address.state, order.shipping_address.postal_code]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                <User size={16} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Customer</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                    <User size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-slate-900 truncate">{order.customer?.name || 'Guest User'}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Contact</p>
                                </div>
                            </div>
                            {order.customer?.phone && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                        <Phone size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-slate-900 truncate">{order.customer.phone}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pro Tip */}
                    <div className="bg-slate-50 rounded-3xl border border-slate-100 p-8 space-y-4">
                        <div className="flex items-center gap-2 text-slate-900">
                            <Info size={16} className="text-primary" />
                            <span className="text-xs font-black uppercase tracking-widest">Pro-Tip</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Always verify package contents before marking as <span className="text-primary font-bold">Packed</span>. Accurate fulfillment leads to higher ratings!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
