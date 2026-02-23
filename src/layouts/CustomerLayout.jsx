import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Search, ShoppingBag, User, Menu, X,
    ChevronDown, Store, LogOut, Wallet, Package,
    Instagram, Twitter, Facebook
} from 'lucide-react';
import customerApi from '../api/customer';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CustomerLayout = ({ children }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const profileRef = useRef(null);
    const categoryRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, cartRes] = await Promise.all([
                    customerApi.getCategoriesTree(),
                    user ? customerApi.getCart() : Promise.resolve({ data: { items: [] } })
                ]);
                setCategories(catRes.data || []);
                setCartCount(cartRes.data?.items?.length || 0);
            } catch (e) { console.error(e); }
        };
        fetchData();

        const onScroll = () => setScrolled(window.scrollY > 8);
        const onCartUpdate = () => {
            if (user) customerApi.getCart().then(r => setCartCount(r.data?.items?.length || 0));
        };
        const onClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
            if (categoryRef.current && !categoryRef.current.contains(e.target)) setIsCategoryOpen(false);
        };
        window.addEventListener('scroll', onScroll);
        window.addEventListener('cartUpdated', onCartUpdate);
        document.addEventListener('mousedown', onClickOutside);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('cartUpdated', onCartUpdate);
            document.removeEventListener('mousedown', onClickOutside);
        };
    }, [user]);

    const handleLogout = async () => {
        await logout();
        setIsProfileOpen(false);
        toast.success('Signed out');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };
    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* ── Header (Corporate Glass) ─────────────────────────────── */}
            <header className="executive-header-glass">
                {/* Upper Bar: Brand & Primary Search */}
                <div className="premium-container border-b border-gray-100/50">
                    <div className="flex items-center justify-between h-20 gap-10">

                        {/* Left: Brand Group */}
                        <div className="flex items-center gap-8">
                            <button
                                onClick={() => setIsMenuOpen(true)}
                                className="lg:hidden p-2 -ml-2 text-primary hover:bg-gray-50 rounded-xl transition-all"
                            >
                                <Menu size={20} />
                            </button>
                            <Link to="/" className="flex items-center gap-3 shrink-0">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/10 transition-transform active:scale-95">
                                    <span className="text-white font-black text-xs">FW</span>
                                </div>
                                <span className="text-xl font-black text-primary tracking-tighter hidden sm:block">
                                    FirstWeb<span className="text-accent">.</span>
                                </span>
                            </Link>
                        </div>

                        {/* Center: Search (Solid & High-Contrast) */}
                        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl relative">
                            <input
                                type="text"
                                placeholder="Search for products..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-full focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all outline-none font-medium text-sm text-primary placeholder-primary/30"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40">
                                <Search size={18} strokeWidth={2.5} />
                            </div>
                        </form>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="md:hidden p-2.5 text-primary/70 hover:bg-gray-50 rounded-full transition-all"
                            >
                                <Search size={20} />
                            </button>

                            <Link
                                to="/cart"
                                className="relative p-2.5 text-primary/70 hover:bg-gray-50 rounded-full transition-all group"
                            >
                                <ShoppingBag size={20} className="group-hover:text-primary transition-colors" />
                                {cartCount > 0 && (
                                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-accent text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* User Profile / Auth Toggle */}
                            {user ? (
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="h-10 pl-1.5 pr-4 rounded-full border border-gray-100 hover:border-accent bg-white transition-all flex items-center gap-3 group ml-1"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">
                                            {user.full_name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <span className="text-[11px] font-bold text-primary group-hover:text-accent transition-colors hidden lg:block">
                                            Account
                                        </span>
                                        <ChevronDown size={12} className={`text-primary/30 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="px-5 py-5 border-b border-gray-50 bg-gray-50/50">
                                                <p className="text-xs font-black text-primary truncate leading-none mb-1.5">{user.full_name}</p>
                                                <p className="text-[10px] text-primary/40 font-bold uppercase tracking-tight truncate">{user.email}</p>
                                            </div>
                                            <div className="py-2.5">
                                                {[
                                                    { to: '/profile', icon: User, label: 'My Profile' },
                                                    { to: '/orders', icon: Package, label: 'My Orders' },
                                                    { to: '/wallet', icon: Wallet, label: 'My Wallet' },
                                                ].map(({ to, icon: Icon, label }) => (
                                                    <Link
                                                        key={to}
                                                        to={to}
                                                        onClick={() => setIsProfileOpen(false)}
                                                        className="flex items-center gap-3 px-5 py-2.5 text-[13px] font-bold text-primary/60 hover:text-accent hover:bg-gray-50 transition-all"
                                                    >
                                                        <Icon size={16} strokeWidth={2} /> {label}
                                                    </Link>
                                                ))}
                                            </div>
                                            <div className="border-t border-gray-50 py-3 px-5">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-2 text-red-500 text-[11px] font-black uppercase tracking-widest hover:text-red-600 transition-colors"
                                                >
                                                    <LogOut size={14} /> Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 ml-2">
                                    <Link
                                        to="/login"
                                        className="text-xs font-black text-primary/60 hover:text-primary transition-colors px-4"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-primary text-white text-xs font-black px-6 py-3 rounded-full hover:bg-secondary transition-all shadow-lg shadow-primary/10"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lower Bar: Symmetrical Navigation */}
                <div className="hidden lg:block bg-white/50 border-b border-gray-50">
                    <div className="premium-container flex items-center justify-center gap-12 h-12">
                        <Link to="/products" className="text-[11px] font-black uppercase tracking-[0.15em] text-primary/60 hover:text-accent transition-colors">
                            Marketplace
                        </Link>

                        <div className="relative group" ref={categoryRef}>
                            <button
                                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-primary/60 hover:text-accent transition-colors"
                            >
                                Categories
                                <ChevronDown size={12} className={`transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isCategoryOpen && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-64 bg-white border border-gray-100 rounded-b-2xl shadow-xl py-4 z-50 animate-in fade-in slide-in-from-top-1">
                                    {categories.map(cat => (
                                        <Link
                                            key={cat._id}
                                            to={`/products?category=${cat.slug}`}
                                            onClick={() => setIsCategoryOpen(false)}
                                            className="flex items-center justify-between px-6 py-2.5 text-[12px] font-bold text-primary/60 hover:text-accent hover:bg-gray-50 transition-all"
                                        >
                                            {cat.name}
                                            <div className="w-1 h-1 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link to="/products?sort=new" className="text-[11px] font-black uppercase tracking-[0.15em] text-primary/60 hover:text-accent transition-colors">
                            New Arrivals
                        </Link>

                        <Link
                            to={user ? '/merchant/apply' : '/login'}
                            className="text-[11px] font-black uppercase tracking-[0.15em] text-accent hover:text-primary transition-colors flex items-center gap-2"
                        >
                            <Store size={14} /> Become a Partner
                        </Link>
                    </div>
                </div>

                {/* Mobile expansion search */}
                {isSearchOpen && (
                    <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 animate-in slide-in-from-top duration-300">
                        <form onSubmit={handleSearch} className="flex-1 relative">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm font-bold placeholder-primary/30"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30">
                                <Search size={16} />
                            </div>
                        </form>
                    </div>
                )}
            </header>


            {/* ── Mobile Sidebar ───────────────────────────────── */}
            {
                isMenuOpen && (
                    <div className="fixed inset-0 z-[200] lg:hidden">
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-white flex flex-col shadow-2xl">
                            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e5d1]">
                                <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                                        <span className="text-white font-black text-xs">FW</span>
                                    </div>
                                    <span className="text-base font-black text-primary">FirstWeb</span>
                                </Link>
                                <button onClick={() => setIsMenuOpen(false)} className="p-1.5 text-[#9f8170] hover:text-primary rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>

                            <nav className="flex-1 overflow-y-auto px-4 py-4">
                                <Link
                                    to="/products"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-4 py-3 text-[13px] font-semibold text-primary rounded-2xl hover:bg-[#fdfaf5] hover:text-[#c19a6b] transition-all mb-1"
                                >
                                    Shop All Products
                                </Link>

                                {categories.length > 0 && (
                                    <>
                                        <p className="px-4 pt-4 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#c19a6b]">
                                            Categories
                                        </p>
                                        {categories.map(cat => (
                                            <Link
                                                key={cat._id}
                                                to={`/products?category=${cat.slug}`}
                                                onClick={() => setIsMenuOpen(false)}
                                                className="block px-4 py-2.5 text-[13px] font-medium text-primary/60 rounded-xl hover:bg-[#fdfaf5] hover:text-primary transition-all mb-0.5"
                                            >
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </>
                                )}

                                <div className="border-t border-[#e5e5d1] mt-4 pt-4">
                                    <Link
                                        to={user ? '/merchant/apply' : '/login'}
                                        state={!user ? { from: { pathname: '/merchant/apply' } } : undefined}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-2 px-4 py-3 text-[13px] font-black text-[#c19a6b] uppercase tracking-wide rounded-2xl hover:bg-[#fdfaf5] transition-all"
                                    >
                                        <Store size={14} /> Sell on FirstWeb
                                    </Link>
                                </div>

                                {user ? (
                                    <div className="border-t border-[#e5e5d1] mt-4 pt-4">
                                        <p className="px-4 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#c19a6b]">Account</p>
                                        {[
                                            { to: '/profile', label: 'My Profile' },
                                            { to: '/orders', label: 'My Orders' },
                                            { to: '/wallet', label: 'My Wallet' },
                                        ].map(({ to, label }) => (
                                            <Link
                                                key={to}
                                                to={to}
                                                onClick={() => setIsMenuOpen(false)}
                                                className="block px-4 py-2.5 text-[13px] font-medium text-primary/60 rounded-xl hover:bg-[#fdfaf5] hover:text-primary transition-all mb-0.5"
                                            >
                                                {label}
                                            </Link>
                                        ))}
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 w-full px-4 py-2.5 text-[13px] font-medium text-red-500 rounded-xl hover:bg-red-50 transition-all mt-1"
                                        >
                                            <LogOut size={14} /> Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-t border-[#e5e5d1] mt-4 pt-4 space-y-2.5">
                                        <Link
                                            to="/login"
                                            state={{ from: location }}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block text-center py-3 text-[13px] font-semibold border border-[#e5e5d1] text-primary rounded-2xl hover:border-[#c19a6b] transition-all"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block text-center py-3 text-[13px] font-black text-white bg-primary rounded-2xl hover:bg-[#c19a6b] transition-all duration-300"
                                        >
                                            Create Account
                                        </Link>
                                    </div>
                                )}
                            </nav>
                        </div>
                    </div>
                )
            }

            {/* ── Page Content ─────────────────────────────────── */}
            <main className="flex-1">
                {children}
            </main>

            {/* ── Footer (Executive Grid) ─────────────────────────────── */}
            <footer className="bg-primary text-white border-t border-gray-100/10">
                <div className="premium-container pt-24 pb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">
                        {/* Company Detail */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                                    <span className="text-primary font-black text-xs">FW</span>
                                </div>
                                <span className="text-xl font-black text-white tracking-tighter">
                                    FirstWeb<span className="text-accent">.</span>
                                </span>
                            </div>
                            <p className="text-sm text-white/50 leading-relaxed font-medium">
                                Empowering small and large vendors across the nation. We provide the infrastructure, you provide the quality. Join India's fastest growing corporate marketplace today.
                            </p>
                            <div className="flex gap-4">
                                {[Instagram, Twitter, Facebook].map((Icon, i) => (
                                    <a key={i} href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 hover:bg-accent hover:text-white transition-all duration-500">
                                        <Icon size={18} strokeWidth={1.5} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Navigation Groups */}
                        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
                            {[
                                {
                                    title: 'Platform',
                                    links: [['Marketplace', '/products'], ['Sellers', '/merchant/apply']]
                                },
                                {
                                    title: 'Support',
                                    links: [['Help Center', '/help-center'], ['Order Track', '/orders'], ['Returns', '/returns'], ['Contact', '/contact']]
                                },
                                {
                                    title: 'Company',
                                    links: [['About Us', '/about']]
                                },
                                {
                                    title: 'Legal',
                                    links: [['Privacy', '/privacy'], ['Terms', '/terms']]
                                },
                            ].map((group) => (
                                <div key={group.title} className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                                        {group.title}
                                    </h4>
                                    <ul className="space-y-4">
                                        {group.links.map(([label, to]) => (
                                            <li key={label}>
                                                <Link to={to} className="text-sm text-white/40 hover:text-white transition-colors font-semibold">
                                                    {label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex flex-col md:flex-row items-center gap-8 text-[11px] font-black uppercase tracking-widest text-white/30">
                            <p>© 2026 FirstWeb Infrastructure Pvt Ltd.</p>
                            <div className="flex gap-6">
                                <a href="#" className="hover:text-accent transition-colors">Site Map</a>
                                <a href="#" className="hover:text-accent transition-colors">Status</a>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Systems Nominal</span>
                        </div>
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes fadeDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div >
    );
};

export default CustomerLayout;
