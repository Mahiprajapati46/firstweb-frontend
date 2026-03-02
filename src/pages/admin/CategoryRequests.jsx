import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, Store, User, Hash, MessageSquare, RefreshCw, FolderTree, ListChecks, Upload, Layers, Edit } from 'lucide-react';
import adminApi from '../../api/admin';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const CategoryRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [approvalData, setApprovalData] = useState({ name: '', parent_category_id: '', description: '', sort_order: 0, image: null });
    const [categories, setCategories] = useState([]);
    const fileInputRef = React.useRef(null);

    const fetchCategories = async () => {
        try {
            const response = await adminApi.getCategories();
            if (response.data) setCategories(response.data);
        } catch (error) {
            console.error('Failed to load categories');
        }
    };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getCategoryRequests(filter);
            setRequests(response.data);
        } catch (error) {
            toast.error('Failed to fetch category requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchCategories();
    }, [filter]);

    const openApproveModal = (req) => {
        setSelectedRequest(req);
        setApprovalData({
            name: req.name || '',
            parent_category_id: req.parent_category_id?._id || req.parent_category_id || '',
            description: req.description || '',
            sort_order: 0,
            image: null
        });
        setIsModalOpen(true);
    };

    const handleApproveSubmit = async (e) => {
        e.preventDefault();
        if (!approvalData.image) {
            toast.error('Category image is required');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', approvalData.name);
            if (approvalData.parent_category_id) formData.append('parent_category_id', approvalData.parent_category_id);
            if (approvalData.description) formData.append('description', approvalData.description);
            formData.append('sort_order', approvalData.sort_order);
            formData.append('image', approvalData.image);

            await adminApi.approveCategoryRequest(selectedRequest._id, formData);
            toast.success('Category approved and created');
            setIsModalOpen(false);
            fetchRequests();
            fetchCategories(); // Refresh taxonomy
        } catch (error) {
            toast.error(error.message || 'Failed to approve request');
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt('Reason for rejection (optional):');
        if (reason === null) return; // Cancelled prompt

        try {
            await adminApi.rejectCategoryRequest(id, reason);
            toast.success('Request rejected');
            fetchRequests();
        } catch (error) {
            toast.error('Failed to reject request');
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'APPROVED': return 'text-green-500 bg-green-50 border-green-100';
            case 'REJECTED': return 'text-red-500 bg-red-50 border-red-100';
            default: return 'text-amber-500 bg-amber-50 border-amber-100';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tighter uppercase italic">Category Requests</h1>
                    <p className="text-gray-400 font-medium text-sm mt-1">Review and process merchant-suggested product categories.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link to="/admin/categories" className="px-6 py-3 bg-white border border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all flex items-center gap-2">
                        <FolderTree size={16} /> <span>Back to Taxonomy</span>
                    </Link>
                    <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                        {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === s ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-primary'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="card-premium overflow-hidden border border-gray-100 bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center space-y-4">
                        <RefreshCw size={32} className="text-accent animate-spin" />
                        <div className="text-accent font-black uppercase tracking-widest text-[10px] italic">Scanning Suggestions...</div>
                    </div>
                ) : requests.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {requests.map((req) => (
                            <div key={req._id} className="p-8 hover:bg-gray-50/50 transition-colors">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="space-y-6 flex-1">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center shrink-0">
                                                <Hash size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-black text-primary uppercase italic tracking-tight text-lg leading-none">{req.name}</h3>
                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(req.status)}`}>
                                                        {req.status}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 italic">Slug: {req.slug}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pl-16">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Suggested By</span>
                                                <div className="flex items-center gap-2 group cursor-pointer">
                                                    <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                        <Store size={12} />
                                                    </div>
                                                    <span className="text-xs font-bold text-primary group-hover:text-accent transition-colors">{req.merchant_id?.store_name || 'Unknown Store'}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Requested On</span>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={12} className="text-gray-300" />
                                                    <span className="text-xs font-bold text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            {req.description && (
                                                <div className="sm:col-span-2 flex flex-col p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                        <MessageSquare size={10} /> Description / Context
                                                    </span>
                                                    <p className="text-xs font-medium text-gray-600 leading-relaxed italic">"{req.description}"</p>
                                                </div>
                                            )}
                                            {req.rejection_reason && (
                                                <div className="sm:col-span-2 flex flex-col p-4 bg-red-50 rounded-2xl border border-red-100">
                                                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-2">Rejection Reason</span>
                                                    <p className="text-xs font-medium text-red-600 leading-relaxed italic">{req.rejection_reason}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {req.status === 'PENDING' && (
                                        <div className="flex flex-row lg:flex-col gap-3 min-w-[160px]">
                                            <button
                                                onClick={() => openApproveModal(req)}
                                                className="flex-1 px-6 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 size={14} /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(req._id)}
                                                className="flex-1 px-6 py-4 bg-white border border-gray-100 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={14} /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center space-y-4">
                        <div className="inline-flex p-4 bg-gray-50 rounded-full text-gray-200">
                            <ListChecks size={48} />
                        </div>
                        <p className="text-gray-400 font-bold italic">No requests found matching this filter.</p>
                    </div>
                )}
            </div>

            {/* Approval Modal */}
            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl relative z-10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center text-primary">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Refine & Approve</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Finalize Category Taxonomy</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all text-slate-300 hover:text-slate-900">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleApproveSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-8 space-y-6">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Category Name</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-12 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black focus:ring-8 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none"
                                            value={approvalData.name}
                                            onChange={(e) => setApprovalData({ ...approvalData, name: e.target.value })}
                                        />
                                        <Edit className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Parent Select */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Parent Category</label>
                                        <div className="relative">
                                            <select
                                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:ring-8 focus:ring-primary/5 focus:border-primary/20 appearance-none transition-all outline-none cursor-pointer"
                                                value={approvalData.parent_category_id}
                                                onChange={(e) => setApprovalData({ ...approvalData, parent_category_id: e.target.value })}
                                            >
                                                <option value="">None (Top Level)</option>
                                                {categories.map(cat => (
                                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        </div>
                                    </div>

                                    {/* Sort Order */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Sort Weight (Priority)</label>
                                        <div className="relative group">
                                            <input
                                                type="number"
                                                className="w-full px-12 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black focus:ring-8 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none"
                                                value={approvalData.sort_order}
                                                onChange={(e) => setApprovalData({ ...approvalData, sort_order: Number(e.target.value) })}
                                            />
                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Description</label>
                                    <div className="relative group">
                                        <textarea
                                            className="w-full px-12 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:ring-8 focus:ring-primary/5 focus:border-primary/20 transition-all min-h-[100px] outline-none resize-none"
                                            value={approvalData.description}
                                            onChange={(e) => setApprovalData({ ...approvalData, description: e.target.value })}
                                        />
                                        <MessageSquare className="absolute left-4 top-4 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                    </div>
                                </div>

                                {/* Image Upload (Mandatory) */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Category Image (Required)</label>
                                    <div
                                        className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${approvalData.image ? 'border-primary/30 bg-primary/5' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'}`}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {approvalData.image ? (
                                            <>
                                                <CheckCircle2 size={32} className="text-primary" />
                                                <p className="text-sm font-bold text-slate-700">{approvalData.image.name}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest cursor-pointer font-black" onClick={(e) => { e.stopPropagation(); setApprovalData({ ...approvalData, image: null }) }}>Remove File</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={32} className="text-slate-300" />
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-slate-700">Click to upload image</p>
                                                    <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG (Max 5MB)</p>
                                                </div>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => setApprovalData({ ...approvalData, image: e.target.files[0] })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Area */}
                            <div className="p-8 bg-slate-50/30 border-t border-slate-100 flex gap-4">
                                <Button
                                    type="submit"
                                    className="flex-1 py-5 rounded-3xl font-black bg-primary border-primary shadow-2xl shadow-primary/20 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                >
                                    Confirm & Create Category
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryRequests;
