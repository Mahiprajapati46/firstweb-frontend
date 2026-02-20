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
        <div className="bg-[#fdfaf5] min-h-screen pb-32 pt-12">
            <div className="container-custom max-w-3xl mx-auto px-6 text-center">
                {/* Success Header */}
                <div className="mb-16 animate-in zoom-in-50 duration-1000">
                    <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-500 mx-auto shadow-2xl shadow-emerald-500/10 border border-emerald-100/50 mb-8">
                        <CheckCircle2 size={48} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c19a6b] mb-4">Success</p>
                    <h1 className="text-7xl font-black text-primary tracking-tighter italic serif">Order Placed<span className="text-[#c19a6b]">!</span></h1>
                </div>

                {/* Details Card */}
                <div className="bg-white rounded-[3.5rem] border border-[#e5e5d1]/50 p-12 shadow-2xl shadow-[#c19a6b05] mb-16 space-y-12 animate-in slide-in-from-bottom-12 duration-700">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">Order Number</p>
                        <h3 className="text-3xl font-black text-primary tracking-tight tabular-nums">#{order.order_number || order.order_id?.slice(-8).toUpperCase()}</h3>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="space-y-6 border-y border-[#e5e5d1]/30 py-10 text-left">
                        <h4 className="text-xl font-black text-primary tracking-tight italic serif">Payment Details</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-[#9f8170]">
                                <span>Subtotal</span>
                                <span className="text-primary tabular-nums">₹ {order.pricing?.subtotal || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-[#9f8170]">
                                <span>Shipping</span>
                                <span className="text-emerald-500 italic">Free</span>
                            </div>
                            {(order.pricing?.discount > 0) && (
                                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-emerald-500">
                                    <span className="flex items-center gap-2">
                                        Discount
                                        {order.pricing.coupon_code && <span className="bg-emerald-50 px-2 py-0.5 rounded text-[8px] border border-emerald-100">{order.pricing.coupon_code}</span>}
                                    </span>
                                    <span className="tabular-nums">- ₹ {order.pricing.discount}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-sm font-black uppercase tracking-widest text-primary pt-4 border-t border-[#e5e5d1]/30">
                                <span>Total Paid</span>
                                <span className="text-2xl tracking-tighter tabular-nums">₹ {order.pricing?.total || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <p className="text-xs font-medium text-[#9f8170] italic leading-relaxed px-8">
                            Thank you for your order! We'll start preparing your items right away. You'll receive an email confirmation with tracking details as soon as your package is on its way.
                        </p>
                    </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-in fade-in duration-1000 delay-500">
                    <Link
                        to="/orders"
                        className="w-full md:w-auto px-10 py-6 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                    >
                        View Order Status <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full md:w-auto px-10 py-6 border border-[#e5e5d1] rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-[#9f8170] hover:text-primary transition-all flex items-center justify-center gap-3"
                    >
                        <ChevronLeft size={16} /> Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
