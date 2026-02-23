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
    const [loading, setLoading] = useState(true);
    const [visibleSection, setVisibleSection] = useState('');

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
        <div className="min-h-screen bg-[#eae0d5] text-primary">

            {/* ─── Hero (Executive Impact) ─── */}
            <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
                {/* Visual Background Layer */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000"
                        alt="Corporate Background"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
                    <div className="absolute inset-0 bg-radial-at-t from-accent/5 to-transparent" />
                </div>

                <div className="premium-container relative z-10 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-3 bg-white/50 backdrop-blur-md border border-gray-100 px-6 py-2 rounded-full shadow-xl shadow-primary/5 mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">India's Premium Collective</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary tracking-tighter leading-[1.1] mb-8 max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Modern Commerce <br />
                        <span className="text-accent italic font-serif font-normal">Redefined.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-primary/40 font-medium max-w-2xl leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        A globally trusted marketplace connecting premium manufacturers with discerning customers. Precision, quality, and trust in every transaction.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1200">
                        <Link to="/products" className="btn-boutique-primary shadow-2xl shadow-primary/20 scale-110">
                            Enter Marketplace
                        </Link>
                        <Link to={sellerLink} state={sellerState} className="btn-boutique-outline bg-white/50 backdrop-blur-sm">
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
                    <div className="flex flex-col items-center text-center mb-12">
                        <span className="text-accent text-[11px] font-black uppercase tracking-[0.4em] mb-4">Core Directory</span>
                        <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter">Marketplace Categorization</h2>
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
                                    <div className="absolute inset-0 bg-gray-50 group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500" />

                                    <div className="absolute inset-x-8 bottom-8 flex items-end justify-between z-10">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-accent uppercase tracking-widest">{cat.slug}</p>
                                            <h3 className="text-2xl font-black text-primary tracking-tighter">{cat.name}</h3>
                                        </div>
                                        <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                            <ArrowRight size={20} />
                                        </div>
                                    </div>

                                    <div className="absolute top-8 left-8">
                                        <span className="text-6xl font-black text-primary/5 select-none">{cat.name?.charAt(0)}</span>
                                    </div>
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
                            <span className="text-accent text-[11px] font-black uppercase tracking-[0.4em]">Curated Selection</span>
                            <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter">Marketplace Spotlights</h2>
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

            {/* ─── Partner CTA (Executive) ─── */}
            <section className="section-spacing">
                <div className="premium-container">
                    <div className="bg-primary rounded-[3rem] overflow-hidden relative shadow-2xl shadow-primary/20 min-h-[400px] flex items-center">
                        {/* Background Detail */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/50 to-transparent blur-3xl" />

                        <div className="relative z-10 w-full px-12 md:px-24 py-8 grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-3 text-white">
                                    <Store size={22} className="text-accent" />
                                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-accent">Vendor Partnership</span>
                                </div>

                                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter">
                                    Become a Merchant of <br />
                                    <span className="text-accent underline decoration-white/10 underline-offset-8">Distinction.</span>
                                </h2>

                                <p className="text-lg text-white/50 leading-relaxed font-medium max-w-xl">
                                    We provide the industrial-scale infrastructure. You provide the exceptional craft. Apply today to scale your business across the multi-vendor ecosystem.
                                </p>

                                <div className="flex flex-wrap items-center gap-6">
                                    <Link to={sellerLink} state={sellerState} className="btn-boutique-secondary">
                                        Establish Merchant Account
                                    </Link>
                                    <span className="text-xs font-bold text-white/20 uppercase tracking-widest">
                                        15-Min Application Process
                                    </span>
                                </div>
                            </div>

                            <div className="hidden lg:flex flex-col gap-6">
                                {[
                                    { title: 'Logistics Network', desc: 'Pan-India shipping infrastructure built-in.' },
                                    { title: 'Global Reach', desc: 'Secure payments with Stripe integration.' },
                                    { title: 'Brand Visibility', desc: 'Curated catalogs with high-end visibility.' },
                                ].map((benefit, i) => (
                                    <div key={i} className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 transition-transform hover:scale-105 duration-300">
                                        <h4 className="text-white font-black text-lg mb-2">{benefit.title}</h4>
                                        <p className="text-white/40 text-sm font-medium">{benefit.desc}</p>
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
