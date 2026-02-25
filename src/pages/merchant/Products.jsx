import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    EyeOff,
    Edit2,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Clock,
    Box,
    Layers,
    Boxes,
    ChevronRight,
    Image as ImageIcon
} from 'lucide-react';
import merchantApi from '../../api/merchant';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { Copy } from 'lucide-react';
import ChangeRequestModal from '../../components/merchant/ChangeRequestModal';

const STATUS_CHIPS = {
    DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Clock },
    PENDING: { label: 'Pending Approval', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: AlertCircle },
    APPROVED: { label: 'Approved', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle2 },
    REJECTED: { label: 'Rejected', color: 'bg-rose-50 text-rose-600 border-rose-200', icon: AlertCircle },
};

const Products = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({ ALL: 0 });
    const [categories, setCategories] = useState([]);
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        setPage(1);
        fetchProducts(1);
    }, [filterStatus]);

    useEffect(() => {
        fetchProducts(page);
    }, [page]);

    const fetchProducts = async (targetPage = page) => {
        try {
            setLoading(true);
            const params = {
                page: targetPage,
                limit: 10,
                ...(filterStatus !== 'ALL' && { status: filterStatus })
            };
            const response = await merchantApi.getProducts(params);
            setProducts(response.data || []);
            setTotalPages(response.pagination?.pages || 1);
            setStats(response.stats || { ALL: 0 });

            if (categories.length === 0) {
                const catResponse = await merchantApi.getCategories();
                setCategories(catResponse.data || []);
            }
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitForApproval = async (productId) => {
        try {
            await merchantApi.submitProduct(productId);
            toast.success('Product submitted for approval');
            fetchProducts();
        } catch (error) {
            toast.error(error.message || 'Submission failed');
        }
    };

    const handleResubmit = async (productId) => {
        try {
            await merchantApi.resubmitProduct(productId);
            toast.success('Product resubmitted for approval');
            fetchProducts();
        } catch (error) {
            toast.error(error.message || 'Resubmission failed');
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to deactivate this product?')) return;
        try {
            await merchantApi.deleteProduct(productId);
            toast.success('Product deactivated');
            fetchProducts();
        } catch (error) {
            toast.error('Failed to deactivate product');
        }
    };

    const handlePermanentDelete = async (productId) => {
        if (!window.confirm('CRITICAL: Irreversible action. Continue?')) return;
        try {
            await merchantApi.permanentDeleteProduct(productId);
            toast.success('Product permanently deleted');
            fetchProducts();
        } catch (error) {
            toast.error('Permanent deletion failed');
        }
    };

    const handleToggleActive = async (productId, currentStatus) => {
        try {
            const formData = new FormData();
            formData.append('is_active', !currentStatus);
            await merchantApi.updateProduct(productId, formData);
            toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'}`);
            fetchProducts();
        } catch (error) {
            toast.error(error.message || 'Toggle failed');
        }
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        toast.success(`${type} ID copied`);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary tracking-tight">Market Inventory</h1>
                    <p className="text-gray-500 mt-1">Manage and monitor your digital assets across the platform.</p>
                </div>
                <button
                    onClick={() => navigate('/merchant/products/new')}
                    className="btn-boutique-primary h-12 px-8 shadow-xl shadow-primary/20"
                >
                    <Plus size={18} className="mr-2" /> CREATE PRODUCT
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map((status) => {
                    const count = stats[status] || 0;
                    const isActive = filterStatus === status;
                    return (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`card-premium p-6 text-left transition-all duration-300 ${isActive
                                ? 'bg-primary border-primary shadow-xl scale-[1.02]'
                                : 'hover:border-accent group'
                                }`}
                        >
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isActive ? 'text-gray-400' : 'text-gray-400 group-hover:text-accent'}`}>
                                {status === 'ALL' ? 'Total Pipeline' : status}
                            </p>
                            <p className={`text-3xl font-black ${isActive ? 'text-white' : 'text-primary'}`}>{count}</p>
                        </button>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search product identifiers or titles..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-xs font-black uppercase tracking-widest text-primary focus:ring-4 focus:ring-primary/5 shadow-sm appearance-none cursor-pointer"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="ALL">ALL STATES</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                </select>
            </div>

            {/* Product Table */}
            <div className="card-premium overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Definition</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Variants</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="4" className="px-8 py-8"><div className="h-4 bg-gray-50 rounded w-1/4"></div></td>
                                    </tr>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Box size={48} className="text-primary" />
                                            <p className="text-sm font-bold text-primary uppercase tracking-widest">No matching assets found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-all">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon size={20} className="text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-black text-primary truncate leading-tight">{product.title}</h3>
                                                        <button
                                                            onClick={() => copyToClipboard(product._id, 'Asset')}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded text-gray-400 transition-all"
                                                        >
                                                            <Copy size={12} />
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">
                                                        ID: {product._id.slice(-8).toUpperCase()} · {new Date(product.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none w-fit ${product.status === 'APPROVED' ? 'bg-green-50 text-green-600' :
                                                    product.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                                                        product.status === 'REJECTED' ? 'bg-rose-50 text-rose-600' :
                                                            'bg-gray-50 text-gray-500'
                                                    }`}>
                                                    <div className={`w-1 h-1 rounded-full ${product.status === 'APPROVED' ? 'bg-green-600' :
                                                        product.status === 'PENDING' ? 'bg-amber-600' :
                                                            product.status === 'REJECTED' ? 'bg-rose-600' :
                                                                'bg-gray-500'
                                                        }`} />
                                                    {product.status}
                                                </div>
                                                {product.status === 'REJECTED' && product.rejected_reason && (
                                                    <p className="text-[9px] font-bold text-rose-500 max-w-[180px] leading-tight flex items-center gap-1">
                                                        <AlertCircle size={10} /> {product.rejected_reason}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <button
                                                onClick={() => navigate(`/merchant/products/${product._id}/variants`)}
                                                className="flex items-center gap-3 px-4 py-2 bg-gray-50 hover:bg-accent/5 rounded-xl group/var transition-all"
                                            >
                                                <span className="text-sm font-black text-primary group-hover/var:text-accent">{product.stats?.variant_count || 0}</span>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover/var:text-accent/70">Units</span>
                                                <ChevronRight size={14} className="text-gray-300 group-hover/var:text-accent/50 group-hover/var:translate-x-1 transition-all" />
                                            </button>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => navigate(`/merchant/products/${product._id}/edit`)}
                                                    className="p-2.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-xl transition-all"
                                                    title="Refine Specification"
                                                >
                                                    <Edit2 size={18} />
                                                </button>

                                                <button
                                                    onClick={() => navigate(`/merchant/products/${product._id}`)}
                                                    className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                    title="Inspect Asset"
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                {product.status === 'DRAFT' && (
                                                    <button
                                                        onClick={() => handleSubmitForApproval(product._id)}
                                                        className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                                        title="Deploy to Moderation"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                )}

                                                {product.status === 'REJECTED' && (
                                                    <button
                                                        onClick={() => handleResubmit(product._id)}
                                                        className="p-2.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                                        title="Re-deploy Asset"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                )}

                                                {['DRAFT', 'REJECTED'].includes(product.status) && (
                                                    <button
                                                        onClick={() => handleDelete(product._id)}
                                                        className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                        title="Decommission Asset"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="p-2.5 rounded-xl border border-gray-100 bg-white text-primary disabled:opacity-30 hover:bg-gray-50 transition-all font-black text-xs uppercase tracking-widest"
                    >
                        Prev
                    </button>
                    <div className="flex gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setPage(i + 1)}
                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${page === i + 1
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'bg-white text-gray-400 border border-gray-100 hover:border-accent hover:text-accent'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="p-2.5 rounded-xl border border-gray-100 bg-white text-primary disabled:opacity-30 hover:bg-gray-50 transition-all font-black text-xs uppercase tracking-widest"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Products;
