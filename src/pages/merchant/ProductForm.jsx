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
import SearchableSelect from '../../components/ui/SearchableSelect';
import { productSchemas } from '../../validations/product.schema';
import { z } from 'zod';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [productStatus, setProductStatus] = useState('DRAFT');
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category_ids: [],
        variants: [
            { price: '', compare_at_price: '', stock: '', sku: '', gst_rate: 18, attributes: { Size: 'Standard' }, image: null }
        ],
        attribute_config: ['Size'],
        showAdvanced: false
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

                // Map existing variants if available, otherwise fallback to product pricing info
                const existingVariants = product.variants?.length > 0
                    ? product.variants.map(v => ({
                        _id: v._id,
                        price: v.price || '',
                        compare_at_price: v.compare_at_price || '',
                        stock: v.stock_quantity || 0,
                        sku: v.sku || '',
                        gst_rate: v.gst_rate || 18,
                        attributes: v.attributes || { size: 'Standard' },
                        image: v.images?.[0] || null
                    }))
                    : [{
                        price: product.pricing?.min_price || '',
                        gst_rate: 18,
                        stock: 0,
                        sku: '',
                        attributes: { size: 'Standard' },
                        image: null
                    }];

                // Extra: Identify unique attribute keys from variants
                const attrKeys = Array.from(new Set(
                    existingVariants.flatMap(v => Object.keys(v.attributes))
                ));

                setFormData({
                    title: product.title,
                    description: product.description,
                    category_ids: product.category_ids?.map(c => typeof c === 'object' ? c._id : c) || [],
                    variants: existingVariants,
                    attribute_config: attrKeys.length > 0 ? attrKeys : ['Size']
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

    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleBlur = (name, value) => {
        const currentData = { ...formData };

        // Handle nested paths like variants.0.price
        if (name.includes('.')) {
            const parts = name.split('.');
            if (parts[0] === 'variants') {
                const index = parseInt(parts[1]);
                const field = parts[2];
                const cleanValue = (field === 'price' || field === 'stock' || field === 'compare_at_price') ? (value === '' ? '' : Number(value)) : value;
                currentData.variants[index] = { ...currentData.variants[index], [field]: cleanValue };
            } else {
                const [parent, child] = parts;
                currentData[parent] = { ...currentData[parent], [child]: value };
            }
        } else {
            currentData[name] = value;
        }

        const dataToValidate = {
            ...currentData,
            images: previewImages.map(img => typeof img === 'string' ? img : img.url)
        };

        const result = productSchemas.create.safeParse(dataToValidate);

        if (!result.success) {
            const fieldIssue = result.error.issues.find(issue => {
                const path = issue.path.join('.');
                return path === name;
            });

            if (fieldIssue) {
                setFieldErrors(prev => ({ ...prev, [name]: fieldIssue.message }));
            } else {
                setFieldErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                });
            }
        } else {
            setFieldErrors({});
        }
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...formData.variants];
        if (field.startsWith('attributes.')) {
            const attrKey = field.split('.')[1];
            newVariants[index].attributes = { ...newVariants[index].attributes, [attrKey]: value };
        } else {
            newVariants[index][field] = value;
        }
        setFormData({ ...formData, variants: newVariants });
    };

    const addVariant = () => {
        const defaultAttrs = {};
        formData.attribute_config.forEach(key => {
            defaultAttrs[key] = '';
        });

        setFormData({
            ...formData,
            variants: [
                ...formData.variants,
                { price: '', compare_at_price: '', stock: '', sku: '', attributes: defaultAttrs, image: null }
            ],
            hasMultipleVariants: true
        });
    };

    const addAttributeKey = () => {
        const key = window.prompt("Enter option name (e.g. Color, Material):");
        if (!key || formData.attribute_config.includes(key)) return;

        const newVariants = formData.variants.map(v => ({
            ...v,
            attributes: { ...v.attributes, [key]: '' }
        }));

        setFormData({
            ...formData,
            attribute_config: [...formData.attribute_config, key],
            variants: newVariants
        });
    };

    const removeAttributeKey = (key) => {
        if (formData.attribute_config.length <= 1) {
            toast.error("At least one option is required");
            return;
        }

        const newVariants = formData.variants.map(v => {
            const newAttrs = { ...v.attributes };
            delete newAttrs[key];
            return { ...v, attributes: newAttrs };
        });

        setFormData({
            ...formData,
            attribute_config: formData.attribute_config.filter(k => k !== key),
            variants: newVariants
        });
    };

    const removeVariant = (index) => {
        if (formData.variants.length <= 1) {
            toast.error("At least one variant is required");
            return;
        }
        const newVariants = formData.variants.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            variants: newVariants
        });
    };

    const handleVariantImageChange = (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error('Unsupported image format');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error('Image too large (max 5MB)');
            return;
        }

        file.previewUrl = URL.createObjectURL(file);
        const newVariants = [...formData.variants];
        newVariants[index].image = {
            url: file.previewUrl,
            isLocal: true,
            originalFile: file
        };
        setFormData({ ...formData, variants: newVariants });
    };

    const removeVariantImage = (index) => {
        const newVariants = [...formData.variants];
        if (newVariants[index].image?.isLocal) {
            URL.revokeObjectURL(newVariants[index].image.url);
        }
        newVariants[index].image = null;
        setFormData({ ...formData, variants: newVariants });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

        const validFiles = [];
        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                toast.error(`${file.name} is not supported`);
                continue;
            }
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`${file.name} is too large`);
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        const newPreviews = validFiles.map(file => {
            file.previewUrl = URL.createObjectURL(file);
            return {
                url: file.previewUrl,
                isLocal: true,
                originalFile: file
            };
        });

        setPreviewImages(prev => [...prev, ...newPreviews]);
        setImages(prev => [...prev, ...validFiles]);
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
            const validationData = {
                ...formData,
                images: previewImages.map(img => typeof img === 'string' ? img : img.url),
                variants: formData.variants.map(v => ({
                    ...v,
                    price: v.price === '' ? 0 : Number(v.price),
                    compare_at_price: v.compare_at_price === '' ? undefined : Number(v.compare_at_price),
                    stock: v.stock === '' ? 0 : Number(v.stock)
                }))
            };
            const result = productSchemas.create.safeParse(validationData);

            if (!result.success) {
                const errors = {};
                result.error.issues.forEach(issue => {
                    errors[issue.path.join('.')] = issue.message;
                });
                setFieldErrors(errors);
                toast.error("Please correct the validation errors first");
                return;
            }

            setLoading(true);
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            formData.category_ids.forEach(catId => data.append('category_ids', catId));

            // Append global images
            images.forEach(image => data.append('images', image));

            // Handle variants and their images
            const processedVariants = formData.variants.map((v, idx) => {
                const variantData = { ...v };
                if (v.image?.isLocal) {
                    data.append(`variant_image_${idx}`, v.image.originalFile);
                    variantData.image = `variant_image_${idx}`;
                } else if (!v.image) {
                    variantData.image = null;
                } else {
                    variantData.image = v.image; // Keep URL if edit
                }
                return variantData;
            });

            data.append('variants', JSON.stringify(processedVariants));

            if (isEdit) {
                await merchantApi.updateProduct(id, data);
            } else {
                await merchantApi.createProduct(data);
            }
            toast.success(isEdit ? 'Product updated' : 'Product created');
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
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Loading...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/merchant/products')}
                        className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-primary tracking-tight">
                            {isEdit ? 'Manage Product' : 'Industry Catalog Entry'}
                        </h1>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-[0.2em] mt-1">
                            {isEdit ? 'Update product essence and strategy' : 'Create a professional high-converting product'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    {/* Card 1: Main Details */}
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-10 relative overflow-hidden text-left">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center italic font-black text-lg">01</div>
                                <div>
                                    <h3 className="text-xl font-black text-primary tracking-tight">Main Details</h3>
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Foundational product identity</p>
                                </div>
                            </div>
                            {productStatus === 'APPROVED' && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 animate-in fade-in zoom-in-95 duration-500">
                                    <Lock size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Locked for Security</span>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-8">
                            <div className="space-y-3">
                                <Input
                                    label="Product Title"
                                    required
                                    placeholder="Enter professional product title..."
                                    value={formData.title}
                                    onChange={e => productStatus === 'APPROVED' ? toast.error('Standard title is locked. Use "Request Change" to propose updates.') : handleInputChange('title', e.target.value)}
                                    onBlur={e => handleBlur('title', e.target.value)}
                                    disabled={productStatus === 'APPROVED'}
                                    suffix={
                                        <span className={`text-[10px] font-bold ${formData.title.length > 100 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {formData.title.length}/100
                                        </span>
                                    }
                                />
                                {fieldErrors.title && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{fieldErrors.title}</p>}
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Description</label>
                                    <span className={`text-[10px] font-bold ${formData.description.length < 50 ? 'text-amber-500' : formData.description.length > 2000 ? 'text-red-500' : 'text-gray-400'}`}>
                                        {formData.description.length}/2000
                                    </span>
                                </div>
                                <textarea
                                    className={`w-full px-8 py-6 bg-gray-50/50 border ${fieldErrors.description ? 'border-red-500' : 'border-gray-100'} rounded-[2rem] text-sm font-medium ${productStatus === 'APPROVED' ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 focus:ring-4 focus:ring-primary/5 focus:border-primary'} leading-relaxed min-h-[180px] transition-all`}
                                    placeholder="Explain your product's story..."
                                    value={formData.description}
                                    onChange={e => productStatus === 'APPROVED' ? toast.error('Scientific description is locked. Use "Request Change" to propose updates.') : handleInputChange('description', e.target.value)}
                                    onBlur={e => handleBlur('description', e.target.value)}
                                    readOnly={productStatus === 'APPROVED'}
                                />
                                {fieldErrors.description && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{fieldErrors.description}</p>}
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Categories</label>
                                <div onClick={() => productStatus === 'APPROVED' && toast.error('Categories are locked. Use "Request Change" to propose updates.')} className={productStatus === 'APPROVED' ? 'opacity-60 cursor-not-allowed' : ''}>
                                    <SearchableSelect
                                        options={categories}
                                        selectedValues={formData.category_ids}
                                        onSelect={id => setFormData({ ...formData, category_ids: [...formData.category_ids, id] })}
                                        onRemove={id => setFormData({ ...formData, category_ids: formData.category_ids.filter(v => v !== id) })}
                                        disabled={productStatus === 'APPROVED'}
                                    />
                                </div>
                                {fieldErrors.category_ids && <p className="text-[10px] text-red-500 font-bold mt-1 ml-4">{fieldErrors.category_ids}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Product Images */}
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-8 text-left">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center italic font-black text-lg">02</div>
                                <div>
                                    <h3 className="text-xl font-black text-primary tracking-tight">Product Images</h3>
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Shared product photos</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <label className="bg-primary text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all cursor-pointer shadow-lg active:scale-95">
                                    Add Images
                                    <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                                </label>
                                {fieldErrors.images && <p className="text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">{fieldErrors.images}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            {previewImages.map((img, idx) => (
                                <div key={idx} className="aspect-square relative group bg-gray-50 rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm">
                                    <img src={img.url || img} alt="" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-4 right-4 p-2 bg-white/90 text-red-500 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            <label className="aspect-square border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center group hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer">
                                <Plus size={24} className="text-gray-300 group-hover:text-primary transition-all" />
                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-2 group-hover:text-primary">New Shot</span>
                                <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                            </label>
                        </div>
                    </div>

                    {/* Card 3: Variant Management */}
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center italic font-black text-lg">03</div>
                                <div>
                                    <h3 className="text-xl font-black text-primary tracking-tight">Product Variants</h3>
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Define variations like size/color</p>
                                </div>
                            </div>
                        </div>

                        {/* Option Builder (Configuration) */}
                        <div className="space-y-6 text-left">
                            <div className="flex items-center justify-between px-2">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selection Options (e.g. Color, Size)</h4>
                                <button
                                    type="button"
                                    onClick={addAttributeKey}
                                    className="text-[10px] font-black text-primary hover:underline flex items-center gap-1.5 italic"
                                >
                                    <Plus size={14} /> Add new option
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-3 px-2">
                                {formData.attribute_config.map(key => (
                                    <div key={key} className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black text-primary uppercase tracking-widest group/pill ring-1 ring-transparent hover:ring-primary/10 transition-all">
                                        {key}
                                        <button
                                            type="button"
                                            onClick={() => removeAttributeKey(key)}
                                            className="text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {productStatus === 'APPROVED' ? (
                            /* Specialist Redirect Dashboard (Industrial) */
                            <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-10 text-center space-y-8 animate-in zoom-in-95 duration-500">
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                                    <Layout size={32} className="text-primary" />
                                </div>
                                <div className="space-y-3 max-w-md mx-auto">
                                    <h4 className="text-2xl font-black text-primary italic tracking-tight">Variation Matrix Locked</h4>
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                        This product is currently **Active**. Global identity is managed here, but surgical variation edits (Price, SKU, Images) are handled in the specialized manager.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-xl mx-auto">
                                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Variants</div>
                                        <div className="text-2xl font-black italic text-primary">{formData.variants.length}</div>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Stock</div>
                                        <div className="text-2xl font-black italic text-primary">
                                            {formData.variants.reduce((acc, v) => acc + Number(v.stock || 0), 0)}
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm col-span-2 md:col-span-1">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Price Range</div>
                                        <div className="text-xl font-black italic text-primary">
                                            ₹{Math.min(...formData.variants.map(v => Number(v.price)))} - ₹{Math.max(...formData.variants.map(v => Number(v.price)))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => navigate(`/merchant/variants/${id}`)}
                                    className="inline-flex items-center gap-4 px-10 py-6 bg-primary text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/30 hover:bg-accent hover:-translate-y-1 transition-all active:scale-95 group"
                                >
                                    Manage Detailed Variations
                                    <ArrowLeft size={16} className="rotate-180 group-hover:translate-x-2 transition-transform" />
                                </button>
                            </div>
                        ) : (
                            /* Simplified Single Variant View (Inspired by Variants.jsx) */
                            <div className="bg-gray-50/50 rounded-[2.5rem] p-8 border border-gray-100 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                    <div className="space-y-6 text-left">
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Attributes & Options</h5>
                                        <div className="space-y-4 text-left">
                                            {formData.attribute_config.map(key => (
                                                <div key={key} className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{key}</label>
                                                    <input
                                                        type="text"
                                                        placeholder={`Enter ${key}... (e.g. ${key.toLowerCase() === 'size' ? 'Large' : 'Crimson Red'})`}
                                                        className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-black text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                                                        value={formData.variants[0].attributes[key] || ''}
                                                        onChange={e => handleVariantChange(0, `attributes.${key}`, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                            {formData.attribute_config.length === 0 && (
                                                <p className="text-[10px] text-gray-400 font-bold italic p-4 bg-white rounded-2xl border border-dashed border-gray-100">Click "Add new option" to define attributes like Color or Material.</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-6 text-left">
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Commercial Specs</h5>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2 text-left">
                                                <div className="flex justify-between items-center ml-1">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Selling Price</label>
                                                    <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Sale</span>
                                                </div>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                                    <input
                                                        type="number"
                                                        placeholder="0.00"
                                                        className={`w-full pl-8 pr-6 py-4 bg-white border ${fieldErrors['variants.0.price'] ? 'border-red-500' : 'border-gray-100'} rounded-2xl text-lg font-black text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all`}
                                                        value={formData.variants[0].price}
                                                        onChange={e => handleVariantChange(0, 'price', e.target.value)}
                                                        onBlur={e => handleBlur('variants.0.price', e.target.value)}
                                                    />
                                                </div>
                                                {fieldErrors['variants.0.price'] && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1 animate-in slide-in-from-top-1">{fieldErrors['variants.0.price']}</p>}
                                            </div>
                                            <div className="space-y-2 text-left">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Original Price (Strike)</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                                    <input
                                                        type="number"
                                                        placeholder="Optional"
                                                        className={`w-full pl-8 pr-6 py-4 bg-white border ${fieldErrors['variants.0.compare_at_price'] ? 'border-red-500' : 'border-gray-100'} rounded-2xl text-lg font-black text-primary/60 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all strike-through`}
                                                        value={formData.variants[0].compare_at_price}
                                                        onChange={e => handleVariantChange(0, 'compare_at_price', e.target.value)}
                                                        onBlur={e => handleBlur('variants.0.compare_at_price', e.target.value)}
                                                    />
                                                </div>
                                                {fieldErrors['variants.0.compare_at_price'] && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1 animate-in slide-in-from-top-1">{fieldErrors['variants.0.compare_at_price']}</p>}
                                            </div>
                                            <div className="space-y-2 text-left">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Inventory Count</label>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    className={`w-full px-6 py-4 bg-white border ${fieldErrors['variants.0.stock'] ? 'border-red-500' : 'border-gray-100'} rounded-2xl text-lg font-black text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all`}
                                                    value={formData.variants[0].stock}
                                                    onChange={e => handleVariantChange(0, 'stock', e.target.value)}
                                                    onBlur={e => handleBlur('variants.0.stock', e.target.value)}
                                                />
                                                {fieldErrors['variants.0.stock'] && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1 animate-in slide-in-from-top-1">{fieldErrors['variants.0.stock']}</p>}
                                            </div>

                                            {/* New: GST Rate Selection for Simple View */}
                                            <div className="space-y-2 text-left">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">GST Rate (%)</label>
                                                <select
                                                    className={`w-full px-6 py-4 bg-white border ${fieldErrors['variants.0.gst_rate'] ? 'border-red-500' : 'border-gray-100'} rounded-2xl text-[10px] font-black tracking-widest text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none appearance-none cursor-pointer`}
                                                    value={formData.variants[0].gst_rate}
                                                    onChange={e => handleVariantChange(0, 'gst_rate', Number(e.target.value))}
                                                >
                                                    <option value={0}>0% (Nill Rated)</option>
                                                    <option value={5}>5% (Essential)</option>
                                                    <option value={12}>12% (Standard Low)</option>
                                                    <option value={18}>18% (Standard High)</option>
                                                    <option value={28}>28% (Luxury)</option>
                                                </select>
                                                {fieldErrors['variants.0.gst_rate'] && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1 animate-in slide-in-from-top-1">{fieldErrors['variants.0.gst_rate']}</p>}
                                            </div>
                                        </div>
                                        {formData.showAdvanced && (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 text-left">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">SKU (Auto-Generated)</label>
                                                <input
                                                    type="text"
                                                    placeholder="Leave blank for auto"
                                                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-400 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                                                    value={formData.variants[0].sku}
                                                    onChange={e => handleVariantChange(0, 'sku', e.target.value.toUpperCase())}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Fixed Sidebar Actions */}
                    <div className="sticky top-10 space-y-8">
                        <div className="bg-primary rounded-[2.5rem] p-10 text-white shadow-2xl shadow-primary/20 space-y-8">
                            <div className="space-y-1">
                                <h4 className="text-xl font-black italic tracking-tight">Commercialization</h4>
                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Final platform review</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-white/60">Global Photos</span>
                                    <span>{previewImages.length}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-white/60">Active Variants</span>
                                    <span>{formData.variants.length}</span>
                                </div>
                                <div className="h-[1px] bg-white/10" />
                                <div className="flex flex-col gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, showAdvanced: !formData.showAdvanced })}
                                        className="flex items-center justify-between group/adv"
                                    >
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest group-hover/adv:text-accent transition-colors">Advanced Settings</span>
                                        <div className={`w-8 h-4 rounded-full p-0.5 transition-all ${formData.showAdvanced ? 'bg-accent' : 'bg-white/10'}`}>
                                            <div className={`w-3 h-3 bg-white rounded-full transition-all ${formData.showAdvanced ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                    </button>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Pricing Strategy</span>
                                        <p className="text-lg font-black italic text-accent">
                                            {formData.variants[0]?.price ? `Starts at ₹${Math.min(...formData.variants.filter(v => v.price).map(v => Number(v.price)))}` : 'Entry Level TBD'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-6 bg-white text-primary rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-accent hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Processing...' : isEdit ? 'Update Catalog' : 'Launch Product'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/merchant/products')}
                                    className="w-full py-4 text-white/40 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest italic"
                                >
                                    Cancel & Return
                                </button>
                            </div>
                        </div>

                        {/* Status Guard */}
                        {isEdit && (
                            <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full animate-pulse ${productStatus === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Live Visibility: {productStatus}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </form >
        </div >
    );
};

export default ProductForm;
