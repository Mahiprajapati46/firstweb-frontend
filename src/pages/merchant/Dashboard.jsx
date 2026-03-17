import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Package,
    ShoppingBag,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    MoreHorizontal,
    BarChart2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';
import merchantApi from '../../api/merchant';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const RevenueChart = ({ data }) => {
    return (
        <div className="h-[350px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#c19a6b" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#c19a6b" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                        dataKey="_id"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                            background: '#ffffffcc',
                            backdropFilter: 'blur(8px)',
                            fontSize: '12px',
                            fontWeight: '800'
                        }}
                        itemStyle={{ color: '#1F3A2E' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="total_earnings"
                        stroke="#c19a6b"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

const StatCard = ({ title, value, change, icon: Icon, trend, className }) => (
    <div className={`card-premium p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${className}`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
                <h3 className="text-3xl font-black mt-2 text-primary">{value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${className?.includes('border-l-[#c19a6b]') ? 'bg-[#c19a6b15] text-[#c19a6b]' :
                className?.includes('border-l-[#9f8170]') ? 'bg-[#9f817015] text-[#9f8170]' :
                    className?.includes('border-l-[#cb997e]') ? 'bg-[#cb997e15] text-[#cb997e]' :
                        'bg-[#e3dac9] text-[#8a7d6b]'
                }`}>
                <Icon size={24} />
            </div>
        </div>
        <div className="mt-6 flex items-center gap-2">
            {trend && (
                <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {change}%
                </span>
            )}
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Growth</span>
        </div>
    </div>
);

const MerchantDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_sales: 0,
        total_orders: 0,
        active_products: 0,
        wallet_balance: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [earningsData, setEarningsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [walletRes, ordersRes, productsRes, earningsRes] = await Promise.all([
                    merchantApi.getWallet(),
                    merchantApi.getOrders({ limit: 5 }),
                    merchantApi.getProducts({ limit: 1 }),
                    merchantApi.getEarningsReport('daily')
                ]);

                const wallet = walletRes.data || {};
                const recent = ordersRes.data || [];
                const productsMeta = productsRes.meta || {};
                const earnings = earningsRes.data || [];

                let revenueTrend = 'up';
                let revenueChange = 0;
                if (earnings.length >= 2) {
                    const today = earnings[earnings.length - 1]?.total_earnings || 0;
                    const yesterday = earnings[earnings.length - 2]?.total_earnings || 0;
                    if (yesterday > 0) {
                        revenueChange = Math.round(((today - yesterday) / yesterday) * 100);
                        revenueTrend = today >= yesterday ? 'up' : 'down';
                    }
                }

                setStats({
                    total_sales: `₹${(wallet.total_earned || 0).toLocaleString()}`,
                    total_orders: (recent.length > 0 ? (recent[0]?.total_count || recent.length) : 0).toString(),
                    active_products: (productsMeta.total || 0).toString(),
                    wallet_balance: `₹${(wallet.available_balance || 0).toLocaleString()}`,
                    revenue_trend: revenueTrend,
                    revenue_change: Math.abs(revenueChange)
                });

                setEarningsData(earnings);

                const formattedOrders = recent.map(order => ({
                    id: `#${order.sub_order_id.slice(-6).toUpperCase()}`,
                    customer: order.customer?.name || 'Guest',
                    status: order.status,
                    amount: `₹${order.total.toLocaleString()}`,
                    date: new Date(order.created_at).toLocaleDateString()
                }));

                setRecentOrders(formattedOrders);

            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
                toast.error('Could not load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-accent font-black uppercase tracking-widest text-xs">Calibrating Store Analytics...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight uppercase">Operational Intelligence</h1>
                    <p className="text-gray-500 font-medium mt-1">Real-time performance metrics for your digital storefront.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/merchant/reports')}
                        className="btn-boutique-primary h-12 px-8 shadow-xl shadow-primary/20 flex items-center gap-2"
                    >
                        <BarChart2 size={18} /> FINANCIAL REPORTS
                    </button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Gross Revenue"
                    value={stats.total_sales}
                    change={stats.revenue_change}
                    trend={stats.revenue_trend}
                    icon={TrendingUp}
                    className="border-l-4 border-l-[#c19a6b]"
                />
                <StatCard
                    title="Order Volume"
                    value={stats.total_orders}
                    icon={ShoppingBag}
                    className="border-l-4 border-l-[#9f8170]"
                />
                <StatCard
                    title="Active Market SKU's"
                    value={stats.active_products}
                    icon={Package}
                    className="border-l-4 border-l-[#cb997e]"
                />
                <StatCard
                    title="Available Capital"
                    value={stats.wallet_balance}
                    icon={Wallet}
                    className="border-l-4 border-l-[#24b47e]"
                />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue over Time */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-4">
                        <h2 className="text-lg font-black text-primary tracking-tight uppercase">Revenue allocation</h2>
                        <button className="text-[10px] font-black text-accent hover:underline uppercase tracking-widest">
                            Last 30 Days
                        </button>
                    </div>

                    <div className="card-premium p-8">
                        <RevenueChart data={earningsData} />
                    </div>

                    <div className="flex justify-between items-center px-4 pt-4">
                        <h2 className="text-lg font-black text-primary tracking-tight uppercase">Recent Transactions</h2>
                        <button className="text-[10px] font-black text-accent hover:underline uppercase tracking-widest">
                            View all activity
                        </button>
                    </div>

                    <div className="card-premium overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-400 uppercase text-[10px] tracking-[0.2em] font-black border-b border-gray-100">
                                    <th className="px-8 py-5">Order Protocol</th>
                                    <th className="px-8 py-5">Origin</th>
                                    <th className="px-8 py-5">State</th>
                                    <th className="px-8 py-5 text-right">Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 font-medium">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/30 transition-colors group cursor-pointer">
                                        <td className="px-8 py-6">
                                            <p className="font-black text-primary">{order.id}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-tighter font-bold">{order.date}</p>
                                        </td>
                                        <td className="px-8 py-6 text-gray-500 font-bold">{order.customer}</td>
                                        <td className="px-8 py-6">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${order.status === 'DELIVERED' ? 'bg-green-50 text-green-600' :
                                                order.status === 'PROCESSING' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-amber-50 text-amber-600'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-primary">{order.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <h2 className="text-lg font-black text-primary tracking-tight uppercase px-4">Market Actions</h2>
                    <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-20"></div>

                        <div className="relative z-10 space-y-6">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-accent transition-transform group-hover:scale-110">
                                <Package size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Expand Inventory</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">Boost your marketplace presence by deploying new product variants.</p>
                            </div>
                            <button
                                onClick={() => window.location.href = '/merchant/products/new'}
                                className="w-full h-12 bg-accent hover:bg-accent/90 text-white rounded-xl font-black tracking-widest text-[11px] transition-all shadow-lg shadow-accent/20"
                            >
                                ADD NEW DISCOVERY
                            </button>
                        </div>
                    </div>

                    <div className="card-premium p-8 space-y-6 group cursor-pointer hover:border-accent transition-all" onClick={() => window.location.href = '/merchant/wallet'}>
                        <div className="flex justify-between items-center">
                            <div className="w-12 h-12 bg-accent/5 text-accent rounded-2xl flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                                <Wallet size={24} />
                            </div>
                            <MoreHorizontal className="text-gray-300" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Available Capital</p>
                            <h3 className="text-2xl font-black text-primary tracking-tight">{stats.wallet_balance}</h3>
                        </div>
                        <p className="text-xs text-gray-400 font-bold">Manage payouts and verify financial status.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MerchantDashboard;
