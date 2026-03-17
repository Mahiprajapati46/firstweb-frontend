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
    GitPullRequest,
    BarChart2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const SidebarItem = ({ icon: Icon, label, path, active }) => (
    <Link
        to={path}
        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${active
            ? 'bg-accent text-white shadow-md'
            : 'text-gray-400 hover:bg-soft-accent hover:bg-opacity-10 hover:text-accent'
            }`}
    >
        <Icon size={20} className={active ? 'text-white' : 'group-hover:text-accent text-gray-400'} />
        <span className="font-bold tracking-tight text-sm">{label}</span>
        {active && <ChevronRight size={16} className="ml-auto" />}
    </Link>
);

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
        { name: 'Reports', icon: BarChart2, path: '/merchant/reports' },
        { name: 'Wallet', icon: Wallet, path: '/merchant/wallet' },
        { name: 'Requests', icon: GitPullRequest, path: '/merchant/requests' },
        { name: 'Reviews', icon: MessageSquare, path: '/merchant/reviews' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background flex text-text-main font-sans">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-72' : 'w-20'
                    } bg-primary border-r border-gray-700 h-screen sticky top-0 transition-all duration-300 flex flex-col z-50`}
            >
                <div className="h-20 flex items-center px-6 gap-3">
                    <Link to="/merchant/dashboard" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-bold text-xl transition-all duration-300 shadow-lg shadow-accent/20">
                            FW
                        </div>
                        {isSidebarOpen && <span className="text-xl font-bold text-white tracking-tight">Merchant Hub</span>}
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
                    {isSidebarOpen && <div className="px-4 mb-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Management</div>}
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.name}
                            label={item.name}
                            icon={item.icon}
                            path={item.path}
                            active={location.pathname === item.path}
                        />
                    ))}
                </nav>

                <div className="px-4 py-6 border-t border-gray-700 space-y-1">
                    {isSidebarOpen && <div className="px-4 mb-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">System</div>}
                    <Link
                        to="/merchant/settings"
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${location.pathname === '/merchant/settings'
                            ? 'bg-accent text-white shadow-md'
                            : 'text-gray-400 hover:bg-soft-accent hover:bg-opacity-10 hover:text-accent'
                            }`}
                    >
                        <Settings size={20} className={location.pathname === '/merchant/settings' ? 'text-white' : 'text-gray-400 group-hover:text-accent'} />
                        {isSidebarOpen && <span className="text-sm font-bold tracking-tight">Settings</span>}
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="text-sm font-bold tracking-tight">Sign Out</span>}
                    </button>
                </div>

                {isSidebarOpen && (
                    <div className="p-4 bg-gray-900/20 border-t border-gray-700">
                        <div className="flex items-center gap-3 p-2">
                            <div className="w-10 h-10 rounded-xl bg-soft-accent bg-opacity-20 border border-soft-accent border-opacity-30 flex items-center justify-center text-accent font-black text-sm capitalize">
                                {user?.full_name?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{user?.full_name}</p>
                                <p className="text-[10px] text-gray-400 truncate uppercase font-black tracking-widest">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-2 text-gray-500 hover:text-primary hover:bg-gray-50 rounded-lg transition-all"
                        >
                            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>

                        <div className="hidden md:flex items-center bg-background px-4 py-2.5 rounded-full border border-gray-200 w-80">
                            <Search size={18} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search inventory, orders..."
                                className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2 placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="p-2.5 text-gray-400 hover:text-accent hover:bg-gray-50 rounded-xl relative transition-all">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

                        <div className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 p-2 rounded-xl transition-all">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-primary truncate">{user?.full_name}</p>
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none mt-0.5">{user?.role}</p>
                            </div>
                            <div className="w-10 h-10 bg-soft-accent bg-opacity-10 border border-soft-accent border-opacity-20 rounded-lg flex items-center justify-center text-accent font-black text-sm ring-2 ring-transparent group-hover:ring-soft-accent transition-all">
                                {user?.full_name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MerchantLayout;
