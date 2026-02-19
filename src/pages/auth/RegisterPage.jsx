import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, UserPlus, CheckCircle } from 'lucide-react';
import authApi from '../../api/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const RegisterPage = () => {
    const location = useLocation();
    const isMerchantFlow = location.state?.from?.pathname?.includes('/become-seller') || location.state?.from?.pathname?.includes('/merchant');

    // ... existing state ...
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        auth_provider: 'PASSWORD'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    // ... existing handlers ...
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authApi.register(formData);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
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
                        <h2 className="text-2xl font-bold text-primary mb-2">Registration Successful!</h2>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            A verification email has been sent to <span className="text-primary font-semibold">{formData.email}</span>. Please check your inbox to activate your account.
                        </p>
                        <Link to="/login" state={location.state}>
                            <Button className="w-full py-3">Back to Login</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-2xl text-white shadow-lg shadow-accent/20 mb-6">
                    <UserPlus size={32} />
                </div>
                <h2 className="text-3xl font-extrabold text-primary tracking-tight">
                    {isMerchantFlow ? (
                        <div className="space-y-2">
                            <span className="block text-xs font-black uppercase tracking-[0.3em] text-accent mb-4">Phase Alpha: Identity Registration</span>
                            <span>Create Corporate Account</span>
                        </div>
                    ) : 'Create Account'}
                </h2>
                <p className="mt-4 text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                    {isMerchantFlow
                        ? 'Register your primary administrator identity to access the merchant onboarding protocols.'
                        : 'Join the FirstWeb multi-vendor ecosystem and experience premium commerce.'}
                </p>
                {isMerchantFlow && (
                    <div className="mt-8 flex justify-center items-center gap-3">
                        <div className="h-1 w-12 bg-accent rounded-full shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]"></div>
                        <div className="h-1 w-8 bg-gray-200 rounded-full"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Step 1: Identity</span>
                    </div>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 border border-gray-200 shadow-xl rounded-2xl sm:px-10">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <Input
                            label="Full Name"
                            name="full_name"
                            required
                            placeholder="John Doe"
                            icon={<User size={18} className="text-gray-400" />}
                            value={formData.full_name}
                            onChange={handleChange}
                        />

                        <Input
                            label="Corporate Email"
                            name="email"
                            type="email"
                            required
                            placeholder="name@company.com"
                            icon={<Mail size={18} className="text-gray-400" />}
                            value={formData.email}
                            onChange={handleChange}
                        />

                        <Input
                            label="Phone Number"
                            name="phone"
                            type="tel"
                            placeholder="+91 00000 00000"
                            icon={<Phone size={18} className="text-gray-400" />}
                            value={formData.phone}
                            onChange={handleChange}
                        />

                        <Input
                            label="Choose Password"
                            name="password"
                            type="password"
                            required
                            placeholder="Min. 8 characters"
                            icon={<Lock size={18} className="text-gray-400" />}
                            value={formData.password}
                            onChange={handleChange}
                        />

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full py-3 text-base"
                                disabled={loading}
                            >
                                {loading ? 'Creating Account...' : 'Initialize Activation'}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                        <Link to="/login" state={location.state} className="text-sm text-gray-500 hover:text-primary transition-colors">
                            Already have an account? <span className="text-accent font-bold">Sign In</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
