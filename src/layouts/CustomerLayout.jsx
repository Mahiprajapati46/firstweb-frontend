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
        <div className="min-h-screen flex flex-col bg-[#fdfaf5]">

            {/* ── Announcement Bar ─────────────────────────────── */}
            <div className="bg-primary text-white text-center py-2.5 text-[11px] font-semibold tracking-wide">
                Free delivery on orders above ₹499 &nbsp;·&nbsp;
                <Link
                    to={user ? '/merchant/apply' : '/login'}
                    state={!user ? { from: { pathname: '/merchant/apply' } } : undefined}
                    className="underline underline-offset-2 hover:text-[#c19a6b] transition-colors"
                >
                    Start selling on FirstWeb →
                </Link>
            </div>

            {/* ── Header ───────────────────────────────────────── */}
            <header className={`sticky top-0 z-50 bg-white border-b border-[#e5e5d1] transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center h-[68px] gap-8">

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="lg:hidden p-2 -ml-2 text-primary hover:text-[#c19a6b] transition-colors"
                    >
                        <Menu size={22} />
                    </button>

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 shrink-0 group">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center group-hover:bg-[#c19a6b] transition-colors duration-300">
                            <span className="text-white font-black text-xs tracking-tight">FW</span>
                        </div>
                        <span className="text-lg font-black text-primary tracking-tight hidden sm:block">
                            FirstWeb
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-6 flex-1">
                        <Link
                            to="/products"
                            className="text-[13px] font-semibold text-primary/70 hover:text-primary transition-colors"
                        >
                            Shop All
                        </Link>

                        <div className="relative" ref={categoryRef}>
                            <button
                                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                className="flex items-center gap-1.5 text-[13px] font-semibold text-primary/70 hover:text-primary transition-colors"
                            >
                                Categories
                                <ChevronDown size={13} className={`transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isCategoryOpen && (
                                <div className="absolute top-full left-0 mt-3 w-56 bg-white border border-[#e5e5d1] rounded-[1.5rem] shadow-xl py-2 z-50"
                                    style={{ animation: 'fadeDown 0.15s ease-out' }}>
                                    <p className="px-5 pt-2 pb-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#c19a6b]">
                                        All Categories
                                    </p>
                                    {categories.map(cat => (
                                        <Link
                                            key={cat._id}
                                            to={`/products?category=${cat.slug}`}
                                            onClick={() => setIsCategoryOpen(false)}
                                            className="block px-5 py-2.5 text-[13px] font-medium text-primary/70 hover:text-primary hover:bg-[#fdfaf5] transition-all"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link
                            to={user ? '/merchant/apply' : '/login'}
                            state={!user ? { from: { pathname: '/merchant/apply' } } : undefined}
                            className="flex items-center gap-1.5 text-[13px] font-black text-[#c19a6b] hover:text-primary transition-colors uppercase tracking-wider"
                        >
                            <Store size={13} /> Sell
                        </Link>
                    </nav>

                    {/* Search (desktop) */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm">
                        <div className="flex w-full items-center border border-[#e5e5d1] rounded-2xl overflow-hidden bg-[#fdfaf5] focus-within:border-[#c19a6b] transition-colors duration-200">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="flex-1 px-4 py-2.5 bg-transparent text-[13px] text-primary placeholder-[#9f8170] outline-none"
                            />
                            <button type="submit" className="px-4 py-2.5 text-[#9f8170] hover:text-[#c19a6b] transition-colors">
                                <Search size={16} />
                            </button>
                        </div>
                    </form>

                    {/* Right actions */}
                    <div className="flex items-center gap-1 ml-auto lg:ml-0">

                        {/* Mobile search */}
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="md:hidden p-2 text-primary/60 hover:text-[#c19a6b] rounded-xl hover:bg-[#fdfaf5] transition-all"
                        >
                            <Search size={19} />
                        </button>

                        {/* Cart */}
                        <Link
                            to="/cart"
                            className="relative p-2 text-primary/60 hover:text-[#c19a6b] rounded-xl hover:bg-[#fdfaf5] transition-all"
                        >
                            <ShoppingBag size={19} />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-[#c19a6b] text-white text-[9px] font-black flex items-center justify-center rounded-full px-1">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Auth */}
                        {user ? (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl border border-[#e5e5d1] hover:border-[#c19a6b] bg-white transition-all duration-200 ml-1"
                                >
                                    <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-[11px] font-black">
                                        {user.full_name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <span className="hidden sm:block text-[12px] font-semibold text-primary max-w-[80px] truncate">
                                        {user.full_name?.split(' ')[0]}
                                    </span>
                                    <ChevronDown size={12} className={`text-[#9f8170] transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white border border-[#e5e5d1] rounded-[1.5rem] shadow-2xl z-50 overflow-hidden"
                                        style={{ animation: 'fadeDown 0.15s ease-out' }}>
                                        <div className="px-5 py-4 border-b border-[#e5e5d1]">
                                            <p className="text-[13px] font-black text-primary truncate">{user.full_name}</p>
                                            <p className="text-[11px] text-[#9f8170] truncate mt-0.5">{user.email}</p>
                                        </div>
                                        <div className="py-2">
                                            {[
                                                { to: '/profile', icon: User, label: 'My Profile' },
                                                { to: '/orders', icon: Package, label: 'My Orders' },
                                                { to: '/wallet', icon: Wallet, label: 'My Wallet' },
                                                { to: '/cart', icon: ShoppingBag, label: 'My Cart' },
                                            ].map(({ to, icon: Icon, label }) => (
                                                <Link
                                                    key={to}
                                                    to={to}
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-primary/70 hover:text-primary hover:bg-[#fdfaf5] transition-all"
                                                >
                                                    <Icon size={14} className="text-[#9f8170]" /> {label}
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="border-t border-[#e5e5d1] py-2">
                                            <Link
                                                to="/merchant/apply"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-5 py-2.5 text-[13px] font-black text-[#c19a6b] hover:bg-[#fdfaf5] transition-all uppercase tracking-wide"
                                            >
                                                <Store size={14} /> Start Selling
                                            </Link>
                                        </div>
                                        <div className="border-t border-[#e5e5d1] py-2">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-all w-full text-left"
                                            >
                                                <LogOut size={14} /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 ml-2">
                                <Link
                                    to="/login"
                                    state={{ from: location }}
                                    className="hidden sm:block text-[13px] font-semibold text-primary/70 hover:text-primary px-4 py-2 border border-[#e5e5d1] rounded-2xl hover:border-[#c19a6b] transition-all"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="text-[13px] font-black text-white bg-primary hover:bg-[#c19a6b] px-5 py-2 rounded-2xl transition-all duration-300"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile search bar */}
                {isSearchOpen && (
                    <div className="md:hidden border-t border-[#e5e5d1] bg-white px-6 py-3">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="flex-1 flex items-center border border-[#e5e5d1] rounded-2xl overflow-hidden focus-within:border-[#c19a6b] bg-[#fdfaf5] transition-colors">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="flex-1 px-4 py-2.5 bg-transparent text-[13px] text-primary placeholder-[#9f8170] outline-none"
                                />
                                <button type="submit" className="px-4 text-[#9f8170] hover:text-[#c19a6b] transition-colors">
                                    <Search size={16} />
                                </button>
                            </div>
                            <button type="button" onClick={() => setIsSearchOpen(false)} className="p-2 text-[#9f8170]">
                                <X size={18} />
                            </button>
                        </form>
                    </div>
                )}
            </header>

            {/* ── Mobile Sidebar ───────────────────────────────── */}
            {isMenuOpen && (
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
            )}

            {/* ── Page Content ─────────────────────────────────── */}
            <main className="flex-1">
                {children}
            </main>

            {/* ── Footer ───────────────────────────────────────── */}
            <footer className="bg-primary text-white/60">
                <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                        {/* Brand */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                                    <span className="text-[#c19a6b] font-black text-xs">FW</span>
                                </div>
                                <span className="text-white font-black text-base">FirstWeb</span>
                            </div>
                            <p className="text-[13px] leading-relaxed text-white/40">
                                A multi-vendor marketplace. Connecting buyers with trusted sellers across India.
                            </p>
                            <div className="flex gap-2">
                                {[Instagram, Twitter, Facebook].map((Icon, i) => (
                                    <a
                                        key={i}
                                        href="#"
                                        className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-white/40 hover:bg-[#c19a6b] hover:text-white transition-all duration-300"
                                    >
                                        <Icon size={14} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {[
                            {
                                title: 'Shop',
                                links: [
                                    ['All Products', '/products'],
                                    ['New Arrivals', '/products?sort=new'],
                                    ['My Cart', '/cart']
                                ]
                            },
                            {
                                title: 'Sell',
                                links: [
                                    ['Start Selling', '/merchant/apply'],
                                    ['Application Status', '/merchant/status']
                                ]
                            },
                            {
                                title: 'Account',
                                links: [
                                    ['My Profile', '/profile'],
                                    ['My Orders', '/orders'],
                                    ['My Wallet', '/wallet']
                                ]
                            },
                        ].map(({ title, links }) => (
                            <div key={title}>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c19a6b] mb-5">{title}</p>
                                <ul className="space-y-3">
                                    {links.map(([label, to]) => (
                                        <li key={label}>
                                            <Link
                                                to={to}
                                                className="text-[13px] text-white/40 hover:text-white transition-colors"
                                            >
                                                {label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/30">
                        <p>© 2026 FirstWeb Marketplace. All rights reserved.</p>
                        <div className="flex gap-6">
                            {['Privacy Policy', 'Terms of Service'].map(t => (
                                <a key={t} href="#" className="hover:text-white/60 transition-colors">{t}</a>
                            ))}
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
        </div>
    );
};

export default CustomerLayout;
