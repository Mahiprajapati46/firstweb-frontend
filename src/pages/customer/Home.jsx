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

/* ─── ProductCard (Executive Corporate Style) ─── */
const ProductCard = ({ product }) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    return (
        <div className="group relative flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5 focus-within:ring-4 focus-within:ring-primary/5">
            {/* Wishlist Toggle */}
            <button
                onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted); }}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95"
            >
                <Heart size={18} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-primary/20'} strokeWidth={2} />
            </button>

            {/* Image Section */}
            <Link to={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50">
                {product.images?.[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <ShoppingBag size={48} strokeWidth={1} className="text-primary/5" />
                    </div>
                )}

                {/* Status Badges */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                    {product.discount_percent > 0 && (
                        <span className="bg-accent text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest shadow-lg shadow-accent/20">
                            -{product.discount_percent}%
                        </span>
                    )}
                    {product.is_new && (
                        <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest shadow-lg shadow-primary/20">
                            New
                        </span>
                    )}
                </div>
            </Link>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">
                        {product.category?.name || 'Uncategorized'}
                    </span>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-50 rounded-lg">
                        <Star size={10} className="fill-yellow-500 text-yellow-500" />
                        <span className="text-[10px] font-black text-yellow-700">4.9</span>
                    </div>
                </div>

                <Link to={`/products/${product.slug}`} className="block group/link">
                    <h3 className="text-base font-bold text-primary group-hover/link:text-accent transition-colors line-clamp-2 leading-snug mb-4">
                        {product.title}
                    </h3>
                </Link>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-primary">
                            ₹{product.pricing?.base_price?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9px] font-bold text-primary/20 uppercase tracking-widest">
                            Free Shipping
                        </span>
                    </div>
                    <Link
                        to={`/products/${product.slug}`}
                        className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500"
                    >
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

/* ─── Main Component ───────────────────────────────────────── */
const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleSection, setVisibleSection] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [catRes, prodRes, couponRes] = await Promise.all([
                    customerApi.getCategoriesTree(),
                    customerApi.getProducts({ limit: 8 }),
                    customerApi.getCoupons()
                ]);
                setCategories(catRes.data || []);
                setFeaturedProducts(prodRes.data?.products || []);
                setCoupons(couponRes.data?.slice(0, 3) || []);
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
        <div className="min-h-screen bg-white text-primary selection:bg-accent selection:text-white">
            {/* ─── Hero (Executive & Compact) ─── */}
            <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gray-50">
                {/* Refined Background Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://res.cloudinary.com/dkaxoygi2/image/upload/v1773549332/ecommerce/general/hero_bg_premium_fixed.jpg"
                        alt="Retail Excellence"
                        className="w-full h-full object-cover opacity-50 mix-blend-multiply"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/50 to-white" />
                </div>

                <div className="premium-container relative z-10 flex flex-col items-center text-center py-20">
                    <div className="inline-flex items-center gap-3 bg-white border border-gray-100 px-6 py-2.5 rounded-full shadow-2xl shadow-primary/5 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        <span className="premium-subheading !text-[10px] !tracking-[0.3em]">India’s Premium Marketplace, Reimagined.</span>
                    </div>

                    <h1 className="premium-heading mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-4xl">
                        Modern Commerce <br />
                        <span className="text-accent font-serif font-normal">Redefined</span>
                    </h1>

                    <p className="text-base md:text-lg text-gray-400 font-medium max-w-2xl leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        Where premium manufacturers meet discerning customers. Experience seamless, trustworthy transactions.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-5 animate-in fade-in slide-in-from-bottom-12 duration-1200">
                        <Link to="/products" className="btn-boutique-primary !px-12 !py-4.5 shadow-xl shadow-primary/10 transition-transform hover:scale-105">
                            Enter Marketplace
                        </Link>
                        <Link to={sellerLink} state={sellerState} className="btn-boutique-outline !px-12 !py-4.5 bg-white/50 backdrop-blur-sm transition-transform hover:scale-105">
                            Partner With Us
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── Trust Bar (Balanced) ─── */}
            <section className="py-12 border-y border-gray-100 bg-white">
                <div className="premium-container">
                    <div className="flex flex-wrap justify-around items-center gap-8 text-primary/30 font-black text-[9px] uppercase tracking-[0.4em]">
                        <div className="flex items-center gap-3 group hover:text-accent transition-colors">
                            <ShieldCheck size={20} className="text-accent group-hover:scale-110 transition-transform" />
                            <span>Enterprise Security</span>
                        </div>
                        <div className="flex items-center gap-3 group hover:text-accent transition-colors">
                            <Truck size={20} className="text-accent group-hover:scale-110 transition-transform" />
                            <span>Global Logistics</span>
                        </div>
                        <div className="flex items-center gap-3 group hover:text-accent transition-colors">
                            <Headphones size={20} className="text-accent group-hover:scale-110 transition-transform" />
                            <span>Executive Care</span>
                        </div>
                        <div className="flex items-center gap-3 group hover:text-accent transition-colors">
                            <RotateCcw size={20} className="text-accent group-hover:scale-110 transition-transform" />
                            <span>Verified Quality</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Category Navigation (Executive Grid) ─── */}
            <section className="section-spacing">
                <div className="premium-container">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <span className="premium-subheading mb-4">Core Directory</span>
                            <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tighter">Marketplace Categorization</h2>
                        </div>
                        <Link to="/categories" className="btn-boutique-outline flex items-center gap-2 group">
                            See All Categories <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-64 bg-gray-50 rounded-2xl animate-pulse" />
                            ))
                        ) : (
                            categories.slice(0, 6).map((cat, i) => (
                                <Link
                                    key={cat._id}
                                    to={`/products?category=${cat.slug}`}
                                    className="group relative h-72 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2"
                                >
                                    <div className="absolute inset-0 bg-gray-50 group-hover:scale-110 transition-transform duration-700">
                                        {cat.image && (
                                            <img
                                                src={cat.image}
                                                alt={cat.name}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className={`absolute inset-0 transition-colors duration-500 ${cat.image ? 'bg-black/20 group-hover:bg-black/40' : 'bg-primary/0 group-hover:bg-primary/5'}`} />

                                    <div className="absolute inset-x-8 bottom-8 flex items-end justify-between z-10">
                                        <div className="space-y-2">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${cat.image ? 'text-white' : 'text-accent'}`}>{cat.slug}</p>
                                            <h3 className={`text-2xl font-black tracking-tighter ${cat.image ? 'text-white' : 'text-primary'}`}>{cat.name}</h3>
                                        </div>
                                        <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                            <ArrowRight size={20} />
                                        </div>
                                    </div>

                                    {!cat.image && (
                                        <div className="absolute top-8 left-8">
                                            <span className="text-6xl font-black text-primary/5 select-none">{cat.name?.charAt(0)}</span>
                                        </div>
                                    )}
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* ─── Featured Collection ─── */}
            <section className="section-spacing bg-gray-50/50 border-y border-gray-100">
                <div className="premium-container">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                        <div className="space-y-4">
                            <span className="premium-subheading">Curated Selection</span>
                            <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tighter">Marketplace Spotlights</h2>
                        </div>
                        <Link to="/products" className="btn-boutique-outline bg-white border-gray-200">
                            Explore All Products
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="aspect-[3/4] bg-gray-200/50 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuredProducts.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ─── Exclusive Offers Section (NEW) ─── */}
            {coupons.length > 0 && (
                <section className="section-spacing bg-white">
                    <div className="premium-container">
                        <div className="flex flex-col items-center text-center mb-16 px-2">
                            <span className="premium-subheading mb-4">Limited Availability</span>
                            <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tighter">Exclusive Offers</h2>
                            <p className="text-primary/40 text-sm md:text-base font-medium max-w-xl mt-6">
                                Claim verified vouchers and premium discounts from our marketplace partners.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            {coupons.map(coupon => (
                                <div key={coupon._id} className="transform hover:-translate-y-2 transition-transform duration-500">
                                    <div className="bg-[#f8f9fa] border border-gray-100 p-8 rounded-[2rem] relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 text-primary group-hover:scale-110 transition-transform duration-700">
                                            <Zap size={80} fill="currentColor" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="inline-block bg-primary text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-6">
                                                {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`} OFF
                                            </div>
                                            <h3 className="text-2xl font-black text-primary mb-2">{coupon.code}</h3>
                                            <p className="text-xs text-primary/40 font-bold uppercase tracking-tight mb-8">
                                                Min Order: ₹{coupon.min_order_amount}
                                            </p>
                                            <Link to="/coupons" className="text-xs font-black text-accent uppercase tracking-widest flex items-center gap-2 group/btn">
                                                View Offer <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <Link to="/coupons" className="btn-boutique-outline">
                                See All Active Vouchers
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ─── Partner CTA (Executive) ─── */}
            <section className="section-spacing">
                <div className="premium-container">
                    <div className="bg-primary rounded-[3rem] overflow-hidden relative shadow-2xl shadow-primary/20 min-h-[300px] flex items-center border border-white/5">
                        {/* Background Detail */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/50 to-transparent blur-3xl" />

                        <div className="relative z-10 w-full px-8 md:px-16 py-10 grid lg:grid-cols-2 gap-10 items-center">
                            <div className="space-y-5">
                                <div className="inline-flex items-center gap-2.5 text-white">
                                    <Store size={18} className="text-accent" />
                                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-accent">Vendor Partnership</span>
                                </div>

                                <h2 className="text-2xl md:text-4xl font-black text-white leading-[1.1] tracking-tighter">
                                    Become a Merchant of <br />
                                    <span className="text-accent italic font-serif font-normal">Distinction.</span>
                                </h2>

                                <p className="text-base text-white/40 leading-relaxed font-medium max-w-lg">
                                    We provide the industrial-scale infrastructure. You provide the exceptional craft. Apply today.
                                </p>

                                <div className="flex flex-wrap items-center gap-5">
                                    <Link to={sellerLink} state={sellerState} className="btn-boutique-secondary !px-8 !py-3.5">
                                        Establish Merchant Account
                                    </Link>
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                                        Verified Merchants Only
                                    </span>
                                </div>
                            </div>

                            <div className="hidden lg:grid grid-cols-1 gap-4">
                                {[
                                    { title: 'Logistics Network', desc: 'Pan-India shipping infrastructure.' },
                                    { title: 'Global Reach', desc: 'Secure payments via Stripe.' },
                                    { title: 'Brand Visibility', desc: 'Curated high-end exposure.' },
                                ].map((benefit, i) => (
                                    <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/10 transition-all hover:bg-white/10 duration-300">
                                        <h4 className="text-white font-black text-sm mb-1">{benefit.title}</h4>
                                        <p className="text-white/30 text-[11px] font-medium leading-tight">{benefit.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
