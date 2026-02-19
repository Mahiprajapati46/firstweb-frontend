import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    GitPullRequest,
    Plus,
    CheckCircle2,
    XCircle,
    Clock,
    Tag,
    Edit,
    AlertCircle,
    ChevronRight,
    Search,
    Copy
} from 'lucide-react';
import merchantApi from '../../api/merchant';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const Requests = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('CATEGORY'); // CATEGORY | CHANGE
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        parent_category_id: ''
    });
    const [changeData, setChangeData] = useState({
        entity_type: 'PRODUCT', // Default to PRODUCT
        entity_id: '',
        title: '',
        description: '',
        category_ids: '',
        sku: '',
        reason: ''
    });

    useEffect(() => {
        if (location.state?.productId) {
            setActiveTab('CHANGE');
            setChangeData(prev => ({
                ...prev,
                entity_id: location.state.productId,
                entity_type: 'PRODUCT'
            }));
            setShowModal(true);
        } else if (location.state?.variantId) {
            setActiveTab('CHANGE');
            setChangeData(prev => ({
                ...prev,
                entity_id: location.state.variantId,
                entity_type: 'VARIANT'
            }));
            setShowModal(true);
        }
    }, [location.state]);

    useEffect(() => {
        if (activeTab === 'CATEGORY') {
            fetchCategoryRequests();
        } else {
            fetchChangeRequests();
        }
    }, [activeTab]);

    const fetchCategoryRequests = async () => {
        try {
            setLoading(true);
            const response = await merchantApi.getCategoryRequests();
            setRequests(response.data || []);
        } catch (error) {
            toast.error('Failed to load category requests');
        } finally {
            setLoading(false);
        }
    };

    const fetchChangeRequests = async () => {
        try {
            setLoading(true);
            const response = await merchantApi.getChangeRequests();
            setRequests(response.data || []);
        } catch (error) {
            toast.error('Failed to load change requests');
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            await merchantApi.submitCategoryRequest(formData);
            toast.success('Category request submitted');
            setShowModal(false);
            setFormData({ name: '', slug: '', description: '', parent_category_id: '' });
            fetchCategoryRequests();
        } catch (error) {
            toast.error(error.message || 'Submission failed');
        }
    };

    const handleChangeSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!changeData.entity_id) {
                toast.error('Entity ID is required');
                return;
            }

            let changes = {};
            if (changeData.entity_type === 'PRODUCT') {
                if (changeData.title) changes.title = changeData.title;
                if (changeData.description) changes.description = changeData.description;
                if (changeData.category_ids) {
                    // Try to parse as JSON or split by comma
                    try {
                        changes.category_ids = JSON.parse(changeData.category_ids);
                    } catch (err) {
                        changes.category_ids = changeData.category_ids.split(',').map(id => id.trim()).filter(id => id);
                    }
                }
            } else {
                if (changeData.sku) changes.sku = changeData.sku;
            }

            if (Object.keys(changes).length === 0) {
                toast.error('Please provide at least one field to change');
                return;
            }

            await merchantApi.submitChangeRequest({
                entity_type: changeData.entity_type,
                entity_id: changeData.entity_id,
                requested_changes: changes,
                reason: changeData.reason
            });

            toast.success('Change request submitted');
            setShowModal(false);
            setChangeData({ entity_type: 'PRODUCT', entity_id: '', title: '', description: '', category_ids: '', sku: '', reason: '' });
            fetchChangeRequests();
        } catch (error) {
            toast.error(error.message || 'Submission failed');
        }
    };

    const StatusBadge = ({ status }) => {
        const configs = {
            PENDING: { color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Clock, label: 'Pending' },
            APPROVED: { color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle2, label: 'Approved' },
            REJECTED: { color: 'bg-rose-50 text-rose-600 border-rose-200', icon: XCircle, label: 'Rejected' },
        };
        const config = configs[status] || configs.PENDING;
        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${config.color}`}>
                <config.icon size={12} />
                {config.label}
            </div>
        );
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Request Hub</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage category requests and product change requests.</p>
                </div>
                <Button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2"
                >
                    <Plus size={20} />
                    New Request
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-100">
                {['CATEGORY', 'CHANGE'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        {tab} Requests
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-1" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content list */}
            <div className="space-y-4">
                {loading ? (
                    <div className="p-20 text-center font-black animate-pulse text-slate-300">Syncing Request Data...</div>
                ) : requests.length === 0 ? (
                    <div className="p-20 text-center bg-white rounded-3xl border border-slate-100">
                        <GitPullRequest size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold">No active requests found here.</p>
                    </div>
                ) : (
                    requests.map((req) => (
                        <div key={req._id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    {activeTab === 'CATEGORY' ? <Tag size={20} /> : <GitPullRequest size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">
                                        {activeTab === 'CATEGORY' ? req.name : `${req.entity_type} Change`}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                        {activeTab === 'CATEGORY' ? `Slug: ${req.slug}` : `ID: ...${req.entity_id?.slice(-6) || '??????'}`} • {new Date(req.createdAt).toLocaleDateString()}
                                    </p>
                                    {activeTab === 'CHANGE' && (
                                        <div className="mt-2 flex gap-1">
                                            {Object.keys(req.requested_changes || {}).map(field => (
                                                <span key={field} className="text-[8px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-black uppercase">{field}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <StatusBadge status={req.status} />
                                {req.reason && (
                                    <div className="group/note relative">
                                        <AlertCircle size={18} className="text-slate-300 cursor-help hover:text-primary transition-colors" />
                                        <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover/note:opacity-100 transition-opacity pointer-events-none z-50">
                                            <span className="font-black text-primary uppercase block mb-1">Reason:</span>
                                            {req.reason}
                                        </div>
                                    </div>
                                )}
                                <ChevronRight size={20} className="text-slate-300" />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal - Basic New Request */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="bg-white rounded-[2rem] w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-50">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                {activeTab === 'CATEGORY' ? 'New Category Request' : 'New Change Request'}
                            </h2>
                            <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-tighter">Enter details for the administrative review.</p>
                        </div>

                        {activeTab === 'CATEGORY' ? (
                            <form onSubmit={handleCategorySubmit} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Category Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">URL Slug</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Description</label>
                                        <textarea
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all h-24"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" className="flex-1 rounded-xl">Submit Request</Button>
                                    <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="px-6 rounded-xl font-bold">Cancel</Button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleChangeSubmit} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Target Type</label>
                                            <select
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all"
                                                value={changeData.entity_type}
                                                onChange={(e) => setChangeData({ ...changeData, entity_type: e.target.value })}
                                            >
                                                <option value="PRODUCT">Product</option>
                                                <option value="VARIANT">Variant</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Object ID (Hex)</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Hex ID from URL/Detail"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all"
                                                value={changeData.entity_id}
                                                onChange={(e) => setChangeData({ ...changeData, entity_id: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {changeData.entity_type === 'PRODUCT' ? (
                                        <>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">New Title (Optional)</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all"
                                                    value={changeData.title || ''}
                                                    onChange={(e) => setChangeData({ ...changeData, title: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">New Description (Optional)</label>
                                                <textarea
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all h-20"
                                                    value={changeData.description || ''}
                                                    onChange={(e) => setChangeData({ ...changeData, description: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">New Category IDs (Optional)</label>
                                                <input
                                                    type="text"
                                                    placeholder="Comma separated IDs or JSON array"
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all"
                                                    value={changeData.category_ids || ''}
                                                    onChange={(e) => setChangeData({ ...changeData, category_ids: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">New SKU (Optional)</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all"
                                                value={changeData.sku || ''}
                                                onChange={(e) => setChangeData({ ...changeData, sku: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Reason for Change</label>
                                        <textarea
                                            required
                                            placeholder="Why are you requesting this change?"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all h-20"
                                            value={changeData.reason}
                                            onChange={(e) => setChangeData({ ...changeData, reason: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" className="flex-1 rounded-xl bg-slate-900 border-slate-900">Submit Change</Button>
                                    <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="px-6 rounded-xl font-bold">Cancel</Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Requests;
