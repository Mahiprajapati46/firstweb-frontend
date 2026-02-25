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
    Clock,
    Plus
} from 'lucide-react';
import merchantApi from '../../api/merchant';
import adminApi from '../../api/admin';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';
import ChangeRequestModal from '../../components/merchant/ChangeRequestModal';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [productStatus, setProductStatus] = useState('DRAFT');
    const [showChangeModal, setShowChangeModal] = useState(false);
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
            toast.error('Failed to load product details');
        } finally {
            setLoading(false);
            setFetching(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
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

            formData.category_ids.forEach(catId => data.append('category_ids', catId));

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
                toast.success('Product created as DRAFT');
            }
            navigate('/merchant/products');
        } catch (error) {
            toast.error(error.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Loading Product Data...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Change Request Modal */}
            <ChangeRequestModal
                isOpen={showChangeModal}
                onClose={() => setShowChangeModal(false)}
                entityType="PRODUCT"
                entityId={id}
                currentData={formData}
                categories={categories}
            />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/merchant/products')}
                        className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/20 hover:shadow-xl transition-all group"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-primary tracking-tight">
                            {isEdit ? 'Edit Product' : 'Create New Product'}
                        </h1>
                        <p className="text-gray-500 font-medium text-sm mt-1">
                            {isEdit ? 'Update details for your catalog item.' : 'Set up your base product. You can add variants later.'}
                        </p>
                    </div>
                </div>

                {isEdit && ['APPROVED', 'PENDING'].includes(productStatus) && (
                    <div className="bg-primary/5 border border-primary/10 rounded-2xl px-6 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary italic font-black">
                            {productStatus.charAt(0)}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest whitespace-nowrap">Status: {productStatus}</p>
                            <p className="text-[11px] text-gray-500 font-medium italic">Edit permissions restricted</p>
                        </div>
                    </div>
                )}
            </div>

            {isEdit && ['APPROVED', 'PENDING'].includes(productStatus) && (
                <div className="bg-primary rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-primary/20 relative overflow-hidden animate-in zoom-in duration-500">
                    <div className="relative z-10 w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-accent italic font-black text-2xl">
                        !
                    </div>
                    <div className="relative z-10 flex-1 space-y-1">
                        <h4 className="text-lg font-black tracking-tight italic">Product Locked</h4>
                        <p className="text-white/60 text-sm font-medium leading-relaxed">
                            Primary fields (Title, Categories, Content) are locked because the product is {productStatus === 'APPROVED' ? 'Approved' : 'Pending Verification'}.
                            Please submit a change request to modify these fields.
                        </p>
                    </div>
                    <div className="relative z-10 flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={() => setShowChangeModal(true)}
                            className="px-8 py-3 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-primary transition-all shadow-lg active:scale-95 flex items-center gap-2"
                        >
                            <Clock size={16} />
                            Request Change
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/merchant/requests')}
                            className="px-8 py-3 bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/20 transition-all font-inter"
                        >
                            View Requests
                        </button>
                    </div>
                    <Lock size={200} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    {/* Basic Information */}
                    <div className="card-premium p-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary border border-gray-100 italic font-black">
                                01
                            </div>
                            <h2 className="text-xl font-black text-primary tracking-tight">Basic Details</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="relative group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Product Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Premium Leather Jacket"
                                    className={`w-full px-8 py-5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-black tracking-tight text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-gray-300 ${['APPROVED', 'PENDING'].includes(productStatus) ? 'opacity-50 cursor-not-allowed pr-14' : ''}`}
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    disabled={['APPROVED', 'PENDING'].includes(productStatus)}
                                />
                                {['APPROVED', 'PENDING'].includes(productStatus) && (
                                    <Lock size={18} className="absolute right-6 bottom-5 text-accent" />
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Description</label>
                                <div className="relative">
                                    <textarea
                                        className={`w-full px-8 py-6 bg-gray-50/50 border border-gray-100 rounded-3xl text-sm font-medium text-gray-600 leading-relaxed focus:ring-4 focus:ring-primary/5 focus:border-primary min-h-[200px] transition-all placeholder:text-gray-300 italic ${['APPROVED', 'PENDING'].includes(productStatus) ? 'opacity-50 cursor-not-allowed pr-14' : ''}`}
                                        placeholder="Describe your product materials, features, and care instructions..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        disabled={['APPROVED', 'PENDING'].includes(productStatus)}
                                    />
                                    {['APPROVED', 'PENDING'].includes(productStatus) && (
                                        <Lock size={18} className="absolute right-6 top-6 text-accent" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Media Gallery */}
                    <div className="card-premium p-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary border border-gray-100">
                                    <Upload size={20} />
                                </div>
                                <h2 className="text-xl font-black text-primary tracking-tight">Product Images</h2>
                            </div>
                            <label className="cursor-pointer bg-primary text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:shadow-xl transition-all active:scale-95">
                                Upload Images
                                <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                            </label>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {previewImages.map((img, idx) => (
                                <div key={idx} className="aspect-square relative w-full bg-gray-50 rounded-[2rem] overflow-hidden border border-gray-100">
                                    <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-4 right-4 p-2 bg-white/90 text-rose-600 rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <X size={16} />
                                    </button>
                                    {!img.isLocal && (
                                        <div className="absolute bottom-4 left-4 px-3 py-1 bg-accent text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                                            Saved
                                        </div>
                                    )}
                                </div>
                            ))}
                            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[2rem] hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-accent group-hover:bg-white transition-all shadow-sm">
                                    <Plus size={24} />
                                </div>
                                <span className="text-[10px] font-black text-gray-400 group-hover:text-accent uppercase tracking-[0.2em] mt-4">Add More</span>
                                <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    {/* Pricing Specifications */}
                    <div className="card-premium p-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary border border-gray-100 italic font-black">
                                ₹
                            </div>
                            <h2 className="text-xl font-black text-primary tracking-tight">Pricing</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Min Price (INR)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-lg font-black text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                                    value={formData.pricing.min_price}
                                    onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, min_price: e.target.value } })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Max Price (Optional)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-lg font-black text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                                    value={formData.pricing.max_price}
                                    onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, max_price: e.target.value } })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Taxonomy/Categories */}
                    <div className="card-premium p-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary border border-gray-100">
                                <Layout size={20} />
                            </div>
                            <h2 className="text-xl font-black text-primary tracking-tight">Categories</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {categories.map((cat) => (
                                <button
                                    key={cat._id}
                                    type="button"
                                    onClick={() => {
                                        if (['APPROVED', 'PENDING'].includes(productStatus)) {
                                            toast.error('Categories are locked. Request a change.');
                                            return;
                                        }
                                        const isSelected = formData.category_ids.includes(cat._id);
                                        if (isSelected) {
                                            setFormData({ ...formData, category_ids: formData.category_ids.filter(id => id !== cat._id) });
                                        } else {
                                            setFormData({ ...formData, category_ids: [...formData.category_ids, cat._id] });
                                        }
                                    }}
                                    className={`relative px-6 py-4 rounded-xl border-l-4 transition-all text-[11px] font-black uppercase tracking-widest text-left flex items-center justify-between group ${formData.category_ids.includes(cat._id)
                                        ? 'bg-primary border-accent text-white shadow-xl shadow-primary/10'
                                        : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-white hover:border-primary/20 hover:text-primary'
                                        } ${['APPROVED', 'PENDING'].includes(productStatus) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {cat.name}
                                    {formData.category_ids.includes(cat._id) ? (
                                        <Check size={14} className="text-accent" />
                                    ) : (
                                        ['APPROVED', 'PENDING'].includes(productStatus) && <Lock size={12} className="text-accent opacity-50" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="card-premium p-10 space-y-6 bg-gray-50/50 border-none">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs transition-all shadow-2xl ${loading ? 'opacity-50' : 'bg-primary text-white hover:bg-black hover:-translate-y-1 shadow-primary/20'}`}
                        >
                            {loading ? 'Saving...' : isEdit ? 'Save Product' : 'Create Product'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/merchant/products')}
                            className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] text-gray-400 hover:text-primary transition-all italic underline underline-offset-8 decoration-gray-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
