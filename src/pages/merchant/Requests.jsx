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
import RequestDetailsModal from '../../components/merchant/RequestDetailsModal';

const Requests = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('CATEGORY'); // CATEGORY | CHANGE
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        parent_category_id: ''
    });

    useEffect(() => {
        if (location.state?.type === 'CHANGE' || location.state?.productId) {
            setActiveTab('CHANGE');
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
            // Auto-generate slug from name
            await merchantApi.submitCategoryRequest(formData);

            toast.success('Category request submitted');
            setShowModal(false);
            setFormData({ name: '', slug: '', description: '', parent_category_id: '' });
            fetchCategoryRequests();
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
                    <p className="text-slate-500 mt-1 font-medium italic">Track your category suggestions and product modification status.</p>
                </div>
                {activeTab === 'CATEGORY' && (
                    <Button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-slate-900 border-slate-900"
                    >
                        <Plus size={20} />
                        Suggest New Category
                    </Button>
                )}
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
                        {tab === 'CATEGORY' ? 'Category Suggestions' : 'Modification Status'}
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
                        <div
                            key={req._id}
                            onClick={() => {
                                if (activeTab === 'CHANGE') setSelectedRequest(req);
                            }}
                            className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group ${activeTab === 'CHANGE' ? 'cursor-pointer hover:border-primary/30' : ''}`}
                        >
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
                                {activeTab === 'CHANGE' && (
                                    <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider flex items-center gap-1">
                                        View Details <ChevronRight size={12} />
                                    </span>
                                )}
                                <ChevronRight size={20} className="text-slate-300 group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal - New Category Suggestion */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg relative z-10 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Suggest Category</h2>
                                <p className="text-slate-500 text-[10px] font-black mt-1 uppercase tracking-widest">Help us expand our catalog structure.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <XCircle className="text-slate-300 hover:text-slate-900" size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCategorySubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Proposed Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Sustainable Living"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Why should we add this? (Optional)</label>
                                    <textarea
                                        placeholder="Explain the market demand or specific use-case..."
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all h-28 outline-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button type="submit" className="flex-1 py-4 rounded-2xl font-black bg-primary shadow-xl shadow-primary/20">Submit Suggestion</Button>
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="px-8 rounded-2xl font-bold border-slate-200">Cancel</Button>
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
            />
        </div>
    );
};

export default Requests;
