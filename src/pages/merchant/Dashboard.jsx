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
    MoreHorizontal
} from 'lucide-react';
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
        <div className="h-[300px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="_id"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontSize: '12px',
                            fontWeight: '800'
                        }}
                        itemStyle={{ color: '#1e293b' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="total_earnings"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

const StatCard = ({ title, value, change, icon: Icon, trend }) => (
    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-accent/5 text-accent rounded-2xl flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                <Icon size={24} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {change}%
                </div>
            )}
        </div>
        <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-primary tracking-tight">{value}</h3>
        </div>
    </div>
);

const MerchantDashboard = () => {
    const [stats, setStats] = useState({
        total_sales: 0,
        total_orders: 0,
        active_products: 0,
        wallet_balance: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [earningsData, setEarningsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Wallet Summary, Orders (for count), Products, and Earnings Report
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

                // Calculate Revenue Trend (Compare last 2 days if daily)
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

                // Map Orders to UI format
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

    if (loading) return <div className="p-8 text-center text-accent">Initializing Storefront Analytics...</div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight uppercase">Operational Intelligence</h1>
                    <p className="text-gray-500 font-medium mt-1">Real-time performance metrics for your digital storefront.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-gray-200 text-gray-400 hover:text-primary h-12 px-6">
                        <Filter size={18} className="mr-2" /> Adjust View
                    </Button>
                    <Button
                        onClick={() => toast.success('Report generation started. We will notify you when it is ready.')}
                        className="h-12 px-8 font-black tracking-widest shadow-xl shadow-accent/20"
                    >
                        <TrendingUp size={18} className="mr-2" /> EXPORT REPORT
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Gross Revenue"
                    value={stats.total_sales}
                    change={stats.revenue_change}
                    trend={stats.revenue_trend}
                    icon={TrendingUp}
                />
                <StatCard
                    title="Order Volume"
                    value={stats.total_orders}
                    icon={ShoppingBag}
                />
                <StatCard
                    title="Market SKU's"
                    value={stats.active_products}
                    icon={Package}
                />
                <StatCard
                    title="Settled Capital"
                    value={stats.wallet_balance}
                    icon={Wallet}
                />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-lg font-black text-primary tracking-widest uppercase">Revenue over Time</h2>
                        <Button variant="outline" className="text-[10px] font-black border-none text-accent hover:bg-accent/5">
                            LAST 30 DAYS
                        </Button>
                    </div>

                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
                        <RevenueChart data={earningsData} />
                    </div>

                    <div className="flex justify-between items-center px-2 pt-4">
                        <h2 className="text-lg font-black text-primary tracking-widest uppercase">Stream Activity</h2>
                        <Button variant="outline" className="text-[10px] font-black border-none text-accent hover:bg-accent/5">
                            VIEW ALL STREAMS
                        </Button>
                    </div>

                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
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
                                            <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{order.date}</p>
                                        </td>
                                        <td className="px-8 py-6 text-gray-500">{order.customer}</td>
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

                {/* Quick Actions / Upgrades */}
                <div className="space-y-6">
                    <h2 className="text-lg font-black text-primary tracking-widest uppercase px-2">Quick Access</h2>
                    <div className="bg-primary rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-20"></div>

                        <div className="relative z-10 space-y-6">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-accent">
                                <Package size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Grow Your Catalog</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">Expand your market reach by adding new product variants to the platform.</p>
                            </div>
                            <Button className="w-full h-12 bg-accent hover:bg-accent/90 text-white border-none font-black tracking-widest text-[11px]">
                                ADD NEW PRODUCT
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm space-y-6 group cursor-pointer hover:border-accent transition-all" onClick={() => window.location.href = '/merchant/wallet'}>
                        <div className="flex justify-between items-center">
                            <div className="w-12 h-12 bg-accent/5 text-accent rounded-2xl flex items-center justify-center">
                                <Wallet size={24} />
                            </div>
                            <MoreHorizontal className="text-gray-300" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Available to Withdraw</p>
                            <h3 className="text-2xl font-black text-primary tracking-tight">{stats.wallet_balance}</h3>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">Click to manage payouts and connection status.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MerchantDashboard;
