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
    AlertCircle
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

    useEffect(() => {
        fetchReviews(page);
    }, [page]);

    const fetchReviews = async (targetPage = page) => {
        try {
            setLoading(true);
            const response = await merchantApi.getReviews({
                page: targetPage,
                limit: 5 // Fewer reviews per page for clearer focus
            });
            setReviews(response.data || []);
            setTotalPages(response.pagination?.pages || 1);
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
            toast.success('Reply posted successfully');
            setReplyingTo(null);
            setReplyText('');
            fetchReviews(page);
        } catch (error) {
            toast.error('Failed to post reply');
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Feedback</h1>
                    <p className="text-slate-500 mt-1 font-medium lowercase italic">Engage with your buyers and build trust.</p>
                </div>
            </div>

            {/* Overall Rating Simulation */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl">
                <div className="text-center md:text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Merchant Rating</p>
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <h2 className="text-6xl font-black italic tracking-tighter">4.8</h2>
                        <div className="flex flex-col gap-1">
                            <div className="flex gap-1 text-primary">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={20} fill="currentColor" />)}
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Based on {reviews.length} reviews</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    {['Product Quality', 'Shipping Speed', 'Communication', 'Value'].map(label => (
                        <div key={label} className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                            <p className="text-sm font-black italic">Excellent</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-40 bg-white rounded-3xl border border-slate-50 animate-pulse"></div>
                    ))
                ) : reviews.length === 0 ? (
                    <div className="p-20 bg-white rounded-3xl border border-slate-100 text-center shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                            <MessageSquare size={32} />
                        </div>
                        <p className="text-slate-500 font-bold">No reviews yet. Keep selling!</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-xl transition-all duration-500">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 italic font-black">
                                        {review.user_id?.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="text-base font-black text-slate-900">{review.user_id?.full_name || 'Customer'}</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="flex gap-0.5 text-primary">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Purchased Item</p>
                                    <p className="text-xs font-black text-slate-900 tracking-tight">{review.product?.title || 'Unknown Product'}</p>
                                </div>
                            </div>

                            <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                                "{review.comment}"
                            </p>

                            {review.merchant_reply ? (
                                <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-primary space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                                        <CornerDownRight size={14} />
                                        Your Response
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium italic">
                                        {review.merchant_reply.comment}
                                    </p>
                                </div>
                            ) : replyingTo === review._id ? (
                                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <textarea
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-primary/5 min-h-[100px] font-medium"
                                        placeholder="Write a professional reply..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setReplyingTo(null)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all">Cancel</button>
                                        <Button onClick={() => handleReply(review._id)} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest">Post Reply</Button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setReplyingTo(review._id)}
                                    className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-primary transition-all uppercase tracking-widest"
                                >
                                    <MessageSquare size={14} />
                                    Reply to Customer
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="rounded-xl"
                    >
                        Previous
                    </Button>
                    <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setPage(i + 1)}
                                className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${page === i + 1
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="rounded-xl"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Reviews;
