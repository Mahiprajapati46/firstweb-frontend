import React from 'react';
import { Copy, Ticket, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const CouponCard = ({ coupon, onApply, isApplied }) => {
    const isExpired = new Date(coupon.expiry_date) < new Date();

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(coupon.code);
        toast.success("Coupon code copied!");
    };

    return (
        <div className={`relative flex group ${isExpired ? 'opacity-60 grayscale' : ''}`}>
            {/* Left Side (Main Info) */}
            <div className={`flex-1 bg-white border border-r-0 border-[#e5e5d1] rounded-l-2xl p-5 flex flex-col justify-between min-h-[140px] relative overflow-hidden transition-all duration-300 ${isApplied ? 'bg-primary/5 border-primary/20' : ''}`}>
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Ticket size={80} className="text-[#c19a6b]" />
                </div>

                <div className="space-y-1 relative z-10">
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${isApplied ? 'bg-primary text-white' : 'bg-[#fdfaf5] text-[#9f8170]'}`}>
                            {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                        </span>
                        {isApplied && <span className="text-[10px] font-bold text-primary flex items-center gap-1"><Check size={10} /> Applied</span>}
                    </div>
                    <h3 className="text-xl font-black text-primary tracking-tight">{coupon.code}</h3>
                    <p className="text-xs text-gray-500 font-medium line-clamp-2">{coupon.description}</p>
                </div>

                <div className="pt-4 border-t border-dashed border-[#e5e5d1] mt-auto">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#c19a6b]">
                        Expires: {new Date(coupon.expiry_date).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Perforation Line - CSS Magic */}
            <div className="w-4 bg-[#fdfaf5] relative flex flex-col justify-between items-center my-2">
                <div className="absolute top-[-8px] w-4 h-4 rounded-full bg-[#fdfaf5] border-b border-[#e5e5d1]"></div>
                <div className="w-[1px] h-full border-l-2 border-dashed border-[#e5e5d1]/50"></div>
                <div className="absolute bottom-[-8px] w-4 h-4 rounded-full bg-[#fdfaf5] border-t border-[#e5e5d1]"></div>
            </div>

            {/* Right Side (Action) */}
            <div className={`w-16 bg-white border border-l-0 border-[#e5e5d1] rounded-r-2xl flex flex-col items-center justify-center gap-4 transition-all duration-300 ${isApplied ? 'bg-primary/5 border-primary/20' : ''}`}>
                <button
                    onClick={handleCopy}
                    className="w-8 h-8 rounded-full bg-[#fdfaf5] flex items-center justify-center text-[#9f8170] hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Copy Code"
                >
                    <Copy size={14} />
                </button>

                <button
                    onClick={() => !isExpired && onApply(coupon.code)}
                    disabled={isExpired || isApplied}
                    className={`writing-vertical text-xs font-black uppercase tracking-widest py-4 transition-colors ${isApplied
                            ? 'text-primary cursor-default'
                            : isExpired
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-[#c19a6b] hover:text-primary cursor-pointer'
                        }`}
                    style={{ writingMode: 'vertical-rl' }}
                >
                    {isApplied ? 'Applied' : isExpired ? 'Expired' : 'Apply'}
                </button>
            </div>
        </div>
    );
};

export default CouponCard;
