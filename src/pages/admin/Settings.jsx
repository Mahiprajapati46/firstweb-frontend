import React, { useState, useEffect } from 'react';
import {
    Save,
    RefreshCcw,
    ShieldCheck,
    Clock,
    Wallet,
    Percent,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import adminApi from '../../api/admin';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const AdminSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [settings, setSettings] = useState({
        commission_rate: 10,
        return_window_days: 7,
        min_withdrawal_amount: 500
    });
    const [tempSettings, setTempSettings] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getSettings();
            if (response.data) {
                setSettings(response.data);
                setTempSettings(response.data);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e?.preventDefault();
        try {
            setSaving(true);
            const response = await adminApi.updateSettings(tempSettings);
            setSettings(tempSettings);
            setIsEditing(false);
            toast.success(response.message || 'Settings updated successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setTempSettings(settings);
        setIsEditing(false);
    };

    const startEditing = () => {
        setTempSettings(settings);
        setIsEditing(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCcw className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight">Platform Governance</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage global operational constants and financial parameters.</p>
                </div>
                {!isEditing && (
                    <Button
                        onClick={startEditing}
                        className="bg-primary px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                        <Save size={18} className="text-[#c19a6b]" />
                        <span className="font-bold tracking-widest uppercase text-xs">Edit Settings</span>
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSave} className="card-premium p-8 space-y-8">
                        {/* Commission Rate */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#c19a6b15] text-[#c19a6b] rounded-lg">
                                    <Percent size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-primary">Marketplace Commission</h3>
                                    <p className="text-sm text-gray-400">Platform fee percentage taken from each transition.</p>
                                </div>
                            </div>
                            <div className="relative max-w-xs">
                                <input
                                    type="number"
                                    value={isEditing ? tempSettings.commission_rate : settings.commission_rate}
                                    onChange={(e) => setTempSettings({ ...tempSettings, commission_rate: Number(e.target.value) })}
                                    readOnly={!isEditing}
                                    className={`w-full pl-4 pr-12 py-3 border-2 rounded-xl transition-all font-bold text-xl text-primary ${isEditing
                                        ? 'border-gray-200 focus:border-[#c19a6b] bg-white'
                                        : 'border-transparent bg-gray-50/50 cursor-default'
                                        }`}
                                    min="0"
                                    max="100"
                                    required
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-[#c19a6b] text-xl opacity-50">%</span>
                            </div>
                        </div>

                        <hr className="border-gray-50" />

                        {/* Return Window */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#9f817015] text-[#9f8170] rounded-lg">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-primary">Return & Refund Policy</h3>
                                    <p className="text-sm text-gray-400">Duration during which customers can initiate returns.</p>
                                </div>
                            </div>
                            <div className="relative max-w-xs">
                                <input
                                    type="number"
                                    value={isEditing ? tempSettings.return_window_days : settings.return_window_days}
                                    onChange={(e) => setTempSettings({ ...tempSettings, return_window_days: Number(e.target.value) })}
                                    readOnly={!isEditing}
                                    className={`w-full pl-4 pr-16 py-3 border-2 rounded-xl transition-all font-bold text-xl text-primary ${isEditing
                                        ? 'border-gray-200 focus:border-[#9f8170] bg-white'
                                        : 'border-transparent bg-gray-50/50 cursor-default'
                                        }`}
                                    min="0"
                                    required
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[#9f8170] text-sm uppercase opacity-50">Days</span>
                            </div>
                        </div>

                        <hr className="border-gray-50" />

                        {/* Withdrawal Limit */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#cb997e15] text-[#cb997e] rounded-lg">
                                    <Wallet size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-primary">Withdrawal Threshold</h3>
                                    <p className="text-sm text-gray-400">Minimum balance required for merchants to request payouts.</p>
                                </div>
                            </div>
                            <div className="relative max-w-xs">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#cb997e] text-xl opacity-50">₹</span>
                                <input
                                    type="number"
                                    value={isEditing ? tempSettings.min_withdrawal_amount : settings.min_withdrawal_amount}
                                    onChange={(e) => setTempSettings({ ...tempSettings, min_withdrawal_amount: Number(e.target.value) })}
                                    readOnly={!isEditing}
                                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all font-bold text-xl text-primary ${isEditing
                                        ? 'border-gray-200 focus:border-[#cb997e] bg-white'
                                        : 'border-transparent bg-gray-50/50 cursor-default'
                                        }`}
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        {isEditing && (
                            <div className="pt-4 flex items-center gap-4">
                                <Button
                                    type="submit"
                                    className="flex-1 bg-primary py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
                                    loading={saving}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Save size={20} className="text-[#c19a6b]" />
                                        <span className="font-bold tracking-widest uppercase text-sm">Save Changes</span>
                                    </div>
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-8 py-4 rounded-xl border-2 border-gray-100 font-bold tracking-widest uppercase text-sm text-gray-400 hover:bg-gray-50 transition-all"
                                    disabled={saving}
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <div className="card-premium p-6 border-l-4 border-l-[#c19a6b]">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="text-[#c19a6b] shrink-0" size={24} />
                            <div>
                                <h4 className="font-black text-[#c19a6b] uppercase text-xs tracking-widest mb-1">Mandatory Review</h4>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                    Adjusting these parameters will impact the platform's revenue model immediately. Ensure all stakeholders are notified before finalizing changes.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card-premium p-6 bg-[#f5f5dc50]">
                        <h4 className="font-black text-primary uppercase text-xs tracking-widest mb-4">Integrity Status</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="text-emerald-500" size={18} />
                                <span className="text-sm font-semibold text-gray-600">Audit Logging: Enabled</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="text-emerald-500" size={18} />
                                <span className="text-sm font-semibold text-gray-600">SSL Encryption: Active</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="text-emerald-500" size={18} />
                                <span className="text-sm font-semibold text-gray-600">Admin Authorization: High</span>
                            </div>
                        </div>
                    </div>

                    <div className="card-premium p-8 bg-primary relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <ShieldCheck size={80} className="text-white" />
                        </div>
                        <h4 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-2">Total System Security</h4>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed relative z-10">
                            The FirstWeb core engine enforces strict cryptographic validation on all governance updates.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
