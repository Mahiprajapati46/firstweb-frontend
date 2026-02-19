import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Edit2,
    Clock,
    CheckCircle2,
    AlertCircle,
    Box,
    DollarSign,
    Layers,
    Image as ImageIcon,
    Tag,
    Globe,
    BarChart3
} from 'lucide-react';
import merchantApi from '../../api/merchant';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const STATUS_CHIPS = {
    DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Clock },
    PENDING: { label: 'Pending Approval', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: AlertCircle },
    APPROVED: { label: 'Approved', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle2 },
    REJECTED: { label: 'Rejected', color: 'bg-rose-50 text-rose-600 border-rose-200', icon: AlertCircle },
};

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, varRes, catRes] = await Promise.all([
                merchantApi.getProduct(id),
                merchantApi.getVariants(id),
                merchantApi.getCategories()
            ]);
            setProduct(prodRes.data);
            setVariants(varRes.data || []);
            setCategories(catRes.data || []);
        } catch (error) {
            toast.error('Failed to load product details');
            navigate('/merchant/products');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!product) return null;

    const statusConfig = STATUS_CHIPS[product.status] || STATUS_CHIPS.DRAFT;
    const CategoryNames = product.category_ids?.map(id => {
        const cat = categories.find(c => c._id === (typeof id === 'object' ? id._id : id));
        return cat?.name;
    }).filter(Boolean).join(', ') || 'Uncategorized';

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/merchant/products')}
                        className="p-2 hover:bg-slate-100 rounded-xl"
                    >
                        <ArrowLeft size={24} className="text-slate-400" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{product.title}</h1>
                            <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${statusConfig.color}`}>
                                {React.createElement(statusConfig.icon, { size: 14 })}
                                {statusConfig.label}
                            </div>
                        </div>
                        <p className="text-slate-500 font-medium max-w-2xl">{product.description || 'No description provided.'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => navigate(`/merchant/products/${product._id}/variants`)}
                        className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                        <Layers size={18} className="mr-2" />
                        Manage Variants
                    </Button>
                    <Button
                        onClick={() => navigate(`/merchant/products/${product._id}/edit`)}
                        className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                    >
                        <Edit2 size={18} className="mr-2" />
                        Edit Product
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Images */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <ImageIcon size={20} className="text-primary" />
                            Product Images
                        </h2>
                        {product.images?.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {product.images.map((img, idx) => (
                                    <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-slate-100 bg-slate-50 group relative">
                                        <img src={img.url} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-xl p-8 text-center border border-dashed border-slate-200">
                                <p className="text-slate-400 font-medium">No images uploaded</p>
                            </div>
                        )}
                    </div>

                    {/* Variants Table */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Box size={20} className="text-primary" />
                                Variations
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                                    {variants.length}
                                </span>
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">SKU</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Attributes</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase text-right">Price</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase text-right">Stock</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {variants.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-slate-500 text-sm">
                                                No variants added yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        variants.map(v => (
                                            <tr key={v._id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 text-sm font-bold text-slate-700">{v.sku}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {Object.entries(v.attributes || {}).map(([key, val]) => (
                                                            <span key={key} className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase">
                                                                {key}: {val}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                                                    ₹{v.price.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${(v.stock_quantity || 0) > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                                        }`}>
                                                        {v.stock_quantity || 0}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Key Details */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Base Pricing</p>
                                <p className="text-lg font-black text-slate-900">
                                    {product.pricing?.min_price ? `₹${product.pricing.min_price}` : '-'}
                                    {product.pricing?.max_price && product.pricing?.max_price !== product.pricing?.min_price && ` - ₹${product.pricing.max_price}`}
                                    <span className="text-xs text-slate-400 font-bold ml-1">{product.pricing?.currency}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <Tag size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Category</p>
                                <p className="text-sm font-bold text-slate-900">{CategoryNames}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Globe size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Slug</p>
                                <p className="text-sm font-mono text-slate-600 break-all">{product.slug}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <BarChart3 size={18} className="text-slate-400" />
                            Performance
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-sm text-slate-500">Total Sales</span>
                                <span className="text-sm font-black text-slate-900">{product.stats?.total_sales || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-sm text-slate-500">Active Variants</span>
                                <span className="text-sm font-black text-slate-900">{variants.length}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-slate-500">Views</span>
                                <span className="text-sm font-black text-slate-900">{product.stats?.views || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
