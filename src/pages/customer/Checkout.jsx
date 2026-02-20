import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    MapPin,
    CreditCard,
    ShoppingBasket,
    ChevronRight,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    Truck,
    Info,
    Wallet,
    Tag,
    Trash2,
    Plus
} from 'lucide-react';
import customerApi from '../../api/customer';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [step, setStep] = useState(1); // 1: Shipping, 2: Review & Pay
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [couponCode, setCouponCode] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [useWallet, setUseWallet] = useState(false);
    const [processingOrder, setProcessingOrder] = useState(false);
    const isSubmitting = useRef(false);
    const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
    const [newAddress, setNewAddress] = useState({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        type: 'HOME'
    });
    const [submittingAddress, setSubmittingAddress] = useState(false);

    // Get variantIds and couponCode from navigation state
    const variantIds = location.state?.variantIds || [];
    const passedCouponCode = location.state?.couponCode || '';

    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { from: '/checkout' } });
            return;
        }
        if (passedCouponCode) {
            setCouponCode(passedCouponCode);
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [addrRes, previewRes] = await Promise.all([
                customerApi.getAddresses(),
                customerApi.checkoutPreview(passedCouponCode || undefined, variantIds)
            ]);

            if (addrRes.data) setAddresses(addrRes.data);
            if (previewRes.success) {
                setPreview(previewRes.data);
                // Pre-select default address if exists
                const defaultAddr = addrRes.data?.find(a => a.is_default);
                if (defaultAddr) setSelectedAddress(defaultAddr);
                else if (addrRes.data?.length > 0) setSelectedAddress(addrRes.data[0]);
            }
        } catch (error) {
            console.error('Fetch Checkout Data Error:', error);
            toast.error('Failed to initialize checkout');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            setSubmittingAddress(true);
            const response = await customerApi.addAddress(newAddress);
            if (response.message) {
                toast.success('Address secured in your vault');
                setIsAddAddressOpen(false);
                setNewAddress({
                    full_name: '',
                    phone: '',
                    address_line1: '',
                    address_line2: '',
                    city: '',
                    state: '',
                    postal_code: '',
                    type: 'HOME'
                });
                const addrRes = await customerApi.getAddresses();
                if (addrRes.data) {
                    setAddresses(addrRes.data);
                    // Select the newly added address
                    const added = addrRes.data.find(a => a.full_name === newAddress.full_name && a.phone === newAddress.phone);
                    if (added) setSelectedAddress(added);
                    else setSelectedAddress(addrRes.data[addrRes.data.length - 1]);
                }
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add address');
        } finally {
            setSubmittingAddress(false);
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        try {
            setApplyingCoupon(true);
            const response = await customerApi.checkoutPreview(couponCode, variantIds);
            if (response.success) {
                setPreview(response.data);
                if (response.data.summary.coupon?.is_valid) {
                    toast.success('Coupon applied successfully');
                } else {
                    toast.error(response.data.summary.coupon?.message || 'Invalid coupon');
                }
            }
        } catch (error) {
            toast.error('Failed to apply coupon');
        } finally {
            setApplyingCoupon(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (isSubmitting.current) {
            console.log('[Checkout] Blocked repeat submission');
            return;
        }

        if (!selectedAddress) {
            toast.error('Please select a shipping address');
            return;
        }

        try {
            isSubmitting.current = true;
            setProcessingOrder(true);
            console.log('[Checkout] Initiating order creation');
            const orderData = {
                shipping_address: {
                    name: selectedAddress.full_name,
                    phone: selectedAddress.phone,
                    line1: selectedAddress.address_line1,
                    line2: selectedAddress.address_line2,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    pincode: selectedAddress.postal_code,
                    country: 'India'
                },
                use_wallet: useWallet,
                coupon_code: preview?.summary?.coupon?.is_valid ? preview.summary.coupon.code : null,
                variant_ids: variantIds.length > 0 ? variantIds : null
            };

            const response = await customerApi.createOrder(orderData);
            if (response.success) {
                // Check if further payment is needed (Nested inside payment_info from backend)
                const { order_id, payment_info } = response.data;
                const needs_payment = payment_info?.needs_payment;

                if (needs_payment) {
                    toast.loading('Redirecting to secure payment...', { duration: 2000 });
                    // Create Stripe session
                    const stripeRes = await customerApi.createCheckoutSession(order_id);
                    if (stripeRes.data?.url) {
                        window.location.href = stripeRes.data.url;
                        return;
                    } else {
                        throw new Error('Failed to initiate payment gateway');
                    }
                } else {
                    toast.success('Order placed successfully!');
                    window.dispatchEvent(new CustomEvent('cartUpdated'));
                    navigate('/order-success', { state: { order: response.data } });
                }
            }
        } catch (error) {
            toast.error(error.message || 'Failed to place order');
        } finally {
            isSubmitting.current = false;
            setProcessingOrder(false);
        }
    };

    if (loading) {
        return (
            <div className="container-custom max-w-7xl mx-auto px-6 py-20 animate-pulse">
                <div className="h-12 bg-gray-100 rounded-full w-64 mb-16"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="h-64 bg-white rounded-[3rem] border border-[#e5e5d1]/30"></div>
                        <div className="h-96 bg-white rounded-[3rem] border border-[#e5e5d1]/30"></div>
                    </div>
                    <div className="h-[500px] bg-white rounded-[3rem] border border-[#e5e5d1]/30"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#fdfaf5] min-h-screen pb-32 pt-12">
            <div className="container-custom max-w-7xl mx-auto px-6">
                {/* User Friendly Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c19a6b]">Almost There</p>
                        <h1 className="text-6xl font-black text-primary tracking-tighter italic serif">Complete Order<span className="text-[#c19a6b]">.</span></h1>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-[#e5e5d1]/50 shadow-sm">
                        <button
                            onClick={() => setStep(1)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${step === 1 ? 'bg-primary text-white scale-105 shadow-xl' : 'text-gray-400'}`}
                        >
                            <MapPin size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Shipping</span>
                        </button>
                        <ChevronRight size={14} className="text-gray-200" />
                        <button
                            disabled={!selectedAddress}
                            onClick={() => setStep(2)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${step === 2 ? 'bg-primary text-white scale-105 shadow-xl' : 'text-gray-400'}`}
                        >
                            <CreditCard size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Payment</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {step === 1 ? (
                            <div className="space-y-12 animate-in fade-in slide-in-from-left-8 duration-700">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-3xl font-black text-primary tracking-tighter italic serif">Delivery Address</h3>
                                        <Link to="/profile" className="text-[10px] font-black uppercase tracking-widest text-[#c19a6b] hover:text-primary transition-colors hover:underline underline-offset-4">Manage Addresses</Link>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {addresses.map((addr) => (
                                            <button
                                                key={addr._id}
                                                onClick={() => setSelectedAddress(addr)}
                                                className={`group relative text-left p-8 rounded-[2.5rem] border-2 transition-all duration-500 scale-95 hover:scale-100 ${selectedAddress?._id === addr._id ? 'bg-white border-primary shadow-2xl' : 'bg-white/50 border-[#e5e5d1]/50 hover:border-[#c19a6b30]'}`}
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="px-3 py-1 bg-[#fdfaf5] border border-[#e5e5d1]/50 rounded-lg text-[8px] font-black uppercase tracking-widest text-[#9f8170]">{addr.type}</span>
                                                        {selectedAddress?._id === addr._id && <CheckCircle2 size={16} className="text-primary" />}
                                                    </div>
                                                    <h4 className="text-lg font-black text-primary tracking-tight">{addr.full_name}</h4>
                                                    <p className="text-xs font-medium text-[#9f8170] leading-relaxed italic line-clamp-2">
                                                        {addr.address_line1}, {addr.city}
                                                    </p>
                                                    <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase pt-2">{addr.phone}</p>
                                                </div>
                                            </button>
                                        ))}
                                        {addresses.length === 0 && (
                                            <div className="md:col-span-2 p-16 text-center bg-white/30 rounded-[3rem] border-2 border-dashed border-[#e5e5d1]">
                                                <MapPin size={32} className="mx-auto text-gray-200 mb-4" />
                                                <p className="text-sm font-bold text-gray-400 italic mb-6">No saved addresses found.</p>
                                                <Link to="/profile" className="inline-flex py-4 px-8 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Add New Address</Link>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setIsAddAddressOpen(true)}
                                            className="group relative p-8 rounded-[2.5rem] border-2 border-dashed border-[#e5e5d1] hover:border-[#c19a6b] transition-all flex flex-col items-center justify-center gap-4 bg-white/30"
                                        >
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#c19a6b] shadow-sm">
                                                <Plus size={24} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">Add New Location</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Delivery Info */}
                                <div className="p-8 bg-[#fdfaf5] border border-[#c19a6b20] rounded-[2.5rem] flex gap-8 items-start">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#c19a6b] shadow-sm shrink-0">
                                        <Truck size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-primary italic">Fast Shipping</h4>
                                        <p className="text-xs font-medium text-[#9f8170] leading-relaxed italic">
                                            Your items will be carefully packed and shipped. Delivery usually takes 2-4 business days.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex pt-8">
                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={!selectedAddress}
                                        className="flex-1 py-6 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                                    >
                                        Proceed to Payment <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                                {/* Order Review */}
                                <div className="space-y-6">
                                    <h3 className="text-3xl font-black text-primary tracking-tighter italic serif">Review Items</h3>
                                    <div className="bg-white rounded-[3rem] border border-[#e5e5d1]/30 overflow-hidden divide-y divide-[#e5e5d1]/30">
                                        {preview?.items.map((item, i) => (
                                            <div key={i} className="p-8 flex items-center gap-6 group hover:bg-[#fdfaf5] transition-colors relative">
                                                <div className="w-16 h-16 bg-[#fdfaf5] rounded-xl overflow-hidden shrink-0 border border-[#e5e5d1]/30">
                                                    <img src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1999'} className="w-full h-full object-cover" alt={item.product_name} />
                                                </div>
                                                <div className="flex-1">
                                                    <Link to={`/products/${item.product?.slug}`} className="text-sm font-black text-primary tracking-tight hover:text-[#c19a6b] transition-colors stretched-link">
                                                        {item.product_name}
                                                    </Link>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#9f8170] italic mt-1">Quantity: {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-black text-primary tabular-nums">₹ {item.price * item.quantity}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Options */}
                                <div className="space-y-6">
                                    <h3 className="text-3xl font-black text-primary tracking-tighter italic serif">Choose Payment</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Wallet Option */}
                                        <button
                                            onClick={() => setUseWallet(!useWallet)}
                                            className={`group p-8 rounded-[2.5rem] border-2 text-left transition-all duration-500 hover:scale-[1.02] ${useWallet ? 'bg-white border-[#c19a6b] shadow-2xl shadow-[#c19a6b10]' : 'bg-white/50 border-[#e5e5d1]/50'}`}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`p-4 rounded-2xl transition-colors ${useWallet ? 'bg-[#c19a6b] text-white shadow-lg' : 'bg-[#c19a6b10] text-[#c19a6b]'}`}>
                                                    <Wallet size={24} />
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${useWallet ? 'border-[#c19a6b] bg-[#c19a6b]' : 'border-gray-200'}`}>
                                                    {useWallet && <CheckCircle2 size={12} className="text-white" />}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-lg font-black text-primary tracking-tight">Matte Wallet</h4>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">Balance: ₹ {preview?.summary?.wallet_balance || 0}</p>
                                            </div>

                                            {useWallet && preview?.summary?.wallet_balance > 0 ? (
                                                <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 italic">
                                                        Applied: -₹ {Math.min(preview.summary.wallet_balance, preview.summary.total).toLocaleString()}
                                                    </p>
                                                </div>
                                            ) : useWallet && (
                                                <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-2">
                                                    <Info size={12} className="text-amber-500 mt-0.5" />
                                                    <p className="text-[9px] font-bold text-amber-700 leading-tight italic">
                                                        Wallet is empty. <Link to="/wallet" className="underline decoration-amber-500/30 hover:text-amber-900 transition-colors">Top up here</Link>
                                                    </p>
                                                </div>
                                            )}
                                        </button>

                                        {/* Stripe Option */}
                                        <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 relative overflow-hidden ${(!useWallet || (preview?.summary?.wallet_balance || 0) < (preview?.summary?.total || 0)) ? 'bg-primary border-primary shadow-2xl shadow-primary/20' : 'bg-white/50 border-[#e5e5d1]/50 grayscale opacity-40'}`}>
                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className={`p-4 rounded-2xl ${(!useWallet || (preview?.summary?.wallet_balance || 0) < (preview?.summary?.total || 0)) ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                        <CreditCard size={24} />
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${(!useWallet || (preview?.summary?.wallet_balance || 0) < (preview?.summary?.total || 0)) ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-400'}`}>Secure</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className={`text-lg font-black tracking-tight ${(!useWallet || (preview?.summary?.wallet_balance || 0) < (preview?.summary?.total || 0)) ? 'text-white' : 'text-gray-400'}`}>Online Payment</h4>
                                                    <p className={`text-[10px] font-medium italic ${(!useWallet || (preview?.summary?.wallet_balance || 0) < (preview?.summary?.total || 0)) ? 'text-white/60' : 'text-gray-400'}`}>Card, UPI, or Netbanking via Stripe.</p>
                                                </div>

                                                {useWallet && (preview?.summary?.wallet_balance || 0) > 0 && (preview?.summary?.wallet_balance || 0) < (preview?.summary?.total || 0) && (
                                                    <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/80 italic">
                                                            Required: ₹ {(preview.summary.total - preview.summary.wallet_balance).toLocaleString()}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <ShieldCheck size={80} className={`absolute -right-4 -bottom-4 rotate-12 transition-opacity ${(!useWallet || (preview?.summary?.wallet_balance || 0) < (preview?.summary?.total || 0)) ? 'text-white/5 opacity-100' : 'opacity-0'}`} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 pt-8">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-10 py-6 border border-[#e5e5d1] rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-primary hover:bg-white transition-all flex items-center gap-3"
                                    >
                                        <ArrowLeft size={16} /> Back
                                    </button>
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={processingOrder}
                                        className="flex-1 py-6 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 group"
                                    >
                                        {processingOrder ? 'Processing...' : 'Place Order Now'}
                                        {!processingOrder && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1 space-y-8 sticky top-32">
                        <div className="bg-white p-10 rounded-[3rem] border border-[#e5e5d1]/30 shadow-xl space-y-10">
                            <div>
                                <h4 className="text-3xl font-black text-primary tracking-tighter">Order Summary</h4>
                            </div>

                            <div className="space-y-6 border-y border-[#e5e5d1]/30 py-10">
                                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-[#9f8170]">
                                    <span>Items Total</span>
                                    <span className="text-primary tabular-nums">₹ {preview?.summary?.subtotal || 0}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-[#9f8170]">
                                    <span>Shipping</span>
                                    <span className="text-emerald-500 italic">Free</span>
                                </div>
                                {(preview?.summary?.discount || 0) > 0 && (
                                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-emerald-500">
                                        <span>Discount</span>
                                        <span className="tabular-nums">- ₹ {preview.summary.discount}</span>
                                    </div>
                                )}
                                {useWallet && (preview?.summary?.wallet_balance || 0) > 0 && (
                                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-[#c19a6b]">
                                        <span>Wallet Contribution</span>
                                        <span className="tabular-nums">- ₹ {Math.min(preview.summary.wallet_balance, preview.summary.total).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">Coupon Code</p>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Enter code"
                                        className="w-full bg-[#fdfaf5] border border-[#e5e5d1] rounded-2xl px-6 py-4 pr-32 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[#c19a6b] transition-colors"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={applyingCoupon || !couponCode}
                                        className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-[#c19a6b] transition-colors disabled:opacity-50"
                                    >
                                        {applyingCoupon ? '...' : 'Apply'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-6 border-t border-[#e5e5d1]/30">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest text-primary">Final Amount Payable</span>
                                    <span className="text-4xl font-black text-primary tracking-tighter tabular-nums italic">
                                        ₹ {(useWallet
                                            ? Math.max(0, (preview?.summary?.total || 0) - (preview?.summary?.wallet_balance || 0))
                                            : (preview?.summary?.total || 0)).toLocaleString()}
                                    </span>
                                </div>

                                {useWallet && (preview?.summary?.wallet_balance || 0) >= (preview?.summary?.total || 0) ? (
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-center gap-3">
                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 italic">Fully covered by your wallet balance</p>
                                    </div>
                                ) : useWallet && (preview?.summary?.wallet_balance || 0) > 0 ? (
                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-center gap-3">
                                        <CreditCard size={16} className="text-amber-500" />
                                        <p className="text-[9px] font-black uppercase tracking-widest text-[#c19a6b] italic font-bold">Partial wallet use + Secure Stripe payment</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-end gap-2 text-[8px] font-black uppercase tracking-widest text-gray-400 italic pt-1">
                                        <ShieldCheck size={12} className="text-primary" />
                                        <span>Secure Checkout via Stripe</span>
                                    </div>
                                )}
                            </div>

                            {/* Trust Badge */}
                            <div className="pt-4 flex items-center gap-3 text-gray-400">
                                <ShieldCheck size={14} className="text-[#c19a6b]" />
                                <span className="text-[8px] font-black uppercase tracking-widest italic leading-none">Your transaction is 100% secure</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* New Address Form Modal */}
                {isAddAddressOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-md" onClick={() => setIsAddAddressOpen(false)}></div>
                        <form
                            onSubmit={handleAddAddress}
                            className="relative w-full max-w-2xl bg-white rounded-[3.5rem] border border-[#c19a6b20] p-12 shadow-[0_32px_128px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-500 space-y-8"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-3xl font-black text-primary tracking-tighter italic serif">Add New Address</h3>
                                <button type="button" onClick={() => setIsAddAddressOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors uppercase text-[10px] font-black">Close</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">Full Name</label>
                                    <input
                                        required
                                        placeholder="Who is this for?"
                                        className="w-full bg-[#fdfaf5] border border-[#e5e5d1] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#c19a6b] transition-colors"
                                        value={newAddress.full_name}
                                        onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">Phone Number</label>
                                    <input
                                        required
                                        placeholder="Active Mobile No."
                                        className="w-full bg-[#fdfaf5] border border-[#e5e5d1] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#c19a6b] transition-colors"
                                        value={newAddress.phone}
                                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">Flat / House No. / Street</label>
                                    <input
                                        required
                                        placeholder="Address Line 1"
                                        className="w-full bg-[#fdfaf5] border border-[#e5e5d1] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#c19a6b] transition-colors"
                                        value={newAddress.address_line1}
                                        onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">City</label>
                                    <input
                                        required
                                        placeholder="Your City"
                                        className="w-full bg-[#fdfaf5] border border-[#e5e5d1] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#c19a6b] transition-colors"
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">Pincode</label>
                                    <input
                                        required
                                        placeholder="6-digit code"
                                        className="w-full bg-[#fdfaf5] border border-[#e5e5d1] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#c19a6b] transition-colors"
                                        value={newAddress.postal_code}
                                        onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                disabled={submittingAddress}
                                type="submit"
                                className="w-full py-6 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                            >
                                {submittingAddress ? 'Saving...' : 'Save and Use Address'} <Plus size={18} />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
