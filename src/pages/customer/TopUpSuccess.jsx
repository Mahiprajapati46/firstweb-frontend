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
            <div className="bg-[#f8f9fa] min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center text-primary mx-auto">
                        <Loader2 size={32} className="animate-spin" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Verifying Payment</h2>
                        <p className="text-xs text-gray-400 font-medium">Please wait while we confirm your transaction.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="bg-[#f8f9fa] min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-10 max-w-md">
                    <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto">
                        <AlertCircle size={32} />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Payment Verification Failed</h2>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase tracking-widest px-4">
                            We couldn't confirm your deposit. If funds were debited, they will be auto-credited shortly.
                        </p>
                    </div>
                    <div>
                        <Link to="/wallet" className="inline-flex py-4 px-10 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Return to Wallet</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f8f9fa] min-h-screen flex items-center justify-center p-6">
            <div className="text-center space-y-12 max-w-xl w-full">
                <div className="space-y-6">
                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto border border-emerald-100/50">
                        <CheckCircle2 size={32} />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Transaction Complete</p>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Funds Added Successfully</h1>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Credited</p>
                        <h3 className="text-5xl font-black text-gray-900 tracking-tight tabular-nums">₹ {amount.toLocaleString()}</h3>
                    </div>
                    <div className="pt-6 border-t border-gray-50">
                        <p className="text-xs font-medium text-gray-400 leading-relaxed px-4">
                            Your wallet balance has been updated. You can now use these funds for purchases across the platform.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/wallet"
                        className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-secondary transition-all flex items-center justify-center gap-3 transition-transform hover:-translate-y-0.5"
                    >
                        View Wallet <Wallet size={14} />
                    </Link>
                    <Link
                        to="/products"
                        className="w-full sm:w-auto px-10 py-4 border border-gray-200 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-all flex items-center justify-center gap-3 transition-transform hover:-translate-y-0.5"
                    >
                        Browse Shop <ArrowRight size={14} />
                    </Link>
                </div>

                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-300">
                    Auto-redirecting to wallet shortly...
                </p>
            </div>
        </div>
    );
};

export default TopUpSuccess;
