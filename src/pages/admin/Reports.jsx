import React, { useState } from 'react';
import {
    Download,
    Calendar,
    FileText,
    ShieldCheck,
    TrendingUp,
    Store,
    Clock,
    Filter,
    BarChart3
} from 'lucide-react';
import adminApi from '../../api/admin';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const ReportCard = ({ title, description, icon: Icon, onDownload, colorClass, loading }) => (
    <div className="card-premium p-8 group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10 transition-colors`}>
                <Icon size={28} className={colorClass.replace('bg-', 'text-')} />
            </div>
            <button
                onClick={onDownload}
                disabled={loading}
                className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-primary transition-all"
            >
                {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                ) : (
                    <Download size={20} />
                )}
            </button>
        </div>
        <h3 className="text-xl font-black text-primary mb-3">{title}</h3>
        <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">{description}</p>
        <Button
            variant="outline"
            className="w-full text-xs font-black uppercase tracking-widest py-3 border-2"
            onClick={onDownload}
            disabled={loading}
            icon={Download}
        >
            {loading ? 'Preparing...' : 'Generate CSV'}
        </Button>
    </div>
);

const AdminReports = () => {
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [loading, setLoading] = useState({
        sales: false,
        tax: false,
        merchants: false
    });

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };

    const downloadReport = async (type) => {
        try {
            setLoading(prev => ({ ...prev, [type]: true }));

            const params = {};
            if (dateRange.startDate) params.startDate = dateRange.startDate;
            if (dateRange.endDate) params.endDate = dateRange.endDate;

            let response;
            if (type === 'sales') {
                response = await adminApi.exportPlatformSales(params);
            } else if (type === 'tax') {
                response = await adminApi.exportTaxationLedger(params);
            } else if (type === 'merchants') {
                response = await adminApi.exportMerchantRanking(params);
            }

            if (response.success) {
                toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully`);
            }
        } catch (error) {
            console.error(`Failed to export ${type} report:`, error);
            toast.error(`Failed to generate ${type} report`);
        } finally {
            setLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    const presets = [
        { label: 'Today', getValue: () => ({ startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] }) },
        {
            label: 'Last 7 Days', getValue: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate() - 7);
                return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
            }
        },
        {
            label: 'This Month', getValue: () => {
                const date = new Date();
                const start = new Date(date.getFullYear(), date.getMonth(), 1);
                return { startDate: start.toISOString().split('T')[0], endDate: date.toISOString().split('T')[0] };
            }
        }
    ];

    const applyPreset = (preset) => {
        setDateRange(preset.getValue());
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-primary tracking-tight">Platform Intelligence</h1>
                    <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Administrative Report Hub</p>
                </div>

                <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
                        <Calendar size={16} className="text-accent" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Report Period:</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            name="startDate"
                            value={dateRange.startDate}
                            onChange={handleDateChange}
                            className="text-xs font-bold bg-transparent border-none focus:ring-0 p-1 text-primary"
                        />
                        <span className="text-gray-300">/</span>
                        <input
                            type="date"
                            name="endDate"
                            value={dateRange.endDate}
                            onChange={handleDateChange}
                            className="text-xs font-bold bg-transparent border-none focus:ring-0 p-1 text-primary"
                        />
                    </div>

                    <div className="h-6 w-[1px] bg-gray-100"></div>

                    <div className="flex gap-2">
                        {presets.map(p => (
                            <button
                                key={p.label}
                                onClick={() => applyPreset(p)}
                                className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-soft-accent hover:text-accent transition-all"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <ReportCard
                    title="Platform Sales Report"
                    description="Comprehensive log of all platform transactions. Includes item details, merchant splits, commissions, and customer metadata for financial auditing."
                    icon={TrendingUp}
                    colorClass="bg-[#24b47e]"
                    onDownload={() => downloadReport('sales')}
                    loading={loading.sales}
                />
                <ReportCard
                    title="GST Taxation Ledger"
                    description="Detailed GST liability report for the entire marketplace. Provides CGST, SGST, and IGST breakdowns verified against platform orders."
                    icon={ShieldCheck}
                    colorClass="bg-[#3b82f6]"
                    onDownload={() => downloadReport('tax')}
                    loading={loading.tax}
                />
                <ReportCard
                    title="Merchant Ranking"
                    description="Performance metrics for all registered vendors. Rank merchants by revenue, order volume, and contribution to platform growth."
                    icon={Store}
                    colorClass="bg-[#a855f7]"
                    onDownload={() => downloadReport('merchants')}
                    loading={loading.merchants}
                />
            </div>

            {/* Quick Insights Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-4">
                <div className="card-premium p-8 border-l-8 border-[#24b47e]">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-[#24b47e10] text-[#24b47e] rounded-xl">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-primary uppercase tracking-tight">Report Frequency</h4>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Live Platform Data</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                        Reports are generated in real-time from the production database. Ensure correct date range filtering to optimize performance and data accuracy for specific accounting cycles.
                    </p>
                </div>

                <div className="card-premium p-8 border-l-8 border-[#3b82f6]">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-[#3b82f610] text-[#3b82f6] rounded-xl">
                            <Filter size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-primary uppercase tracking-tight">Data Integrity</h4>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Verified Multi-Merchant Stats</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                        Our intelligence engine reconciles orders against wallet transactions and merchant settlements to ensure the CSV exports are 100% accurate for GST filing and financial reports.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
