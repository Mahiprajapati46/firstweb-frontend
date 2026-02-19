import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Store,
    ShieldCheck,
    FolderTree,
    ShoppingCart,
    Ticket,
    HandCoins,
    BarChart3,
    ListChecks,
    Settings,
    History,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    ChevronRight,
    ChevronDown,
    User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, path, active }) => (
    <Link
        to={path}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${active
            ? 'bg-accent text-white shadow-md'
            : 'text-gray-400 hover:bg-soft-accent hover:bg-opacity-10 hover:text-accent'
            }`}
    >
        <Icon size={20} className={active ? 'text-white' : 'group-hover:text-accent'} />
        <span className="font-medium">{label}</span>
        {active && <ChevronRight size={16} className="ml-auto" />}
    </Link>
);

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
        { icon: Store, label: 'Merchants', path: '/admin/merchants' },
        { icon: ShieldCheck, label: 'Products Moderation', path: '/admin/products' },
        { icon: FolderTree, label: 'Categories', path: '/admin/categories' },
        { icon: ListChecks, label: 'Category Requests', path: '/admin/category-requests' },
        { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
        { icon: Users, label: 'Users', path: '/admin/users' }, // Moved here as per instruction
        { icon: Ticket, label: 'Coupons', path: '/admin/coupons' },
        { icon: HandCoins, label: 'Withdrawals', path: '/admin/withdrawals' },
        { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
        { icon: History, label: 'Audit Logs', path: '/admin/audit-logs' },
    ];

    return (
        <div className="min-h-screen bg-background flex text-text-main">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? 'w-64' : 'w-20'
                    } bg-primary border-r border-gray-700 h-screen sticky top-0 transition-all duration-300 flex flex-col z-50`}
            >
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        FW
                    </div>
                    {sidebarOpen && <h1 className="text-white text-xl font-bold tracking-tight">FirstWeb</h1>}
                </div>

                <nav className="flex-1 px-4 mt-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            {...item}
                            active={location.pathname === item.path}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span className="font-medium">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-200 sticky top-0 z-40 flex items-center justify-between px-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-all"
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <div className="hidden md:flex items-center bg-background px-4 py-2 rounded-full border border-gray-200 w-80">
                            <Search size={18} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search analytics, orders..."
                                className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-gray-400 hover:text-accent transition-colors">
                            <Bell size={22} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="relative pl-4 border-l border-gray-200" ref={dropdownRef}>
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-all"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-primary">{user?.full_name || 'Super Admin'}</p>
                                    <p className="text-xs text-gray-400 capitalize">{user?.role || 'Administrator'}</p>
                                </div>
                                <div className="w-10 h-10 bg-soft-accent bg-opacity-20 border border-soft-accent border-opacity-30 rounded-full flex items-center justify-center text-accent font-bold">
                                    {user?.full_name?.charAt(0) || 'A'}
                                </div>
                                <ChevronDown size={16} className={`text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-in fade-in zoom-in-50 duration-200">
                                    <div className="px-4 py-3 border-b border-gray-50">
                                        <p className="text-sm font-semibold text-primary">{user?.email}</p>
                                        <p className="text-xs text-gray-500">Active Session</p>
                                    </div>
                                    <div className="p-2">
                                        <Link to="/admin/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                            <User size={16} /> My Profile
                                        </Link>
                                        <Link to="/admin/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                            <Settings size={16} /> Account Settings
                                        </Link>
                                    </div>
                                    <div className="border-t border-gray-50 p-2">
                                        <button
                                            onClick={logout}
                                            className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full text-left transition-colors font-medium"
                                        >
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-8 overflow-y-auto bg-gray-50/50">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
