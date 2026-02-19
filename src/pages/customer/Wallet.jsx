import React, { useState, useEffect } from 'react';
import {
    Wallet as WalletIcon,
    ArrowUpRight,
    ArrowDownLeft,
    History,
    Plus,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    Loader2,
    X,
    Building2,
    CreditCard
} from 'lucide-react';
import customerApi from '../../api/customer';
import toast from 'react-hot-toast';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const Wallet = () => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [bankDetails, setBankDetails] = useState({ account_number: '', ifsc_code: '', bank_name: '', recipient_name: '' });
    const [processing, setProcessing] = useState(false);

    const fetchWalletData = async () => {
        try {
            const response = await customerApi.getWallet();
            setBalance(response.data.balance);
            setTransactions(response.data.transactions);
        } catch (error) {
            toast.error('Failed to load wallet data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    const handleTopUp = async () => {
        if (!topUpAmount || isNaN(topUpAmount) || topUpAmount <= 0) {
            return toast.error('Please enter a valid amount');
        }

        try {
            setProcessing(true);
            const response = await customerApi.topUpWallet(Number(topUpAmount));
            if (response.data.url) {
                window.location.href = response.data.url;
            } else {
                toast.error('Failed to initiate top-up');
            }
        } catch (error) {
            toast.error(error.message || 'Payment initiation failed');
        } finally {
            setProcessing(false);
        }
    };

    const handleWithdraw = async () => {
        if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
            return toast.error('Please enter a valid amount');
        }
        if (withdrawAmount > balance) {
            return toast.error('Insufficient balance');
        }
        if (!bankDetails.account_number || !bankDetails.ifsc_code) {
            return toast.error('Account number and IFSC code are required');
        }

        try {
            setProcessing(true);
            await customerApi.withdrawWallet(Number(withdrawAmount), bankDetails);
            toast.success('Withdrawal request submitted');
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            fetchWalletData();
        } catch (error) {
            toast.error(error.message || 'Withdrawal failed');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle2 size={14} className="text-emerald-500" />;
            case 'PENDING': return <Clock size={14} className="text-amber-500" />;
            case 'FAILED': return <AlertCircle size={14} className="text-rose-500" />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fdfaf5]">
                <Loader2 size={32} className="animate-spin text-[#c19a6b]" />
            </div>
        );
    }

    return (
        <div className="bg-[#fdfaf5] min-h-screen pb-32 pt-12">
            <div className="container-custom max-w-5xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c19a6b]">Your Assets</p>
                        <h1 className="text-7xl font-black text-primary tracking-tighter italic serif">Digital Wallet</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Balance & Actions */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-primary rounded-[3.5rem] p-10 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-white/10 transition-colors" />
                            <div className="relative z-10 space-y-12">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                        <WalletIcon size={24} className="text-white opacity-80" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Available Balance</span>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-5xl font-black tracking-tighter tabular-nums italic">₹ {balance.toLocaleString()}</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">INR Wallet</p>
                                </div>
                                <div className="pt-8 flex gap-4">
                                    <button
                                        onClick={() => setShowTopUpModal(true)}
                                        className="flex-1 py-4 bg-white text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#fdfaf5] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus size={14} /> Top Up
                                    </button>
                                    <button
                                        onClick={() => setShowWithdrawModal(true)}
                                        className="flex-1 py-4 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ArrowUpRight size={14} /> Withdraw
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-[#e5e5d1]/50 space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-[#e5e5d1]/30 pb-4">Wallet Summary</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-[#9f8170]">Total Volume</span>
                                        <span className="text-primary">₹ {transactions.reduce((acc, tx) => acc + Math.abs(tx.amount), 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-[#9f8170]">Transactions</span>
                                        <span className="text-primary">{transactions.length}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#fdfaf5]/80 rounded-2xl p-6 space-y-4 border border-[#c19a6b10]">
                                <div className="flex items-center gap-2 text-primary">
                                    <AlertCircle size={14} className="opacity-50" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Security & Trust</span>
                                </div>
                                <p className="text-[9px] font-medium text-[#9f8170] italic leading-relaxed">
                                    Your funds are managed by our secure backend "Source of Truth". This prevents tampering and ensures every transaction is verified against the bank.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <History size={18} className="text-[#c19a6b]" />
                                <h2 className="text-xl font-black text-primary tracking-tight">Recent Activity</h2>
                            </div>
                        </div>

                        <div className="bg-white rounded-[3.5rem] border border-[#e5e5d1]/50 overflow-hidden shadow-2xl shadow-[#c19a6b05]">
                            {transactions.length === 0 ? (
                                <div className="p-20 text-center space-y-6">
                                    <div className="w-16 h-16 bg-[#fdfaf5] rounded-[2rem] flex items-center justify-center text-[#c19a6b] mx-auto opacity-50">
                                        <History size={24} />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[#9f8170]">No transaction records found</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#e5e5d1]/30">
                                    {transactions.map((tx) => (
                                        <div key={tx.transaction_id} className="p-8 hover:bg-[#fdfaf5]/50 transition-colors group">
                                            <div className="flex items-center justify-between gap-6">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.amount > 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                                                        }`}>
                                                        {tx.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="text-sm font-black text-primary tracking-tight">{tx.description}</h4>
                                                            <div className="status-badge flex items-center gap-1.5 px-2 py-0.5 bg-[#fdfaf5] rounded-full">
                                                                {getStatusIcon(tx.status)}
                                                                <span className="text-[8px] font-black uppercase tracking-widest text-[#9f8170]">{tx.status}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] font-medium text-[#9f8170] italic">
                                                            {new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-lg font-black tracking-tighter tabular-nums italic ${tx.amount > 0 ? 'text-emerald-500' : 'text-primary'
                                                        }`}>
                                                        {tx.amount > 0 ? '+' : ''}₹ {Math.abs(tx.amount).toLocaleString()}
                                                    </p>
                                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#c19a6b] opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {tx.type}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Up Modal */}
            {showTopUpModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm" onClick={() => setShowTopUpModal(false)} />
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-12 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <button onClick={() => setShowTopUpModal(false)} className="absolute top-8 right-8 text-[#9f8170] hover:text-primary transition-colors">
                            <X size={20} />
                        </button>
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c19a6b]">Balance</p>
                                <h2 className="text-4xl font-black text-primary tracking-tighter italic serif">Add Funds</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">Amount (INR)</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black serif italic text-xl">₹</span>
                                        <input
                                            type="number"
                                            value={topUpAmount}
                                            onChange={(e) => setTopUpAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-12 pr-6 py-6 bg-[#fdfaf5] border-none rounded-2xl text-xl font-black text-primary placeholder:text-[#c19a6b]/30 focus:ring-2 focus:ring-[#c19a6b]/20"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {[500, 1000, 5000].map(amt => (
                                        <button
                                            key={amt}
                                            onClick={() => setTopUpAmount(amt.toString())}
                                            className="py-3 bg-[#fdfaf5] text-[10px] font-black uppercase tracking-widest text-[#9f8170] rounded-xl hover:bg-[#c19a6b] hover:text-white transition-all"
                                        >
                                            +₹{amt}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleTopUp}
                                    disabled={processing}
                                    className="w-full py-6 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
                                >
                                    {processing ? 'Processing...' : 'Proceed to Payment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm" onClick={() => setShowWithdrawModal(false)} />
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <button onClick={() => setShowWithdrawModal(false)} className="absolute top-8 right-8 text-[#9f8170] hover:text-primary transition-colors">
                            <X size={20} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c19a6b]">Payout</p>
                                    <h2 className="text-4xl font-black text-primary tracking-tighter italic serif">Withdraw</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">Amount to Withdraw</label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black serif italic text-xl">₹</span>
                                            <input
                                                type="number"
                                                value={withdrawAmount}
                                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full pl-12 pr-6 py-6 bg-[#fdfaf5] border-none rounded-2xl text-xl font-black text-primary placeholder:text-[#c19a6b]/30 focus:ring-2 focus:ring-[#c19a6b]/20"
                                            />
                                        </div>
                                        <div className="flex justify-between px-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#9f8170]">Available: ₹{balance}</span>
                                            <button onClick={() => setWithdrawAmount(balance.toString())} className="text-[9px] font-black uppercase tracking-widest text-[#c19a6b]">Max</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8 pt-4 md:pt-14">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-[#9f8170] ml-2">Account Number</label>
                                            <input
                                                type="text"
                                                value={bankDetails.account_number}
                                                onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                                                className="w-full px-6 py-4 bg-[#fdfaf5] border-none rounded-xl text-xs font-bold text-primary focus:ring-2 focus:ring-[#c19a6b]/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-[#9f8170] ml-2">IFSC Code</label>
                                            <input
                                                type="text"
                                                value={bankDetails.ifsc_code}
                                                onChange={(e) => setBankDetails({ ...bankDetails, ifsc_code: e.target.value })}
                                                className="w-full px-6 py-4 bg-[#fdfaf5] border-none rounded-xl text-xs font-bold text-primary focus:ring-2 focus:ring-[#c19a6b]/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-6 bg-amber-50 rounded-2xl space-y-3">
                                        <div className="flex items-center gap-2 text-amber-600">
                                            <Building2 size={14} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Manual Verification</span>
                                        </div>
                                        <p className="text-[10px] font-medium text-amber-800 italic leading-relaxed">
                                            Admin will manually verify these bank details. Ensure the IFSC and Account Number are exact to avoid delays.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleWithdraw}
                                        disabled={processing || !withdrawAmount || Number(withdrawAmount) > balance}
                                        className="w-full py-6 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
                                    >
                                        {processing ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Wallet;
