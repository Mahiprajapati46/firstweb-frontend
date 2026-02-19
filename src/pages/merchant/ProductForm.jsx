import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Upload,
    X,
    Check,
    AlertCircle,
    Info,
    Layout,
    Lock,
    Clock
} from 'lucide-react';
import merchantApi from '../../api/merchant';
import adminApi from '../../api/admin';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [productStatus, setProductStatus] = useState('DRAFT');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category_ids: [],
        pricing: {
            min_price: '',
            max_price: '',
            currency: 'INR'
        }
    });
    const [images, setImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const catResponse = await merchantApi.getCategories();
            setCategories(catResponse.data || []);

            if (isEdit) {
                const productResponse = await merchantApi.getProduct(id);
                const product = productResponse.data;
                setProductStatus(product.status);
                setFormData({
                    title: product.title,
                    description: product.description,
                    category_ids: product.category_ids?.map(c => typeof c === 'object' ? c._id : c) || [],
                    pricing: {
                        min_price: product.pricing?.min_price || '',
                        max_price: product.pricing?.max_price || '',
                        currency: product.pricing?.currency || 'INR'
                    }
                });
                setPreviewImages(product.images || []);
            }
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
            setFetching(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        // Track files with a unique ID for easier removal
        const newFiles = files.map(file => {
            file.previewUrl = URL.createObjectURL(file);
            return file;
        });
        setImages(prev => [...prev, ...newFiles]);

        const newPreviews = newFiles.map(file => ({
            url: file.previewUrl,
            isLocal: true,
            originalFile: file
        }));
        setPreviewImages(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        const preview = previewImages[index];
        if (preview.isLocal) {
            setImages(prev => prev.filter(f => f !== preview.originalFile));
            URL.revokeObjectURL(preview.url);
        }
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);

            // Backend expects category_ids to be parsed from string if sent as multiple
            formData.category_ids.forEach(catId => data.append('category_ids', catId));

            // Backend expects pricing fields
            data.append('pricing[min_price]', formData.pricing.min_price);
            data.append('pricing[max_price]', formData.pricing.max_price || formData.pricing.min_price);
            data.append('pricing[currency]', formData.pricing.currency);

            images.forEach(image => {
                data.append('images', image);
            });

            if (isEdit) {
                await merchantApi.updateProduct(id, data);
                toast.success('Product updated successfully');
            } else {
                await merchantApi.createProduct(data);
                toast.success('Product initialized as DRAFT');
            }
            navigate('/merchant/products');
        } catch (error) {
            toast.error(error.message || 'Saving failed');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-20 text-center font-black animate-pulse">Loading Product Data...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/merchant/products')}
                    className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        {isEdit ? 'Edit Product' : 'Create New Product'}
                    </h1>
                    <p className="text-slate-500 font-medium lowercase">
                        {isEdit ? 'Update details for your catalog item.' : 'Set up your base product. You can add variants later.'}
                    </p>
                </div>
            </div>

            {isEdit && ['APPROVED', 'PENDING'].includes(productStatus) && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4 animate-in fade-in zoom-in duration-500 shadow-sm">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0 shadow-inner">
                        <Lock size={20} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">
                                {productStatus === 'APPROVED' ? 'Approved Product Protocol' : 'Submission Pending Protocol'}
                            </h4>
                            <span className="text-[10px] font-black bg-amber-200/50 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-tighter">Read Only</span>
                        </div>
                        <p className="text-xs text-amber-700 font-medium mt-1 leading-relaxed">
                            High-level fields (Title, Description, Categories) are locked while the product is <span className="font-bold underline text-amber-900">{productStatus.toLowerCase()}</span>.
                            Changes to these core attributes must be requested via the <span className="font-bold">Requests Hub</span>.
                        </p>
                        <div className="mt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/merchant/requests', { state: { productId: id, entityType: 'product' } })}
                                className="px-4 py-2 bg-amber-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-md active:scale-95"
                            >
                                Submit Change Request
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/merchant/requests')}
                                className="px-4 py-2 bg-white border border-amber-200 text-amber-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-100 transition-all active:scale-95"
                            >
                                View Requests Hub
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-8 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <Info size={16} />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Basic Information</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <Input
                                label="Product Title"
                                placeholder="e.g., Premium Leather Jacket"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                disabled={['APPROVED', 'PENDING'].includes(productStatus)}
                                className={['APPROVED', 'PENDING'].includes(productStatus) ? 'pr-10' : ''}
                            />
                            {['APPROVED', 'PENDING'].includes(productStatus) && (
                                <div className="absolute right-3 top-[38px] text-amber-500 pointer-events-none group-hover:scale-110 transition-transform" title="Locked - Change Request Required">
                                    <Lock size={16} />
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Minimum Price (INR)"
                                type="number"
                                placeholder="0.00"
                                value={formData.pricing.min_price}
                                onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, min_price: e.target.value } })}
                                required
                            />
                            <Input
                                label="Maximum Price (Optional)"
                                type="number"
                                placeholder="0.00"
                                value={formData.pricing.max_price}
                                onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, max_price: e.target.value } })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                            <div className="relative">
                                <textarea
                                    className={`w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-primary/5 min-h-[150px] placeholder:text-slate-400 font-medium ${['APPROVED', 'PENDING'].includes(productStatus) ? 'opacity-60 cursor-not-allowed pr-10' : ''}`}
                                    placeholder="Details about materials, features, and care instructions..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    disabled={['APPROVED', 'PENDING'].includes(productStatus)}
                                />
                                {['APPROVED', 'PENDING'].includes(productStatus) && (
                                    <div className="absolute right-4 top-4 text-amber-500 pointer-events-none" title="Locked - Change Request Required">
                                        <Lock size={16} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <Layout size={16} />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Categories</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat._id}
                                type="button"
                                onClick={() => {
                                    if (['APPROVED', 'PENDING'].includes(productStatus)) {
                                        toast.error('Categories are locked. Submit a change request to modify.');
                                        return;
                                    }
                                    const isSelected = formData.category_ids.includes(cat._id);
                                    if (isSelected) {
                                        setFormData({ ...formData, category_ids: formData.category_ids.filter(id => id !== cat._id) });
                                    } else {
                                        setFormData({ ...formData, category_ids: [...formData.category_ids, cat._id] });
                                    }
                                }}
                                className={`relative px-4 py-3 rounded-2xl border transition-all text-xs font-bold text-left ${formData.category_ids.includes(cat._id)
                                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'
                                    } ${['APPROVED', 'PENDING'].includes(productStatus) ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                <span className="flex items-center justify-between">
                                    {cat.name}
                                    {['APPROVED', 'PENDING'].includes(productStatus) && <Lock size={12} className="text-amber-500" />}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Media */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                <Upload size={16} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Product Images</h2>
                        </div>
                        <label className="cursor-pointer bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                            Upload Files
                            <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {previewImages.map((img, idx) => (
                            <div key={idx} className="aspect-square relative group bg-slate-100 rounded-3xl overflow-hidden border border-slate-200">
                                <img src={img.url} alt="" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-2 right-2 p-1.5 bg-white/90 text-rose-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                >
                                    <X size={14} />
                                </button>
                                {!img.isLocal && (
                                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-500/90 text-white text-[8px] font-black uppercase tracking-tighter rounded-full">
                                        Saved
                                    </div>
                                )}
                            </div>
                        ))}
                        <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
                            <Upload size={24} className="text-slate-300 group-hover:text-primary transition-all" />
                            <span className="text-[10px] font-black text-slate-400 group-hover:text-primary uppercase tracking-widest mt-2">New Media</span>
                            <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                        </label>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-4 pb-8">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigate('/merchant/products')}
                        className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        loading={loading}
                        className="px-10 py-3 bg-primary hover:bg-accent text-white rounded-2xl font-black shadow-xl shadow-primary/20 transition-all"
                    >
                        {isEdit ? 'Save Changes' : 'Initialize Product'}
                    </Button>
                </div>
            </form >
        </div >
    );
};

export default ProductForm;
