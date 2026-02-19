import React, { useEffect, useState } from 'react';
import {
    Ticket,
    Plus,
    Search,
    Edit2,
    Trash2,
    Tag,
    Calendar,
    CheckCircle2,
    XCircle,
    Percent,
    DollarSign,
    Users,
    AlertCircle
} from 'lucide-react';
import adminApi from '../../api/admin';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';

const CouponStatus = ({ isActive, expiryDate }) => {
    const isExpired = new Date(expiryDate) < new Date();

    if (isExpired) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500">
                <AlertCircle size={12} /> Expired
            </span>
        );
    }

    if (isActive) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600">
                <CheckCircle2 size={12} /> Active
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600">
            <XCircle size={12} /> Inactive
        </span>
    );
};

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discount_type: 'PERCENTAGE',
        discount_value: '',
        min_order_amount: 0,
        max_discount_amount: '',
        expiry_date: '',
        usage_limit: '',
        user_usage_limit: 1,
        is_active: true
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getCoupons();
            setCoupons(response.data || []);
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
            toast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, coupon = null) => {
        setModalMode(mode);
        setSelectedCoupon(coupon);
        if (coupon) {
            setFormData({
                code: coupon.code,
                description: coupon.description,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
                min_order_amount: coupon.min_order_amount || 0,
                max_discount_amount: coupon.max_discount_amount || '',
                expiry_date: coupon.expiry_date?.split('T')[0] || '',
                usage_limit: coupon.usage_limit || '',
                user_usage_limit: coupon.user_usage_limit || 1,
                is_active: coupon.is_active
            });
        } else {
            setFormData({
                code: '',
                description: '',
                discount_type: 'PERCENTAGE',
                discount_value: '',
                min_order_amount: 0,
                max_discount_amount: '',
                expiry_date: '',
                usage_limit: '',
                user_usage_limit: 1,
                is_active: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.code || !formData.discount_value || !formData.expiry_date) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setActionLoading(true);
            const payload = {
                ...formData,
                code: formData.code.toUpperCase(),
                discount_value: Number(formData.discount_value),
                min_order_amount: Number(formData.min_order_amount),
                max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : undefined,
                usage_limit: formData.usage_limit ? Number(formData.usage_limit) : undefined,
                user_usage_limit: Number(formData.user_usage_limit),
            };

            if (modalMode === 'create') {
                await adminApi.createCoupon(payload);
                toast.success('Coupon created successfully');
            } else {
                await adminApi.updateCoupon(selectedCoupon._id, payload);
                toast.success('Coupon updated successfully');
            }

            setShowModal(false);
            fetchCoupons();
        } catch (error) {
            console.error('Failed to save coupon:', error);
            toast.error(error.message || 'Failed to save coupon');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) return;

        try {
            await adminApi.deleteCoupon(id);
            toast.success('Coupon deleted successfully');
            fetchCoupons();
        } catch (error) {
            console.error('Failed to delete coupon:', error);
            toast.error('Failed to delete coupon');
        }
    };

    const handleToggleStatus = async (coupon) => {
        try {
            await adminApi.updateCoupon(coupon._id, { is_active: !coupon.is_active });
            toast.success(`Coupon ${!coupon.is_active ? 'activated' : 'deactivated'}`);
            fetchCoupons();
        } catch (error) {
            console.error('Failed to toggle status:', error);
            toast.error('Failed to update status');
        }
    };

    const filteredCoupons = coupons.filter(coupon =>
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Coupons & Discounts</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Manage platform-wide promotional codes</p>
                </div>
                <Button onClick={() => handleOpenModal('create')} className="gap-2 shadow-lg shadow-primary/20">
                    <Plus size={18} /> Create Coupon
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search coupons..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 text-gray-900 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Coupons Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : filteredCoupons.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 border-dashed">
                    <Ticket size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">No coupons found</h3>
                    <p className="text-gray-500">Create your first coupon to start offering discounts.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCoupons.map((coupon) => (
                        <div key={coupon._id} className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 p-6 group hover:border-primary/20 transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary/5 rounded-xl text-primary font-black text-xl tracking-wider">
                                    {coupon.code}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal('edit', coupon)}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon._id)}
                                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-gray-600 text-sm font-medium mb-4 line-clamp-2 min-h-[2.5rem]">
                                {coupon.description}
                            </p>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400 font-medium flex items-center gap-2">
                                        <Tag size={14} /> Discount
                                    </span>
                                    <span className="font-bold text-gray-900">
                                        {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400 font-medium flex items-center gap-2">
                                        <Calendar size={14} /> Expires
                                    </span>
                                    <span className="font-bold text-gray-900">
                                        {new Date(coupon.expiry_date).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400 font-medium flex items-center gap-2">
                                        <Users size={14} /> Usage
                                    </span>
                                    <span className="font-bold text-gray-900">
                                        {coupon.used_count || 0} / {coupon.usage_limit || '∞'}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                <CouponStatus isActive={coupon.is_active} expiryDate={coupon.expiry_date} />
                                <button
                                    onClick={() => handleToggleStatus(coupon)}
                                    className={`text-[10px] font-black uppercase tracking-widest hover:underline ${coupon.is_active ? 'text-red-500' : 'text-green-500'
                                        }`}
                                >
                                    {coupon.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900">
                                {modalMode === 'create' ? 'Create New Coupon' : 'Edit Coupon'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {modalMode === 'edit' && (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm text-blue-700">
                                    <div className="shrink-0 mt-0.5">
                                        <AlertCircle size={16} />
                                    </div>
                                    <p>
                                        <strong>Note:</strong> To maintain data integrity with existing orders, the
                                        <span className="font-bold mx-1">Coupon Code</span> and
                                        <span className="font-bold mx-1">Discount Value</span> cannot be changed once created.
                                        Please create a new coupon if you need different core rules.
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Coupon Code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="SUMMER2026"
                                    disabled={modalMode === 'edit'} // Code is usually immutable after creation
                                    required
                                    className={modalMode === 'edit' ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-100 focus:ring-0' : ''}
                                />
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Expiry Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-gray-900"
                                        value={formData.expiry_date}
                                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <Input
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Summer sale 20% off..."
                            />

                            <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-6">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Discount Rules</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="block text-sm font-bold text-gray-700">Type</label>
                                        <select
                                            className={`w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-gray-900 ${modalMode === 'edit' ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-100 focus:ring-0 appearance-none' : ''
                                                }`}
                                            value={formData.discount_type}
                                            onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                            disabled={modalMode === 'edit'}
                                        >
                                            <option value="PERCENTAGE">Percentage (%)</option>
                                            <option value="FIXED">Fixed Amount (₹)</option>
                                        </select>
                                    </div>
                                    <Input
                                        label="Value"
                                        type="number"
                                        value={formData.discount_value}
                                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                        placeholder={formData.discount_type === 'PERCENTAGE' ? '20' : '500'}
                                        disabled={modalMode === 'edit'}
                                        required
                                        className={modalMode === 'edit' ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-100 focus:ring-0' : ''}
                                    />
                                    <Input
                                        label="Min Order Amount"
                                        type="number"
                                        value={formData.min_order_amount}
                                        onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                                        placeholder="0"
                                    />
                                    {formData.discount_type === 'PERCENTAGE' && (
                                        <Input
                                            label="Max Discount (Cap)"
                                            type="number"
                                            value={formData.max_discount_amount}
                                            onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                                            placeholder="1000"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Global Usage Limit"
                                    type="number"
                                    value={formData.usage_limit}
                                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                    placeholder="Leave empty for unlimited"
                                />
                                <Input
                                    label="Per User Limit"
                                    type="number"
                                    value={formData.user_usage_limit}
                                    onChange={(e) => setFormData({ ...formData, user_usage_limit: e.target.value })}
                                    placeholder="1"
                                />
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-gray-50">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Saving...' : (modalMode === 'create' ? 'Create Coupon' : 'Save Changes')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Coupons;
