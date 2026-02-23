import React, { useState, useEffect } from 'react';
import { Check, Copy, Zap, Clock, ChevronRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const CouponCard = ({ coupon, onApply, isApplied }) => {
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');

    const isExpired = new Date(coupon.expiry_date) < new Date();
    const isPercentage = coupon.discount_type === 'PERCENTAGE';

    // Countdown timer
    useEffect(() => {
        if (isExpired) return;
        const update = () => {
            const diff = new Date(coupon.expiry_date) - new Date();
            if (diff <= 0) { setTimeLeft('Expired'); return; }
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            if (d > 0) setTimeLeft(`${d}d ${h}h left`);
            else {
                const m = Math.floor((diff % 3600000) / 60000);
                setTimeLeft(h > 0 ? `${h}h ${m}m left` : `${m}m left`);
            }
        };
        update();
        const interval = setInterval(update, 60000);
        return () => clearInterval(interval);
    }, [coupon.expiry_date, isExpired]);

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        toast.success('Code copied!', { icon: '🎫' });
        setTimeout(() => setCopied(false), 2000);
    };

    // Usage progress
    const usagePercent = coupon.usage_limit
        ? Math.min(100, ((coupon.used_count || 0) / coupon.usage_limit) * 100)
        : 0;
    const usageRemaining = coupon.usage_limit
        ? coupon.usage_limit - (coupon.used_count || 0)
        : null;

    return (
        <div className={`relative bg-white border rounded-2xl p-5 transition-all ${isExpired ? 'opacity-50 grayscale' : 'hover:border-primary/30 hover:shadow-md'}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
                            {isPercentage ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                        </span>
                        {isApplied && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded uppercase">
                                <Check size={10} /> Applied
                            </span>
                        )}
                    </div>

                    <h3 className="text-xl font-black text-gray-900 mb-1">{coupon.code}</h3>
                    {coupon.description && (
                        <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                            {coupon.description}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        {coupon.min_order_amount > 0 && (
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                Min order: ₹{coupon.min_order_amount}
                            </span>
                        )}
                        <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-tight ${timeLeft.includes('m') && !timeLeft.includes('h') ? 'text-orange-500' : 'text-gray-400'}`}>
                            <Clock size={12} /> {isExpired ? 'Expired' : timeLeft}
                        </span>
                    </div>

                    {/* Simple Usage Bar */}
                    {coupon.usage_limit && (
                        <div className="mt-4">
                            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${usagePercent}%` }}
                                />
                            </div>
                            <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">
                                {usageRemaining} uses remaining
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center gap-3">
                    <button
                        onClick={handleCopy}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${copied ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>

                    {!isExpired && !isApplied && (
                        <button
                            onClick={() => onApply(coupon.code)}
                            className="bg-primary text-white text-[10px] font-black px-4 py-2 rounded-lg uppercase tracking-wider hover:bg-secondary transition-all shadow-lg shadow-primary/10"
                        >
                            Apply
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CouponCard;
