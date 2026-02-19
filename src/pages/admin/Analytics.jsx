import React, { useEffect, useState } from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { Download, Filter, Calendar, TrendingUp } from 'lucide-react';
import adminApi from '../../api/admin';
import Button from '../../components/ui/Button';

const COLORS = [
    '#c19a6b', // Sand
    '#9f8170', // Umber
    '#cb997e', // Earthy Rose
    '#8a7d6b', // Taupe
    '#e3dac9', // Vanilla
    '#6b705c', // Olive
    '#a5a58d', // Sage Matte
    '#b7b7a4'  // Stone
];

const AdminAnalytics = () => {
    const [salesTrend, setSalesTrend] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(30);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const [trendRes, catRes, prodRes] = await Promise.all([
                    adminApi.getSalesTrend(timeRange),
                    adminApi.getCategoryPerformance(),
                    adminApi.getTopProducts(10)
                ]);
                setSalesTrend(trendRes.data || []);
                setCategoryData(catRes.data || []);
                setTopProducts(prodRes.data || []);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [timeRange]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-accent font-black uppercase tracking-widest text-xs">Assembling Insights...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Market Intelligence</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Deep dive into category distribution and product performance.</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                    {[7, 30, 90].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${timeRange === range
                                ? 'bg-primary text-white shadow-md'
                                : 'text-gray-400 hover:text-primary hover:bg-gray-50'
                                }`}
                        >
                            {range}D
                        </button>
                    ))}
                </div>
            </div>

            {/* Sales Trend Chart */}
            <div className="card-premium p-8">
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Revenue & Order Momentum</h3>
                        <p className="text-xs text-gray-400 mt-1 font-medium">Daily performance tracking over the selected period</p>
                    </div>
                </div>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94A3B8', fontSize: 11 }}
                                tickFormatter={(str) => {
                                    const date = new Date(str);
                                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94A3B8', fontSize: 11 }}
                                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: '#ffffff' }}
                                formatter={(value, name) => [
                                    name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                                    name.toUpperCase()
                                ]}
                            />
                            <Bar dataKey="revenue" fill="#c19a6b" radius={[6, 6, 0, 0]} barSize={26} name="revenue" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Distribution */}
                <div className="card-premium p-8">
                    <h3 className="text-lg font-bold text-primary mb-8 border-b border-gray-100 pb-4">Revenue by Category</h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={90}
                                    outerRadius={150}
                                    paddingAngle={10}
                                    dataKey="revenue"
                                    nameKey="category"
                                    stroke="none"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: '#ffffff' }}
                                    formatter={(value) => `₹${value.toLocaleString()}`}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={60}
                                    iconType="rect"
                                    formatter={(value) => <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 border-l-2 border-gray-100 ml-2">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products Bar Chart */}
                <div className="card-premium p-8">
                    <h3 className="text-lg font-bold text-primary mb-8 border-b border-gray-100 pb-4">Top Performing Products (by Revenue)</h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProducts} layout="vertical" margin={{ left: 40, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="title"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={140}
                                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F1F5F930' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: '#ffffff' }}
                                    formatter={(value) => `₹${value.toLocaleString()}`}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="#8a7d6b"
                                    radius={[0, 10, 10, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Numerical Data Table */}
            <div className="card-premium overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-primary">Detailed Product Performance</h3>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 text-accent">
                        <Filter size={14} /> Filter Table
                    </Button>
                </div>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-gray-400 uppercase text-[11px] tracking-wider font-bold">
                            <th className="px-8 py-4">Product Name</th>
                            <th className="px-8 py-4 text-right">Units Sold</th>
                            <th className="px-8 py-4 text-right">Total Revenue</th>
                            <th className="px-8 py-4 text-right">Contribution</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {topProducts.map((product, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-4 font-semibold text-primary group-hover:text-accent">{product.title}</td>
                                <td className="px-8 py-4 text-right text-gray-500">{product.sold} units</td>
                                <td className="px-8 py-4 text-right font-bold text-primary">₹{product.revenue.toLocaleString()}</td>
                                <td className="px-8 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-[#c19a6b] h-full rounded-full"
                                                style={{ width: `${(product.revenue / topProducts[0].revenue) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">
                                            {((product.revenue / topProducts[0].revenue) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminAnalytics;
