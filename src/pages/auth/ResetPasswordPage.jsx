import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';
import authApi from '../../api/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link. No token provided.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match.');
        }

        if (password.length < 8) {
            return setError('Password must be at least 8 characters.');
        }

        setLoading(true);

        try {
            await authApi.resetPassword(token, password);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Reset failed. link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-in zoom-in duration-300">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-12 px-6 border border-gray-100 shadow-2xl rounded-3xl text-center">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
                            <CheckCircle size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-primary mb-2">Password Secured</h2>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Your password has been updated successfully. You can now use your new credentials to sign in.
                        </p>
                        <Link to="/login">
                            <Button className="w-full py-3 flex items-center justify-center gap-2">
                                Sign In to Console <ArrowRight size={18} />
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
                    <RefreshCw size={32} />
                </div>
                <h2 className="text-3xl font-extrabold text-primary tracking-tight">Set New Password</h2>
                <p className="mt-2 text-sm text-gray-500">Secure your account with a strong new password.</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-4 border border-gray-200 shadow-xl rounded-2xl sm:px-10">
                    {!token ? (
                        <div className="text-center">
                            <p className="text-red-500 font-bold mb-4">{error}</p>
                            <Link to="/forgot-password">
                                <Button variant="outline" className="w-full">Request New Link</Button>
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <Input
                                label="New Secure Password"
                                type="password"
                                required
                                placeholder="Min. 8 characters"
                                icon={<Lock size={18} className="text-gray-400" />}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <Input
                                label="Confirm New Password"
                                type="password"
                                required
                                placeholder="Re-enter password"
                                icon={<Lock size={18} className="text-gray-400" />}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full py-3 text-base"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating Credentials...' : 'Solidify New Password'}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
