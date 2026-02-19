import React, { useEffect, useState } from 'react';
import {
    TrendingUp,
    Users,
    Package,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import adminApi from '../../api/admin';

const StatCard = ({ title, value, change, icon: Icon, trend, className }) => (
    <div className={`card-premium p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${className}`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
                <h3 className="text-3xl font-black mt-2 text-primary">{value}</h3>
            </div>
            <div className={`p-3 rounded-2xl shadow-sm ${className?.includes('#c19a6b') ? 'bg-[#c19a6b15] text-[#c19a6b]' :
                className?.includes('#9f8170') ? 'bg-[#9f817015] text-[#9f8170]' :
                    className?.includes('#cb997e') ? 'bg-[#cb997e15] text-[#cb997e]' :
                        className?.includes('#8a7d6b') ? 'bg-[#8a7d6b15] text-[#8a7d6b]' :
                            'bg-[#e3dac9] text-[#8a7d6b]'
                }`}>
                <Icon size={24} />
            </div>
        </div>
        <div className="mt-6 flex items-center gap-2">
            <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {change}
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Growth</span>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [trendResponse, statsResponse] = await Promise.all([
                    adminApi.getSalesTrend(30),
                    adminApi.getDashboardStats()
                ]);

                setSalesData(trendResponse.data || []);
                setDashboardData(statsResponse.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-accent font-black uppercase tracking-widest text-xs">Gathering Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-primary tracking-tight">Executive Overview</h1>
                <p className="text-gray-500 mt-1">Real-time performance metrics across your marketplace.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    title="Gross Sales"
                    value={`₹${dashboardData?.financials?.gross_sales?.toLocaleString() || 0}`}
                    change="+12.5%"
                    trend="up"
                    icon={TrendingUp}
                    className="border-l-4 border-[#c19a6b]" // Sand
                />
                <StatCard
                    title="Platform Commission"
                    value={`₹${dashboardData?.financials?.platform_commission?.toLocaleString() || 0}`}
                    change="+8.2%"
                    trend="up"
                    icon={ShoppingCart}
                    className="border-l-4 border-[#9f8170]" // Umber
                />
                <StatCard
                    title="Inventory Approvals"
                    value={dashboardData?.inventory?.pending_product_approvals || 0}
                    change="-2.4%"
                    trend="down"
                    icon={Package}
                    className="border-l-4 border-[#cb997e]" // Earthy Rose
                />
                <StatCard
                    title="Merchant Approvals"
                    value={dashboardData?.operations?.pending_merchant_approvals || 0}
                    change="+14%"
                    trend="up"
                    icon={Users}
                    className="border-l-4 border-[#8a7d6b]" // Taupe
                />
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 card-premium p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-primary uppercase tracking-tight">Sales Allocation</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#c19a6b]"></div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Revenue</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#c19a6b" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#c19a6b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                                    tickFormatter={(str) => {
                                        const date = new Date(str);
                                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: '#ffffffcc', backdropFilter: 'blur(8px)' }}
                                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#c19a6b"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card-premium p-6 overflow-hidden">
                    <h3 className="font-bold text-lg text-primary mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        {dashboardData?.recent_activity?.length > 0 ? (
                            dashboardData.recent_activity.map((log) => (
                                <div key={log.id} className="flex items-start gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${log.severity === 'HIGH' ? 'bg-[#cb997e15] text-[#cb997e]' :
                                        log.severity === 'MEDIUM' ? 'bg-[#c19a6b15] text-[#c19a6b]' :
                                            'bg-[#e3dac9] text-[#8a7d6b]'
                                        }`}>
                                        <Users size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">
                                            {log.admin} {log.action.toLowerCase().replace('_', ' ')}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                            Target: {log.target}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">
                                            {new Date(log.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-sm text-gray-400">No recent activity detected.</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => window.location.href = '/admin/audit-logs'}
                        className="w-full mt-8 py-3 text-xs font-black uppercase tracking-widest text-primary border-2 border-primary border-dashed rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
                    >
                        View System Audit Logs
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
