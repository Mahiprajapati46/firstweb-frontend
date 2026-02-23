import React, { useState, useEffect, useCallback } from 'react';
import {
    History,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    User,
    Store,
    Calendar,
    ChevronLeft,
    ChevronRight,
    RefreshCcw,
    Download,
    Eye,
    Tag,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    CreditCard,
    Wallet as WalletIcon,
    ArrowRightLeft,
    Shield
} from 'lucide-react';
import adminApi from '../../api/admin';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const AdminTransactions = () => {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
    const [role, setRole] = useState('MERCHANT'); // 'MERCHANT' or 'CUSTOMER'

    // Detailed View State
    const [selectedTx, setSelectedTx] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        date_from: '',
        date_to: ''
    });

    const fetchTransactions = useCallback(async (pageNumber = 1) => {
        try {
            setLoading(true);
            const params = {
                role,
                page: pageNumber,
                limit: 20,
                ...filters
            };
            const response = await adminApi.getAllTransactions(params);
            setTransactions(response.data.transactions || []);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            toast.error(error.message || 'Failed to load transactions');
        } finally {
            setLoading(false);
        }
    }, [role, filters]);

    useEffect(() => {
        fetchTransactions(1);
    }, [fetchTransactions]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({
            type: '',
            status: '',
            date_from: '',
            date_to: ''
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'COMPLETED':
            case 'SUCCESS':
                return <span className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg bg-green-50 text-green-600 uppercase tracking-tighter"><CheckCircle2 size={10} /> {status}</span>;
            case 'PENDING':
            case 'INITIATED':
                return <span className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg bg-orange-50 text-orange-600 uppercase tracking-tighter"><Clock size={10} /> {status}</span>;
            case 'FAILED':
                return <span className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg bg-red-50 text-red-600 uppercase tracking-tighter"><XCircle size={10} /> {status}</span>;
            default:
                return <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-gray-50 text-gray-400 uppercase tracking-tighter">{status}</span>;
        }
    };

    const getTypeIcon = (type) => {
        if (['TOP_UP', 'ORDER_CREDIT', 'REFUND', 'ADJUSTMENT'].includes(type)) {
            return <ArrowUpRight size={14} className="text-green-500" />;
        }
        return <ArrowDownRight size={14} className="text-red-500" />;
    };

    const merchantTypes = [
        { value: 'ORDER_CREDIT', label: 'Order Credit' },
        { value: 'COMMISSION', label: 'Commission' },
        { value: 'REFUND', label: 'Refund' },
        { value: 'PAYOUT', label: 'Payout' },
        { value: 'ADJUSTMENT', label: 'Adjustment' }
    ];

    const customerTypes = [
        { value: 'ORDER_PAYMENT', label: 'Order Payment' },
        { value: 'TOP_UP', label: 'Top-Up' },
        { value: 'WITHDRAWAL', label: 'Withdrawal' },
        { value: 'ADJUSTMENT', label: 'Adjustment' }
    ];

    const getPaymentModeContent = (tx) => {
        const provider = tx.order_id?.payment?.provider || 'WALLET';
        const gatewayId = tx.order_id?.payment?.transaction_id || tx.stripe_transfer_id || 'INTERNAL';

        if (provider.toLowerCase().includes('stripe')) {
            return (
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-blue-600 font-bold text-[10px] uppercase tracking-tighter">
                        <CreditCard size={12} /> Stripe
                    </div>
                    <span className="text-[9px] text-gray-400 font-mono truncate max-w-[100px] mt-0.5">{gatewayId}</span>
                </div>
            );
        }
        return (
            <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-accent font-bold text-[10px] uppercase tracking-tighter">
                    <WalletIcon size={12} /> Wallet
                </div>
                <span className="text-[9px] text-gray-400 font-mono truncate max-w-[100px] mt-0.5">{gatewayId}</span>
            </div>
        );
    };

    const fmt = (val) => Number(val || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

    const TransactionDetailModal = ({ tx, onClose }) => {
        if (!tx) return null;

        const isOrderRelated = ['ORDER_CREDIT', 'COMMISSION', 'REFUND', 'ORDER_PAYMENT'].includes(tx.type);
        const couponCode = tx.order_id?.pricing?.coupon_code;
        const discount = tx.order_id?.pricing?.discount;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                    {/* Modal Header */}
                    <div className="bg-gray-50 px-8 py-6 border-b flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-primary tracking-tight">Transaction Inspector</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Ref: {tx._id}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-gray-200 transition-all">
                            <XCircle size={24} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
                        {/* Summary Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="card-premium p-4 bg-gray-50/50">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                {getStatusBadge(tx.status)}
                            </div>
                            <div className="card-premium p-4 bg-gray-50/50">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Type</p>
                                <span className="text-xs font-black text-primary uppercase">{tx.type.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="card-premium p-4 bg-gray-50/50">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment</p>
                                <span className="text-xs font-black text-blue-600 uppercase">{tx.order_id?.payment?.provider || 'WALLET'}</span>
                            </div>
                            <div className="card-premium p-4 bg-gray-50/50">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Currency</p>
                                <span className="text-xs font-black text-primary uppercase">INR</span>
                            </div>
                        </div>

                        {/* Financial Ledger */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                <Shield size={16} /> Financial Breakdown
                            </h3>
                            <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Gross Amount</span>
                                    <span className="font-bold text-primary">{fmt(isOrderRelated ? (tx.sub_order_id?.sub_total || tx.order_id?.pricing?.total || Math.abs(tx.amount)) : tx.amount)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between items-center text-sm text-green-600">
                                        <span className="font-medium flex items-center gap-1.5"><Tag size={14} /> Coupon Code ({couponCode})</span>
                                        <span className="font-bold">-{fmt(discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-sm text-red-500 pt-3 border-t border-gray-100">
                                    <span className="font-medium">Platform Fees / Adjustments</span>
                                    <span className="font-bold">
                                        {tx.type === 'COMMISSION' ? '-' + fmt(Math.abs(tx.amount)) : (tx.type === 'ORDER_CREDIT' ? '-' + fmt((tx.sub_order_id?.sub_total || tx.amount / 0.9) - tx.amount) : fmt(0))}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-lg pt-3">
                                    <span className="font-black text-primary uppercase tracking-tighter">Net Settlement</span>
                                    <span className={`font-black ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.amount > 0 ? '+' : ''}{fmt(tx.amount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Order & Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                    <RefreshCcw size={16} /> Order Info
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Order #</span>
                                        <span className="font-bold text-primary">#{tx.order_id?.order_number || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Timestamp</span>
                                        <span className="font-bold text-primary">{new Date(tx.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Order Status</span>
                                        <span className="font-bold text-primary uppercase">{tx.order_id?.status || tx.sub_order_id?.status || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                    <ArrowRightLeft size={16} /> Gateway Details
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Provider</span>
                                        <span className="font-bold text-primary">{tx.order_id?.payment?.provider || 'INTERNAL WALLET'}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 mt-1">
                                        <span className="text-gray-400 text-xs">Gateway Tx ID:</span>
                                        <span className="font-mono text-[10px] break-all bg-gray-50 p-2 rounded-lg text-gray-600 border">
                                            {tx.order_id?.payment?.transaction_id || tx.stripe_transfer_id || 'INTERNAL_LEDGER_ENTRY'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Audit Trail Note */}
                        <div className="bg-accent/5 p-4 rounded-2xl border border-accent/10">
                            <p className="text-xs text-accent font-medium leading-relaxed italic">
                                "This record is cryptographically linked to Order #{tx.order_id?.order_number}. Any modifications to this ledger entry will be flagged in the system audit logs."
                            </p>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="px-8 py-6 bg-gray-50 border-t flex justify-end gap-3">
                        <Button
                            className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                            onClick={onClose}
                        >
                            Close Inspector
                        </Button>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary tracking-tight">Financial Audit Trail</h1>
                    <p className="text-gray-500 mt-1">Universal ledger of all wallet movements and platform commissions.</p>
                </div>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
                    <button
                        onClick={() => setRole('MERCHANT')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === 'MERCHANT' ? 'bg-white shadow text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Store size={14} />
                        Merchant Flows
                    </button>
                    <button
                        onClick={() => setRole('CUSTOMER')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === 'CUSTOMER' ? 'bg-white shadow text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <User size={14} />
                        Customer Movements
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card-premium p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Type</label>
                        <select
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-accent"
                        >
                            <option value="">All Types</option>
                            {(role === 'MERCHANT' ? merchantTypes : customerTypes).map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Status</label>
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-accent"
                        >
                            <option value="">All Statuses</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="PENDING">Pending</option>
                            <option value="FAILED">Failed</option>
                            <option value="INITIATED">Initiated</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">From Date</label>
                        <input
                            type="date"
                            name="date_from"
                            value={filters.date_from}
                            onChange={handleFilterChange}
                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-accent"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">To Date</label>
                        <input
                            type="date"
                            name="date_to"
                            value={filters.date_to}
                            onChange={handleFilterChange}
                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-accent"
                        />
                    </div>

                    <div className="flex items-end gap-2">
                        <Button
                            className="flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest"
                            onClick={resetFilters}
                        >
                            Reset
                        </Button>
                        <Button
                            className="flex-1 bg-primary text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest"
                            onClick={() => fetchTransactions(1)}
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="card-premium overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {role === 'MERCHANT' ? 'Merchant' : 'Customer'}
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                {role === 'MERCHANT' && (
                                    <>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-red-400">Fee</th>
                                    </>
                                )}
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mode / Gateway</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ref / Order</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Settlement Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={role === 'MERCHANT' ? '10' : '8'} className="px-6 py-4"><div className="h-10 bg-gray-50 rounded-xl"></div></td>
                                    </tr>
                                ))
                            ) : transactions.length > 0 ? (
                                transactions.map((tx) => {
                                    // Industry Logic: For both Credits and Commissions, we show the Gross order value for context
                                    const isOrderRelated = ['ORDER_CREDIT', 'COMMISSION', 'REFUND'].includes(tx.type);
                                    const gross = isOrderRelated ? (tx.sub_order_id?.sub_total || tx.order_id?.pricing?.total || Math.abs(tx.amount)) : tx.amount;

                                    // Explicitly show the Fee if it's a commission or order credit
                                    let fee = 0;
                                    if (tx.type === 'COMMISSION') fee = Math.abs(tx.amount);
                                    else if (tx.type === 'ORDER_CREDIT') fee = gross - tx.amount;

                                    return (
                                        <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                                                        {(role === 'MERCHANT' ? (tx.merchant_id?.store_name || 'M') : (tx.user_id?.full_name || 'C')).charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-primary truncate">
                                                            {role === 'MERCHANT' ? tx.merchant_id?.store_name : tx.user_id?.full_name}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-medium truncate uppercase tracking-widest">
                                                            {role === 'MERCHANT' ? 'Store ID: ' + tx.merchant_id?._id?.slice(-6) : tx.user_id?.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-lg ${Math.abs(tx.amount) === tx.amount ? 'bg-green-50' : 'bg-red-50'}`}>
                                                        {getTypeIcon(tx.type)}
                                                    </div>
                                                    <span className="text-[11px] font-black uppercase tracking-tight text-primary whitespace-nowrap">{tx.type.replace(/_/g, ' ')}</span>
                                                </div>
                                            </td>

                                            {role === 'MERCHANT' && (
                                                <>
                                                    <td className="px-6 py-4">
                                                        <p className="text-xs font-bold text-gray-600">
                                                            {isOrderRelated ? fmt(gross) : '—'}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-xs font-bold text-red-500">
                                                            {fee > 0 ? '-' + fmt(fee) : (isOrderRelated ? fmt(0) : '—')}
                                                        </p>
                                                    </td>
                                                </>
                                            )}

                                            <td className="px-6 py-4">
                                                <p className={`text-sm font-black ${Math.abs(tx.amount) === tx.amount || tx.type === 'TOP_UP' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {tx.amount > 0 ? '+' : ''}{fmt(tx.amount)}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                {getPaymentModeContent(tx)}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-mono font-bold text-gray-600">
                                                        {tx.order_id ? (
                                                            typeof tx.order_id === 'object'
                                                                ? (tx.order_id.order_number ? '#' + tx.order_id.order_number : '#' + (tx.order_id._id?.slice(-8) || tx.order_id))
                                                                : '#' + tx.order_id.slice(-8)
                                                        ) : tx.sub_order_id ? (
                                                            'SO-' + (typeof tx.sub_order_id === 'object' ? (tx.sub_order_id._id?.slice(-8) || tx.sub_order_id) : tx.sub_order_id?.slice(-8))
                                                        ) : (
                                                            'TX-' + tx._id?.slice(-8)
                                                        )}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium truncate max-w-[120px]">
                                                        {tx.description}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    {getStatusBadge(tx.status)}
                                                    {tx.order_id?.pricing?.coupon_code && (
                                                        <div className="flex items-center gap-1 text-[9px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 uppercase tracking-tighter w-fit">
                                                            <Tag size={10} /> {tx.order_id.pricing.coupon_code}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col whitespace-nowrap">
                                                    <span className="text-xs font-bold text-primary">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">{new Date(tx.createdAt).toLocaleTimeString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => {
                                                        setSelectedTx(tx);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-gray-100 text-gray-400 hover:text-accent transition-all"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={role === 'MERCHANT' ? '10' : '8'} className="px-6 py-20 text-center">
                                        <History size={48} className="mx-auto text-gray-200 mb-4" />
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No transactions found matching your criteria</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Showing page {pagination.page} of {pagination.pages} ({pagination.total} Total)
                        </p>
                        <div className="flex gap-2">
                            <Button
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-accent disabled:opacity-50"
                                onClick={() => fetchTransactions(pagination.page - 1)}
                                disabled={pagination.page === 1}
                            >
                                <ChevronLeft size={18} />
                            </Button>
                            <Button
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-accent disabled:opacity-50"
                                onClick={() => fetchTransactions(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                            >
                                <ChevronRight size={18} />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Transaction Inspection Modal */}
            {isModalOpen && (
                <TransactionDetailModal
                    tx={selectedTx}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedTx(null);
                    }}
                />
            )}
        </div>
    );
};

export default AdminTransactions;
