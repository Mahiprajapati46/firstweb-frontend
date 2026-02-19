import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    MapPin,
    User,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Store,
    ShoppingBag,
    Clock,
    DollarSign,
    Box
} from 'lucide-react';
import adminApi from '../../api/admin';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const AdminOrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await adminApi.getOrderById(id);
                setOrder(response.data);
            } catch (error) {
                console.error('Failed to fetch order details:', error);
                toast.error('Failed to load order details');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <p className="text-gray-400 font-bold">Order not found</p>
                <Link to="/admin/orders">
                    <Button variant="outline" size="sm" icon={ArrowLeft}>Back to Orders</Button>
                </Link>
            </div>
        );
    }

    const getStatusColor = (status) => {
        const colors = {
            CREATED: 'text-blue-600 bg-blue-50 border-blue-100',
            CONFIRMED: 'text-indigo-600 bg-indigo-50 border-indigo-100',
            PACKED: 'text-purple-600 bg-purple-50 border-purple-100',
            SHIPPED: 'text-amber-600 bg-amber-50 border-amber-100',
            DELIVERED: 'text-emerald-600 bg-emerald-50 border-emerald-100',
            CANCELLED: 'text-red-600 bg-red-50 border-red-100',
            RETURNED: 'text-gray-600 bg-gray-50 border-gray-100',
        };
        return colors[status] || 'text-gray-600 bg-gray-50 border-gray-100';
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        to="/admin/orders"
                        className="p-2 -ml-2 text-gray-400 hover:text-primary hover:bg-white rounded-xl transition-all"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-primary tracking-tight">
                                Order #{order.order_number || order._id.slice(-8).toUpperCase()}
                            </h1>
                            <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                {order.status?.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-gray-400 font-bold mt-1 text-sm flex items-center gap-2">
                            <Calendar size={14} />
                            Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Order Items & Sub-orders */}
                <div className="lg:col-span-2 space-y-8">
                    {order.sub_orders?.map((subOrder) => (
                        <div key={subOrder._id} className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                        <Store size={20} message="Store Icon" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-primary">{subOrder.merchant?.store_name || 'Unknown Merchant'}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Merchant ID: {subOrder.merchant?._id?.slice(-8)}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getStatusColor(subOrder.status)}`}>
                                    {subOrder.status?.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {subOrder.items?.map((item) => (
                                    <div key={item._id} className="p-6 flex items-start gap-4 hover:bg-gray-50/50 transition-colors">
                                        <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                                            {/* Placeholder for product image if not available in item snapshot */}
                                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                                <Box size={24} />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-primary truncate">{item.product_name_snapshot}</h4>
                                            {item.variant_label_snapshot && (
                                                <p className="text-xs font-medium text-gray-400 mt-1">
                                                    Variant: {item.variant_label_snapshot}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                                    Qty: {item.quantity}
                                                </span>
                                                <span className="text-sm font-black text-primary">
                                                    {order.pricing?.currency} {item.price_snapshot?.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-primary">
                                                {order.pricing?.currency} {(item.price_snapshot * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sub-Order Total</div>
                                <div className="text-lg font-black text-primary">
                                    {order.pricing?.currency} {subOrder.sub_total?.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar - Customer & Payment Info */}
                <div className="space-y-6">
                    {/* Customer Card */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 p-6">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <User size={16} className="text-primary" /> Customer
                        </h3>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-black text-lg">
                                {order.user_id?.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <div className="font-bold text-primary">{order.user_id?.full_name}</div>
                                <div className="text-xs text-gray-400">{order.user_id?.email}</div>
                                <div className="text-xs text-gray-400">{order.user_id?.phone}</div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 p-6">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <MapPin size={16} className="text-primary" /> Shipping Address
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1 font-medium">
                            <p className="font-bold text-primary">{order.shipping_address_snapshot?.name}</p>
                            <p>{order.shipping_address_snapshot?.line1}</p>
                            {order.shipping_address_snapshot?.line2 && <p>{order.shipping_address_snapshot?.line2}</p>}
                            <p>
                                {order.shipping_address_snapshot?.city}, {order.shipping_address_snapshot?.state} {order.shipping_address_snapshot?.pincode}
                            </p>
                            <p>{order.shipping_address_snapshot?.country}</p>
                            <p className="mt-2 text-primary font-bold">{order.shipping_address_snapshot?.phone}</p>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 p-6">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CreditCard size={16} className="text-primary" /> Payment Details
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400">Total Amount</span>
                                <span className="text-xl font-black text-primary">
                                    {order.pricing?.currency} {order.pricing?.total?.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400">Status</span>
                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${order.payment?.status === 'SUCCESS' ? 'bg-green-50 text-green-600' :
                                    order.payment?.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                                        'bg-red-50 text-red-600'
                                    }`}>
                                    {order.payment?.status || 'PENDING'}
                                </span>
                            </div>
                            <div className="pt-4 border-t border-gray-50 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Provider</span>
                                    <span className="font-bold text-primary">{order.payment?.provider || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Transaction ID</span>
                                    <span className="font-bold text-primary font-mono">{order.payment?.transaction_id || 'N/A'}</span>
                                </div>
                                {order.payment?.paid_at && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Paid At</span>
                                        <span className="font-bold text-primary">
                                            {new Date(order.payment.paid_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetail;
