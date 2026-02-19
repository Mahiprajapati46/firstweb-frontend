import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Key, ArrowLeft, Send } from 'lucide-react';
import authApi from '../../api/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authApi.forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Failed to send reset link.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-in fade-in duration-500">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-12 px-6 border border-gray-100 shadow-2xl rounded-3xl text-center">
                        <div className="w-20 h-20 bg-accent bg-opacity-10 rounded-full flex items-center justify-center text-accent mx-auto mb-6">
                            <Send size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-primary mb-2">Check Your Email</h2>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            If an account exists for <span className="text-primary font-semibold">{email}</span>, you will receive a password reset link shortly.
                        </p>
                        <Link to="/login">
                            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                                <ArrowLeft size={18} /> Back to Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20 mb-6 font-bold text-2xl">
                    <Key size={32} />
                </div>
                <h2 className="text-3xl font-extrabold text-primary tracking-tight">Recovery Access</h2>
                <p className="mt-2 text-sm text-gray-500">Forgot your password? No problem. We'll send a link to reset it.</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-4 border border-gray-200 shadow-xl rounded-2xl sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <Input
                            label="Corporate Email Address"
                            type="email"
                            required
                            placeholder="name@company.com"
                            icon={<Mail size={18} className="text-gray-400" />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full py-3 text-base"
                                disabled={loading}
                            >
                                {loading ? 'Sending Instructions...' : 'Request Reset Link'}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <Link to="/login" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-accent transition-colors flex items-center justify-center gap-2">
                            <ArrowLeft size={14} /> Back to Secure Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
