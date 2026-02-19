import React, { useState, useEffect } from 'react';
import {
    Wallet as WalletIcon,
    ArrowUpRight,
    ArrowDownLeft,
    TrendingUp,
    Clock,
    CreditCard,
    Activity,
    ExternalLink
} from 'lucide-react';
import merchantApi from '../../api/merchant';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const Wallet = () => {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
    const [earnings, setEarnings] = useState(0);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        // Handle Stripe Return Parameters
        const params = new URLSearchParams(window.location.search);
        const stripeStatus = params.get('stripe');

        if (stripeStatus === 'success') {
            toast.success('Stripe account connected successfully!');
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (stripeStatus === 'refresh') {
            toast.error('Onboarding was interrupted. Please try again.');
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

            // Get today's earnings from the last entry of the report
            const reportData = earningsRes.data || [];
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
            const txs = await merchantApi.getTransactions({ page, limit: 10 });
            setTransactions(txs.data || []);
            setPagination(txs.pagination || { page: 1, total: 0, pages: 1 });
        } catch (error) {
            toast.error('Failed to load transaction history');
        }
    };

    const handlePayout = async () => {
        // Check Stripe onboarding status
        if (wallet.stripe_onboarding_status !== 'COMPLETED') {
            toast.error('Please complete Stripe onboarding first');
            return;
        }

        // Check minimum withdrawal (should come from backend settings)
        const minWithdrawal = 500; // TODO: Fetch from platform settings
        if (wallet.available_balance < minWithdrawal) {
            toast.error(`Minimum payout amount is ₹${minWithdrawal}`);
            return;
        }

        if (wallet.available_balance === 0) {
            toast.error('No funds available for payout');
            return;
        }

        try {
            setRequesting(true);
            const response = await merchantApi.requestPayout();
            toast.success(`Payout of ₹${wallet.available_balance.toLocaleString()} initiated successfully`);
            fetchInitialData();
            fetchTransactions(1);
        } catch (error) {
            toast.error(error.message || 'Payout failed');
        } finally {
            setRequesting(false);
        }
    };

    const handleDownloadReport = (type) => { // Removed async
        try {
            if (!transactions || transactions.length === 0) {
                toast.error('No transactions to export');
                return;
            }

            toast.loading(`Generating ${type} report...`, { id: 'report' });

            // Define CSV Headers
            const headers = ['Transaction ID', 'Date', 'Type', 'Description', 'Amount', 'Status', 'Balance Type'];

            // Map data to rows
            const rows = transactions.map(tx => [
                tx._id,
                new Date(tx.createdAt).toISOString().split('T')[0],
                tx.type,
                `"${tx.description.replace(/"/g, '""')}"`, // Escape quotes
                tx.amount,
                tx.status,
                tx.balance_type
            ]);

            // Combine headers and rows
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

            // Create Blob and Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `merchant_${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

            toast.success(`${type} report downloaded`, { id: 'report' });
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to generate report', { id: 'report' });
        }
    };

    const handleStripe = async () => {
        try {
            const response = await merchantApi.initStripeOnboarding();
            if (response.data?.url) {
                window.location.href = response.data.url;
            } else {
                toast.error('Failed to generate onboarding link');
            }
        } catch (error) {
            if (error.code === 'STRIPE_CONNECT_NOT_ENABLED') {
                toast.error(
                    (t) => (
                        <div className="space-y-4">
                            <p className="font-bold">Stripe Connect Not Enabled</p>
                            <p className="text-xs opacity-80">{error.message}</p>
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => {
                                        toast.dismiss(t.id);
                                        // Scroll to simulation button or just inform them
                                    }}
                                    className="px-3 py-1 bg-primary text-white rounded-lg text-[10px] font-black uppercase"
                                >
                                    Understood
                                </button>
                            </div>
                        </div>
                    ),
                    { duration: 6000 }
                );
            } else {
                toast.error(error.message || 'Stripe onboarding failed to start');
            }
        }
    };

    if (loading && !wallet) return <div className="p-20 text-center font-black animate-pulse">Syncing Ledgers...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Hub</h1>
                <p className="text-slate-500 mt-1 font-medium">Track your earnings and manage payouts.</p>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                    <div className="relative z-10 space-y-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Available for Payout</p>
                            <h2 className="text-6xl font-black tracking-tighter line-clamp-1">₹{wallet?.available_balance?.toLocaleString() || '0.00'}</h2>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Button
                                onClick={handlePayout}
                                loading={requesting}
                                disabled={wallet?.stripe_onboarding_status !== 'COMPLETED' || wallet?.available_balance < 500}
                                className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-2xl font-black text-sm shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title={
                                    wallet?.stripe_onboarding_status !== 'COMPLETED'
                                        ? 'Complete Stripe onboarding first'
                                        : wallet?.available_balance < 500
                                            ? 'Minimum ₹500 required'
                                            : 'Request payout'
                                }
                            >
                                Request Payout
                            </Button>
                            {(wallet?.stripe_onboarding_status !== 'COMPLETED' || !wallet?.stripe_account_id) ? (
                                <>
                                    <button
                                        onClick={handleStripe}
                                        className="flex items-center gap-2 bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-slate-700 transition-all border border-slate-700"
                                    >
                                        <CreditCard size={18} className="text-primary" />
                                        Connect Stripe
                                    </button>
                                    {/* Test Mode Only Button */}
                                    <button
                                        onClick={async () => {
                                            try {
                                                setLoading(true);
                                                await merchantApi.simulateStripeOnboarding();
                                                toast.success('Simulation Mode: Onboarding Completed!');
                                                fetchInitialData();
                                                fetchTransactions(1);
                                            } catch (err) {
                                                toast.error(err.message);
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="flex items-center gap-2 bg-emerald-900/20 text-emerald-400 px-6 py-4 rounded-2xl font-black text-sm hover:bg-emerald-900/30 transition-all border border-emerald-900/50"
                                    >
                                        <CreditCard size={18} />
                                        Simulate Onboarding
                                    </button>
                                </>
                            ) : (
                                <div className="flex items-center gap-2 px-6 py-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">
                                        Stripe Connected
                                        <span className="opacity-50 ml-1">({wallet.stripe_account_id?.slice(0, 8)}...)</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <WalletIcon size={300} className="absolute -right-20 -bottom-20 text-white/5 rotate-12" />
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-6 font-black border border-amber-100">
                            <TrendingUp size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Today's Earnings</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight italic">₹{earnings?.toLocaleString() || '0.00'}</h3>
                    </div>
                    <div className="pt-8 border-t border-slate-50">
                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-tighter">Settlement Pending: ₹{wallet?.pending_balance?.toLocaleString() || '0.00'}</p>
                    </div>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Activity className="text-primary" size={20} />
                        Recent Activity
                    </h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleDownloadReport('transactions')}
                            className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest px-4 py-2 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all"
                        >
                            Export CSV
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden shadow-slate-200/50">
                    <table className="w-full text-left border-collapse">
                        {/* ... table content ... */}
                        <tbody className="divide-y divide-slate-50">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <p className="text-slate-400 font-bold italic lowercase">your ledger is currently empty.</p>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-black text-slate-900">{tx.description}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(tx.createdAt).toLocaleDateString()} • {tx.balance_type}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter px-2.5 py-1 bg-slate-100 rounded-md">
                                                {tx.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${tx.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                {tx.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-slate-900">
                                            <span className={tx.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                                {tx.amount >= 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {pagination.pages > 1 && (
                        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Page {pagination.page} of {pagination.pages} • {pagination.total} Total Recorded Actions
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="h-8 px-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === pagination.pages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="h-8 px-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Wallet;
