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
        <div className="bg-[#f8f9fa] min-h-screen py-12 md:py-20 animate-in fade-in duration-700">
            <div className="max-w-6xl mx-auto px-4 md:px-6 pt-8">
                {/* Simplified Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Cart</h1>
                        {hasItems && (
                            <p className="text-sm text-gray-500 mt-1">
                                {selectedItems.length} of {cart.items.length} items selected
                            </p>
                        )}
                    </div>
                </div>

                {!hasItems ? (
                    <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag size={32} className="text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8">Add items to it now to shop.</p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm transition-all hover:bg-secondary"
                        >
                            Shop Now <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Items Section */}
                        <div className="lg:col-span-8 space-y-4">
                            {/* Select All Bar */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                                <button
                                    onClick={toggleAll}
                                    className="flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-primary transition-colors"
                                >
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedItems.length === cart.items.length ? 'bg-primary border-primary text-white' : 'border-gray-200 bg-white'}`}>
                                        {selectedItems.length === cart.items.length && <Plus size={12} className="rotate-45" />}
                                    </div>
                                    Select All Items
                                </button>
                            </div>

                            {cart.items.map((item) => (
                                <div
                                    key={item._id}
                                    className={`bg-white p-4 md:p-6 rounded-2xl border transition-all ${selectedItems.includes(item.variant_id?._id || item._id) ? 'border-primary/20 shadow-md' : 'border-gray-100 opacity-80'}`}
                                >
                                    <div className="flex gap-4 md:gap-6">
                                        {/* Selection */}
                                        <div className="flex items-start pt-1">
                                            <button
                                                onClick={() => toggleSelection(item.variant_id?._id || item._id)}
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedItems.includes(item.variant_id?._id || item._id) ? 'bg-primary border-primary text-white' : 'border-gray-200 bg-white'}`}
                                            >
                                                {selectedItems.includes(item.variant_id?._id || item._id) && <Plus size={12} className="rotate-45" />}
                                            </button>
                                        </div>

                                        {/* Image */}
                                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                                            <img
                                                src={item.product?.images?.[0]}
                                                alt={item.product?.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-base md:text-lg truncate mb-1">
                                                        {item.product?.title}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {Object.entries(item.variant?.attributes || {}).map(([key, val]) => (
                                                            <span key={key} className="text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                                {key.toUpperCase()}: {val}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-left md:text-right">
                                                    <p className="text-lg font-black text-gray-900">₹{item.price}</p>
                                                    {item.quantity > 1 && (
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                                            Total: ₹{item.total_price}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
                                                <div className="flex items-center gap-6">
                                                    {/* Quantity Selector */}
                                                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-9">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item._id, item.quantity, -1)}
                                                            className="w-9 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="w-10 text-center text-sm font-bold text-gray-900 border-x border-gray-100">{item.quantity}</span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item._id, item.quantity, 1)}
                                                            disabled={item.quantity >= item.available_stock}
                                                            className="w-9 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => handleRemoveItem(item._id)}
                                                        className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 size={14} /> REMOVE
                                                    </button>
                                                </div>

                                                <div className="text-right">
                                                    {item.available_stock <= 5 && item.available_stock > 0 && (
                                                        <span className="text-[10px] font-bold text-orange-500 uppercase bg-orange-50 px-2 py-1 rounded">
                                                            Only {item.available_stock} left
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Back to shop */}
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-colors pt-4"
                            >
                                <ArrowLeft size={16} /> ADD MORE FROM MARKETPLACE
                            </Link>

                            {/* Coupons (Simplified) */}
                            {coupons.length > 0 && (
                                <div className="pt-12">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Sparkles size={18} className="text-accent" />
                                        <h3 className="text-xl font-bold text-gray-900">Available Coupons</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                        {/* Summary Column */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 sticky top-24">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Price Details</h3>

                                {/* Coupon Input */}
                                <div className="space-y-3 pb-6 border-b border-gray-50">
                                    {appliedCoupon ? (
                                        <div className="bg-emerald-50 p-4 rounded-xl flex items-center justify-between border border-emerald-100">
                                            <div className="flex items-center gap-3">
                                                <Ticket size={18} className="text-emerald-600" />
                                                <div>
                                                    <p className="text-sm font-bold text-emerald-900">{appliedCoupon.code}</p>
                                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">Applied Successfully</p>
                                                </div>
                                            </div>
                                            <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <Minus size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="Enter Coupon Code"
                                                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors"
                                            />
                                            <button
                                                onClick={() => validateCoupon(couponCode)}
                                                disabled={!couponCode || isValidatingCoupon}
                                                className="bg-primary text-white px-6 rounded-xl font-black text-xs uppercase tracking-wider transition-all hover:bg-secondary disabled:opacity-50"
                                            >
                                                {isValidatingCoupon ? '...' : 'Apply'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Total MRP</span>
                                        <span className="font-bold text-gray-900">₹{calculateSelectedTotal().subtotal}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Coupon Discount</span>
                                        <span className={appliedCoupon ? "font-bold text-emerald-500" : "text-gray-400"}>
                                            {appliedCoupon ? `-₹${appliedCoupon.discount}` : '₹0'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Delivery Charges</span>
                                        <span className="font-bold text-emerald-500 uppercase text-[11px]">Free</span>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-base font-bold text-gray-900">Total Amount</span>
                                        <span className="text-2xl font-black text-primary tabular-nums tracking-tight">
                                            ₹{calculateSelectedTotal().total}
                                        </span>
                                    </div>
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
                                    className="w-full py-4 bg-primary text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-secondary transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Proceed to Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>

                                <div className="flex items-center justify-center gap-4 text-gray-400 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-100">
                                    <ShieldCheck size={20} className="text-emerald-500" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">
                                        100% Safe Payments
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
