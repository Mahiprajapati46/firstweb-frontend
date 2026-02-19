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
        <div className="bg-[#fdfaf5] min-h-screen pb-32 pt-12">
            <div className="container-custom max-w-7xl mx-auto px-6">
                {/* Header Section */}
                <div className="mb-16 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c19a6b]">Member Account</p>
                    <h1 className="text-6xl font-black text-primary tracking-tighter">Your Profile<span className="text-[#c19a6b]">.</span></h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
                    {/* Sidebar Profile Card */}
                    <div className="lg:col-span-1 space-y-8 sticky top-32">
                        <div className="bg-primary text-white p-12 rounded-[3.5rem] shadow-2xl shadow-primary/30 relative overflow-hidden group">
                            <div className="relative z-10 space-y-8">
                                <div className="w-24 h-24 bg-[#c19a6b] rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-xl group-hover:scale-110 transition-transform duration-500">
                                    {user?.full_name?.charAt(0) || 'C'}
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black tracking-tighter italic serif">{user?.full_name}</h2>
                                    <p className="text-sm font-bold text-white/50 flex items-center gap-2">
                                        <AtSign size={14} /> {user?.email}
                                    </p>
                                </div>
                                <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#c19a6b]">Role</p>
                                        <p className="text-xs font-bold mt-1">Premium Client</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#c19a6b]">Member Since</p>
                                        <p className="text-xs font-bold mt-1">{new Date(user?.createdAt || Date.now()).getFullYear()}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative Pattern */}
                            <div className="absolute -right-10 -bottom-10 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                                <Shield size={240} />
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <div className="bg-white border border-[#e5e5d1]/50 rounded-[2.5rem] p-4 space-y-2">
                            {[
                                { label: 'Security & Access', icon: Shield },
                                { label: 'Order History', icon: Clock },
                                { label: 'Saved Items', icon: Clock }
                            ].map((item, i) => (
                                <Link to="/orders" key={i} className="w-full flex items-center justify-between p-4 hover:bg-[#fdfaf5] rounded-2xl transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-[#c19a6b10] rounded-xl flex items-center justify-center text-[#c19a6b]">
                                            <item.icon size={18} />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-primary">{item.label}</span>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Main Content: Address Book */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-2">
                                <h3 className="text-4xl font-black text-primary tracking-tighter italic serif">Address Vault</h3>
                                <p className="text-sm text-[#9f8170] font-medium italic">Secure locations for your artisan deliveries.</p>
                            </div>
                            {!isAddMode && (
                                <button
                                    onClick={() => setIsAddMode(true)}
                                    className="flex items-center gap-3 px-8 py-4 bg-white border border-[#e5e5d1] rounded-2xl text-xs font-black uppercase tracking-widest text-primary hover:border-[#c19a6b] transition-all group shadow-sm"
                                >
                                    <Plus size={16} className="text-[#c19a6b]" />
                                    New Location
                                </button>
                            )}
                        </div>

                        {isAddMode ? (
                            <form onSubmit={handleAddAddress} className="bg-white border border-[#c19a6b30] p-12 rounded-[3.5rem] space-y-8 animate-in slide-in-from-bottom-8 duration-500 shadow-xl shadow-[#c19a6b05]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">Receipient Name</label>
                                        <input
                                            required
                                            className="w-full bg-[#fdfaf5] border border-[#e5e5d1] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#c19a6b] transition-colors"
                                            value={newAddress.full_name}
                                            onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">Mobile Contact</label>
                                        <input
                                            required
                                            className="w-full bg-[#fdfaf5] border border-[#e5e5d1] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#c19a6b] transition-colors"
                                            value={newAddress.phone}
                                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">Primary Address Details</label>
                                        <input
                                            required
                                            className="w-full bg-[#fdfaf5] border border-[#e5e5d1] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#c19a6b] transition-colors"
                                            value={newAddress.address_line1}
                                            onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">City / District</label>
                                        <input
                                            required
                                            className="w-full bg-[#fdfaf5] border border-[#e5e5d1] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#c19a6b] transition-colors"
                                            value={newAddress.city}
                                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">State / Province</label>
                                        <input
                                            required
                                            className="w-full bg-[#fdfaf5] border border-[#e5e5d1] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#c19a6b] transition-colors"
                                            value={newAddress.state}
                                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">Postal Code</label>
                                        <input
                                            required
                                            className="w-full bg-[#fdfaf5] border border-[#e5e5d1] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#c19a6b] transition-colors"
                                            value={newAddress.postal_code}
                                            onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#9f8170]">Location Type</label>
                                        <div className="flex gap-4">
                                            {['HOME', 'WORK'].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setNewAddress({ ...newAddress, type })}
                                                    className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${newAddress.type === type ? 'bg-primary text-white border-primary' : 'bg-transparent text-[#9f8170] border-[#e5e5d1]'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 py-5 bg-[#c19a6b] hover:bg-[#a6825a] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:-translate-y-1 transition-all"
                                    >
                                        Encrypt & Save Address
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddMode(false)}
                                        className="px-10 py-5 text-gray-400 font-black text-xs uppercase tracking-[0.2em] hover:text-red-500 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {loading ? (
                                    Array(2).fill(0).map((_, i) => (
                                        <div key={i} className="h-64 bg-white rounded-[2.5rem] border border-[#e5e5d1]/30 animate-pulse"></div>
                                    ))
                                ) : addresses.length > 0 ? (
                                    addresses.map((addr) => (
                                        <div
                                            key={addr._id}
                                            className="group relative bg-white p-10 rounded-[2.5rem] border border-[#e5e5d1]/50 hover:shadow-2xl transition-all duration-700"
                                        >
                                            <div className="flex items-start justify-between mb-8">
                                                <div className="w-12 h-12 bg-[#fdfaf5] rounded-2xl flex items-center justify-center text-[#c19a6b] border border-[#e5e5d1]/50">
                                                    {addr.type === 'HOME' ? <HomeIcon size={20} /> : <Briefcase size={20} />}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteAddress(addr._id)}
                                                    className="p-3 text-red-100 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c19a6b]">{addr.type}</p>
                                                <h4 className="text-xl font-black text-primary tracking-tight">{addr.full_name}</h4>
                                                <p className="text-sm font-medium text-[#9f8170] leading-relaxed italic line-clamp-2">
                                                    {addr.address_line1}, {addr.city}
                                                </p>
                                                <div className="pt-4 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                    <span>{addr.phone}</span>
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                    <span>{addr.postal_code}</span>
                                                </div>
                                            </div>
                                            {addr.is_default && (
                                                <div className="absolute top-10 right-10">
                                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-100">DEFAULT</span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="md:col-span-2 py-20 text-center bg-white rounded-[3rem] border border-dashed border-[#e5e5d1]">
                                        <MapPin size={40} className="mx-auto text-gray-200 mb-6" />
                                        <p className="text-sm font-bold text-gray-400 italic">No addresses secured in your vault yet.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Aesthetic Info Card */}
                        <div className="p-10 bg-[#fdfaf5] border border-[#c19a6b20] rounded-[2.5rem] flex gap-8 items-start">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#c19a6b] shadow-sm shrink-0">
                                <Shield size={24} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-black uppercase tracking-widest text-primary">Identity Protection</h4>
                                <p className="text-xs font-medium text-[#9f8170] leading-relaxed italic">
                                    Your address details are encrypted at REST. We follow international standards for data privacy and location security. Hand-verified by our automated logistics pipeline.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
