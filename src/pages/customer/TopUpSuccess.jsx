import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, ArrowRight, Wallet, AlertCircle } from 'lucide-react';
import customerApi from '../../api/customer';
import toast from 'react-hot-toast';

const TopUpSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [amount, setAmount] = useState(0);

    useEffect(() => {
        const confirmPayment = async () => {
            const sessionId = searchParams.get('session_id');
            if (!sessionId) {
                setStatus('error');
                return;
            }

            try {
                const response = await customerApi.confirmTopUp(sessionId);
                setAmount(response.data.amount_added);
                setStatus('success');
                toast.success('Wallet credited successfully!');

                // Snappier auto-redirect after 3 seconds
                setTimeout(() => {
                    navigate('/wallet', { replace: true });
                }, 3000);
            } catch (error) {
                console.error('Verification error:', error);
                setStatus('error');
                toast.error(error.message || 'Verification failed. Our team is monitoring this.');
            }
        };

        confirmPayment();
    }, [searchParams, navigate]);

    if (status === 'verifying') {
        return (
            <div className="bg-[#fdfaf5] min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-8 animate-pulse">
                    <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-primary mx-auto mb-8">
                        <Loader2 size={48} className="animate-spin" />
                    </div>
                    <h2 className="text-4xl font-black text-primary italic serif tracking-tighter">Securing Funds...</h2>
                    <p className="text-[#9f8170] italic">Validating your transaction with the bank.</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="bg-[#fdfaf5] min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-8 max-w-md">
                    <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-500 mx-auto mb-8">
                        <AlertCircle size={48} className="opacity-20" />
                    </div>
                    <h2 className="text-4xl font-black text-primary italic serif tracking-tighter">Verification Failed</h2>
                    <p className="text-[#9f8170] italic leading-relaxed">
                        We couldn't confirm your top-up. If your account was debited, it will be credited automatically within 24 hours.
                    </p>
                    <div className="pt-8">
                        <Link to="/wallet" className="inline-flex py-4 px-10 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30">Return to Wallet</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#fdfaf5] min-h-screen flex items-center justify-center p-6">
            <div className="text-center space-y-12 max-w-xl">
                <div className="space-y-6">
                    <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-500 mx-auto shadow-2xl shadow-emerald-500/10 border border-emerald-100/50">
                        <CheckCircle2 size={48} />
                    </div>
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c19a6b]">Success</p>
                        <h1 className="text-6xl font-black text-primary tracking-tighter italic serif">Funds Added<span className="text-[#c19a6b]">!</span></h1>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] p-10 border border-[#e5e5d1]/50 shadow-2xl shadow-[#c19a6b05] space-y-6">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">Amount Credited</p>
                        <h3 className="text-4xl font-black text-primary tracking-tight tabular-nums">₹ {amount.toLocaleString()}</h3>
                    </div>
                    <p className="text-xs font-medium text-[#9f8170] italic leading-relaxed px-8">
                        Your digital wallet has been successfully credited. You can now use these funds for a seamless checkout experience.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                    <Link
                        to="/wallet"
                        className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                    >
                        Go to Wallet <Wallet size={16} />
                    </Link>
                    <Link
                        to="/products"
                        className="w-full sm:w-auto px-10 py-5 border border-[#e5e5d1] rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-[#9f8170] hover:text-primary transition-all flex items-center justify-center gap-3 group"
                    >
                        Continue Shopping <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <p className="text-[9px] font-black uppercase tracking-widest text-[#c19a6b] opacity-40">
                    Redirecting to wallet in a few seconds...
                </p>
            </div>
        </div>
    );
};

export default TopUpSuccess;
