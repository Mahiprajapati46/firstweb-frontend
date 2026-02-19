import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, Heart, ChevronDown, LogOut, Settings, LayoutDashboard, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const GuestLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        setProfileOpen(false);
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            {/* Public Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo ... (rest remains same) */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:bg-accent transition-colors">
                                FW
                            </div>
                            <span className="text-2xl font-bold text-primary tracking-tight">FirstWeb</span>
                        </Link>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex items-center gap-8">
                            <Link to="/products" className="text-sm font-semibold text-gray-600 hover:text-accent transition-colors">Shop All</Link>
                            <Link to="/categories" className="text-sm font-semibold text-gray-600 hover:text-accent transition-colors">Categories</Link>
                            <Link to="/become-seller" className="text-sm font-semibold text-gray-600 hover:text-accent transition-colors text-accent">Sell on FirstWeb</Link>
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-5">
                            <div className="hidden lg:flex items-center bg-background px-4 py-2 rounded-full border border-gray-200 w-64 group focus-within:border-accent transition-all">
                                <Search size={18} className="text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Find products..."
                                    className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2 text-primary placeholder:text-gray-400 font-medium"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-400 hover:text-accent transition-colors">
                                    <Heart size={22} />
                                </button>
                                <Link to="/cart" className="p-2 text-gray-400 hover:text-accent transition-colors relative">
                                    <ShoppingBag size={22} />
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-white text-[10px] flex items-center justify-center rounded-full font-bold">0</span>
                                </Link>
                                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                                {user ? (
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setProfileOpen(!profileOpen)}
                                            className="flex items-center gap-2 group focus:outline-none"
                                        >
                                            <div className="w-10 h-10 bg-soft-accent bg-opacity-10 border border-soft-accent border-opacity-20 rounded-xl flex items-center justify-center text-accent font-black text-xs ring-2 ring-transparent group-hover:ring-soft-accent transition-all">
                                                {user.full_name?.charAt(0)}
                                            </div>
                                            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {profileOpen && (
                                            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 z-[100]">
                                                <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Authenticated Account</p>
                                                    <p className="text-sm font-bold text-primary truncate">{user.full_name}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium truncate">{user.email}</p>
                                                    <div className="mt-2 text-[9px] font-black uppercase tracking-tighter text-accent bg-accent/5 px-2 py-0.5 rounded inline-block">
                                                        {user.role} Status
                                                    </div>
                                                </div>
                                                <div className="p-2 space-y-1">
                                                    {(user.role === 'SUPER_ADMIN' || user.role === 'MERCHANT') && (
                                                        <Link
                                                            to={user.role === 'SUPER_ADMIN' ? '/admin/dashboard' : '/merchant/dashboard'}
                                                            className="flex items-center gap-3 px-3 py-2.5 text-xs font-black text-gray-600 hover:bg-accent/5 hover:text-accent rounded-xl transition-all uppercase tracking-widest"
                                                            onClick={() => setProfileOpen(false)}
                                                        >
                                                            <LayoutDashboard size={16} /> Console Access
                                                        </Link>
                                                    )}
                                                    {user.role === 'CUSTOMER' && (
                                                        <Link
                                                            to="/merchant/apply"
                                                            className="flex items-center gap-3 px-3 py-2.5 text-xs font-black text-accent hover:bg-accent/5 rounded-xl transition-all uppercase tracking-widest"
                                                            onClick={() => setProfileOpen(false)}
                                                        >
                                                            <Store size={16} /> Register as Merchant
                                                        </Link>
                                                    )}
                                                    <Link
                                                        to="/profile"
                                                        className="flex items-center gap-3 px-3 py-2.5 text-xs font-black text-gray-600 hover:bg-gray-50 rounded-xl transition-all uppercase tracking-widest"
                                                        onClick={() => setProfileOpen(false)}
                                                    >
                                                        <User size={16} /> Identity Settings
                                                    </Link>
                                                    <Link
                                                        to="/settings"
                                                        className="flex items-center gap-3 px-3 py-2.5 text-xs font-black text-gray-600 hover:bg-gray-50 rounded-xl transition-all uppercase tracking-widest"
                                                        onClick={() => setProfileOpen(false)}
                                                    >
                                                        <Settings size={16} /> Preferences
                                                    </Link>
                                                </div>
                                                <div className="border-t border-gray-50 p-2">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center gap-3 px-3 py-2.5 text-xs font-black text-red-600 hover:bg-red-50 rounded-xl w-full text-left transition-all uppercase tracking-widest"
                                                    >
                                                        <LogOut size={16} /> Terminate Session
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link to="/login">
                                        <Button variant="outline" size="sm" className="hidden sm:block">Sign In</Button>
                                    </Link>
                                )}
                                <button className="md:hidden p-2 text-gray-500">
                                    <Menu size={24} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-primary text-gray-400 py-16 border-t border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-bold">
                                    FW
                                </div>
                                <span className="text-xl font-bold text-white tracking-tight">FirstWeb</span>
                            </div>
                            <p className="text-sm leading-relaxed">
                                A premium marketplace for multi-vendor excellence. Built for quality, scalability, and performance.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Platform</h4>
                            <ul className="space-y-4 text-sm">
                                <li><Link to="/products" className="hover:text-accent transition-colors">Marketplace</Link></li>
                                <li><Link to="/become-seller" className="hover:text-accent transition-colors">Merchant Application</Link></li>
                                <li><Link to="/categories" className="hover:text-accent transition-colors">Product Tree</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Support</h4>
                            <ul className="space-y-4 text-sm">
                                <li><Link to="/faq" className="hover:text-accent transition-colors">Help Center</Link></li>
                                <li><Link to="/returns" className="hover:text-accent transition-colors">Returns Policy</Link></li>
                                <li><Link to="/contact" className="hover:text-accent transition-colors">Contact Corporate</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Newsletter</h4>
                            <p className="text-sm mb-4">Stay updated with premium listings.</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Corporate email"
                                    className="bg-gray-800 border-none rounded-md px-4 py-2 text-sm text-white w-full focus:ring-1 focus:ring-accent"
                                />
                                <Button size="sm">Join</Button>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                        <p>&copy; 2026 FirstWeb Marketplace. Final Project MCA.</p>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-white">Privacy Policy</a>
                            <a href="#" className="hover:text-white">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default GuestLayout;
