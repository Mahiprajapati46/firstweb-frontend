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

    useEffect(() => {
        setPage(1); // Reset to first page when filter changes
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
        if (!window.confirm('CRITICAL: This will permanently delete the product and all images. This action cannot be undone. Continue?')) return;
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
        toast.success(`${type} ID copied to clipboard`);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inventory</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage and monitor your store's product catalog.</p>
                </div>
                <Button
                    onClick={() => navigate('/merchant/products/new')}
                    className="flex items-center gap-2 bg-primary hover:bg-accent text-white px-6 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all duration-300"
                >
                    <Plus size={20} />
                    Create Product
                </Button>
            </div>

            {/* Quick Stats Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map((status) => {
                    const count = stats[status] || 0;
                    const isActive = filterStatus === status;
                    return (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`p-4 rounded-2xl border transition-all duration-300 text-left group ${isActive
                                ? 'bg-white border-primary shadow-xl shadow-primary/5 ring-1 ring-primary'
                                : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'
                                }`}
                        >
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{status === 'ALL' ? 'Total' : status}</p>
                            <p className={`text-2xl font-black ${isActive ? 'text-primary' : 'text-slate-900'}`}>{count}</p>
                        </button>
                    );
                })}
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search products by title..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="px-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-primary/5 shadow-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden shadow-slate-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Product Info</th>
                                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Variants</th>
                                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="4" className="px-8 py-8"><div className="h-4 bg-slate-100 rounded w-1/3"></div></td>
                                    </tr>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                <Box size={32} />
                                            </div>
                                            <p className="text-slate-500 font-bold">No products found matching your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center group-hover:shadow-md transition-shadow">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon size={20} className="text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 group/id">
                                                        <h3 className="text-sm font-black text-slate-900 truncate">{product.title}</h3>
                                                        <button
                                                            onClick={() => copyToClipboard(product._id, 'Product')}
                                                            className="opacity-0 group-hover/id:opacity-100 p-1 hover:bg-slate-100 rounded transition-all text-slate-400"
                                                            title="Copy Product ID"
                                                        >
                                                            <Copy size={12} />
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate">
                                                        Added {new Date(product.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${STATUS_CHIPS[product.status]?.color || STATUS_CHIPS.DRAFT.color}`}>
                                                    {React.createElement(STATUS_CHIPS[product.status]?.icon || STATUS_CHIPS.DRAFT.icon, { size: 12 })}
                                                    {STATUS_CHIPS[product.status]?.label || 'Draft'}
                                                </div>
                                                {product.status === 'REJECTED' && product.rejected_reason && (
                                                    <p className="text-[9px] font-bold text-rose-500 max-w-[150px] leading-tight flex items-center gap-1">
                                                        <AlertCircle size={10} />
                                                        {product.rejected_reason}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <button
                                                onClick={() => navigate(`/merchant/products/${product._id}/variants`)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-primary/10 rounded-lg group/var transition-all"
                                            >
                                                <span className="text-xs font-black text-slate-700 group-hover/var:text-primary">{product.stats?.variant_count || 0}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover/var:text-primary/70">Variants</span>
                                                <ChevronRight size={12} className="text-slate-300 group-hover/var:text-primary/50 group-hover/var:translate-x-0.5 transition-all" />
                                            </button>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/merchant/products/${product._id}/edit`)}
                                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                    title="Edit Product"
                                                >
                                                    <Edit2 size={18} />
                                                </button>

                                                <button
                                                    onClick={() => navigate(`/merchant/products/${product._id}`)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                <button
                                                    onClick={() => navigate(`/merchant/products/${product._id}/variants`)}
                                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                    title="Manage Variants"
                                                >
                                                    <Boxes size={18} />
                                                </button>

                                                {product.status === 'APPROVED' && (
                                                    <button
                                                        onClick={() => navigate('/merchant/requests', { state: { productId: product._id } })}
                                                        className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                        title="Create Change Request"
                                                    >
                                                        <Clock size={18} />
                                                    </button>
                                                )}

                                                {product.status === 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleToggleActive(product._id, product.is_active)}
                                                        className={`p-2 rounded-lg transition-all ${product.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-rose-500 hover:bg-rose-50'}`}
                                                        title={product.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {product.is_active ? <Eye size={18} /> : <EyeOff size={18} className="opacity-30" />}
                                                    </button>
                                                )}

                                                {product.status === 'DRAFT' && (
                                                    <button
                                                        onClick={() => handleSubmitForApproval(product._id)}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                        title="Submit for Approval"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                )}

                                                {product.status === 'REJECTED' && (
                                                    <button
                                                        onClick={() => handleResubmit(product._id)}
                                                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                        title="Resubmit for Approval"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                )}

                                                {['DRAFT', 'REJECTED'].includes(product.status) && (
                                                    <div className="flex gap-1 border-l border-slate-100 ml-1 pl-1">
                                                        <button
                                                            onClick={() => handleDelete(product._id)}
                                                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                            title="Soft Delete (Deactivate)"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handlePermanentDelete(product._id)}
                                                            className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded-lg transition-all"
                                                            title="Permanent Delete (Irreversible)"
                                                        >
                                                            <Trash2 size={18} strokeWidth={3} />
                                                        </button>
                                                    </div>
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
                <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="rounded-xl"
                    >
                        Previous
                    </Button>
                    <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setPage(i + 1)}
                                className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${page === i + 1
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="rounded-xl"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Products;
