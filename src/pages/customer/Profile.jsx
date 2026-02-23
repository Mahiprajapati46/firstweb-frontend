import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    User,
    MapPin,
    Plus,
    Trash2,
    AtSign,
    Shield,
    Clock,
    ChevronRight,
    Home as HomeIcon,
    Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import customerApi from '../../api/customer';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddMode, setIsAddMode] = useState(false);
    const [newAddress, setNewAddress] = useState({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        type: 'HOME'
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const response = await customerApi.getAddresses();
            if (response.data) {
                setAddresses(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const response = await customerApi.addAddress(newAddress);
            if (response.message) {
                toast.success('Address added to your vault');
                setIsAddMode(false);
                setNewAddress({
                    full_name: '',
                    phone: '',
                    address_line1: '',
                    address_line2: '',
                    city: '',
                    state: '',
                    postal_code: '',
                    type: 'HOME'
                });
                fetchAddresses();
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add address');
        }
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
                                    <h2 className="text-xl font-bold text-gray-900 truncate">{user?.full_name}</h2>
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
                                    onClick={() => setIsAddMode(true)}
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
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                                        <input
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary transition-all"
                                            value={newAddress.full_name}
                                            onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile Number</label>
                                        <input
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary transition-all"
                                            value={newAddress.phone}
                                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Address Line</label>
                                        <input
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary transition-all"
                                            value={newAddress.address_line1}
                                            onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">City</label>
                                        <input
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary transition-all"
                                            value={newAddress.city}
                                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pincode</label>
                                        <input
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary transition-all"
                                            value={newAddress.postal_code}
                                            onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Address Type</label>
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
                                        Save Address
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddMode(false)}
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
                                                <button
                                                    onClick={() => handleDeleteAddress(addr._id)}
                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="font-bold text-gray-900">{addr.full_name}</h4>
                                                <p className="text-xs text-gray-500 leading-relaxed">
                                                    {addr.address_line1}, {addr.city}, {addr.postal_code}
                                                </p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pt-2">{addr.phone}</p>
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
