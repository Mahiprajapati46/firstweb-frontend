import React, { useState, useEffect } from 'react';
import {
    BarChart2,
    TrendingUp,
    Download,
    PieChart as PieIcon,
    Layers,
    ShoppingCart,
    CreditCard,
    ArrowUpRight,
    ChevronRight,
    Calendar,
    Target,
    Zap
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Cell,
    Pie,
    Legend
} from 'recharts';
import merchantApi from '../../api/merchant';
import { toast } from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, colorClass, subtitle, bgGradient }) => (
    <div className={`card-premium p-10 border-none relative overflow-hidden group hover:shadow-2xl transition-all duration-500 bg-white min-h-[160px] flex flex-col justify-between`}>
        {/* Decorative Gradient Blob */}
        <div className={`absolute -right-4 -top-4 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-700 ${bgGradient}`}></div>

        <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div className="flex justify-between items-start">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-500 group-hover:scale-110 bg-opacity-10 ${colorClass.replace('text-', 'bg-')} ${colorClass}`}>
                    <Icon size={28} strokeWidth={2.5} />
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
                    <h3 className="text-3xl font-black mt-2 text-primary tracking-tight">{value}</h3>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{subtitle}</p>
                <div className={`${colorClass} opacity-40 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-1`}>
                    <ArrowUpRight size={16} />
                </div>
            </div>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-md p-4 border border-gray-100 shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-50 pb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between gap-6 py-1">
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">{entry.name}:</span>
                        <span className="text-xs font-black text-primary">₹{entry.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const Reports = () => {
    const [activeTab, setActiveTab] = useState('sales'); // 'sales' or 'gst'
    const [gstStats, setGstStats] = useState({
        total_tax: 0, total_cgst: 0, total_sgst: 0, total_igst: 0,
        intra_state_count: 0, inter_state_count: 0
    });
    const [salesData, setSalesData] = useState({
        sales: [],
        topProducts: [],
        categories: []
    });
    const [reportPeriod, setReportPeriod] = useState('this_month');
    const [loading, setLoading] = useState(true);

    const COLORS = ['#24b47e', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'];

    const getDatesFromPeriod = (period) => {
        const now = new Date();
        let startDate, endDate = new Date();

        if (period === 'today') {
            startDate = new Date(now.setHours(0, 0, 0, 0));
        } else if (period === 'this_month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (period === 'last_month') {
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        }
        return { startDate, endDate };
    };

    const fetchReports = async (period) => {
        try {
            setLoading(true);
            const { startDate, endDate } = getDatesFromPeriod(period);
            const params = {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            };

            const [gstRes, salesRes] = await Promise.all([
                merchantApi.getGstSummary(params),
                merchantApi.getSalesSummary(params)
            ]);

            setGstStats(gstRes.data);
            setSalesData(salesRes.data || { sales: [], topProducts: [], categories: [] });
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            toast.error('Could not load reporting data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports(reportPeriod);
    }, []);

    const handleExportGst = async () => {
        try {
            const { startDate, endDate } = getDatesFromPeriod(reportPeriod);
            await merchantApi.exportGstReport({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });
            toast.success('Report downloaded successfully');
        } catch (error) {
            toast.error('Failed to export report');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Processing Analytics...</p>
        </div>
    );

    const totalOrders = salesData.sales?.reduce((acc, curr) => acc + curr.orders, 0) || 0;
    const grossRevenue = salesData.sales?.reduce((acc, curr) => acc + curr.revenue, 0) || 0;
    const avgOrderValue = totalOrders > 0 ? (grossRevenue / totalOrders) : 0;
    const totalGst = salesData.sales?.reduce((acc, curr) => acc + curr.tax, 0) || 0;

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-2">Merchant Insights</h2>
                    <h1 className="text-3xl font-black text-primary tracking-tight uppercase">Financial Reports</h1>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Report Period</span>
                        <div className="flex items-center bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
                            {['today', 'this_month', 'last_month'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => {
                                        setReportPeriod(p);
                                        fetchReports(p);
                                    }}
                                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportPeriod === p ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-primary'}`}
                                >
                                    {p.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 pt-5 sm:pt-0">
                        <span className="text-[9px] font-black text-transparent uppercase tracking-widest hidden sm:block">.</span>
                        <button
                            onClick={handleExportGst}
                            className="btn-boutique-primary h-12 px-6 flex items-center gap-2 shadow-xl shadow-primary/20"
                        >
                            <Download size={18} /> EXPORT CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-8 border-b border-gray-100">
                <button
                    onClick={() => setActiveTab('sales')}
                    className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'sales' ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
                >
                    Sales Analytics
                    {activeTab === 'sales' && <div className="absolute bottom-0 left-0 w-full h-1 bg-accent rounded-full animate-in slide-in-from-left duration-300"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('gst')}
                    className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'gst' ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
                >
                    GST Reporting
                    {activeTab === 'gst' && <div className="absolute bottom-0 left-0 w-full h-1 bg-accent rounded-full animate-in slide-in-from-left duration-300"></div>}
                </button>
            </div>

            {activeTab === 'sales' ? (
                /* Sales Analytics View */
                <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Net Revenue"
                            value={`₹${Math.round(grossRevenue).toLocaleString()}`}
                            icon={TrendingUp}
                            colorClass="text-accent"
                            bgGradient="bg-accent"
                            subtitle="Revenue After Taxes"
                        />
                        <StatCard
                            title="Total Orders"
                            value={`${totalOrders}`}
                            icon={ShoppingCart}
                            colorClass="text-blue-500"
                            bgGradient="bg-blue-500"
                            subtitle={`${totalOrders} Orders Completed`}
                        />
                        <StatCard
                            title="Average Order Value"
                            value={`₹${Math.round(avgOrderValue).toLocaleString()}`}
                            icon={Target}
                            colorClass="text-indigo-500"
                            bgGradient="bg-indigo-500"
                            subtitle="Revenue Per Order"
                        />
                        <StatCard
                            title="GST Collected"
                            value={`₹${Math.round(totalGst).toLocaleString()}`}
                            icon={Layers}
                            colorClass="text-rose-500"
                            bgGradient="bg-rose-500"
                            subtitle="Total Tax Liability"
                        />
                    </div>

                    {/* Main Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Area Chart: Sales Trend */}
                        <div className="lg:col-span-2 card-premium p-8 relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                        <TrendingUp size={20} />
                                    </div>
                                    <h2 className="text-sm font-black text-primary uppercase tracking-widest">Revenue Trend – Daily Revenue Performance</h2>
                                </div>
                                <Zap size={16} className="text-gray-200 group-hover:text-accent transition-colors duration-500" />
                            </div>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesData.sales}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#24b47e" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#24b47e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="_id"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                                            dy={10}
                                            tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                                            tickFormatter={(val) => `₹${val}`}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            name="Revenue"
                                            stroke="#24b47e"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorRev)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pie Chart: Category Distribution */}
                        <div className="card-premium p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <PieIcon size={20} />
                                </div>
                                <h2 className="text-sm font-black text-primary uppercase tracking-widest">Sales by Category</h2>
                            </div>
                            <div className="h-[300px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={salesData.categories}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={8}
                                            dataKey="revenue"
                                            stroke="none"
                                        >
                                            {salesData.categories.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} content={({ payload }) => (
                                            <div className="flex flex-wrap justify-center gap-4 mt-8">
                                                {payload.map((entry, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{entry.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-6">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">By Category</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Top Products */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="card-premium p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                    <Target size={20} />
                                </div>
                                <h2 className="text-sm font-black text-primary uppercase tracking-widest">Top Selling Products</h2>
                            </div>
                            <div className="space-y-6">
                                {salesData.topProducts.map((product, idx) => (
                                    <div key={idx} className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xs font-black text-gray-400 border border-gray-100 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                                            0{idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-end mb-2">
                                                <p className="text-xs font-black text-primary uppercase tracking-tight truncate max-w-[200px]">{product.name}</p>
                                                <p className="text-xs font-black text-accent">₹{product.revenue.toLocaleString()}</p>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-accent rounded-full transition-all duration-1000 delay-300"
                                                    style={{ width: `${salesData.topProducts[0] ? (product.revenue / salesData.topProducts[0].revenue) * 100 : 0}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{product.quantity} Units Sold</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card-premium p-0 overflow-hidden border-none shadow-xl">
                            <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100">
                                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sales History</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/20">
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Gross Sales</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Tax</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Net Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {salesData.sales.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-8 py-5 text-xs font-black text-primary uppercase tracking-widest">{new Date(item._id).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                <td className="px-8 py-5 text-sm font-black text-primary text-right tracking-tight">₹{Math.round(item.revenue).toLocaleString()}</td>
                                                <td className="px-8 py-5 text-sm font-black text-rose-500 text-right tracking-tight">₹{Math.round(item.tax).toLocaleString()}</td>
                                                <td className="px-8 py-5 text-sm font-black text-accent text-right tracking-tight">₹{Math.round(item.revenue + item.tax).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* GST Reporting View (Same as before but in its own tab) */
                <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total GST Collected"
                            value={`₹${Math.round(gstStats.total_tax || 0).toLocaleString()}`}
                            icon={PieIcon}
                            colorClass="text-[#24b47e]"
                            bgGradient="bg-[#24b47e]"
                            subtitle={`${gstStats.intra_state_count + gstStats.inter_state_count} Orders`}
                        />
                        <StatCard
                            title="CGST (Intra-State)"
                            value={`₹${Math.round(gstStats.total_cgst || 0).toLocaleString()}`}
                            icon={ArrowUpRight}
                            colorClass="text-blue-500"
                            bgGradient="bg-blue-500"
                            subtitle={`${gstStats.intra_state_count} Intra-State Orders`}
                        />
                        <StatCard
                            title="SGST (Intra-State)"
                            value={`₹${Math.round(gstStats.total_sgst || 0).toLocaleString()}`}
                            icon={ArrowUpRight}
                            colorClass="text-indigo-500"
                            bgGradient="bg-indigo-500"
                            subtitle={`${gstStats.intra_state_count} Intra-State Orders`}
                        />
                        <StatCard
                            title="IGST (Inter-State)"
                            value={`₹${Math.round(gstStats.total_igst || 0).toLocaleString()}`}
                            icon={TrendingUp}
                            colorClass="text-purple-500"
                            bgGradient="bg-purple-500"
                            subtitle={`${gstStats.inter_state_count} Inter-State Orders`}
                        />
                    </div>

                    {/* GST History Table */}
                    <div className="card-premium p-0 overflow-hidden border-none shadow-xl">
                        <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">GST Transaction History</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/20">
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Orders</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">CGST</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">SGST</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">IGST</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total Tax</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {salesData.sales.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-10 text-center text-gray-400 text-xs font-black uppercase tracking-widest opacity-40">No tax records found.</td>
                                        </tr>
                                    ) : (
                                        salesData.sales.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-8 py-5 text-xs font-black text-primary uppercase tracking-widest">{new Date(item._id).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                <td className="px-8 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">{item.orders} Orders</td>
                                                <td className="px-8 py-5 text-sm font-black text-blue-500 text-right tracking-tight">₹{Math.round(item.cgst || 0).toLocaleString()}</td>
                                                <td className="px-8 py-5 text-sm font-black text-indigo-500 text-right tracking-tight">₹{Math.round(item.sgst || 0).toLocaleString()}</td>
                                                <td className="px-8 py-5 text-sm font-black text-purple-500 text-right tracking-tight">₹{Math.round(item.igst || 0).toLocaleString()}</td>
                                                <td className="px-8 py-5 text-sm font-black text-[#24b47e] text-right tracking-tight">₹{Math.round(item.tax).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card-premium p-10 border-dashed border-2 border-gray-200 bg-gray-50/50 flex flex-col justify-center items-center text-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-300">
                            <CreditCard size={32} />
                        </div>
                        <div className="max-w-[500px] space-y-2">
                            <h3 className="text-sm font-black text-primary uppercase tracking-widest font-bold">GST Ledger Data Extraction</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-loose">Download a complete GST transaction ledger including invoice numbers, GST rates, and state-wise tax breakdown for accounting and tax filing.</p>
                        </div>
                        <button
                            onClick={handleExportGst}
                            className="btn-boutique-primary h-12 px-10 shadow-xl shadow-primary/20"
                        >
                            Download GST Ledger (CSV)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
