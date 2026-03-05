import React, { useState, useEffect } from 'react';
import {
    ShieldAlert,
    CheckCircle2,
    XCircle,
    Trash2,
    Filter,
    Search,
    MessageSquare,
    User,
    Package,
    Calendar,
    Eye,
    EyeOff,
    AlertTriangle,
    Flag
} from 'lucide-react';
import adminApi from '../../api/admin';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED, ALL
    const [riskFilter, setRiskFilter] = useState('all'); // high, all
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchReviews();
        }, 300); // 300ms debounce

        return () => clearTimeout(debounceTimer);
    }, [filter, riskFilter, page, searchQuery]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const params = {
                status: filter === 'ALL' ? '' : filter,
                risk: riskFilter,
                search: searchQuery,
                page,
                limit: 10
            };
            const response = await adminApi.getReviews(params);
            setReviews(response.data || []);
            setTotalPages(response.pagination?.pages || 1);
        } catch (error) {
            toast.error('Failed to load reviews for moderation');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (reviewId, action) => {
        try {
            await adminApi.moderateReview(reviewId, {
                action,
                reason: `Admin Decision: ${action === 'APPROVE' ? 'Manually Approved' : 'Rejected as inappropriate'}`
            });
            toast.success(`Review ${action.toLowerCase()}d successfully`);
            fetchReviews();
        } catch (error) {
            toast.error('Moderation action failed');
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review FOREVER? This cannot be undone.')) return;
        try {
            await adminApi.deleteReview(reviewId);
            toast.success('Review deleted successfully');
            fetchReviews();
        } catch (error) {
            toast.error('Deletion failed');
        }
    };

    const getRiskLevel = (review) => {
        if (!review.is_visible) return { label: 'High Risk', color: 'text-rose-600 bg-rose-50 border-rose-100', icon: ShieldAlert, reason: 'Toxic Content Detected' };
        if (review.rating === 1) return { label: 'Medium Risk', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: AlertTriangle, reason: 'Very Low Rating' };
        return { label: 'Safe', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2, reason: 'Standard Submission' };
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary tracking-tight">Review Moderation Center</h1>
                    <p className="text-gray-500 mt-1">Manage and audit customer feedback across the platform.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">System Operational</span>
                    </div>
                </div>
            </div>

            {/* Filter Hub */}
            <div className="card-premium p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl p-1.5 p-2">
                        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
                            <button
                                key={status}
                                onClick={() => { setFilter(status); setPage(1); }}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${filter === status
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'text-gray-400 hover:text-primary'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 flex-1 max-w-md">
                        <div className="relative flex-1 group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by User, Product or Content..."
                                className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-transparent rounded-2xl text-xs font-medium focus:ring-4 focus:ring-accent/10 focus:border-accent focus:bg-white transition-all outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => { setRiskFilter(riskFilter === 'high' ? 'all' : 'high'); setPage(1); }}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${riskFilter === 'high'
                                ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
                                : 'bg-white border-gray-100 text-gray-400 hover:border-accent hover:text-accent'}`}
                        >
                            <ShieldAlert size={16} />
                            {riskFilter === 'high' ? 'High Risk Only' : 'Risk Map'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Reviews list */}
            <div className="space-y-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-64 card-premium animate-pulse"></div>
                    ))
                ) : reviews.length === 0 ? (
                    <div className="p-24 card-premium text-center opacity-40">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                            <Flag size={36} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">No reviews found</p>
                    </div>
                ) : (
                    reviews.map((review) => {
                        const risk = getRiskLevel(review);
                        const RiskIcon = risk.icon;
                        return (
                            <div key={review._id} className="card-premium p-10 space-y-8 hover:shadow-2xl transition-all group border-l-4 border-transparent hover:border-accent">
                                <div className="flex flex-col lg:flex-row justify-between gap-8">
                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center italic font-black text-xl shadow-lg">
                                                    {review.user_id?.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-black text-primary">{review.user_id?.full_name || 'Customer'}</h3>
                                                    <p className="text-[10px] text-gray-400 font-bold tracking-wider">{review.user_id?.email}</p>
                                                    <div className="flex items-center gap-4 pt-1">
                                                        <div className="flex gap-0.5 text-accent">
                                                            {[...Array(5)].map((_, i) => (
                                                                <StarIcon key={i} size={14} filled={i < review.rating} />
                                                            ))}
                                                        </div>
                                                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">{new Date(review.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex gap-2">
                                                    <div className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${review.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                                        review.status === 'REJECTED' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                                            'bg-primary/5 border-primary/10 text-primary'
                                                        }`}>
                                                        {review.status}
                                                    </div>
                                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${risk.color}`}>
                                                        <RiskIcon size={12} /> {risk.label}
                                                    </div>
                                                </div>
                                                <p className="text-[8px] font-bold text-gray-400 italic">Flag Source: {risk.reason}</p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 relative group/quote">
                                            <p className="text-base text-gray-600 font-medium leading-relaxed italic pr-12">
                                                "{review.comment || 'Rating only - no text provided.'}"
                                            </p>
                                            <MessageSquare size={24} className="absolute right-6 top-6 text-gray-100 group-hover/quote:text-accent group-hover/quote:scale-110 transition-all duration-500" />
                                        </div>
                                    </div>

                                    <div className="lg:w-80 space-y-6 lg:border-l lg:border-gray-100 lg:pl-8">
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Target Asset Details</p>
                                            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                                <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden border border-gray-50">
                                                    <img src={review.product_id?.images?.[0] || '/placeholder-product.png'} alt="Product" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-black text-primary truncate tracking-tight">{review.product_id?.title || 'Unknown Product'}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: ...{review._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 space-y-3">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Moderation Actions</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {review.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(review._id, 'APPROVE')}
                                                            className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-100 transition-all"
                                                        >
                                                            <CheckCircle2 size={16} /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(review._id, 'REJECT')}
                                                            className="flex items-center justify-center gap-2 bg-rose-600 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-100 transition-all"
                                                        >
                                                            <XCircle size={16} /> Reject
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(review._id)}
                                                    className="col-span-2 flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:shadow-lg transition-all"
                                                >
                                                    <Trash2 size={16} /> Delete Review
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination Component */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-8">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="p-3 rounded-xl border border-gray-100 bg-white text-primary disabled:opacity-30 hover:bg-gray-50 transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                        Prev
                    </button>
                    <div className="flex gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setPage(i + 1)}
                                className={`w-11 h-11 rounded-xl text-xs font-black transition-all ${page === i + 1
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'bg-white text-gray-400 border border-gray-100 hover:border-accent hover:text-accent'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="p-3 rounded-xl border border-gray-100 bg-white text-primary disabled:opacity-30 hover:bg-gray-50 transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

const StarIcon = ({ filled }) => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-star"
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

export default AdminReviews;
