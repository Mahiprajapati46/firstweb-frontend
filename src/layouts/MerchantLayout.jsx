import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Box,
    ShoppingCart,
    Wallet,
    MessageSquare,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Search,
    Bell,
    User,
    Package,
    GitPullRequest
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const MerchantLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/merchant/dashboard' },
        { name: 'Products', icon: Box, path: '/merchant/products' },
        { name: 'Inventory', icon: Package, path: '/merchant/inventory' },
        { name: 'Orders', icon: ShoppingCart, path: '/merchant/orders' },
        { name: 'Wallet', icon: Wallet, path: '/merchant/wallet' },
        { name: 'Requests', icon: GitPullRequest, path: '/merchant/requests' },
        { name: 'Reviews', icon: MessageSquare, path: '/merchant/reviews' },
    ];

    const bottomNavItems = [
        { name: 'Settings', icon: Settings, path: '/merchant/settings' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-0'
                    }`}
            >
                <div className="flex flex-col h-full">
                    <div className="h-20 flex items-center px-8 border-b border-slate-100">
                        <Link to="/merchant/dashboard" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:bg-accent transition-all duration-300 shadow-lg shadow-primary/20">
                                FW
                            </div>
                            <span className="text-xl font-bold text-slate-900 tracking-tight">Merchant Hub</span>
                        </Link>
                    </div>

                    <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
                        <div className="px-4 mb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Management</div>
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'} />
                                    <span className="text-sm font-bold tracking-tight">{item.name}</span>
                                    {isActive && <ChevronRight size={16} className="ml-auto text-white/60" />}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="px-4 py-6 border-t border-slate-100 space-y-1">
                        <div className="px-4 mb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System</div>
                        {bottomNavItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 group"
                            >
                                <item.icon size={20} className="text-slate-400 group-hover:text-slate-900" />
                                <span className="text-sm font-bold tracking-tight">{item.name}</span>
                            </Link>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 group"
                        >
                            <LogOut size={20} />
                            <span className="text-sm font-bold tracking-tight">Sign Out</span>
                        </button>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                        <div className="flex items-center gap-3 p-2">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-black text-sm shadow-sm capitalize">
                                {user?.full_name?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{user?.full_name}</p>
                                <p className="text-[10px] text-slate-500 truncate uppercase font-black tracking-widest">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg lg:hidden"
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className="flex items-center gap-6 max-w-xl w-full hidden md:flex">
                        <div className="relative w-full">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search inventory, orders..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl relative transition-all">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-6 w-px bg-slate-200 mx-2"></div>
                        <div className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-2 rounded-xl transition-all">
                            <span className="text-sm font-bold text-slate-900 hidden sm:block">{user?.full_name}</span>
                            <div className="w-9 h-9 bg-soft-accent bg-opacity-10 border border-soft-accent border-opacity-20 rounded-lg flex items-center justify-center text-accent font-black text-xs ring-2 ring-transparent group-hover:ring-soft-accent transition-all">
                                {user?.full_name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>

            {/* Mobile Overlay */}
            {!isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(true)}
                />
            )}
        </div>
    );
};

export default MerchantLayout;
