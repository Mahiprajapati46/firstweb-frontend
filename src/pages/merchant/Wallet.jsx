import React, { useState, useEffect } from 'react';
import {
    Wallet as WalletIcon,
    ArrowUpRight,
    ArrowDownLeft,
    TrendingUp,
    Clock,
    CreditCard,
    Activity,
    ExternalLink,
    LineChart as ChartIcon,
    RotateCcw,
    ShieldCheck,
    Search,
    Filter,
    ArrowDown,
    ArrowUp,
    Info,
    ChevronDown,
    ChevronUp,
    Settings2
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
import merchantApi from '../../api/merchant';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const Wallet = () => {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
    const [earnings, setEarnings] = useState(0);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [chartData, setChartData] = useState([]);
    const [isSandbox, setIsSandbox] = useState(false);
    const [expandedRows, setExpandedRows] = useState(new Set());

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedRows(newExpanded);
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const stripeStatus = params.get('stripe');

        if (stripeStatus === 'success') {
            toast.success('Electronic gateway synchronized');
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (stripeStatus === 'refresh') {
            toast.error('Onboarding sequence interrupted');
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchTransactions(currentPage);
    }, [currentPage]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [summary, earningsRes] = await Promise.all([
                merchantApi.getWallet(),
                merchantApi.getEarningsReport('daily')
            ]);
            setWallet(summary.data);
            setIsSandbox(summary.data.is_sandbox);

            const reportData = earningsRes.data || [];
            setChartData(reportData.map(item => ({
                name: new Date(item._id).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                earnings: item.total_earnings
            })));

            if (reportData.length > 0) {
                setEarnings(reportData[reportData.length - 1].total_earnings);
            }
        } catch (error) {
            console.error('Failed to load initial wallet data:', error);
        } finally {
            if (currentPage === 1) setLoading(false);
        }
    };

    const fetchTransactions = async (page) => {
        try {
            const txs = await merchantApi.getTransactions({ page, limit: 20 });
            setTransactions(txs.data || []);
            setPagination(txs.pagination || { page: 1, total: 0, pages: 1 });
        } catch (error) {
            toast.error('Ledger synchronization failed');
        }
    };

    const groupTransactions = (txs) => {
        let processed = [];
        const usedIds = new Set();

        // Pass 1: Handle Primary Events (Credit or Refund) and their associated Commission
        txs.forEach((tx, index) => {
            if (usedIds.has(tx._id)) return;

            const isEarnTrigger = tx.type === 'ORDER_CREDIT';
            const isRefundTrigger = tx.type === 'REFUND' || tx.type === 'ORDER_CANCEL_REFUND' || tx.type === 'ORDER_RETURN_REFUND';

            if ((isEarnTrigger || isRefundTrigger) && tx.order_id) {
                const related = txs.find((other, otherIdx) =>
                    otherIdx !== index &&
                    !usedIds.has(other._id) &&
                    other.order_id === tx.order_id &&
                    (other.type === 'COMMISSION' || other.type === 'COMMISSION_REVERSAL' || other.type === 'ADJUSTMENT') &&
                    (isEarnTrigger ? other.amount < 0 : other.amount > 0)
                );

                if (related) {
                    const gross = tx.amount;
                    const fee = related.amount;
                    const net = Math.round((gross + fee) * 100) / 100;

                    processed.push({
                        ...tx,
                        isGrouped: true,
                        displayGross: gross,
                        displayFee: fee,
                        net: net,
                    });
                    usedIds.add(tx._id);
                    usedIds.add(related._id);
                    return;
                }
            }
        });

        txs.forEach(tx => {
            if (usedIds.has(tx._id)) return;
            processed.push({ ...tx, net: tx.amount, isGrouped: false });
            usedIds.add(tx._id);
        });

        processed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return processed.filter(tx => {
            const matchesSearch = !searchTerm ||
                tx.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.description?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter = filterType === 'ALL' ||
                (filterType === 'EARNINGS' && (tx.type === 'ORDER_CREDIT' || tx.type === 'COMMISSION')) ||
                (filterType === 'SETTLEMENTS' && (tx.type === 'PAYOUT' || tx.type === 'WITHDRAWAL')) ||
                (filterType === 'ADJUSTMENTS' && (tx.type === 'REFUND' || tx.type === 'ORDER_CANCEL_REFUND' || tx.type === 'ORDER_RETURN_REFUND' || tx.type === 'ADJUSTMENT'));

            return matchesSearch && matchesFilter;
        });
    };

    const handlePayout = async () => {
        if (wallet.stripe_onboarding_status !== 'COMPLETED') {
            toast.error('Gateway authorization required');
            return;
        }

        const minWithdrawal = 500;
        if (wallet.available_balance < minWithdrawal) {
            toast.error(`Minimum threshold: ₹${minWithdrawal}`);
            return;
        }

        try {
            setRequesting(true);
            await merchantApi.requestPayout();
            toast.success(`Settlement of ₹${wallet.available_balance.toLocaleString()} initiated`);
            fetchInitialData();
            fetchTransactions(1);
        } catch (error) {
            toast.error(error.message || 'Settlement failed');
        } finally {
            setRequesting(false);
        }
    };

    const handleDownloadReport = (type) => {
        try {
            if (!transactions || transactions.length === 0) {
                toast.error('Empty dataset for export');
                return;
            }
            toast.loading(`Extracting ${type} logs...`, { id: 'report' });
            const headers = ['Transaction ID', 'Date', 'Type', 'Description', 'Amount', 'Status', 'Balance Type'];
            const rows = transactions.map(tx => [
                tx._id,
                new Date(tx.createdAt).toISOString().split('T')[0],
                tx.type,
                `"${tx.description.replace(/"/g, '""')}"`,
                tx.amount,
                tx.status,
                tx.balance_type
            ]);
            const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ledger_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Logs exported successfully', { id: 'report' });
        } catch (error) {
            toast.error('Export failed', { id: 'report' });
        }
    };

    const handleStripe = async () => {
        try {
            const response = await merchantApi.initStripeOnboarding();
            if (response.data?.url) {
                window.location.href = response.data.url;
            } else {
                toast.error('Failed to generate secure link');
            }
        } catch (error) {
            toast.error(error.message || 'Onboarding gateway failure');
        }
    };

    const handleSimulateOnboarding = async () => {
        try {
            const loadingToast = toast.loading('Simulating onboarding...');
            await merchantApi.simulateStripeOnboarding();
            toast.success('Simulation: Gateway onboarded successfully', { id: loadingToast });
            fetchInitialData();
        } catch (error) {
            toast.error('Simulation failed', { id: 'simulate' });
        }
    };

    if (loading && !wallet) return (
        <div className="flex items-center justify-center p-20">
            <div className="flex flex-col items-center gap-4">
                <Activity className="text-primary animate-pulse" size={48} />
                <p className="text-xs font-black text-primary uppercase tracking-[0.3em]">Syncing Ledger</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-primary tracking-tight">Digital Ledger & Settlements</h1>
                <p className="text-gray-500 mt-1">Monitor your capital flow and manage liquidity distributions.</p>
            </div>

            {/* Balance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-primary rounded-[2rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                    <div className="relative z-10 space-y-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">Liquidity Available</p>
                                <h2 className="text-6xl font-black tracking-tighter text-white">₹{wallet?.available_balance?.toLocaleString() || '0.00'}</h2>
                            </div>
                            {isSandbox && (
                                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-4 max-w-[200px]">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white/50 tracking-widest">
                                        <Settings2 size={14} className="text-amber-400" />
                                        Demo Controls
                                    </div>
                                    <button
                                        onClick={handleSimulateOnboarding}
                                        disabled={wallet?.stripe_onboarding_status === 'COMPLETED'}
                                        className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-20"
                                    >
                                        Force Onboard
                                    </button>
                                    <p className="text-[8px] text-white/40 font-bold leading-tight">
                                        Faculty Note: Use this to simulate real bank verification for the Connect gateway.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={handlePayout}
                                disabled={requesting || wallet?.stripe_onboarding_status !== 'COMPLETED' || wallet?.available_balance < 500}
                                className="bg-accent text-white hover:bg-white hover:text-primary px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Initiate Settlement
                            </button>
                            {(wallet?.stripe_onboarding_status !== 'COMPLETED' || !wallet?.stripe_account_id) ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleStripe}
                                        className="flex items-center gap-2 bg-primary/40 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/60 transition-all border border-gray-700"
                                    >
                                        <CreditCard size={18} className="text-accent" />
                                        Setup Stripe
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-6 py-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                    <span className="text-white font-black text-[10px] uppercase tracking-widest">
                                        Gateway Active
                                        <span className="text-white/40 ml-2">[{wallet.stripe_account_id?.slice(0, 10)}]</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <WalletIcon size={300} className="absolute -right-20 -bottom-20 text-white opacity-[0.03] rotate-12" />
                </div>

                <div className="flex flex-col gap-6">
                    <div className="card-premium p-8 group flex-1 bg-white hover:bg-green-50/50 transition-all border-green-100/50 shadow-green-900/5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600">
                                <TrendingUp size={20} />
                            </div>
                            <span className="text-[10px] font-black text-green-600/50 uppercase tracking-widest">Lifetime Yield</span>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Earned (Net)</p>
                        <h3 className="text-2xl font-black text-primary tracking-tight">₹{wallet?.total_earned?.toLocaleString() || '0.00'}</h3>
                    </div>

                    <div className="card-premium p-8 group flex-1 bg-white hover:bg-amber-50/50 transition-all border-amber-100/50 shadow-amber-900/5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                                <Clock size={20} />
                            </div>
                            <span className="text-[10px] font-black text-amber-600/50 uppercase tracking-widest">In Escrow</span>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pending Reserve</p>
                        <h3 className="text-2xl font-black text-primary tracking-tight italic">₹{wallet?.pending_balance?.toLocaleString() || '0.00'}</h3>
                    </div>
                </div>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-primary tracking-tight flex items-center gap-3">
                            <ChartIcon className="text-accent" size={20} />
                            Performance Visualization
                        </h2>
                    </div>
                    <div className="card-premium p-8 h-[350px]">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0a0a0a" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#0a0a0a" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 900 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 900 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: 'none',
                                            borderRadius: '16px',
                                            boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)',
                                            padding: '12px'
                                        }}
                                        labelStyle={{ color: '#0a0a0a', fontWeight: 900, fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 900 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="earnings"
                                        stroke="#0a0a0a"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorEarnings)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-3">
                                <ChartIcon size={40} className="opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Insufficient data for telemetry</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-black text-primary tracking-tight flex items-center gap-3">
                        <CreditCard className="text-accent" size={20} />
                        Settlement Stats
                    </h2>
                    <div className="card-premium p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Withdrawn</p>
                                <p className="text-xl font-black text-primary">₹{wallet?.total_withdrawn?.toLocaleString() || '0.00'}</p>
                            </div>
                            <div className="p-3 bg-rose-50 rounded-xl text-rose-500">
                                <ArrowUpRight size={20} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Reserve</p>
                                <p className="text-xl font-black text-primary">₹{wallet?.pending_balance?.toLocaleString() || '0.00'}</p>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
                                <Clock size={20} />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-50">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base Currency</span>
                                <span className="text-xs font-black text-primary">{wallet?.currency || 'INR'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Min. Withdrawal</span>
                                <span className="text-xs font-black text-primary">₹500.00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction Logs */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by Order # or Description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                            {['ALL', 'EARNINGS', 'SETTLEMENTS', 'ADJUSTMENTS'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterType === type
                                        ? 'bg-primary text-white shadow-lg'
                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => handleDownloadReport('transactions')}
                        className="flex items-center gap-3 text-[9px] font-black text-gray-400 hover:text-accent uppercase tracking-[0.2em] px-6 py-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <ExternalLink size={14} />
                        Export Dataset (.CSV)
                    </button>
                </div>

                <div className="space-y-4">
                    {transactions.length === 0 ? (
                        <div className="bg-white rounded-3xl p-20 text-center border border-gray-100 shadow-sm">
                            <div className="opacity-20 flex flex-col items-center gap-4">
                                <Activity size={48} />
                                <p className="text-sm font-black uppercase tracking-[0.3em]">No Financial Signatures Recorded</p>
                            </div>
                        </div>
                    ) : (
                        groupTransactions(transactions).map((tx) => {
                            const isExpanded = expandedRows.has(tx._id);
                            return (
                                <div
                                    key={tx._id}
                                    className={`bg-white rounded-2xl border transition-all overflow-hidden ${isExpanded ? 'border-accent ring-1 ring-accent/10 shadow-xl' : 'border-gray-100 hover:border-gray-200 shadow-sm'
                                        }`}
                                >
                                    {/* Summary Header (Collapsed View) */}
                                    <div
                                        onClick={() => toggleRow(tx._id)}
                                        className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`p-3 rounded-xl shadow-sm ${tx.type === 'REFUND' || tx.type === 'ORDER_CANCEL_REFUND' || tx.type === 'ORDER_RETURN_REFUND' ? 'bg-rose-50 text-rose-500' : tx.type === 'PAYOUT' || tx.type === 'WITHDRAWAL' ? 'bg-primary/5 text-primary' : 'bg-green-50 text-green-600'}`}>
                                                {tx.type === 'REFUND' || tx.type === 'ORDER_CANCEL_REFUND' || tx.type === 'ORDER_RETURN_REFUND' ? <RotateCcw size={20} /> : tx.type === 'PAYOUT' || tx.type === 'WITHDRAWAL' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-black text-primary">
                                                        {(tx.type === 'ORDER_CREDIT' || tx.type === 'COMMISSION') && tx.isGrouped ? 'Marketplace Order Receipt' :
                                                            (tx.type === 'REFUND' || tx.type === 'ORDER_CANCEL_REFUND' || tx.type === 'ORDER_RETURN_REFUND') && tx.isGrouped ? 'Order Adjustment (Refund)' :
                                                                tx.description}
                                                    </p>
                                                    {tx.order_number && (
                                                        <span className="text-[10px] font-black px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">
                                                            #{tx.order_number}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                                        {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    <div className="w-1 h-1 bg-gray-200 rounded-full" />
                                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${tx.balance_type === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                                        <Clock size={10} />
                                                        {tx.balance_type === 'PENDING' ? 'Pending Reserve' : 'Available Liquidity'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8 justify-between md:justify-end">
                                            <div className="text-center">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${tx.status === 'COMPLETED' ? 'bg-green-500/5 text-green-600 border-green-500/20' : 'bg-amber-500/5 text-amber-600 border-amber-500/20'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'COMPLETED' ? 'bg-green-600 animate-pulse' : 'bg-amber-600'}`} />
                                                    {tx.status}
                                                </div>
                                                <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1">Status</p>
                                            </div>

                                            <span className={`text-lg font-black ${tx.net >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
                                                {tx.net >= 0 ? '+' : '−'}₹{Math.abs(tx.net).toLocaleString()}
                                            </span>
                                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Net Impact</p>

                                            <div className={`text-gray-300 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-accent' : ''}`}>
                                                <ChevronDown size={20} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Disclosure Content (Expanded View) */}
                                    {isExpanded && (
                                        <div className="p-6 bg-gray-50/50 border-t border-gray-100 animate-in slide-in-from-top-1 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                <div className="space-y-4">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100">Audit Details</p>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between">
                                                            <span className="text-[10px] font-bold text-gray-500">Trace ID</span>
                                                            <span className="text-[10px] font-black text-primary font-mono select-all">#{tx._id.slice(-12).toUpperCase()}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-[10px] font-bold text-gray-500">Entry Type</span>
                                                            <span className="text-[10px] font-black text-primary uppercase">{tx.type}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-[10px] font-bold text-gray-500">Method</span>
                                                            <span className="text-[10px] font-black text-primary uppercase">Gateway Protocol v1</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="md:col-span-2 space-y-4">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100">Financial Statement Breakdown</p>
                                                    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4 shadow-sm">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="font-bold text-gray-600">{tx.type === 'REFUND' || tx.type === 'ORDER_CANCEL_REFUND' || tx.type === 'ORDER_RETURN_REFUND' ? 'Original Gross' : 'Gross Amount'}</span>
                                                            <span className="font-black text-primary">₹{Math.abs(tx.displayGross || tx.amount).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="font-bold text-gray-600">
                                                                {tx.type === 'REFUND' || tx.type === 'ORDER_CANCEL_REFUND' || tx.type === 'ORDER_RETURN_REFUND' ? 'Commission Reversed' : 'Platform Fee (8%)'}
                                                            </span>
                                                            <span className={`font-black ${tx.displayFee > 0 ? 'text-green-600' : 'text-rose-500'}`}>
                                                                {tx.displayFee > 0 ? '+' : tx.displayFee < 0 ? '−' : ''}₹{Math.abs(tx.displayFee || 0).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <div className="h-px bg-gray-50" />
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{tx.net >= 0 ? 'Net Added to Balance' : 'Net Deducted Adjustment'}</span>
                                                            <span className={`text-xl font-black ${tx.net >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
                                                                {tx.net >= 0 ? '+' : '−'}₹{Math.abs(tx.net).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="p-8 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            Archive Page <span className="text-primary">{pagination.page}</span> / {pagination.pages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="px-6 py-2 bg-white border border-gray-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
                            >
                                Back
                            </button>
                            <button
                                disabled={currentPage === pagination.pages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="px-6 py-2 bg-white border border-gray-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
                            >
                                Forward
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wallet;
