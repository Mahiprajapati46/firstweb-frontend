import React, { useState, useEffect } from 'react';
import {
    Star,
    MessageSquare,
    CornerDownRight,
    User,
    Calendar,
    Filter,
    Search,
    ThumbsUp,
    AlertCircle,
    Activity,
    CheckCircle2,
    Eye,
    EyeOff
} from 'lucide-react';
import merchantApi from '../../api/merchant';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        verifiedCount: 0
    });

    useEffect(() => {
        fetchReviews(page);
    }, [page]);

    const fetchReviews = async (targetPage = page) => {
        try {
            setLoading(true);
            const response = await merchantApi.getReviews({
                page: targetPage,
                limit: 5
            });
            setReviews(response.data || []);
            setTotalPages(response.pagination?.pages || 1);
            if (response.stats) {
                setStats(response.stats);
            }
        } catch (error) {
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (reviewId) => {
        if (!replyText.trim()) return;
        try {
            await merchantApi.replyToReview(reviewId, replyText);
            toast.success('Reply sent successfully');
            setReplyingTo(null);
            setReplyText('');
            fetchReviews(page);
        } catch (error) {
            toast.error('Failed to post response');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary tracking-tight">Customer Reviews</h1>
                    <p className="text-gray-500 mt-1">Reply to customers and manage your public feedback.</p>
                </div>
            </div>

            {/* Rating Summary Card - Professional Dark Theme */}
            <div className="bg-slate-900 rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center gap-12 shadow-2xl shadow-slate-200 relative overflow-hidden border border-slate-800">
                <div className="relative z-10 text-center md:text-left">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Rating Summary</p>
                    <div className="flex items-center justify-center md:justify-start gap-6">
                        <h2 className="text-8xl font-black tracking-tighter italic text-white">{stats.averageRating.toFixed(1)}</h2>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-1 text-emerald-400">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={24} fill={s <= Math.round(stats.averageRating) ? "currentColor" : "none"} />)}
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">From {stats.totalReviews} Verified Reviews</p>
                        </div>
                    </div>
                </div>
                <div className="relative z-10 flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    {[
                        { label: 'Review Quality', value: stats.averageRating >= 4 ? 'Elite' : stats.averageRating >= 2.5 ? 'Standard' : 'Needs Attention' },
                        { label: 'Response Time', value: 'Fast' },
                        { label: 'Verified Sales', value: `${stats.verifiedCount} Total` },
                        { label: 'Merchant Status', value: 'Premium' }
                    ].map(stat => (
                        <div key={stat.label} className="bg-white/5 p-6 rounded-[1.5rem] border border-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                            <p className={`text-sm font-black italic ${stat.label === 'Quality Index' && stats.averageRating < 2.5 ? 'text-rose-400' : 'text-emerald-400'}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>
                <Activity size={320} className="absolute -right-20 -bottom-20 text-emerald-500/5 rotate-12" />
            </div>

            {/* Reviews list */}
            <div className="space-y-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-44 card-premium animate-pulse"></div>
                    ))
                ) : reviews.length === 0 ? (
                    <div className="p-24 card-premium text-center opacity-40">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                            <MessageSquare size={36} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">No reviews found</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className="card-premium p-10 space-y-8 hover:shadow-2xl transition-all group">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-primary border border-gray-100 italic font-black text-xl shadow-sm">
                                        {review.user_id?.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-black text-primary">{review.user_id?.full_name || 'Customer'}</h3>
                                            {review.is_verified_purchase && (
                                                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                                    <CheckCircle2 size={10} />
                                                    <span className="text-[8px] font-black uppercase tracking-wider">Verified Purchase</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex gap-0.5 text-accent">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                                                ))}
                                            </div>
                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">{new Date(review.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col md:items-end gap-3">
                                    <div className="md:text-right">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Reference Asset</p>
                                        <p className="text-sm font-black text-primary tracking-tight">{review.product_id?.title || 'Unknown Product'}</p>
                                    </div>
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${review.is_visible ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                                        {review.is_visible ? <><Eye size={12} /> Public Visibility</> : <><EyeOff size={12} /> Hidden (Toxic)</>}
                                    </div>
                                </div>
                            </div>

                            {review.comment ? (
                                <p className="text-base text-gray-600 font-medium leading-relaxed italic border-l-2 border-gray-100 pl-6">
                                    "{review.comment}"
                                </p>
                            ) : (
                                <div className="flex items-center gap-2 text-gray-400 italic text-sm pl-6 border-l-2 border-gray-50">
                                    <AlertCircle size={14} />
                                    <span>Rating Only Submission</span>
                                </div>
                            )}

                            {review.merchant_reply ? (
                                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 space-y-3 ml-6 md:ml-12 relative">
                                    <div className="flex items-center gap-2 text-[9px] font-black text-accent uppercase tracking-[0.2em]">
                                        <CornerDownRight size={16} />
                                        Official Response
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium italic leading-relaxed">
                                        {review.merchant_reply.comment}
                                    </p>
                                </div>
                            ) : replyingTo === review._id ? (
                                <div className="space-y-4 animate-in slide-in-from-top-4 duration-500 ml-6 md:ml-12">
                                    <textarea
                                        className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary min-h-[120px] shadow-sm transition-all"
                                        placeholder="Write your reply here..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => {
                                                setReplyingTo(null);
                                                setReplyText('');
                                            }}
                                            className="px-6 py-3 text-[10px] font-black text-gray-400 hover:text-primary transition-all uppercase tracking-widest"
                                        >
                                            Discard
                                        </button>
                                        <button
                                            onClick={() => handleReply(review._id)}
                                            className="bg-primary text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:shadow-primary/20 transition-all"
                                        >
                                            Send Reply
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        setReplyingTo(review._id);
                                        setReplyText('');
                                    }}
                                    className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-accent transition-all uppercase tracking-[0.2em] ml-6 md:ml-12 group/btn"
                                >
                                    <MessageSquare size={16} className="group-hover/btn:scale-110 transition-transform" />
                                    Reply
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
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
                                    : 'bg-white text-gray-400 border border-gray-100 hover:border-accent hover:text-accent'
                                    }`}
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

export default Reviews;
