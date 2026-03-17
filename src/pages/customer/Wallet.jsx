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
    CreditCard,
    ShieldCheck
} from 'lucide-react';
import customerApi from '../../api/customer';
import { merchantSchemas } from '../../validations/merchant.schema';
import toast from 'react-hot-toast';
import { z } from 'zod';
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

    const [fieldErrors, setFieldErrors] = useState({});

    const validateField = (name, value) => {
        const payoutData = {
            amount: name === 'amount' ? Number(value) || 0 : Number(withdrawAmount) || 0,
            method: "BANK_TRANSFER",
            bank_details: {
                account_holder_name: "Merchant Owner",
                account_number: name === 'bank_details.account_number' ? value : bankDetails.account_number,
                ifsc_code: name === 'bank_details.ifsc_code' ? value : bankDetails.ifsc_code,
                bank_name: "Primary Bank",
            }
        };

        const result = merchantSchemas.withdrawalRequest.safeParse(payoutData);

        if (result.success) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        } else {
            // Find error for THIS field. Try both full path and leaf name.
            const fieldError = result.error.issues.find(err =>
                err.path.join('.') === name || err.path[err.path.length - 1] === name
            );

            if (fieldError) {
                setFieldErrors(prev => ({ ...prev, [name]: fieldError.message }));
            } else {
                setFieldErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                });
            }
        }
    };

    const handleWithdraw = async () => {
        setFieldErrors({});

        const payoutData = {
            amount: Number(withdrawAmount) || 0,
            method: "BANK_TRANSFER",
            bank_details: {
                account_holder_name: bankDetails.recipient_name || "Merchant Owner",
                account_number: bankDetails.account_number,
                ifsc_code: bankDetails.ifsc_code,
                bank_name: bankDetails.bank_name || bankDetails.recipient_name || "Primary Bank",
            }
        };

        const result = merchantSchemas.withdrawalRequest.safeParse(payoutData);

        if (!result.success) {
            const errors = {};
            result.error.issues.forEach(err => {
                const dotPath = err.path.join('.');
                const leafPath = err.path[err.path.length - 1];
                errors[dotPath] = err.message;
                // Also map to leaf path just in case JSX uses that
                if (leafPath && !errors[leafPath]) {
                    errors[leafPath] = err.message;
                }
            });
            setFieldErrors(errors);
            toast.error("Please provide valid information");
            return;
        }

        if (payoutData.amount > balance) {
            setFieldErrors(prev => ({ ...prev, amount: 'Insufficient wallet balance' }));
            return toast.error('Insufficient wallet balance');
        }

        try {
            setProcessing(true);
            await customerApi.withdrawWallet(payoutData.amount, bankDetails);
            toast.success('Withdrawal request submitted');
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            setBankDetails({ account_number: '', ifsc_code: '', bank_name: '', recipient_name: '' });
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
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="bg-[#f8f9fa] min-h-screen pb-24 pt-12">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 px-2">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Financial Overview</p>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Wallet</h1>
                    </div>
                </div>

                <div className="space-y-12">
                    {/* Top Section: Dashboard Header (Full Width Balance) */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                        <WalletIcon size={20} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Available Balance</h2>
                                        <p className="text-[10px] font-bold text-gray-400">Total funds ready for use</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter tabular-nums leading-none">
                                        ₹ {balance.toLocaleString()}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Wallet Active</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 lg:w-80">
                                <button
                                    onClick={() => setShowTopUpModal(true)}
                                    className="flex-1 py-4 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-secondary transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={14} /> Add Money
                                </button>
                                <button
                                    onClick={() => setShowWithdrawModal(true)}
                                    className="flex-1 py-4 bg-white border border-gray-100 text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <ArrowUpRight size={14} /> Withdraw
                                </button>
                            </div>
                        </div>

                        {/* Quick Summary Bar */}
                        <div className="bg-gray-50/50 border-t border-gray-50 px-8 py-5 flex flex-wrap gap-10">
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Transactions</p>
                                <p className="text-base font-bold text-gray-900">{transactions.length}</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Volume Flow</p>
                                <p className="text-base font-bold text-gray-900">₹{transactions.reduce((acc, tx) => acc + Math.abs(tx.amount), 0).toLocaleString()}</p>
                            </div>
                            <div className="flex-1 hidden md:block" />
                            <div className="flex items-center gap-3 px-6 border-l border-gray-100">
                                <ShieldCheck size={16} className="text-primary" />
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-black text-gray-900 uppercase tracking-widest">Protected Payouts</p>
                                    <p className="text-[9px] font-medium text-gray-400">Funds are held in secure escrow</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Full Width Activity */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                <History size={20} className="text-gray-400" />
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Activity</h2>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            {transactions.length === 0 ? (
                                <div className="py-24 text-center space-y-6">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mx-auto">
                                        <History size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Activity Records</p>
                                        <p className="text-xs text-gray-300">New transactions will appear here after processing.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {transactions.map((tx) => (
                                        <div key={tx.transaction_id} className="p-8 hover:bg-gray-50 transition-colors group">
                                            <div className="flex items-center justify-between gap-8">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${tx.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                        {tx.amount > 0 ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                                    </div>
                                                    <div className="space-y-1.5 focus-within:ring-0">
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <h4 className="text-base font-bold text-gray-900">{tx.description}</h4>
                                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : tx.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                                {tx.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] font-medium text-gray-400">
                                                            {new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <p className={`text-xl font-bold tabular-nums ${tx.amount > 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                                                        {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest group-hover:text-primary transition-colors">{tx.type}</p>
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

            {/* Modals - Standardized */}
            {showTopUpModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowTopUpModal(false)} />
                    <div className="bg-white w-full max-w-md rounded-2xl p-8 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <button onClick={() => setShowTopUpModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Add Money</h2>
                                <p className="text-xs text-gray-500 font-medium">Funds will be added instantly to your wallet.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Amount (INR)</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₹</span>
                                        <input
                                            type="number"
                                            value={topUpAmount}
                                            onChange={(e) => setTopUpAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-10 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-xl text-lg font-bold text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    {[500, 1000, 5000].map(amt => (
                                        <button
                                            key={amt}
                                            onClick={() => setTopUpAmount(amt.toString())}
                                            className="py-2.5 bg-gray-50 text-[10px] font-bold text-gray-500 rounded-lg hover:bg-primary hover:text-white transition-all border border-gray-100"
                                        >
                                            +₹{amt}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleTopUp}
                                    disabled={processing}
                                    className="w-full py-4 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-secondary transition-all disabled:opacity-50"
                                >
                                    {processing ? 'Connecting Gateway...' : 'Continue to Payment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowWithdrawModal(false)} />
                    <div className="bg-white w-full max-w-2xl rounded-2xl p-8 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <button onClick={() => setShowWithdrawModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Left Column: Amount */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Withdraw</h2>
                                    <p className="text-xs text-gray-500 font-medium">To your primary bank account.</p>
                                </div>

                                {Object.keys(fieldErrors).length > 0 && (
                                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Attention Required</p>
                                            <p className="text-[10px] font-medium text-red-500 leading-tight">
                                                Please correct the {Object.keys(fieldErrors).length} error(s) identified in red before proceeding.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                            Amount <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₹</span>
                                            <input
                                                type="number"
                                                value={withdrawAmount}
                                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                                onBlur={(e) => validateField('amount', e.target.value)}
                                                placeholder="Min. 500"
                                                className={`w-full pl-10 pr-6 py-4 bg-gray-50 border-2 ${fieldErrors.amount ? 'border-red-500 bg-red-50/10' : 'border-gray-100'} rounded-xl text-lg font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all`}
                                            />
                                        </div>
                                        {fieldErrors.amount && (
                                            <div className="flex items-center gap-1.5 px-1 py-0.5">
                                                <AlertCircle size={10} className="text-red-500" />
                                                <p className="text-[10px] text-red-500 font-bold tracking-tight">{fieldErrors.amount}</p>
                                            </div>
                                        )}
                                        <div className="flex justify-between px-1">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase">Avail: ₹{balance}</span>
                                            <button onClick={() => { setWithdrawAmount(balance.toString()); validateField('amount', balance); }} className="text-[9px] font-bold text-primary uppercase">Withdraw All</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Bank Details & Action */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">
                                            Bank Details <span className="text-red-500">*</span>
                                        </label>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Account Number"
                                                value={bankDetails.account_number}
                                                onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                                                onBlur={(e) => validateField('bank_details.account_number', e.target.value)}
                                                className={`w-full px-4 py-3 bg-gray-50 border-2 ${fieldErrors['bank_details.account_number'] ? 'border-red-500 bg-red-50/10' : 'border-gray-100'} rounded-lg text-xs font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all`}
                                            />
                                            {fieldErrors['bank_details.account_number'] && (
                                                <div className="flex items-center gap-1.5 px-1 py-0.5">
                                                    <AlertCircle size={10} className="text-red-500" />
                                                    <p className="text-[9px] text-red-500 font-bold tracking-tight">{fieldErrors['bank_details.account_number']}</p>
                                                </div>
                                            )}

                                            <input
                                                type="text"
                                                placeholder="IFSC Code (e.g., SYNB0001234)"
                                                value={bankDetails.ifsc_code}
                                                onChange={(e) => setBankDetails({ ...bankDetails, ifsc_code: e.target.value })}
                                                onBlur={(e) => validateField('bank_details.ifsc_code', e.target.value)}
                                                className={`w-full px-4 py-3 bg-gray-50 border-2 ${fieldErrors['bank_details.ifsc_code'] ? 'border-red-500 bg-red-50/10' : 'border-gray-100'} rounded-lg text-xs font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all`}
                                            />
                                            {fieldErrors['bank_details.ifsc_code'] && (
                                                <div className="flex items-center gap-1.5 px-1 py-0.5">
                                                    <AlertCircle size={10} className="text-red-500" />
                                                    <p className="text-[9px] text-red-500 font-bold tracking-tight">{fieldErrors['bank_details.ifsc_code']}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                        <p className="text-[10px] font-bold text-amber-700 leading-relaxed italic">
                                            Payouts are manually audited and typically processed within 24-48 hours.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleWithdraw}
                                        disabled={processing}
                                        className="w-full py-4 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-secondary transition-all disabled:opacity-50"
                                    >
                                        {processing ? 'Submitting Request...' : 'Send Payout Request'}
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
