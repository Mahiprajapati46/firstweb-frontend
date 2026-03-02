import React, { useState } from 'react';
import { X, Star, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
import customerApi from '../../api/customer';
import toast from 'react-hot-toast';

const ReviewModal = ({ isOpen, onClose, orderItem, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a star rating');
            return;
        }

        try {
            setLoading(true);
            const response = await customerApi.submitReview({
                order_item_id: orderItem.order_item_id,
                rating,
                comment
            });

            if (response.data) {
                toast.success(response.message || 'Review submitted!');
                onSuccess(response.data);
                onClose();
            }
        } catch (error) {
            toast.error(error.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    const getPlaceholder = () => {
        if (rating >= 4) return "What did you love about this item? Share your positive experience...";
        if (rating === 3) return "How could we improve your experience with this item?";
        return "Please share the details of the issues you faced so we can resolve them...";
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose}></div>
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* Header Section */}
                <div className="px-8 pt-8 pb-6 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#10b981]/10 rounded-xl flex items-center justify-center text-[#10b981]">
                            <Star size={20} fill="currentColor" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
                            <p className="text-xs text-gray-500 font-medium">Share your thoughts on this item</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar px-8 py-8">
                    <form onSubmit={handleSubmit} className="space-y-10">

                        {/* Item Card */}
                        <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border border-gray-100 shrink-0">
                                <img
                                    src={orderItem.images?.[0] || orderItem.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'}
                                    className="w-full h-full object-cover"
                                    alt={orderItem.product_name}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-800 truncate uppercase tracking-tight">{orderItem.product_name}</h4>
                                <div className="mt-1">
                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase border border-green-100/50">Verified Purchase</span>
                                </div>
                            </div>
                        </div>

                        {/* Rating Selection */}
                        <div className="space-y-4 text-center">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Rate the quality</label>
                            <div className="flex justify-center gap-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                        className="transition-transform active:scale-90"
                                    >
                                        <Star
                                            size={48}
                                            fill={(hover || rating) >= star ? "#10b981" : "none"}
                                            stroke={(hover || rating) >= star ? "#10b981" : "#d1d5db"}
                                            strokeWidth={1.5}
                                        />
                                    </button>
                                ))}
                            </div>
                            {rating > 0 && (
                                <p className="text-sm font-bold text-[#10b981]">
                                    {rating === 5 ? "Excellent!" :
                                        rating === 4 ? "Very Good" :
                                            rating === 3 ? "Good" :
                                                rating === 2 ? "Below Average" : "Poor"}
                                </p>
                            )}
                        </div>

                        {/* Comment Field */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Your review</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                maxLength={500}
                                placeholder={getPlaceholder()}
                                className="w-full px-6 py-5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-green-50 focus:border-[#10b981] min-h-[160px] shadow-sm transition-all resize-none leading-relaxed"
                            />
                        </div>

                        {/* Moderation Note */}
                        <div className="flex items-start gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                            <ShieldCheck size={20} className="text-[#10b981] shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-800 font-bold uppercase tracking-widest">Review guidelines</p>
                                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                                    To keep our platform safe and professional, all reviews are checked for inappropriate language. Helpful reviews are posted instantly.
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pb-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#10b981] text-white py-5 rounded-2xl text-sm font-bold shadow-lg shadow-[#10b981]/10 hover:bg-[#059669] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                            >
                                {loading ? "Submitting..." : "Submit Review"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
