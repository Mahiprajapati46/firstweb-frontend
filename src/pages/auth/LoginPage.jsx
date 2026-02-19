import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Smartphone, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const LoginPage = () => {
    const [loginMode, setLoginMode] = useState('password'); // password | otp
    const [otpStep, setOtpStep] = useState('request'); // request | verify
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { loginWithPassword, verifyOtp, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleRedirect = (role) => {
        // If there is a 'from' location (that isn't login or register), go there
        if (location.state?.from) {
            const { pathname, search } = location.state.from;
            navigate({ pathname, search });
            return;
        }

        // Otherwise, go to role-based dashboard
        if (role === 'SUPER_ADMIN') {
            navigate('/admin/dashboard');
        } else if (role === 'MERCHANT') {
            navigate('/merchant/dashboard');
        } else {
            navigate('/');
        }
    };

    useEffect(() => {
        if (user) {
            handleRedirect(user.role);
        }
    }, [user, navigate, location]); // Added location dependency

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (loginMode === 'password') {
                const result = await loginWithPassword(email, password);
                if (result.success) {
                    handleRedirect(result.role);
                } else {
                    setError(result.message);
                }
            } else {
                if (otpStep === 'request') {
                    await authApi.requestOtp(email);
                    setOtpStep('verify');
                } else {
                    const result = await verifyOtp(email, otp);
                    if (result.success) {
                        handleRedirect(result.role);
                    } else {
                        setError(result.message);
                    }
                }
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Link to="/" className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 hover:bg-accent transition-all">
                        <ShieldCheck size={32} strokeWidth={1.5} />
                    </Link>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-primary">
                    FirstWeb Console
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500">
                    Secure Access to Marketplace Management
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 border border-gray-200 shadow-xl rounded-2xl sm:px-10">
                    {/* Mode Toggle */}
                    <div className="flex p-1 bg-gray-50 rounded-xl mb-8 border border-gray-100">
                        <button
                            onClick={() => { setLoginMode('password'); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${loginMode === 'password' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Lock size={14} /> PASSWORD
                        </button>
                        <button
                            onClick={() => { setLoginMode('otp'); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${loginMode === 'otp' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Smartphone size={14} /> OTP LOGIN
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md animate-in fade-in slide-in-from-top-1">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                disabled={loginMode === 'otp' && otpStep === 'verify'}
                                label="Corporate Email"
                                placeholder="name@firstweb.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                icon={<Mail className="text-gray-400" size={18} />}
                            />
                        </div>

                        {loginMode === 'password' ? (
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    label="Secure Password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    icon={<Lock className="text-gray-400" size={18} />}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-[34px] text-gray-400 hover:text-accent transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        ) : (
                            otpStep === 'verify' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2">
                                    <Input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        required
                                        label="One-Time Password"
                                        placeholder="6-Digit Code"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        icon={<Send className="text-gray-400" size={18} />}
                                    />
                                    <p className="mt-2 text-xs text-gray-400">
                                        OTP sent to your email. Didn't receive? <button type="button" onClick={() => setOtpStep('request')} className="text-accent font-bold">Resend</button>
                                    </p>
                                </div>
                            )
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                                    Trust this device
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link to="/forgot-password" size="sm" className="font-medium text-accent hover:text-soft-accent transition-colors">
                                    Trouble signing in?
                                </Link>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-3 text-base shadow-lg shadow-primary/10"
                            disabled={loading}
                        >
                            {loading
                                ? 'Processing...'
                                : (loginMode === 'password'
                                    ? 'Sign In to Dashboard'
                                    : (otpStep === 'request' ? 'Request OTP' : 'Verify & Continue'))
                            }
                        </Button>
                    </form>

                    <div className="mt-8 border-t border-gray-100 pt-6 text-center">
                        <Link to="/register" state={location.state} className="text-sm text-gray-500 hover:text-primary transition-colors">
                            Don't have an account? <span className="text-accent font-bold">Register Now</span>
                        </Link>
                    </div>
                </div>

                <div className="mt-8 flex justify-center gap-6 text-xs text-gray-400 font-bold uppercase tracking-widest">
                    <Link to="/terms" className="hover:text-gray-600">Terms</Link>
                    <Link to="/privacy" className="hover:text-gray-600">Privacy</Link>
                    <Link to="/help" className="hover:text-gray-600">Security</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
