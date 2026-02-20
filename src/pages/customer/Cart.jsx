import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ShoppingBag,
    Trash2,
    Plus,
    Minus,
    ArrowRight,
    ArrowLeft,
    Truck,
    Info,
    Ticket,
    Copy,
    Sparkles,
    ShieldCheck
} from 'lucide-react';
import CouponCard from '../../components/customer/CouponCard';
import customerApi from '../../api/customer';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Cart = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState([]); // Track selected variant_ids

    // 🆕 Coupon State
    const [coupons, setCoupons] = useState([]);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [couponError, setCouponError] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { from: '/cart' } });
            return;
        }
        fetchCart();
        fetchCoupons();

        // Listen for internal cart updates
        const handleCartUpdate = () => fetchCart();
        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, [user, navigate]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await customerApi.getCart();
            if (response.success) {
                setCart(response.data);
                // Default select all if no selection exists
                if (response.data?.items?.length > 0) {
                    setSelectedItems(response.data.items.map(item => item.variant_id?._id || item._id));
                }
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    // 🆕 Fetch available coupons
    const fetchCoupons = async () => {
        try {
            const response = await customerApi.getCoupons();
            if (response.success) setCoupons(response.data || []);
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
        }
    };

    const toggleSelection = (id) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedItems.length === cart.items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cart.items.map(item => item.variant_id?._id || item._id));
        }
    };

    // 🆕 Check Coupon Validity via Preview API
    const validateCoupon = async (codeToValidate) => {
        if (!codeToValidate) return;

        setIsValidatingCoupon(true);
        setCouponError(null);

        try {
            // Only validate if items are selected
            if (selectedItems.length === 0) {
                toast.error("Please select items to apply coupon");
                return;
            }

            const response = await customerApi.checkoutPreview(codeToValidate, selectedItems);

            if (response.success) {
                const { summary } = response.data;
                if (summary.coupon?.is_valid) {
                    setAppliedCoupon({
                        code: codeToValidate,
                        discount: summary.discount,
                        message: summary.coupon.message
                    });
                    setCouponCode(''); // Clear input on success
                    toast.success("Coupon applied successfully!");
                } else {
                    setCouponError(summary.coupon?.message || "Invalid coupon code");
                    setAppliedCoupon(null);
                    toast.error(summary.coupon?.message || "Invalid coupon code");
                }
            }
        } catch (error) {
            console.error("Coupon validation failed:", error);
            setCouponError(error.message || "Failed to validate coupon");
            setAppliedCoupon(null);
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponError(null);
        toast.success("Coupon removed");
    };

    const calculateSelectedTotal = () => {
        if (!cart || !cart.items) return { subtotal: 0, total: 0 };
        const selected = cart.items.filter(item =>
            selectedItems.includes(item.variant_id?._id || item._id)
        );
        const subtotal = selected.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // 🆕 Apply discount locally for display (re-verified in checkout)
        let total = subtotal;
        if (appliedCoupon) {
            total = Math.max(0, subtotal - appliedCoupon.discount);
        }

        return { subtotal, total: Math.round(total * 100) / 100 };
    };

    const handleUpdateQuantity = async (itemId, currentQty, delta) => {
        const newQty = currentQty + delta;
        if (newQty < 1) return;

        try {
            const response = await customerApi.updateCartItem(itemId, { quantity: newQty });
            if (response.success) {
                fetchCart();
                // If coupon applied, re-validate as total changed
                if (appliedCoupon) validateCoupon(appliedCoupon.code);
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update quantity');
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            const response = await customerApi.removeFromCart(itemId);
            if (response.success) {
                toast.success('Item removed from basket');
                fetchCart();
                // If coupon applied, re-validate or remove
                if (appliedCoupon) validateCoupon(appliedCoupon.code);
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            }
        } catch (error) {
            toast.error(error.message || 'Failed to remove item');
        }
    };

    if (loading && !cart) {
        return (
            <div className="container-custom max-w-7xl mx-auto px-6 py-20 animate-pulse">
                <div className="h-10 bg-gray-100 rounded-full w-48 mb-12"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-6">
                        {Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-32 bg-white rounded-3xl border border-[#e5e5d1]/30"></div>
                        ))}
                    </div>
                    <div className="h-80 bg-white rounded-3xl border border-[#e5e5d1]/30"></div>
                </div>
            </div>
        );
    }

    const hasItems = cart?.items?.length > 0;

    return (
        <div className="bg-[#fdfaf5] min-h-screen pb-32 pt-12">
            <div className="container-custom max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#9f8170]">
                            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-primary italic">Your Basket</span>
                        </div>
                        <h1 className="text-6xl font-black text-primary tracking-tighter">Shopping Bag<span className="text-[#c19a6b]">.</span></h1>
                    </div>
                    {hasItems && (
                        <div className="flex items-center gap-6">
                            <button
                                onClick={toggleAll}
                                className="text-[10px] font-black uppercase tracking-widest text-[#9f8170] hover:text-primary transition-colors flex items-center gap-2"
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedItems.length === cart.items.length ? 'bg-primary border-primary text-white' : 'border-[#e5e5d1] bg-white'}`}>
                                    {selectedItems.length === cart.items.length && <Plus size={10} className="rotate-45" />}
                                </div>
                                {selectedItems.length === cart.items.length ? 'Deselect All' : 'Select All'}
                            </button>
                            <p className="text-xs font-black uppercase tracking-widest text-[#9f8170]">
                                {selectedItems.length} of {cart.items.length} Items Selected
                            </p>
                        </div>
                    )}
                </div>

                {!hasItems ? (
                    <div className="bg-white rounded-[3rem] border border-[#e5e5d1]/50 p-20 text-center space-y-8 shadow-sm">
                        <div className="w-24 h-24 bg-[#fdfaf5] rounded-[2rem] border border-[#e5e5d1] flex items-center justify-center text-[#c19a6b] mx-auto">
                            <ShoppingBag size={40} className="opacity-20" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black text-primary tracking-tighter italic serif">Your basket is empty.</h2>
                            <p className="text-[#9f8170] font-medium italic">Discover our curated collection and find something extraordinary.</p>
                        </div>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all"
                        >
                            Start Shopping <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
                        {/* Items List */}
                        <div className="lg:col-span-2 space-y-8">
                            {cart.items.map((item) => (
                                <div
                                    key={item._id}
                                    className={`group relative flex flex-col md:flex-row gap-8 bg-white p-8 rounded-[2.5rem] border transition-all duration-700 ${selectedItems.includes(item.variant_id?._id || item._id) ? 'border-primary/20 shadow-xl' : 'border-[#e5e5d1]/30 opacity-70'}`}
                                >
                                    {/* Selection Checkbox */}
                                    <div className="absolute top-8 right-8 z-10">
                                        <button
                                            onClick={() => toggleSelection(item.variant_id?._id || item._id)}
                                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedItems.includes(item.variant_id?._id || item._id) ? 'bg-primary border-primary text-white' : 'border-[#e5e5d1] bg-white'}`}
                                        >
                                            {selectedItems.includes(item.variant_id?._id || item._id) && <Plus size={14} className="rotate-45" />}
                                        </button>
                                    </div>
                                    <div className="relative w-full md:w-32 aspect-square rounded-2xl overflow-hidden bg-[#fdfaf5] shrink-0">
                                        <img
                                            src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1999'}
                                            alt={item.product?.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c19a6b] mb-1">
                                                    {item.product?.category?.name || 'Artisan Series'}
                                                </p>
                                                <h3 className="text-xl font-black text-primary tracking-tight leading-none group-hover:text-[#c19a6b] transition-colors">
                                                    {item.product?.title}
                                                </h3>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {Object.entries(item.variant?.attributes || {}).map(([key, val]) => (
                                                        <span key={key} className="px-3 py-1 bg-[#fdfaf5] border border-[#e5e5d1]/50 rounded-lg text-[10px] font-black uppercase tracking-wider text-[#9f8170]">
                                                            {key}: {val}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-primary">₹ {item.price}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">Subtotal: ₹ {item.total_price}</p>
                                            </div>
                                        </div>

                                        {/* Stock Status */}
                                        <div className="flex items-center gap-2">
                                            {item.stock_status === 'OUT_OF_STOCK' || item.available_stock <= 0 ? (
                                                <span className="px-3 py-1 bg-red-50 text-red-500 border border-red-100 rounded-lg text-[8px] font-black uppercase tracking-widest">
                                                    Out of Stock
                                                </span>
                                            ) : item.available_stock <= 5 ? (
                                                <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[8px] font-black uppercase tracking-widest">
                                                    Only {item.available_stock} Left
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[8px] font-black uppercase tracking-widest">
                                                    In Stock
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-4">
                                            <div className="flex items-center bg-[#fdfaf5] border border-[#e5e5d1] rounded-xl p-1 shadow-sm">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item._id, item.quantity, -1)}
                                                    className="w-8 h-8 flex items-center justify-center text-primary hover:text-red-500 transition-colors"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-8 text-center text-xs font-black text-primary">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item._id, item.quantity, 1)}
                                                    disabled={item.quantity >= item.available_stock}
                                                    className={`w-8 h-8 flex items-center justify-center transition-colors ${item.quantity >= item.available_stock ? 'text-gray-300' : 'text-primary hover:text-[#c19a6b]'}`}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item._id)}
                                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Continue Shopping */}
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#9f8170] hover:text-primary transition-colors group"
                            >
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Continue Shopping
                            </Link>

                            {/* 🆕 Available Coupons Section */}
                            {coupons.length > 0 && (
                                <div className="mt-12 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <Sparkles size={20} className="text-[#c19a6b]" />
                                        <h3 className="text-2xl font-black text-primary tracking-tighter italic serif">Available Coupons</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {coupons.map(coupon => (
                                            <CouponCard
                                                key={coupon._id}
                                                coupon={coupon}
                                                onApply={(code) => validateCoupon(code)}
                                                isApplied={appliedCoupon?.code === coupon.code}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1 space-y-8 sticky top-32">
                            <div className="bg-primary text-white p-10 rounded-[3rem] shadow-2xl shadow-primary/30 space-y-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c19a6b]">Your Selection</p>
                                <h4 className="text-3xl font-black tracking-tighter italic serif">Order Summary</h4>
                            </div>

                            {/* 🆕 Coupon Input */}
                            <div className="space-y-3">
                                {appliedCoupon ? (
                                    <div className="bg-white/10 p-4 rounded-2xl flex items-center justify-between border border-emerald-500/30">
                                        <div className="flex items-center gap-3">
                                            <Ticket size={18} className="text-emerald-400" />
                                            <div>
                                                <p className="text-sm font-black text-white">{appliedCoupon.code}</p>
                                                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Coupon Applied</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={removeCoupon}
                                            className="text-white/50 hover:text-white transition-colors"
                                        >
                                            <Minus size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="ENTER CODE"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-black text-white placeholder:text-white/30 focus:outline-none focus:border-[#c19a6b] transition-colors"
                                        />
                                        <button
                                            onClick={() => validateCoupon(couponCode)}
                                            disabled={!couponCode || isValidatingCoupon}
                                            className="bg-[#c19a6b] hover:bg-[#a6825a] text-white px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                                        >
                                            {isValidatingCoupon ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                )}
                                {couponError && <p className="text-xs text-rose-400 font-medium pl-2">{couponError}</p>}
                            </div>

                            <div className="space-y-6 border-y border-white/10 py-10">
                                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span>₹ {calculateSelectedTotal().subtotal}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                                    <span className="text-gray-400">Discounts</span>
                                    <span className={appliedCoupon ? "text-emerald-400" : "text-gray-600"}>
                                        - ₹ {appliedCoupon ? appliedCoupon.discount : 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                                    <span className="text-gray-400">Shipping</span>
                                    <span className="text-[#c19a6b]">Free</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-black uppercase tracking-widest text-[#c19a6b]">Total Price</span>
                                <span className="text-4xl font-black tracking-tighter tabular-nums">₹ {calculateSelectedTotal().total}</span>
                            </div>

                            <button
                                onClick={() => navigate('/checkout', {
                                    state: {
                                        variantIds: selectedItems,
                                        couponCode: appliedCoupon?.code
                                    }
                                })}
                                disabled={
                                    selectedItems.length === 0 ||
                                    cart.items.some(item =>
                                        selectedItems.includes(item.variant_id?._id || item._id) &&
                                        (item.stock_status === 'OUT_OF_STOCK' || item.available_stock <= 0)
                                    )
                                }
                                className="w-full py-6 bg-[#c19a6b] hover:bg-[#a6825a] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                Proceed to Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Trust Badge */}
                        <div className="p-8 bg-white border border-[#e5e5d1]/30 rounded-[2.5rem] space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#c19a6b10] rounded-xl flex items-center justify-center text-[#c19a6b]">
                                    <ShieldCheck size={20} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary leading-tight">Secure Payment<br />Infrastructure</p>
                            </div>
                            <div className="h-px bg-[#e5e5d1]/30"></div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#c19a6b10] rounded-xl flex items-center justify-center text-[#c19a6b]">
                                    <Truck size={20} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary leading-tight">Insured Global<br />Logistics</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
