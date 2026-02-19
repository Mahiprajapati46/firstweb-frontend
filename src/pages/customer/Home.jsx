import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRight, Truck, RotateCcw, ShieldCheck,
    Headphones, Store, Package, BadgeCheck,
    TrendingUp, Star, ChevronRight, ShoppingBag,
    Zap, Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import customerApi from '../../api/customer';
import toast from 'react-hot-toast';

/* Animated counter hook */
const useCounter = (target, duration = 1800) => {
    const [count, setCount] = useState(0);
    const ref = useRef(false);
    useEffect(() => {
        if (ref.current) return;
        ref.current = true;
        const startTime = Date.now();
        const tick = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(ease * target));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [target, duration]);
    return count;
};

/* Category color palette */
const categoryColors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-blue-600',
    'from-yellow-400 to-orange-500',
    'from-teal-500 to-green-500',
    'from-fuchsia-500 to-pink-600',
    'from-sky-500 to-blue-500',
];

/* ─── ProductCard ──────────────────────────────────────────── */
const ProductCard = ({ product }) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    return (
        <Link
            to={`/products/${product.slug}`}
            className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/60 transition-all duration-300 flex flex-col"
        >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-50">
                {product.images?.[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <ShoppingBag size={40} className="text-gray-300" />
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                {/* Wishlist button */}
                <button
                    onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 hover:scale-110"
                >
                    <Heart size={14} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                </button>

                {/* Badge */}
                {product.discount_percent > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        -{product.discount_percent}%
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3.5 flex flex-col flex-1">
                <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider mb-1">
                    {product.category?.name || 'Product'}
                </p>
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-2 group-hover:text-blue-700 transition-colors">
                    {product.title}
                </h3>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                    <div>
                        <span className="text-base font-bold text-gray-900">
                            ₹{product.pricing?.base_price?.toLocaleString('en-IN')}
                        </span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                        <Star size={11} className="fill-amber-400" />
                        <span className="text-xs font-semibold text-gray-500 ml-0.5">4.5</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

/* ─── Main Component ───────────────────────────────────────── */
const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleSection, setVisibleSection] = useState('');

    const productsCount = useCounter(10000);
    const sellersCount = useCounter(500);
    const customersCount = useCounter(25000);
    const ordersCount = useCounter(60000);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [catRes, prodRes] = await Promise.all([
                    customerApi.getCategoriesTree(),
                    customerApi.getProducts({ limit: 8 })
                ]);
                setCategories(catRes.data || []);
                setFeaturedProducts(prodRes.data?.products || []);
            } catch (e) {
                toast.error('Failed to load content');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const sellerLink = user ? '/merchant/apply' : '/login';
    const sellerState = !user ? { from: { pathname: '/merchant/apply' } } : undefined;

    return (
        <div className="overflow-x-hidden">

            {/* ─── HERO ─────────────────────────────────────────────── */}
            <section className="relative min-h-[88vh] flex items-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 overflow-hidden">

                {/* Animated background blobs */}
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-600/20 blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }} />
                <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[60px] animate-pulse" style={{ animationDelay: '3s' }} />

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '50px 50px' }}
                />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* Left — Text */}
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-4 py-2 rounded-full backdrop-blur-sm">
                                <Zap size={12} className="fill-blue-300" />
                                India's Growing Multi-Vendor Marketplace
                            </div>

                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.06] tracking-tight">
                                Shop Smart,<br />
                                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                                    Sell More.
                                </span>
                            </h1>

                            <p className="text-lg text-blue-200/80 leading-relaxed max-w-lg">
                                Discover quality products from trusted sellers. Fast delivery, easy returns, and secure payments — all in one place.
                            </p>

                            <div className="flex items-center gap-4 flex-wrap">
                                <Link
                                    to="/products"
                                    className="group inline-flex items-center gap-2.5 px-8 py-4 bg-white text-gray-900 text-sm font-bold rounded-2xl hover:bg-blue-50 transition-all duration-300 shadow-2xl shadow-black/30 hover:scale-[1.03] active:scale-[0.98]"
                                >
                                    Browse Products
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to={sellerLink}
                                    state={sellerState}
                                    className="group inline-flex items-center gap-2.5 px-8 py-4 bg-transparent text-white text-sm font-bold rounded-2xl border border-white/30 hover:bg-white/10 hover:border-white/60 transition-all duration-300 backdrop-blur-sm hover:scale-[1.03] active:scale-[0.98]"
                                >
                                    <Store size={16} />
                                    Start Selling
                                </Link>
                            </div>

                            {/* Trust chips */}
                            <div className="flex items-center gap-4 flex-wrap pt-2">
                                {['Secure Payments', 'Free Returns', '24/7 Support'].map((t, i) => (
                                    <div key={i} className="flex items-center gap-1.5 text-xs text-blue-300/80 font-medium">
                                        <BadgeCheck size={13} className="text-emerald-400" />
                                        {t}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right — Stats floating boxes */}
                        <div className="hidden lg:grid grid-cols-2 gap-4">
                            {[
                                { label: 'Products', value: `${(productsCount / 1000).toFixed(0)}K+`, icon: Package, color: 'from-blue-500 to-cyan-500' },
                                { label: 'Sellers', value: `${sellersCount}+`, icon: Store, color: 'from-violet-500 to-purple-600' },
                                { label: 'Customers', value: `${(customersCount / 1000).toFixed(0)}K+`, icon: Heart, color: 'from-pink-500 to-rose-500' },
                                { label: 'Orders', value: `${(ordersCount / 1000).toFixed(0)}K+`, icon: ShoppingBag, color: 'from-emerald-500 to-teal-600' },
                            ].map((s, i) => (
                                <div
                                    key={i}
                                    className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/30 cursor-default"
                                    style={{ animationDelay: `${i * 0.1}s` }}
                                >
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 shadow-lg`}>
                                        <s.icon size={18} className="text-white" />
                                    </div>
                                    <p className="text-3xl font-extrabold text-white">{s.value}</p>
                                    <p className="text-sm text-blue-200/70 mt-1 font-medium">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
            </section>

            {/* ─── TRUST BAR ────────────────────────────────────────── */}
            <section className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-gray-100">
                        {[
                            { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹499', color: 'text-blue-600' },
                            { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy', color: 'text-emerald-600' },
                            { icon: ShieldCheck, title: 'Secure Payment', desc: 'Stripe & Wallet', color: 'text-violet-600' },
                            { icon: Headphones, title: '24/7 Support', desc: 'Always here to help', color: 'text-orange-600' },
                        ].map(({ icon: Icon, title, desc, color }, i) => (
                            <div key={i} className="flex items-center gap-3 px-6 py-5 hover:bg-gray-50 transition-colors cursor-default group">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-current/10 group-hover:scale-110 transition-transform duration-300`}
                                    style={{ backgroundColor: 'currentColor' }}
                                >
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 group-hover:scale-110 transition-transform">
                                        <Icon size={18} className={color} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">{title}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CATEGORIES ───────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Browse</p>
                        <h2 className="text-3xl font-extrabold text-gray-900">Shop by Category</h2>
                    </div>
                    <Link
                        to="/products"
                        className="group flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        All Categories
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : categories.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {categories.slice(0, 10).map((cat, idx) => (
                            <Link
                                key={cat._id}
                                to={`/products?category=${cat.slug}`}
                                className="group relative overflow-hidden rounded-2xl aspect-[4/3] flex flex-col items-center justify-center text-center p-4 hover:scale-[1.04] hover:shadow-xl transition-all duration-300 active:scale-[0.98]"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${categoryColors[idx % categoryColors.length]} opacity-90 group-hover:opacity-100 transition-opacity`} />
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white, transparent)' }} />
                                <div className="relative z-10 space-y-2">
                                    <div className="w-10 h-10 bg-white/25 rounded-xl flex items-center justify-center mx-auto group-hover:bg-white/40 transition-colors">
                                        <span className="text-white font-black text-base">{cat.name?.charAt(0)}</span>
                                    </div>
                                    <p className="text-white font-bold text-sm leading-tight drop-shadow-sm">{cat.name}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">No categories available.</p>
                )}
            </section>

            {/* ─── FEATURED PRODUCTS ────────────────────────────────── */}
            <section className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Handpicked</p>
                            <h2 className="text-3xl font-extrabold text-gray-900">Featured Products</h2>
                        </div>
                        <Link
                            to="/products"
                            className="group flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            View All
                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                                    <div className="aspect-square bg-gray-100" />
                                    <div className="p-4 space-y-2">
                                        <div className="h-3 bg-gray-100 rounded w-1/3" />
                                        <div className="h-4 bg-gray-100 rounded w-3/4" />
                                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : featuredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                            {featuredProducts.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <ShoppingBag size={40} className="mx-auto mb-3 text-gray-200" />
                            <p>No products available yet.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ─── SELL ON FIRSTWEB ─────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 py-20">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[60px]" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

                        {/* Left */}
                        <div className="text-center lg:text-left space-y-5 max-w-xl">
                            <div className="inline-flex items-center gap-2 bg-orange-400/20 border border-orange-400/30 text-orange-300 text-xs font-bold px-4 py-2 rounded-full">
                                <Store size={12} />
                                FOR SELLERS
                            </div>
                            <h2 className="text-4xl font-extrabold text-white leading-tight">
                                Sell your products <br />
                                <span className="text-orange-400">on FirstWeb.</span>
                            </h2>
                            <p className="text-blue-200/80 leading-relaxed">
                                Apply to become a seller, get approved by our team, and start your own store. Manage products, orders, and payments from a single dashboard.
                            </p>
                        </div>

                        {/* Right */}
                        <div className="flex flex-col items-center lg:items-end gap-8">
                            <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
                                {[
                                    { icon: Package, text: 'List and manage your products' },
                                    { icon: BadgeCheck, text: 'Admin approval within 24 hours' },
                                    { icon: TrendingUp, text: 'Track sales, orders, and wallet' },
                                ].map(({ icon: Icon, text }, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors">
                                        <div className="w-8 h-8 bg-orange-400/20 rounded-lg flex items-center justify-center shrink-0">
                                            <Icon size={15} className="text-orange-300" />
                                        </div>
                                        <span className="text-sm text-gray-300 font-medium">{text}</span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                to={sellerLink}
                                state={sellerState}
                                className="group inline-flex items-center gap-3 px-9 py-4 bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold rounded-2xl transition-all duration-300 shadow-2xl shadow-orange-900/50 hover:scale-[1.04] active:scale-[0.98]"
                            >
                                Start Selling Now
                                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
