import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    Shield,
    Activity,
    Lock,
    Unlock,
    LogOut,
    CheckCircle2,
    XCircle,
    AlertTriangle
} from 'lucide-react';
import adminApi from '../../api/admin';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockReason, setBlockReason] = useState('');

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getUserById(id);
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            toast.error('Failed to load user details');
        } finally {
            setLoading(false);
        }
    };

    const handleBlockToggle = async () => {
        if (!user) return;

        if (user.status === 'ACTIVE') {
            setShowBlockModal(true);
        } else {
            // Unblock directly
            try {
                setActionLoading(true);
                await adminApi.unblockUser(id, 'Unblocked by admin');
                toast.success('User unblocked successfully');
                fetchUser();
            } catch (error) {
                console.error('Failed to unblock user:', error);
                toast.error(error.message || 'Failed to unblock user');
            } finally {
                setActionLoading(false);
            }
        }
    };

    const confirmBlock = async () => {
        if (!blockReason.trim()) {
            toast.error('Please provide a reason');
            return;
        }

        try {
            setActionLoading(true);
            await adminApi.blockUser(id, blockReason);
            toast.success('User blocked successfully');
            setShowBlockModal(false);
            setBlockReason('');
            fetchUser();
        } catch (error) {
            console.error('Failed to block user:', error);
            toast.error(error.message || 'Failed to block user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleForceLogout = async () => {
        if (!window.confirm('Are you sure you want to force logout this user from all sessions?')) return;

        try {
            setActionLoading(true);
            await adminApi.forceLogoutUser(id);
            toast.success('User logged out from all sessions');
        } catch (error) {
            console.error('Failed to force logout:', error);
            toast.error(error.message || 'Failed to force logout');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-gray-400 font-bold">User not found</p>
                <Button onClick={() => navigate('/admin/users')}>Back to Users</Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">User Details</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage user profile and access</p>
                </div>
                <div className="ml-auto flex gap-3">
                    <Button
                        variant={user.status === 'BLOCKED' ? 'primary' : 'danger'}
                        onClick={handleBlockToggle}
                        disabled={actionLoading}
                        className="gap-2"
                    >
                        {user.status === 'BLOCKED' ? <Unlock size={18} /> : <Lock size={18} />}
                        {user.status === 'BLOCKED' ? 'Unblock User' : 'Block User'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleForceLogout}
                        disabled={actionLoading}
                        className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300"
                    >
                        <LogOut size={18} />
                        Force Logout
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Profile Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Profile Card */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 p-8">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl font-black text-gray-300">
                                    {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">{user.full_name || 'Unknown User'}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${user.status === 'ACTIVE' ? 'bg-green-50 text-green-600' :
                                                user.status === 'BLOCKED' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'
                                            }`}>
                                            {user.status === 'ACTIVE' ? <CheckCircle2 size={12} /> :
                                                user.status === 'BLOCKED' ? <XCircle size={12} /> : <AlertTriangle size={12} />}
                                            {user.status}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-purple-50 text-purple-600">
                                            <Shield size={12} />
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-50">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Email Address</label>
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <Mail size={16} className="text-gray-300" />
                                    {user.email}
                                    {user.email_verified && <CheckCircle2 size={14} className="text-green-500" />}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Phone Number</label>
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <Phone size={16} className="text-gray-300" />
                                    {user.phone || 'Not provided'}
                                    {user.phone_verified && <CheckCircle2 size={14} className="text-green-500" />}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">User ID</label>
                                <div className="font-mono text-sm text-gray-500 bg-white px-2 py-1 rounded border border-gray-100 inline-block">
                                    {user._id}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Member Since</label>
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <Calendar size={16} className="text-gray-300" />
                                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 p-6">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Activity size={16} className="text-primary" /> Activity Log
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500 font-medium">Last Login</span>
                                <span className="text-sm font-bold text-primary">
                                    {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500 font-medium">Failed Attempts</span>
                                <span className={`text-sm font-bold ${user.failed_login_attempts > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {user.failed_login_attempts || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-500 font-medium">Account Status</span>
                                <span className="text-sm font-bold text-primary">{user.status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Block User Modal */}
            {showBlockModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-black text-gray-900 mb-2">Block User</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Please provide a reason for blocking this user. They will not be able to log in until unblocked.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Reason</label>
                                <textarea
                                    className="w-full p-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-red-200 focus:ring-4 focus:ring-red-500/10 transition-all resize-none font-medium text-gray-900 placeholder-gray-400"
                                    rows="3"
                                    placeholder="Violation of terms, suspicious activity..."
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowBlockModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={confirmBlock}
                                    className="flex-1"
                                    disabled={!blockReason.trim() || actionLoading}
                                >
                                    {actionLoading ? 'Blocking...' : 'Confirm Block'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetail;
