import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, Store, User, Hash, MessageSquare, RefreshCw, FolderTree, ListChecks } from 'lucide-react';
import adminApi from '../../api/admin';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const CategoryRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');

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
    }, [filter]);

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this category? This will add it to the global taxonomy.')) return;
        try {
            await adminApi.approveCategoryRequest(id);
            toast.success('Category approved and created');
            fetchRequests();
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
                                                onClick={() => handleApprove(req._id)}
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
        </div>
    );
};

export default CategoryRequests;
