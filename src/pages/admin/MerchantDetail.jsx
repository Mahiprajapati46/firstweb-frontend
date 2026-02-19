import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Store,
    Shield,
    UserCheck,
    UserX,
    Mail,
    RefreshCw,
    Calendar,
    ArrowLeft,
    ShieldAlert,
    Building2,
    Clock,
    User,
    BadgeCheck,
    Phone,
    MapPin,
    Hash,
    AlignLeft
} from 'lucide-react';
import adminApi from '../../api/admin';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import GovernanceModal from '../../components/ui/GovernanceModal';

const StatusBadge = ({ status }) => {
    const styles = {
        APPROVED: "bg-green-100 text-green-700 border-green-200",
        PENDING: "bg-amber-100 text-amber-700 border-amber-200",
        REJECTED: "bg-red-100 text-red-700 border-red-200",
        SUSPENDED: "bg-rose-100 text-rose-700 border-rose-200",
    };
    return (
        <span className={`px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-widest ${styles[status]}`}>
            {status}
        </span>
    );
};


const AdminMerchantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [merchant, setMerchant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, status: null });

    const fetchMerchant = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getMerchantById(id);
            setMerchant(response.data);
        } catch (error) {
            console.error('Failed to fetch merchant details:', error);
            toast.error('Sync error: Merchant entity record is unreadable');
            navigate('/admin/merchants');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMerchant();
    }, [id]);

    const handleStatusChange = async (status, reason) => {
        setActionLoading(true);
        try {
            await adminApi.updateMerchantStatus(id, status, reason);
            toast.success(`Merchant status migrated to ${status}`);
            setModal({ isOpen: false, status: null });
            fetchMerchant();
        } catch (error) {
            toast.error(error.message || 'Governance status transition failed');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-accent">Syncing Entity Metadata...</div>;
    if (!merchant) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Navigation & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <Link
                    to="/admin/merchants"
                    className="group flex items-center gap-2 text-gray-400 hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Store List
                </Link>

                <div className="flex gap-2">
                    {merchant.status === 'PENDING' && (
                        <>
                            <button
                                onClick={() => setModal({ isOpen: true, status: 'APPROVED' })}
                                disabled={actionLoading}
                                className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-green-500/10 flex items-center gap-2"
                            >
                                <UserCheck size={16} /> Approve Store
                            </button>
                            <button
                                onClick={() => setModal({ isOpen: true, status: 'REJECTED' })}
                                disabled={actionLoading}
                                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-500/10 flex items-center gap-2"
                            >
                                <UserX size={16} /> Reject Store
                            </button>
                        </>
                    )}
                    {merchant.status === 'APPROVED' && (
                        <button
                            onClick={() => setModal({ isOpen: true, status: 'SUSPENDED' })}
                            disabled={actionLoading}
                            className="px-6 py-2.5 border border-amber-200 text-amber-600 hover:bg-amber-50 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                        >
                            <Shield size={16} /> Suspend Store
                        </button>
                    )}
                    {merchant.status === 'SUSPENDED' && (
                        <button
                            onClick={() => setModal({ isOpen: true, status: 'APPROVED' })}
                            disabled={actionLoading}
                            className="px-6 py-2.5 border border-green-200 text-green-600 hover:bg-green-50 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                        >
                            <UserCheck size={16} /> Activate Store
                        </button>
                    )}
                </div>
            </div>

            {/* Entity Branding */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-accent/10 transition-colors duration-1000" />

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="w-24 h-24 bg-accent/5 text-accent rounded-3xl flex items-center justify-center border border-accent/10 shadow-inner">
                        <Store size={48} className="animate-in fade-in zoom-in duration-1000" />
                    </div>
                    <div className="text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                            <h1 className="text-4xl font-black text-primary tracking-tighter uppercase italic">{merchant.store_name}</h1>
                            <StatusBadge status={merchant.status} />
                        </div>
                        <p className="text-gray-400 font-mono text-xs font-black uppercase tracking-[0.2em] italic">Store ID: {merchant._id}</p>
                    </div>
                </div>

                {/* Additional Branding Meta */}
                <div className="mt-8 flex flex-wrap gap-4 border-t border-gray-50 pt-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                        <Hash size={14} className="text-gray-400" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Slug: {merchant.store_slug}</span>
                    </div>
                    {merchant.description && (
                        <div className="flex items-start gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 max-w-2xl">
                            <AlignLeft size={14} className="text-gray-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] font-bold text-gray-500 italic leading-tight">{merchant.description}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Business Contact Hub */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-lg space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="p-2 bg-primary/5 text-primary rounded-lg">
                            <Mail size={20} />
                        </div>
                        <h2 className="text-sm font-black text-primary uppercase tracking-widest">Contact Information</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-1 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:border-primary/20 transition-colors">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Official Business Email</span>
                            <div className="flex items-center gap-3">
                                <Mail size={16} className="text-primary/40" />
                                <span className="text-sm font-black text-primary">{merchant.business_email || 'Not Provided'}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:border-primary/20 transition-colors">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Primary Contact Number</span>
                            <div className="flex items-center gap-3">
                                <Phone size={16} className="text-primary/40" />
                                <span className="text-sm font-black text-primary">{merchant.business_phone || 'Not Provided'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Operational Headquarters */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-lg space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="p-2 bg-primary/5 text-primary rounded-lg">
                            <MapPin size={20} />
                        </div>
                        <h2 className="text-sm font-black text-primary uppercase tracking-widest">Business Address</h2>
                    </div>

                    <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-3">
                        {merchant.address ? (
                            <>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-primary">{merchant.address.line1}</p>
                                    {merchant.address.line2 && <p className="text-xs font-bold text-gray-400 italic">{merchant.address.line2}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">City/State</p>
                                        <p className="text-xs font-black text-primary uppercase tracking-tight">{merchant.address.city}, {merchant.address.state}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Postal Code</p>
                                        <p className="text-xs font-black text-primary tracking-widest font-mono">{merchant.address.pincode}</p>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-gray-100">
                                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em]">{merchant.address.country}</p>
                                </div>
                            </>
                        ) : (
                            <p className="text-xs font-bold text-gray-400 italic py-4">Address data missing from system registry</p>
                        )}
                    </div>
                </div>
                {/* Store Metadata */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-lg space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="p-2 bg-primary/5 text-primary rounded-lg">
                            <Building2 size={20} />
                        </div>
                        <h2 className="text-sm font-black text-primary uppercase tracking-widest">Registration Info</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center group">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors">Onboarding Date</span>
                            <div className="flex items-center gap-2 text-primary font-black italic">
                                <Calendar size={14} className="text-gray-300" />
                                <span>{new Date(merchant.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center group">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors">Catalog Update</span>
                            <div className="flex items-center gap-2 text-primary font-black italic">
                                <Clock size={14} className="text-gray-300" />
                                <span>{new Date(merchant.updatedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                            </div>
                        </div>
                        {merchant.rejection_reason && (
                            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                    <ShieldAlert size={14} /> Review Note
                                </span>
                                <p className="text-xs text-rose-600 font-bold italic leading-relaxed">
                                    "{merchant.rejection_reason}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Ownership Identity */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-lg space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="p-2 bg-primary/5 text-primary rounded-lg">
                            <User size={20} />
                        </div>
                        <h2 className="text-sm font-black text-primary uppercase tracking-widest">Owner Details</h2>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-primary font-black text-xl italic">
                            {merchant.owner_user_id?.name?.charAt(0) || 'M'}
                        </div>
                        <div>
                            <p className="text-lg font-black text-primary tracking-tight leading-none mb-1">{merchant.owner_user_id?.name || 'Authorized Merchant'}</p>
                            <p className="text-[10px] text-gray-400 font-medium lowercase tracking-tight">{merchant.owner_user_id?.email}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 text-gray-400">
                            <BadgeCheck size={16} className="text-green-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Verified Multi-Vendor Principal</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 text-gray-400">
                            <Mail size={16} className="text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">System Communications Enabled</span>
                        </div>
                    </div>
                </div>
            </div>

            <GovernanceModal
                isOpen={modal.isOpen}
                status={modal.status}
                loading={actionLoading}
                onClose={() => setModal({ isOpen: false, status: null })}
                onConfirm={(reason) => handleStatusChange(modal.status, reason)}
            />
        </div>
    );
};

export default AdminMerchantDetail;
