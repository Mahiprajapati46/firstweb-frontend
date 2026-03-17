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
    Plus,
    User,
    Building,
    Shield
} from 'lucide-react';
import customerApi from '../../api/customer';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { commonSchemas } from '../../validations/common.schema';
import Input from '../../components/ui/Input';

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
        name: '',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        type: 'HOME'
    });

    // 🛡️ Data Normalization Helper
    const normalizeAddress = (addr) => ({
        ...addr,
        name: (addr.name || addr.full_name || addr.fullName || '').trim(),
        line1: (addr.line1 || addr.address_line1 || addr.addressLine1 || '').trim(),
        line2: (addr.line2 || addr.address_line2 || addr.addressLine2 || '').trim(),
        pincode: (addr.pincode || addr.postal_code || addr.postalCode || addr.zipCode || '').trim(),
        phone: (addr.phone || addr.mobile || addr.business_phone || '').trim(),
        city: (addr.city || '').trim(),
        state: (addr.state || '').trim(),
        country: addr.country || 'India' // Added country to normalization
    });
    const [submittingAddress, setSubmittingAddress] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

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

            if (addrRes.data) {
                const normalized = addrRes.data.map(normalizeAddress);
                setAddresses(normalized);

                // Pre-select default address if exists
                const defaultAddr = normalized.find(a => a.is_default);
                const initialSelected = defaultAddr || (normalized.length > 0 ? normalized[0] : null);

                if (initialSelected) {
                    setSelectedAddress(initialSelected);
                    // Initial preview with state
                    const initialPreviewRes = await customerApi.checkoutPreview(passedCouponCode || undefined, variantIds, initialSelected.state);
                    if (initialPreviewRes.success) {
                        setPreview(initialPreviewRes.data);
                    }
                } else if (previewRes.success) {
                    setPreview(previewRes.data);
                }
            }
        } catch (error) {
            console.error('Fetch Checkout Data Error:', error);
            toast.error('Failed to initialize checkout');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedAddress) {
            updatePreview();
        }
    }, [selectedAddress]);

    const updatePreview = async () => {
        try {
            const response = await customerApi.checkoutPreview(couponCode || undefined, variantIds, selectedAddress?.state);
            if (response.success) {
                setPreview(response.data);
            }
        } catch (error) {
            console.error('Update Preview Error:', error);
        }
    };

    const handleFieldChange = (name, value) => {
        let cleanedValue = value;

        // 🛡️ Industrial Input Cleaning
        if (name === 'phone') {
            // No silent cleaning for documentation
        } else if (name === 'pincode') {
            // No silent cleaning for documentation
        }

        setNewAddress(prev => ({ ...prev, [name]: cleanedValue }));

        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleFieldBlur = (name, value) => {
        // 🛡️ Real-time Field Validation
        const result = commonSchemas.address.safeParse({ ...newAddress, [name]: value });

        if (!result.success) {
            const fieldIssue = result.error.issues.find(issue => issue.path[0] === name);
            if (fieldIssue) {
                setFieldErrors(prev => ({
                    ...prev,
                    [name]: fieldIssue.message
                }));
                return;
            }
        }

        // ✅ Clear error if field is now valid
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setFieldErrors({});

        // 🛡️ Frontend Validation with Zod
        const result = commonSchemas.address.safeParse(newAddress);
        if (!result.success) {
            const errors = {};
            result.error.issues.forEach(issue => {
                errors[issue.path[0]] = issue.message;
            });
            setFieldErrors(errors);
            toast.error("Please clarify the required fields.");
            return;
        }

        try {
            setSubmittingAddress(true);
            const response = await customerApi.addAddress(newAddress);
            if (response.message) {
                toast.success('Address secured in your vault');
                setIsAddAddressOpen(false);
                setNewAddress({
                    name: '',
                    phone: '',
                    line1: '',
                    line2: '',
                    city: '',
                    state: '',
                    pincode: '',
                    country: 'India',
                    type: 'HOME'
                });
                const addrRes = await customerApi.getAddresses();
                if (addrRes.data) {
                    const normalized = addrRes.data.map(normalizeAddress);
                    setAddresses(normalized);
                    // Select the newly added address
                    const added = normalized.find(a => a.name === newAddress.name && a.phone === newAddress.phone);
                    if (added) setSelectedAddress(added);
                    else setSelectedAddress(normalized[normalized.length - 1]);
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
                    name: selectedAddress.name,
                    phone: selectedAddress.phone,
                    line1: selectedAddress.line1,
                    line2: selectedAddress.line2,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    pincode: selectedAddress.pincode,
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
        <div className="bg-[#f8f9fa] min-h-screen pt-12 pb-32">
            <div className="max-w-6xl mx-auto px-4 md:px-6 pt-8">
                {/* Simplified Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                        <p className="text-sm text-gray-500 mt-1">Complete your order in two simple steps.</p>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                        <button
                            onClick={() => setStep(1)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all ${step === 1 ? 'bg-primary text-white font-bold shadow-md' : 'text-gray-400 font-medium hover:bg-gray-50'}`}
                        >
                            <MapPin size={16} />
                            <span className="text-xs uppercase tracking-wider">1. Shipping</span>
                        </button>
                        <ChevronRight size={14} className="text-gray-300" />
                        <button
                            disabled={!selectedAddress}
                            onClick={() => setStep(2)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all ${step === 2 ? 'bg-primary text-white font-bold shadow-md' : 'text-gray-400 font-medium hover:bg-gray-50 disabled:opacity-30'}`}
                        >
                            <CreditCard size={16} />
                            <span className="text-xs uppercase tracking-wider">2. Payment</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {step === 1 ? (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-gray-900">Delivery Address</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map((addr) => (
                                            <button
                                                key={addr._id}
                                                onClick={() => setSelectedAddress(addr)}
                                                className={`text-left p-6 rounded-2xl border-2 transition-all ${selectedAddress?._id === addr._id ? 'bg-white border-primary ring-4 ring-primary/5' : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'}`}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="px-2 py-0.5 bg-gray-50 text-[10px] font-black uppercase text-gray-500 rounded border border-gray-100">{addr.type}</span>
                                                    {selectedAddress?._id === addr._id && <CheckCircle2 size={18} className="text-primary" />}
                                                </div>
                                                <h4 className="font-bold text-gray-900 mb-1">{addr.name}</h4>
                                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                                                    {addr.line1}, {addr.city}, {addr.pincode}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{addr.phone}</p>
                                            </button>
                                        ))}

                                        {!isAddAddressOpen && (
                                            <button
                                                onClick={() => { setIsAddAddressOpen(true); setFieldErrors({}); }}
                                                className="p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary/30 hover:bg-white transition-all flex flex-col items-center justify-center gap-3 text-gray-400 group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                                    <Plus size={20} />
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-wider">Add New Address</span>
                                            </button>
                                        )}
                                    </div>
                                </section>

                                <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex gap-4 items-center">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                                        <Truck size={20} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Free Standard Delivery</h4>
                                        <p className="text-xs text-emerald-700">Estimated delivery within 3-5 business days.</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!selectedAddress}
                                    className="w-full py-4 bg-primary text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/10 hover:bg-secondary transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    Proceed to Payment <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <section className="space-y-6">
                                    <h3 className="text-xl font-bold text-gray-900">Review Items</h3>
                                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                        {preview?.items.map((item, i) => (
                                            <div key={i} className="p-4 flex items-center gap-4 border-b border-gray-50 last:border-0">
                                                <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                                                    <img src={item.images?.[0] || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-gray-900 truncate">{item.product_name}</h4>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Quantity: {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-black text-gray-900">₹{item.price * item.quantity}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h3 className="text-xl font-bold text-gray-900">Payment Method</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setUseWallet(!useWallet)}
                                            className={`p-6 rounded-2xl border-2 text-left transition-all ${useWallet ? 'bg-white border-primary shadow-lg ring-4 ring-primary/5' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                                        >
                                            <div className="flex justify-between items-center mb-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${useWallet ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}`}>
                                                    <Wallet size={20} />
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${useWallet ? 'border-primary bg-primary' : 'border-gray-200'}`}>
                                                    {useWallet && <CheckCircle2 size={12} className="text-white" />}
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-gray-900">My Wallet</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Available: ₹{preview?.summary?.wallet_balance || 0}</p>

                                            {useWallet && preview?.summary?.wallet_balance > 0 && (
                                                <div className="mt-4 p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                                                    <p className="text-[9px] font-black text-emerald-600 uppercase">
                                                        Using ₹{Math.min(preview.summary.wallet_balance, preview.summary.total).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                        </button>

                                        <div className={`p-6 rounded-2xl border-2 transition-all ${(!useWallet || (preview?.summary?.wallet_balance || 0) < (preview?.summary?.total || 0)) ? 'bg-gray-900 border-gray-900 text-white shadow-lg' : 'bg-white border-gray-100 opacity-50 grayscale'}`}>
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                                    <CreditCard size={20} />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 bg-white/5 px-2 py-0.5 rounded">Secure</span>
                                            </div>
                                            <h4 className="font-bold">Online Payment</h4>
                                            <p className="text-[10px] text-white/60 mt-1">Pay via UPI, Cards, or Netbanking.</p>
                                        </div>
                                    </div>
                                </section>

                                <div className="flex items-center gap-4 pt-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-6 py-4 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-white transition-all flex items-center gap-2"
                                    >
                                        <ArrowLeft size={16} /> Back
                                    </button>
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={processingOrder}
                                        className="flex-1 py-4 bg-primary text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/10 hover:bg-secondary transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {processingOrder ? 'Processing...' : 'Place Order'}
                                        {!processingOrder && <ArrowRight size={18} />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 sticky top-24">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Price Details</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Total MRP</span>
                                    <span className="font-bold text-gray-900">₹{preview?.summary?.subtotal || 0}</span>
                                </div>
                                {(preview?.summary?.discount || 0) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Coupon Discount</span>
                                        <span className="font-bold text-emerald-500">-₹{preview.summary.discount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Delivery Charges</span>
                                    <span className="font-bold text-emerald-500 uppercase text-[11px]">Free</span>
                                </div>

                                {preview?.summary?.tax > 0 && (
                                    <div className="pt-2 space-y-2 border-t border-gray-50 mt-2">
                                        <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                            <span>Tax Breakdown</span>
                                        </div>
                                        {preview.sub_orders?.some(so => so.tax_details?.cgst > 0) ? (
                                            <>
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>CGST</span>
                                                    <span>₹{preview.sub_orders.reduce((acc, so) => acc + (so.tax_details?.cgst || 0), 0).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>SGST</span>
                                                    <span>₹{preview.sub_orders.reduce((acc, so) => acc + (so.tax_details?.sgst || 0), 0).toFixed(2)}</span>
                                                </div>
                                            </>
                                        ) : preview.sub_orders?.some(so => so.tax_details?.igst > 0) ? (
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>IGST</span>
                                                <span>₹{preview.sub_orders.reduce((acc, so) => acc + (so.tax_details?.igst || 0), 0).toFixed(2)}</span>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>GST</span>
                                                <span>₹{preview.summary.tax.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {useWallet && (preview?.summary?.wallet_balance || 0) > 0 && (
                                    <div className="flex justify-between text-sm pt-4 border-t border-gray-50 text-primary">
                                        <span className="font-bold">Wallet Pay</span>
                                        <span className="font-black">-₹{Math.min(preview.summary.wallet_balance, preview.summary.total).toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="font-bold text-gray-900">{useWallet ? 'Payable Now' : 'Total Amount'}</span>
                                    <span className="text-2xl font-black text-primary">
                                        ₹{(useWallet
                                            ? Math.max(0, (preview?.summary?.total || 0) - (preview?.summary?.wallet_balance || 0))
                                            : (preview?.summary?.total || 0)).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Coupon Input Area */}
                            <div className="space-y-3 pt-6 border-t border-gray-50">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter Coupon"
                                        className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary transition-all"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={applyingCoupon || !couponCode}
                                        className="bg-primary text-white px-4 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-secondary transition-all disabled:opacity-50"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-3 p-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-100">
                                <ShieldCheck size={18} className="text-primary" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">100% Secure Transaction</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Simplified Address Modal */}
                {isAddAddressOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsAddAddressOpen(false)}></div>
                        <form
                            onSubmit={handleAddAddress}
                            className="relative w-full max-w-lg bg-white rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-300"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-gray-900">New Address</h3>
                                <button type="button" onClick={() => setIsAddAddressOpen(false)} className="text-gray-400 hover:text-red-500 font-bold text-xs uppercase">Close</button>
                            </div>

                            <div className="space-y-6 mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Full Name"
                                        name="name"
                                        required
                                        placeholder="e.g. Rahul Sharma"
                                        icon={<User size={18} />}
                                        value={newAddress.name}
                                        onChange={(e) => handleFieldChange('name', e.target.value)}
                                        onBlur={(e) => handleFieldBlur('name', e.target.value)}
                                        error={fieldErrors.name}
                                    />
                                    <Input
                                        label="Mobile Number"
                                        name="phone"
                                        required
                                        placeholder="10-digit number"
                                        value={newAddress.phone}
                                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                                        onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                                        error={fieldErrors.phone}
                                    />
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Address Line"
                                            name="line1"
                                            required
                                            placeholder="Flat, House No, Building, Apartment"
                                            icon={<MapPin size={18} />}
                                            value={newAddress.line1}
                                            onChange={(e) => handleFieldChange('line1', e.target.value)}
                                            onBlur={(e) => handleFieldBlur('line1', e.target.value)}
                                            error={fieldErrors.line1}
                                        />
                                    </div>
                                    <Input
                                        label="City"
                                        name="city"
                                        required
                                        placeholder="Your City"
                                        icon={<Building size={18} />}
                                        value={newAddress.city}
                                        onChange={(e) => handleFieldChange('city', e.target.value)}
                                        onBlur={(e) => handleFieldBlur('city', e.target.value)}
                                        error={fieldErrors.city}
                                    />
                                    <Input
                                        label="State"
                                        name="state"
                                        required
                                        placeholder="Your State"
                                        icon={<MapPin size={18} />}
                                        value={newAddress.state}
                                        onChange={(e) => handleFieldChange('state', e.target.value)}
                                        onBlur={(e) => handleFieldBlur('state', e.target.value)}
                                        error={fieldErrors.state}
                                    />
                                    <Input
                                        label="Pincode"
                                        name="pincode"
                                        required
                                        placeholder="6-digit code"
                                        icon={<Shield size={18} />}
                                        value={newAddress.pincode}
                                        onChange={(e) => handleFieldChange('pincode', e.target.value)}
                                        onBlur={(e) => handleFieldBlur('pincode', e.target.value)}
                                        error={fieldErrors.pincode}
                                    />
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address Type<span className="text-red-500 ml-1">*</span></label>
                                        <div className="flex gap-2">
                                            {['HOME', 'WORK'].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setNewAddress({ ...newAddress, type })}
                                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all border-2 ${newAddress.type === type ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={submittingAddress}
                                type="submit"
                                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-secondary transition-all shadow-lg shadow-primary/10"
                            >
                                {submittingAddress ? 'Saving...' : 'Save Address'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
