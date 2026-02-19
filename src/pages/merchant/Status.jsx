import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Building, AlertCircle, RefreshCw, ArrowLeft, Clock, ShieldCheck } from 'lucide-react';
import merchantApi from '../../api/merchant';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const MerchantStatus = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we just submitted
    const justSubmitted = location.state?.submitted;

    const fetchStatus = async (isManual = false) => {
        setLoading(true);
        try {
            const response = await merchantApi.getProfile();
            const merchant = response.data;
            setProfile(merchant);

            if (isManual) {
                toast.success('Status synchronized');
            }

            if (merchant.status === 'APPROVED') {
                navigate('/merchant/dashboard');
            }
        } catch (err) {
            if (err.status === 404) {
                navigate('/merchant/apply');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [navigate]);

    const handleReapply = async () => {
        setLoading(true);
        try {
            // Re-apply simply moves status back to PENDING with existing data
            // Or we could redirect back to Apply page with existing data
            // Based on backend 'reapply' route, it accepts body.
            // Let's redirect to Apply page for editing if it was rejected
            navigate('/merchant/apply');
        } catch (err) {
            console.error('Re-apply navigation failed:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] font-sans">Syncing With Vyapar Grid</p>
                </div>
            </div>
        );
    }

    const isRejected = profile?.status === 'REJECTED';

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto w-full space-y-8 animate-in zoom-in duration-500">

                {justSubmitted && (
                    <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-700 delay-300">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white shrink-0">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-green-700 uppercase tracking-widest">Protocol Success</p>
                            <p className="text-sm text-green-600">Application successfully registered in system.</p>
                        </div>
                    </div>
                )}

                <div className={`bg-white rounded-[40px] border shadow-2xl p-10 md:p-16 text-center relative overflow-hidden ${isRejected ? 'border-red-100' : 'border-gray-100'}`}>

                    {/* Visual Status Indicator */}
                    <div className="relative mb-12">
                        <div className={`w-32 h-32 rounded-[48px] flex items-center justify-center text-5xl mx-auto shadow-2xl transition-all duration-700 rotate-3 hover:rotate-0 ${isRejected ? 'bg-red-50 text-red-500 shadow-red-200' : 'bg-amber-50 text-amber-500 shadow-amber-100'}`}>
                            {isRejected ? '!' : <Clock size={48} className="animate-pulse" />}
                        </div>
                        {/* Decorative orbits */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-dashed border-gray-100 rounded-full animate-spin-slow -z-10"></div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isRejected ? 'text-red-500' : 'text-amber-600'}`}>
                                Account {profile?.status}
                            </p>
                            <h1 className="text-4xl font-extrabold text-primary tracking-tight">
                                {isRejected ? 'Application Flagged' : 'Under Evaluation'}
                            </h1>
                        </div>

                        <p className="text-gray-500 font-medium leading-relaxed max-w-sm mx-auto">
                            {isRejected
                                ? profile.suspended_reason || 'Non-compliance with Vyapar grid protocols. Please review your business metadata.'
                                : 'Our verification board is currently analyzing your business architecture. Security audit usually completes within 48 hours.'
                            }
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-10">
                        <Link to="/">
                            <Button variant="outline" className="w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2">
                                <ArrowLeft size={16} /> Return to Home
                            </Button>
                        </Link>
                        {isRejected && (
                            <Button onClick={handleReapply} className="w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2">
                                <RefreshCw size={16} /> Update & Re-submit
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => fetchStatus(true)} className="w-full sm:w-auto px-6 border-none text-gray-400 hover:text-primary">
                            Manual Refresh
                        </Button>
                    </div>

                    <div className="mt-12 pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-300">
                        <div className="flex items-center gap-2">
                            <Building size={12} /> STORE: {profile?.store_name}
                        </div>
                        <div>ID: {profile?._id?.slice(-12).toUpperCase()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MerchantStatus;
