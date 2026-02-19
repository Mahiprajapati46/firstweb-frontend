import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ShoppingBag, CheckCircle, AlertCircle, Building, MapPin } from 'lucide-react';
import merchantApi from '../../api/merchant';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const MerchantApply = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        store_name: '',
        store_slug: '',
        description: '',
        business_email: user?.email || '',
        business_phone: user?.phone || '',
        address: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
        }
    });

    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!user) return;

        const checkExistingApplication = async () => {
            try {
                const response = await merchantApi.getProfile();
                const merchant = response.data;

                if (merchant.status === 'APPROVED') {
                    navigate('/merchant/dashboard');
                } else if (merchant) {
                    navigate('/merchant/status');
                }
                setChecking(false);
            } catch (err) {
                setChecking(false);
            }
        };

        checkExistingApplication();

        // Prefill contact info from user profile
        setFormData(prev => ({
            ...prev,
            business_email: user.email,
            business_phone: user.phone || ''
        }));
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('address.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [field]: value
                }
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'store_name') {
            const slug = value.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setFormData(prev => ({
                ...prev,
                store_slug: slug
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await merchantApi.apply(formData);
            toast.success('Application submitted successfully!');
            setSuccess(true);
            setTimeout(() => navigate('/merchant/status', { state: { submitted: true } }), 2000);
        } catch (err) {
            toast.error(err.message || 'Application submission failed.');
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-background">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-accent rounded-full mb-4"></div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Verifying Business State</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                    {/* Left Column - Marketing & Trust */}
                    <div className="lg:w-1/3 space-y-10">
                        <div className="space-y-4">
                            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-lg text-[10px] font-black uppercase tracking-widest">Growth Protocol</span>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight leading-[1.1]">
                                Become a <br />
                                <span className="text-accent">Merchant</span> Partner.
                            </h1>
                            <p className="text-gray-500 leading-relaxed text-lg">
                                Join our elite network of professional sellers and reach thousands of customers across the grid.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-5 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm group hover:border-accent transition-all duration-300">
                                <div className="w-12 h-12 bg-accent/5 text-accent rounded-xl flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-white transition-all">
                                    <Store size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-primary mb-1">Store Autonomy</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">Dedicated storefront with complete catalog management and brand control.</p>
                                </div>
                            </div>

                            <div className="flex gap-5 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm group hover:border-accent transition-all duration-300">
                                <div className="w-12 h-12 bg-accent/5 text-accent rounded-xl flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-white transition-all">
                                    <ShoppingBag size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-primary mb-1">Global Logistics</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">Integrated order pipelines, dynamic stock alerts, and multi-vendor fulfillment.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-primary rounded-2xl text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                                    <CheckCircle size={18} />
                                </div>
                                <span className="font-bold uppercase text-[10px] tracking-widest text-accent">Security Verified</span>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                Our security board reviews every merchant application within 24-48 business hours to ensure high-quality standards.
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Form */}
                    <div className="flex-1 lg:max-w-2xl">
                        <div className="bg-white rounded-[32px] border border-gray-200 shadow-2xl p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0"></div>

                            <div className="relative z-10">
                                <div className="mb-10 text-center md:text-left">
                                    <h2 className="text-2xl font-bold text-primary">Merchant Application</h2>
                                    <p className="text-sm text-gray-400">Initialize your business profile for platform participation.</p>
                                </div>

                                {error && (
                                    <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                        <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-600 font-medium">{error}</p>
                                    </div>
                                )}

                                {success ? (
                                    <div className="text-center space-y-8 py-8 animate-in zoom-in-95 duration-500">
                                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle size={40} />
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-bold text-primary">Application Submitted</h3>
                                            <p className="text-gray-500 leading-relaxed">
                                                Your business identity and store profile have been transmitted successfully. Redirecting to status board...
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-10">
                                        {/* SECTION: STORE INFO */}
                                        <div className="space-y-6">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-4">Business Core</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <Input
                                                    label="Store Name"
                                                    name="store_name"
                                                    value={formData.store_name}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Mahi Electronics"
                                                    required
                                                    className="text-lg font-medium"
                                                    icon={<Building size={18} />}
                                                />
                                                <Input
                                                    label="Store Slug"
                                                    name="store_slug"
                                                    value={formData.store_slug}
                                                    onChange={handleChange}
                                                    placeholder="mahi-electronics"
                                                    required
                                                    readOnly
                                                    className="bg-gray-50/50"
                                                    helpText={`URL: vyapar.com/shop/${formData.store_slug || 'identifier'}`}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-primary mb-2 ml-1">Store Description</label>
                                                <textarea
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleChange}
                                                    rows="3"
                                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all resize-none shadow-sm placeholder:text-gray-300"
                                                    placeholder="Tell us about your products..."
                                                    required
                                                ></textarea>
                                            </div>
                                        </div>

                                        {/* SECTION: CONTACT INFO */}
                                        <div className="space-y-6">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-4">Operational Contacts</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <Input
                                                    label="Business Email"
                                                    name="business_email"
                                                    type="email"
                                                    value={formData.business_email}
                                                    onChange={handleChange}
                                                    placeholder="support@merchant.com"
                                                />
                                                <Input
                                                    label="Business Phone"
                                                    name="business_phone"
                                                    value={formData.business_phone}
                                                    onChange={handleChange}
                                                    placeholder="+91 98765 43210"
                                                />
                                            </div>
                                        </div>

                                        {/* SECTION: ADDRESS */}
                                        <div className="space-y-6">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
                                                <MapPin size={12} /> Business Address
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Input
                                                    label="Address Line 1"
                                                    name="address.line1"
                                                    value={formData.address.line1}
                                                    onChange={handleChange}
                                                    placeholder="Office 123, MG Road"
                                                    required
                                                />
                                                <Input
                                                    label="Address Line 2"
                                                    name="address.line2"
                                                    value={formData.address.line2}
                                                    onChange={handleChange}
                                                    placeholder="Landmark"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                <Input label="City" name="address.city" value={formData.address.city} onChange={handleChange} required />
                                                <Input label="State" name="address.state" value={formData.address.state} onChange={handleChange} required />
                                                <Input label="Pin Code" name="address.pincode" value={formData.address.pincode} onChange={handleChange} required />
                                                <Input label="Country" name="address.country" value={formData.address.country} onChange={handleChange} required />
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-gray-100 flex flex-col gap-4">
                                            <Button
                                                type="submit"
                                                className="w-full py-4 text-lg font-black tracking-widest shadow-xl shadow-primary/20"
                                                disabled={loading}
                                            >
                                                {loading ? 'TRANSMITTING...' : 'SUBMIT APPLICATION'}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MerchantApply;
