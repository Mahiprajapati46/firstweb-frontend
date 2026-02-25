import React, { useState, useEffect } from 'react';
import { Ticket, Sparkles, ShoppingBag, ArrowRight, Info, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import customerApi from '../../api/customer';
import CouponCard from '../../components/customer/CouponCard';
import toast from 'react-hot-toast';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await customerApi.getCoupons();
            if (response.success) {
                setCoupons(response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
            toast.error('Failed to load offers');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] py-20 px-6">
                <div className="max-w-6xl mx-auto animate-pulse">
                    <div className="h-10 bg-gray-200 rounded-full w-48 mb-12"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-48 bg-white rounded-3xl border border-gray-100"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] py-12 md:py-20 animate-in fade-in duration-700">
            <div className="max-w-6xl mx-auto px-4 md:px-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-2">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 bg-accent/5 border border-accent/20 px-4 py-1.5 rounded-full">
                            <Sparkles size={14} className="text-accent" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Exclusive Collective</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tighter">
                            Marketplace <span className="text-accent font-serif italic font-normal">Offers.</span>
                        </h1>
                        <p className="text-gray-500 font-medium max-w-sm">
                            Discover premium discounts and exclusive vouchers across India's finest manufacturers.
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hidden lg:flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-primary/30">
                            <Info size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">Coupon Tip</p>
                            <p className="text-sm font-bold text-primary">Codes apply at checkout automatically.</p>
                        </div>
                    </div>
                </div>

                {coupons.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200 shadow-sm">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Ticket size={40} className="text-gray-200" />
                        </div>
                        <h2 className="text-2xl font-bold text-primary mb-3">No active offers right now</h2>
                        <p className="text-gray-400 max-w-sm mx-auto mb-10">Check back soon for new discounts and seasonal sales from our partners.</p>
                        <Link to="/products" className="btn-boutique-primary inline-flex scale-110">
                            Back to Marketplace
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {coupons.map(coupon => (
                                <CouponCard
                                    key={coupon._id}
                                    coupon={coupon}
                                    onApply={(code) => {
                                        toast.success('Code copied! Apply it in your cart.');
                                    }}
                                />
                            ))}
                        </div>

                        {/* Marketplace CTA */}
                        <div className="mt-20 bg-primary rounded-[3rem] p-12 relative overflow-hidden shadow-2xl shadow-primary/20">
                            <div className="absolute top-0 right-0 p-12 opacity-5 text-white">
                                <ShoppingBag size={200} strokeWidth={1} />
                            </div>
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <h3 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">Ready to use your discount?</h3>
                                <p className="text-white/50 font-medium max-w-md mb-10">Explore our curated collections and apply your savings at checkout for a premium shopping experience.</p>
                                <Link to="/products" className="btn-boutique-secondary">
                                    Shop the Marketplace <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Coupons;
