import React, { useState, useEffect } from 'react';
import { 
    Store, 
    Mail, 
    Phone, 
    MapPin, 
    Info, 
    Save, 
    AlertCircle,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import merchantApi from '../../api/merchant';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';

const MerchantSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        store_name: '',
        description: '',
        business_email: '',
        business_phone: '',
        address: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
        }
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await merchantApi.getProfile();
                if (response.data) {
                    setProfile({
                        store_name: response.data.store_name || '',
                        description: response.data.description || '',
                        business_email: response.data.business_email || '',
                        business_phone: response.data.business_phone || '',
                        address: {
                            line1: response.data.address?.line1 || '',
                            line2: response.data.address?.line2 || '',
                            city: response.data.address?.city || '',
                            state: response.data.address?.state || '',
                            pincode: response.data.address?.pincode || '',
                            country: response.data.address?.country || 'India'
                        }
                    });
                }
            } catch (error) {
                toast.error('Failed to load profile settings');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await merchantApi.updateProfile(profile);
            toast.success('Store profile updated successfully');
        } catch (error) {
            if (error.errors && Array.isArray(error.errors)) {
                error.errors.forEach(err => toast.error(`${err.field}: ${err.message}`));
            } else {
                toast.error(error.message || 'Failed to update profile');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [name]: value
            }
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-accent" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-primary tracking-tight">Store Settings</h1>
                <p className="text-sm text-gray-500">Manage your public store profile and business information.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-3">
                        <div className="w-10 h-10 bg-soft-accent bg-opacity-10 rounded-xl flex items-center justify-center text-accent">
                            <Store size={20} />
                        </div>
                        <h2 className="font-bold text-primary">Store Information</h2>
                    </div>
                    
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Store Name</label>
                            <input
                                type="text"
                                value={profile.store_name}
                                onChange={(e) => setProfile({ ...profile, store_name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-accent transition-all text-sm font-medium"
                                placeholder="Enter store name"
                                required
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Store Description</label>
                            <textarea
                                value={profile.description}
                                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-accent transition-all text-sm font-medium min-h-[120px] resize-none"
                                placeholder="Describe your business, products, and specialties..."
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-3">
                        <div className="w-10 h-10 bg-soft-accent bg-opacity-10 rounded-xl flex items-center justify-center text-accent">
                            <Mail size={20} />
                        </div>
                        <h2 className="font-bold text-primary">Contact Details</h2>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Business Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="email"
                                    value={profile.business_email}
                                    onChange={(e) => setProfile({ ...profile, business_email: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-accent transition-all text-sm font-medium"
                                    placeholder="email@business.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Business Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="tel"
                                    value={profile.business_phone}
                                    onChange={(e) => setProfile({ ...profile, business_phone: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-accent transition-all text-sm font-medium"
                                    placeholder="10 digit mobile number"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business Address */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-3">
                        <div className="w-10 h-10 bg-soft-accent bg-opacity-10 rounded-xl flex items-center justify-center text-accent">
                            <MapPin size={20} />
                        </div>
                        <h2 className="font-bold text-primary">Store Address</h2>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Address Line 1</label>
                                <input
                                    type="text"
                                    name="line1"
                                    value={profile.address.line1}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-accent transition-all text-sm font-medium"
                                    placeholder="Building/Street info"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Address Line 2 (Optional)</label>
                                <input
                                    type="text"
                                    name="line2"
                                    value={profile.address.line2}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-accent transition-all text-sm font-medium"
                                    placeholder="Area/Locality"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={profile.address.city}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-accent transition-all text-sm font-medium"
                                    placeholder="City"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={profile.address.state}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-accent transition-all text-sm font-medium"
                                    placeholder="State"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Pincode</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={profile.address.pincode}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-accent transition-all text-sm font-medium"
                                    placeholder="6 digit PIN"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    <button
                        type="button"
                        className="px-8 py-3.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-all uppercase tracking-widest"
                    >
                        Discard Changes
                    </button>
                    <Button
                        type="submit"
                        disabled={saving}
                        className="min-w-[180px] h-[52px] rounded-xl flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>
                                <Save size={18} />
                                <span>Save Profile</span>
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default MerchantSettings;
