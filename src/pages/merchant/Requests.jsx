import React, { useState, useEffect, useMemo } from 'react';
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
    Copy,
    Filter,
    Layers,
    ArrowUpRight,
    MessageSquare,
    Hash
} from 'lucide-react';
import merchantApi from '../../api/merchant';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import RequestDetailsModal from '../../components/merchant/RequestDetailsModal';

const Requests = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('CATEGORY'); // CATEGORY | CHANGE
    const [requests, setRequests] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parent_category_id: ''
    });

    useEffect(() => {
        if (location.state?.type === 'CHANGE' || location.state?.productId) {
            setActiveTab('CHANGE');
        }
    }, [location.state]);

    useEffect(() => {
        fetchData();
        if (activeTab === 'CATEGORY') {
            fetchCategories();
        }
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = activeTab === 'CATEGORY'
                ? await merchantApi.getCategoryRequests()
                : await merchantApi.getChangeRequests();
            setRequests(response.data || []);
        } catch (error) {
            toast.error(`Failed to load ${activeTab.toLowerCase()} requests`);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await merchantApi.getCategories();
            if (response.success || response.data) {
                setCategories(response.data || []);
            }
        } catch (error) {
            console.error('Failed to load categories', error);
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            await merchantApi.submitCategoryRequest(formData);
            toast.success('Category request submitted for review');
            setShowModal(false);
            setFormData({ name: '', description: '', parent_category_id: '' });
            fetchData();
        } catch (error) {
            toast.error(error.message || 'Submission failed');
        }
    };

    const stats = useMemo(() => {
        return {
            total: requests.length,
            pending: requests.filter(r => r.status === 'PENDING').length,
            approved: requests.filter(r => r.status === 'APPROVED').length,
            rejected: requests.filter(r => r.status === 'REJECTED').length
        };
    }, [requests]);

    const filteredRequests = useMemo(() => {
        if (!searchQuery) return requests;
        const q = searchQuery.toLowerCase();
        return requests.filter(r =>
            activeTab === 'CATEGORY'
                ? r.name.toLowerCase().includes(q) || r.slug?.toLowerCase().includes(q)
                : r.entity_type?.toLowerCase().includes(q) || r._id.toLowerCase().includes(q)
        );
    }, [requests, searchQuery, activeTab]);

    const StatusBadge = ({ status }) => {
        const configs = {
            PENDING: { color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Clock, label: 'Pending' },
            APPROVED: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2, label: 'Approved' },
            REJECTED: { color: 'bg-rose-50 text-rose-600 border-rose-100', icon: XCircle, label: 'Rejected' },
        };
        const config = configs[status] || configs.PENDING;
        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest font-inter ${config.color}`}>
                <config.icon size={12} />
                {config.label}
            </div>
        );
    };

    const StatCard = ({ label, value, icon: Icon, colorClass }) => (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
            </div>
            <div className={`w-12 h-12 ${colorClass} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                <Icon size={24} />
            </div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Layers size={20} />
                        </div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Merchant Console</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit">My Requests</h1>
                    <p className="text-slate-500 mt-2 font-medium text-sm font-inter text-balance">Track your requests for new categories and product changes.</p>
                </div>
                <div className="flex gap-3">
                    {activeTab === 'CATEGORY' && (
                        <Button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-slate-900 border-slate-900 shadow-xl shadow-slate-900/20 py-6 px-8 rounded-2xl font-black text-xs uppercase tracking-widest group"
                        >
                            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                            New Category
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Requests" value={stats.total} icon={GitPullRequest} colorClass="bg-slate-50 text-slate-400" />
                <StatCard label="Reviewing" value={stats.pending} icon={Clock} colorClass="bg-amber-50 text-amber-500" />
                <StatCard label="Approved" value={stats.approved} icon={CheckCircle2} colorClass="bg-emerald-50 text-emerald-500" />
                <StatCard label="Rejected" value={stats.rejected} icon={XCircle} colorClass="bg-rose-50 text-rose-500" />
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {/* Tabs & Search */}
                <div className="px-8 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-50 pb-8">
                    <div className="flex gap-8">
                        {['CATEGORY', 'CHANGE'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-2 text-[11px] font-black uppercase tracking-[0.15em] transition-all relative font-inter ${activeTab === tab ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {tab === 'CATEGORY' ? 'New Categories' : 'Product Changes'}
                                {activeTab === tab && (
                                    <div className="absolute -bottom-8 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(var(--primary-rgb),0.3)] animate-in fade-in slide-in-from-bottom-2" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="relative group max-w-sm w-full">
                        <input
                            type="text"
                            placeholder={`Search ${activeTab === 'CATEGORY' ? 'categories...' : 'requests...'}`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                    </div>
                </div>

                {/* List Body */}
                <div className="p-8 space-y-4 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4 opacity-50">
                            <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading requests...</p>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                <Search size={40} />
                            </div>
                            <div>
                                <h3 className="text-slate-900 font-black tracking-tight">No match found</h3>
                                <p className="text-slate-400 text-sm font-medium font-inter mt-1">Try adjusting your filters or search terms.</p>
                            </div>
                        </div>
                    ) : (
                        filteredRequests.map((req) => (
                            <div
                                key={req._id}
                                onClick={() => setSelectedRequest(req)}
                                className="group bg-white p-6 rounded-3xl border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500 shadow-inner">
                                        {activeTab === 'CATEGORY' ? <Tag size={28} /> : <GitPullRequest size={28} />}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-black text-slate-900 tracking-tight text-lg font-outfit uppercase">
                                                {activeTab === 'CATEGORY' ? req.name : `${req.entity_type} Change`}
                                            </h3>
                                            {activeTab === 'CHANGE' && (
                                                <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-md tracking-tighter shadow-sm">
                                                    #{req._id.slice(-6).toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Clock size={12} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                                    {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently'}
                                                </span>
                                            </div>

                                            {activeTab === 'CATEGORY' ? (
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <Hash size={12} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider italic">
                                                        Slug: {req.slug}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    {Object.keys(req.requested_changes || {}).map(field => (
                                                        <span key={field} className="text-[8px] bg-primary/5 text-primary px-2 py-0.5 rounded-full border border-primary/10 font-black uppercase tracking-widest">{field}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 pl-16 md:pl-0">
                                    <div className="hidden lg:block text-right pr-8 border-r border-slate-50">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Last Update</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase italic">
                                            {req.updatedAt || req.createdAt
                                                ? new Date(req.updatedAt || req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : 'Recently'}
                                        </p>
                                    </div>

                                    <StatusBadge status={req.status} />

                                    <div className="w-10 h-10 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:border-primary/20 transition-all group-hover:translate-x-1">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal - New Category Suggestion */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
                    <div className="bg-white rounded-[3rem] w-full max-w-xl relative z-10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center text-primary">
                                    <Tag size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">New Category</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Send a request for a new category</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all text-slate-300 hover:text-slate-900">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCategorySubmit} className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-8 space-y-6">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Category Name</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Sustainable Goods"
                                            className="w-full px-12 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black focus:ring-8 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        <Edit className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                    </div>
                                </div>

                                {/* Parent Select */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Parent Category (Optional)</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-12 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black focus:ring-8 focus:ring-primary/5 focus:border-primary/20 appearance-none transition-all outline-none cursor-pointer"
                                            value={formData.parent_category_id}
                                            onChange={(e) => setFormData({ ...formData, parent_category_id: e.target.value })}
                                        >
                                            <option value="">None (Top Level)</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 rotate-90" size={18} />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Reason for New Category</label>
                                    <div className="relative group">
                                        <textarea
                                            placeholder="Why should this be added? Provide context..."
                                            className="w-full px-12 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:ring-8 focus:ring-primary/5 focus:border-primary/20 transition-all min-h-[120px] outline-none resize-none"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                        <MessageSquare className="absolute left-4 top-5 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Area */}
                            <div className="p-8 bg-slate-50/30 border-t border-slate-100 mt-4 flex gap-4">
                                <Button
                                    type="submit"
                                    className="flex-1 py-5 rounded-3xl font-black bg-slate-900 border-slate-900 shadow-2xl shadow-slate-900/10 uppercase tracking-widest text-xs flex items-center justify-center gap-2 group"
                                >
                                    Send Request
                                    <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                    className="px-8 rounded-3xl font-bold border-slate-200 text-slate-500 hover:bg-slate-50"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Request Details Modal */}
            <RequestDetailsModal
                isOpen={!!selectedRequest}
                onClose={() => setSelectedRequest(null)}
                request={selectedRequest}
                type={activeTab} // Important: tell the modal which type it is
            />
        </div>
    );
};

export default Requests;
