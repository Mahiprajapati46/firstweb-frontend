import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    User,
    MapPin,
    Plus,
    Edit,
    Trash2,
    AtSign,
    Shield,
    Clock,
    ChevronRight,
    Home as HomeIcon,
    Briefcase,
    Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import customerApi from '../../api/customer';
import toast from 'react-hot-toast';
import { commonSchemas } from '../../validations/common.schema';
import Input from '../../components/ui/Input';

const Profile = () => {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddMode, setIsAddMode] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [newAddress, setNewAddress] = useState({
        name: '',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        type: 'HOME'
    });

    // 🛡️ Data Normalization Helper
    // Bridges the gap between old "industrial" keys and current stable keys
    const normalizeAddress = (addr) => {
        const normalized = {
            ...addr, // Keep original ID and other meta
            name: (addr.name || addr.full_name || addr.fullName || '').trim(),
            line1: (addr.line1 || addr.address_line1 || addr.addressLine1 || '').trim(),
            line2: (addr.line2 || addr.address_line2 || addr.addressLine2 || '').trim(),
            pincode: (addr.pincode || addr.postal_code || addr.postalCode || addr.zipCode || '').trim(),
            phone: (addr.phone || addr.mobile || addr.business_phone || '').trim(),
            city: (addr.city || '').trim(),
            state: (addr.state || '').trim(),
            country: addr.country || 'India'
        };
        console.debug('📍 Address Normalized:', { original: addr, normalized });
        return normalized;
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const response = await customerApi.getAddresses();
            // Apply normalization to all fetched addresses
            const normalized = (response.data || []).map(normalizeAddress);
            setAddresses(normalized);
        } catch (error) {
            toast.error('Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (name, value) => {
        let cleanedValue = value;

        // 🛡️ Industrial Input Cleaning
        if (name === 'phone') {
            cleanedValue = value.replace(/\D/g, '').slice(0, 10);
        } else if (name === 'pincode') {
            cleanedValue = value.replace(/\D/g, '').slice(0, 6);
        } else if (name === 'city' || name === 'state') {
            cleanedValue = value.replace(/[^a-zA-Z\s]/g, '');
        }

        setNewAddress(prev => ({ ...prev, [name]: cleanedValue }));

        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleFieldBlur = (name, value) => {
        // 🛡️ Real-time Field Validation
        const result = commonSchemas.address.safeParse({ ...newAddress, [name]: value });

        if (!result.success) {
            const fieldIssue = result.error.issues.find(issue => issue.path[0] === name);
            if (fieldIssue) {
                setFieldErrors(prev => ({
                    ...prev,
                    [name]: fieldIssue.message
                }));
                return;
            }
        }

        // ✅ Clear error if field is now valid
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setFieldErrors({});

        // 🛡️ Frontend Validation with Zod
        const result = commonSchemas.address.safeParse(newAddress);
        if (!result.success) {
            const errors = {};
            result.error.issues.forEach(issue => {
                errors[issue.path[0]] = issue.message;
            });
            setFieldErrors(errors);
            toast.error("Please clarify the required fields.");
            return;
        }

        try {
            let response;
            if (isEditing) {
                response = await customerApi.updateAddress(editingId, newAddress);
                toast.success('Address updated successfully');
            } else {
                response = await customerApi.addAddress(newAddress);
                toast.success('Address added to your vault');
            }

            if (response.message || response.success) {
                setIsAddMode(false);
                setIsEditing(false);
                setEditingId(null);
                setNewAddress({
                    name: '',
                    phone: '',
                    line1: '',
                    line2: '',
                    city: '',
                    state: '',
                    pincode: '',
                    country: 'India',
                    type: 'HOME'
                });
                fetchAddresses();
            }
        } catch (error) {
            toast.error(error.message || 'Failed to save address');
        }
    };

    const handleEditClick = (addr) => {
        const cleanAddr = normalizeAddress(addr);
        setNewAddress({
            name: cleanAddr.name,
            phone: cleanAddr.phone,
            line1: cleanAddr.line1,
            line2: cleanAddr.line2 || '',
            city: cleanAddr.city,
            state: cleanAddr.state,
            pincode: cleanAddr.pincode,
            type: cleanAddr.type
        });
        setEditingId(addr._id);
        setIsEditing(true);
        setIsAddMode(true);
        setFieldErrors({});
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Are you sure you want to remove this address?')) return;
        try {
            const response = await customerApi.deleteAddress(id);
            if (response.message) {
                toast.success('Address removed');
                fetchAddresses();
            }
        } catch (error) {
            toast.error('Failed to remove address');
        }
    };

    return (
        <div className="bg-[#f8f9fa] min-h-screen py-12 md:py-20 animate-in fade-in duration-700">
            <div className="max-w-6xl mx-auto px-4 md:px-6 pt-12">
                {/* Header Section */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your account details and addresses.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Sidebar Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-primary text-white rounded-xl flex items-center justify-center text-xl font-black">
                                    {user?.full_name?.charAt(0) || 'U'}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-xl font-bold text-gray-900 truncate">{user?.full_name ?? 'Guest User'}</h2>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Member Since</p>
                                    <p className="text-sm font-bold text-gray-900 mt-1">{new Date(user?.createdAt || Date.now()).getFullYear()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Status</p>
                                    <p className="text-sm font-bold text-emerald-500 mt-1">Active</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                            {[
                                { label: 'My Orders', icon: Clock, link: '/orders' },
                                { label: 'Account Security', icon: Shield, link: '#' },
                                { label: 'Help Center', icon: AtSign, link: '#' }
                            ].map((item, i) => (
                                <Link
                                    key={i}
                                    to={item.link}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                                        <span className="text-sm font-bold text-gray-700">{item.label}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Main Content: Address Book */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Saved Addresses</h3>
                            {!isAddMode && (
                                <button
                                    onClick={() => {
                                        setIsAddMode(true);
                                        setIsEditing(false);
                                        setEditingId(null);
                                        setNewAddress({
                                            name: '', phone: '', line1: '', line2: '',
                                            city: '', state: '', pincode: '', type: 'HOME'
                                        });
                                        setFieldErrors({});
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all shadow-lg shadow-primary/10"
                                >
                                    <Plus size={16} />
                                    Add New
                                </button>
                            )}
                        </div>

                        {isAddMode ? (
                            <form onSubmit={handleAddAddress} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8 animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Full Name"
                                        name="name"
                                        required
                                        placeholder="e.g. Rahul Sharma"
                                        icon={<User size={18} />}
                                        value={newAddress.name}
                                        onChange={(e) => handleFieldChange('name', e.target.value)}
                                        onBlur={(e) => handleFieldBlur('name', e.target.value)}
                                        error={fieldErrors.name}
                                    />
                                    <Input
                                        label="Mobile Number"
                                        name="phone"
                                        required
                                        placeholder="10-digit number"
                                        value={newAddress.phone}
                                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                                        onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                                        error={fieldErrors.phone}
                                    />
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Address Line"
                                            name="line1"
                                            required
                                            placeholder="Flat, House No, Building, Apartment"
                                            icon={<MapPin size={18} />}
                                            value={newAddress.line1}
                                            onChange={(e) => handleFieldChange('line1', e.target.value)}
                                            onBlur={(e) => handleFieldBlur('line1', e.target.value)}
                                            error={fieldErrors.line1}
                                        />
                                    </div>
                                    <Input
                                        label="City"
                                        name="city"
                                        required
                                        placeholder="Your City"
                                        icon={<Building size={18} />}
                                        value={newAddress.city}
                                        onChange={(e) => handleFieldChange('city', e.target.value)}
                                        onBlur={(e) => handleFieldBlur('city', e.target.value)}
                                        error={fieldErrors.city}
                                    />
                                    <Input
                                        label="State"
                                        name="state"
                                        required
                                        placeholder="Your State"
                                        icon={<HomeIcon size={18} />}
                                        value={newAddress.state}
                                        onChange={(e) => handleFieldChange('state', e.target.value)}
                                        onBlur={(e) => handleFieldBlur('state', e.target.value)}
                                        error={fieldErrors.state}
                                    />
                                    <Input
                                        label="Pincode"
                                        name="pincode"
                                        required
                                        placeholder="6-digit code"
                                        icon={<Shield size={18} />}
                                        value={newAddress.pincode}
                                        onChange={(e) => handleFieldChange('pincode', e.target.value)}
                                        onBlur={(e) => handleFieldBlur('pincode', e.target.value)}
                                        error={fieldErrors.pincode}
                                    />
                                    <div className="md:col-span-2 space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address Type<span className="text-red-500 ml-1">*</span></label>
                                        <div className="flex gap-3">
                                            {['HOME', 'WORK'].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setNewAddress({ ...newAddress, type })}
                                                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border-2 ${newAddress.type === type ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-primary text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-secondary transition-all shadow-lg shadow-primary/10"
                                    >
                                        {isEditing ? 'Update Address' : 'Save Address'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setIsAddMode(false); setIsEditing(false); setEditingId(null); }}
                                        className="px-8 py-4 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-red-500 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {loading ? (
                                    Array(2).fill(0).map((_, i) => (
                                        <div key={i} className="h-48 bg-white rounded-2xl border border-gray-100 animate-pulse"></div>
                                    ))
                                ) : addresses.length > 0 ? (
                                    addresses.map((addr) => (
                                        <div
                                            key={addr._id}
                                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group hover:border-primary/20 transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-gray-50 text-[10px] font-black text-gray-500 rounded border border-gray-100 uppercase">{addr.type}</span>
                                                    {addr.is_default && (
                                                        <span className="px-2 py-0.5 bg-emerald-50 text-[10px] font-black text-emerald-600 rounded border border-emerald-100 uppercase">Default</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleEditClick(addr)}
                                                        className="p-2 text-gray-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                        title="Edit Address"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAddress(addr._id)}
                                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete Address"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                                    <User size={14} className="text-gray-400" />
                                                    {addr.name}
                                                </h4>
                                                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                                    <MapPin size={12} className="inline mr-1 text-gray-400" />
                                                    {addr.line1}
                                                    {addr.line2 && <span className="block ml-4 text-gray-400">{addr.line2}</span>}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    <Building size={12} className="inline mr-1 text-gray-400" />
                                                    {addr.city}, {addr.state} - <span className="font-bold text-gray-900">{addr.pincode}</span>
                                                </p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pt-2 flex items-center gap-2">
                                                    <AtSign size={12} className="text-gray-300" />
                                                    {addr.phone}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="md:col-span-2 py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                                        <MapPin size={32} className="mx-auto text-gray-200 mb-4" />
                                        <p className="text-sm font-bold text-gray-400">No addresses saved yet.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Info Card */}
                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4 items-center">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm shrink-0">
                                <Shield size={20} />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Secure Storage</h4>
                                <p className="text-xs text-gray-500">Your information is protected and used only for delivery purposes.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
