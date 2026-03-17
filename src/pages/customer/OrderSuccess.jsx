import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    CheckCircle2,
    ShoppingBag,
    ArrowRight,
    Truck,
    Calendar,
    ChevronLeft,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import customerApi from '../../api/customer';
import toast from 'react-hot-toast';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [order, setOrder] = useState(location.state?.order || null);
    const [verifying, setVerifying] = useState(!!(searchParams.get('orderId') && searchParams.get('session_id')));
    const [error, setError] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            const orderId = searchParams.get('orderId');
            const sessionId = searchParams.get('session_id');

            if (orderId && sessionId) {
                console.log('[Debug] Verifying payment for Order:', orderId, 'Session:', sessionId);
                console.log('[Debug] Auth token:', localStorage.getItem('token') ? 'Found' : 'Missing');
                try {
                    setVerifying(true);
                    const response = await customerApi.verifyPayment(orderId, sessionId);
                    console.log('[Debug] Verification response:', response);

                    if (response.success) {
                        setOrder(response.data);
                        toast.success('Payment verified successfully!');
                    } else {
                        const msg = response.message || 'Verification failed on server.';
                        setError(msg);
                        console.error('[Debug] Verification failed:', msg);
                    }
                } catch (err) {
                    const errorMsg = err.message || 'Network error or server unreachable.';
                    setError(`Payment verification failed: ${errorMsg}`);
                    console.error('[Debug] Verification catch error:', err);
                } finally {
                    setVerifying(false);
                }
            } else {
                console.warn('[Debug] Missing orderId or sessionId in URL');
            }
        };

        if (!order) {
            verifyPayment();
        }
    }, [searchParams, order]);

    if (verifying) {
        return (
            <div className="bg-[#fdfaf5] min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-8 animate-pulse">
                    <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-primary mx-auto mb-8">
                        <Loader2 size={48} className="animate-spin" />
                    </div>
                    <h2 className="text-4xl font-black text-primary italic serif tracking-tighter">Verifying Payment...</h2>
                    <p className="text-[#9f8170] italic">Securing your order through our gateway.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#fdfaf5] min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-8 max-w-md">
                    <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center text-red-500 mx-auto mb-8">
                        <ShieldCheck size={48} className="opacity-20" />
                    </div>
                    <h2 className="text-4xl font-black text-primary italic serif tracking-tighter">Something went wrong.</h2>
                    <p className="text-[#9f8170] italic">{error}</p>
                    <Link to="/orders" className="inline-flex py-4 px-10 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30">View Order History</Link>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="bg-[#fdfaf5] min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-8">
                    <h2 className="text-4xl font-black text-primary italic serif tracking-tighter">No order found.</h2>
                    <p className="text-[#9f8170] italic">Return to the shop to find something extraordinary.</p>
                    <Link to="/products" className="inline-flex py-4 px-10 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30">Start Shopping</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f8f9fa] min-h-screen pb-24 pt-12">
            <div className="max-w-2xl mx-auto px-6 text-center">
                {/* Success Header */}
                <div className="mb-12">
                    <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto border border-emerald-100 mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Order Placed Successfully!</h1>
                    <p className="text-gray-500 mt-2 font-medium italic">Thank you for shopping with us.</p>
                </div>

                {/* Details Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10 shadow-sm mb-10 space-y-8 text-left">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order Number</p>
                        <h3 className="text-2xl font-bold text-gray-900">#{order.order_number || order.order_id?.slice(-8).toUpperCase()}</h3>
                    </div>

                    {/* Payment Details */}
                    <div className="space-y-4 border-t border-gray-50 pt-8">
                        <h4 className="text-sm font-black uppercase tracking-widest text-gray-400">Payment Summary</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                                <span>Subtotal</span>
                                <span className="text-gray-900">₹{(order.pricing?.subtotal || order.summary?.subtotal || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                                <span>Shipping</span>
                                <span className="text-emerald-500 uppercase text-[10px]">Free</span>
                            </div>
                            {(order.pricing?.tax > 0 || order.summary?.tax > 0) && (
                                <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                                    <span className="flex flex-col">
                                        <span>Tax (GST 18%)</span>
                                        <span className="text-[9px] font-normal text-gray-400">Included in total</span>
                                    </span>
                                    <span>₹{(order.pricing?.tax || order.summary?.tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            {(order.pricing?.discount > 0 || order.summary?.discount > 0) && (
                                <div className="flex items-center justify-between text-xs font-bold text-emerald-500">
                                    <span className="flex items-center gap-2">
                                        Discount
                                        {(order.pricing?.coupon_code || order.summary?.coupon?.code) && (
                                            <span className="bg-emerald-50 px-1.5 py-0.5 rounded text-[8px] border border-emerald-100">
                                                {order.pricing?.coupon_code || order.summary?.coupon?.code}
                                            </span>
                                        )}
                                    </span>
                                    <span>- ₹{(order.pricing?.discount || order.summary?.discount).toLocaleString()}</span>
                                </div>
                            )}

                            {(order.pricing?.amount_paid_via_wallet > 0 || order.payment_info?.amount_paid_via_wallet > 0) && (
                                <div className="flex items-center justify-between text-xs font-bold text-primary italic">
                                    <span>Paid via Wallet</span>
                                    <span>- ₹{(order.pricing?.amount_paid_via_wallet || order.payment_info?.amount_paid_via_wallet).toLocaleString()}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-sm font-bold text-gray-900 pt-3 border-t border-gray-50">
                                <span>Total Paid</span>
                                <span className="text-xl font-black text-primary">₹{(order.pricing?.total || order.summary?.total || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary border border-gray-100 shrink-0">
                            <Truck size={20} />
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                            We've received your order and will begin processing it immediately. You'll receive updates on your registered email.
                        </p>
                    </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <Link
                        to="/orders"
                        className="w-full md:w-auto px-8 py-4 bg-primary text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        View My Orders <ArrowRight size={18} />
                    </Link>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full md:w-auto px-8 py-4 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
