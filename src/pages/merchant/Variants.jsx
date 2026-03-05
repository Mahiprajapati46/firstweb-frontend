import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Package,
    DollarSign,
    Hash,
    Layers,
    ChevronRight,
    Search,
    Edit3,
    CheckCircle2,
    Copy,
    Clock,
    Lock,
    Boxes,
    AlertCircle,
    GitPullRequest
} from 'lucide-react';
import merchantApi from '../../api/merchant';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';
import ChangeRequestModal from '../../components/merchant/ChangeRequestModal';
import { productSchemas } from '../../validations/product.schema';

const Variants = () => {
    const { id } = useParams(); // Product ID
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingVariant, setEditingVariant] = useState(null);

    const [variantForm, setVariantForm] = useState({
        sku: '',
        price: '',
        stock_quantity: '',
        attributes: { size: '', color: '' },
        is_default: false
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [varRes, prodRes] = await Promise.all([
                merchantApi.getVariants(id),
                merchantApi.getProduct(id)
            ]);
            setVariants(varRes.data || []);
            setProduct(prodRes.data);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to load variants');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (variant = null) => {
        // 💎 Phase 14: Ensure Schema Parity by gathering all keys from existing variants
        const allExistingKeys = new Set();
        variants.forEach(v => {
            Object.keys(v.attributes || {}).forEach(k => allExistingKeys.add(k));
        });

        if (variant) {
            setEditingVariant(variant);
            const mergedAttrs = { ...variant.attributes };
            // Ensure even if this specific variant is missing a key found in others, it's present
            allExistingKeys.forEach(k => {
                if (mergedAttrs[k] === undefined) mergedAttrs[k] = '';
            });

            setVariantForm({
                sku: variant.sku,
                price: variant.price.toString(),
                stock_quantity: (variant.stock_quantity || 0).toString(),
                attributes: mergedAttrs,
                is_default: variant.is_default || false
            });
            setImagePreviews(variant.images || []);
        } else {
            setEditingVariant(null);
            const defaultAttrs = {};
            allExistingKeys.forEach(k => {
                defaultAttrs[k] = '';
            });
            // Fallback if no variants exist yet (though unlikely in this view)
            if (allExistingKeys.size === 0) {
                defaultAttrs.size = '';
                defaultAttrs.color = '';
            }

            setVariantForm({
                sku: '',
                price: '',
                stock_quantity: '',
                attributes: defaultAttrs,
                is_default: false
            });
            setImagePreviews([]);
        }
        setSelectedImages([]);
        setShowForm(true);
        setShowAdvanced(!!variant && !!variant.sku);
        setFieldErrors({});
    };

    const handleBlur = (name, value) => {
        const currentData = {
            ...variantForm,
            price: Number(variantForm.price),
            stock: Number(variantForm.stock_quantity),
            images: imagePreviews
        };

        // Handle nested attribute updates for validation data
        if (name.startsWith('attributes.')) {
            const attrKey = name.split('.')[1];
            currentData.attributes = {
                ...variantForm.attributes,
                [attrKey]: value
            };
        }

        const result = productSchemas.variant.safeParse(currentData);

        if (!result.success) {
            const fieldIssue = result.error.issues.find(issue => {
                const path = issue.path.join('.');
                // Map stock to stock_quantity for UI purposes
                if (name === 'stock_quantity' && path === 'stock') return true;
                return path === name;
            });

            if (fieldIssue) {
                setFieldErrors(prev => ({
                    ...prev,
                    [name]: fieldIssue.message
                }));
            } else {
                // Clear error if field is now valid
                setFieldErrors(prev => {
                    const next = { ...prev };
                    delete next[name];
                    return next;
                });
            }
        }
    };

    const handleAttributeChange = (key, value) => {
        setVariantForm(prev => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [key]: value
            }
        }));
    };

    const addAttribute = () => {
        const key = prompt('Enter attribute name (e.g., Material, Style):');
        if (key && !variantForm.attributes[key.toLowerCase()]) {
            handleAttributeChange(key.toLowerCase(), '');
        }
    };

    const removeAttribute = (key) => {
        const newAttrs = { ...variantForm.attributes };
        delete newAttrs[key];
        setVariantForm(prev => ({ ...prev, attributes: newAttrs }));

        // Clear specific error for this attribute if it exists
        if (fieldErrors[`attributes.${key}`]) {
            setFieldErrors(prev => {
                const next = { ...prev };
                delete next[`attributes.${key}`];
                return next;
            });
        }
    };

    const handleSaveVariant = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const formData = new FormData();

            if (!editingVariant || !['APPROVED', 'PENDING'].includes(product?.status)) {
                formData.append('sku', variantForm.sku);
            }
            formData.append('price', variantForm.price);
            formData.append('stock_quantity', variantForm.stock_quantity);
            formData.append('is_default', variantForm.is_default);

            // Filter attributes here too so we don't send empty ones to DB
            const finalAttrs = Object.entries(variantForm.attributes)
                .reduce((acc, [key, val]) => {
                    const trimmed = typeof val === 'string' ? val.trim() : val;
                    if (trimmed !== '') acc[key] = trimmed;
                    return acc;
                }, {});
            formData.append('attributes', JSON.stringify(finalAttrs));

            imagePreviews.forEach(img => {
                if (typeof img === 'string' && img.startsWith('http')) {
                    formData.append('images', img);
                }
            });
            selectedImages.forEach(file => {
                formData.append('images', file);
            });

            // 🛡️ Industrial Frontend Validation
            const filteredAttributes = Object.entries(variantForm.attributes)
                .reduce((acc, [key, val]) => {
                    const trimmed = typeof val === 'string' ? val.trim() : val;
                    if (trimmed !== '') acc[key] = trimmed;
                    return acc;
                }, {});

            const validationData = {
                ...variantForm,
                attributes: filteredAttributes,
                price: Number(variantForm.price),
                stock: Number(variantForm.stock_quantity),
                images: imagePreviews
            };
            const result = productSchemas.variant.safeParse(validationData);

            if (!result.success) {
                console.group("🛡️ Variant Validation Failed");
                const flattened = result.error.flatten().fieldErrors;
                console.error("Errors:", flattened);
                console.log("Data causing error:", validationData);
                console.groupEnd();

                // Show specific fields in toast for better UX
                const errorFields = Object.keys(flattened).map(k => k.replace('attributes.', '')).join(', ');
                toast.error(`Please correct errors in: ${errorFields}`);

                const errors = {};
                result.error.issues.forEach(issue => {
                    const path = issue.path.join('.');
                    // Map back stock to stock_quantity for UI
                    const uiPath = path === 'stock' ? 'stock_quantity' : path;
                    errors[uiPath] = issue.message;
                });
                setFieldErrors(errors);
                toast.error("Please correct the validation errors.");
                return;
            }

            setLoading(true);

            if (editingVariant) {
                await merchantApi.updateVariant(editingVariant._id, formData);
                toast.success('Variant updated');
            } else {
                await merchantApi.createVariant(id, formData);
                toast.success('Variant added successfully');
            }
            setShowForm(false);
            fetchData();
        } catch (error) {
            toast.error(error.message || 'Failed to save variant');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/avif'];

        const validFiles = [];
        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                toast.error(`${file.name} is not a supported format`);
                continue;
            }
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`${file.name} is too large (max 5MB)`);
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        setSelectedImages(prev => [...prev, ...validFiles]);
        const previews = validFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...previews]);
    };

    const handleDeleteVariant = async (variantId) => {
        if (variants.length <= 1) {
            toast.error('❌ Deletion Blocked: A product must have at least one variant.');
            return;
        }

        if (!window.confirm('Delete this variant permanently?')) return;
        try {
            await merchantApi.deleteVariant(variantId);
            toast.success('Variant removed');
            fetchData();
        } catch (error) {
            toast.error('Deletion failed');
        }
    };

    if (loading && !variants.length) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Loading Variants...</p>
        </div>
    );

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/merchant/products')}
                        className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/20 hover:shadow-xl transition-all group"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-primary tracking-tight">Variant Management</h1>
                        <p className="text-gray-500 font-medium text-sm mt-1">
                            Product: <span className="text-primary font-black uppercase">{product?.title}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {product && ['APPROVED', 'PENDING'].includes(product.status) && (
                        <>
                            <div className="bg-primary/5 border border-primary/10 rounded-2xl px-6 py-4 flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary italic font-black">
                                    {product.status.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 tracking-tight text-xs">Status: Approved</h3>
                                    <p className="text-slate-500 font-medium text-[9px] leading-relaxed">This product is approved. To change title or categories, send a request.</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleRequestChange('PRODUCT')}
                                    className="bg-primary hover:bg-black text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                                >
                                    <GitPullRequest size={14} />
                                    Request Change
                                </Button>
                            </div>
                        </>
                    )}

                    {!showForm && (
                        <button
                            onClick={() => handleOpenForm()}
                            className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all active:scale-95 h-fit"
                        >
                            <Plus size={18} />
                            Create New Variant
                        </button>
                    )}
                </div>
            </div>

            {product && ['APPROVED', 'PENDING'].includes(product.status) && (
                <div className="bg-primary rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-primary/20 relative overflow-hidden animate-in zoom-in duration-500">
                    <div className="relative z-10 w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-accent italic font-black text-2xl">
                        !
                    </div>
                    <div className="relative z-10 flex-1 space-y-1">
                        <h4 className="text-lg font-black tracking-tight italic">Product Catalog Locked</h4>
                        <p className="text-white/60 text-sm font-medium leading-relaxed">
                            This product is currently {product.status === 'APPROVED' ? 'active in the store' : 'pending verification'}.
                            Sensitive fields (SKU, Attributes) require administrative approval for modifications.
                        </p>
                    </div>
                    <div className="relative z-10 flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/merchant/requests', { state: { type: 'CHANGE', productId: id } })}
                            className="px-8 py-3 bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/20 transition-all font-inter border border-white/10"
                        >
                            View Submission History
                        </button>
                    </div>
                    <Lock size={200} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
                </div>
            )}

            {showForm ? (
                <div className="card-premium p-10 space-y-8 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-primary tracking-tight">{editingVariant ? 'Edit Variant' : 'Add New Variant'}</h2>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-rose-500 font-black uppercase text-[10px] tracking-widest italic underline underline-offset-4">Discard changes</button>
                    </div>

                    <form onSubmit={handleSaveVariant} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors flex items-center gap-2"
                            >
                                <Layers size={14} />
                                {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
                            </button>
                        </div>

                        {showAdvanced && (
                            <div className="relative md:col-span-2 bg-gray-50/50 p-8 rounded-3xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">SKU (Stock Keeping Unit)</label>
                                    {editingVariant && ['APPROVED', 'PENDING'].includes(product?.status) && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedVariant(editingVariant);
                                                setShowChangeModal(true);
                                            }}
                                            className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline flex items-center gap-1.5"
                                        >
                                            <GitPullRequest size={12} /> Propose SKU Update
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        placeholder="Leave blank to auto-generate"
                                        className={`w-full px-6 py-4 bg-white border ${fieldErrors.sku ? 'border-red-500' : 'border-gray-100'} rounded-2xl text-sm font-black text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all ${editingVariant && ['APPROVED', 'PENDING'].includes(product?.status) ? 'opacity-50 cursor-not-allowed pr-14' : ''}`}
                                        value={variantForm.sku}
                                        onChange={(e) => {
                                            setVariantForm({ ...variantForm, sku: e.target.value.toUpperCase() });
                                            if (fieldErrors.sku) setFieldErrors(prev => { const n = { ...prev }; delete n.sku; return n; });
                                        }}
                                        onBlur={(e) => handleBlur('sku', e.target.value)}
                                        disabled={editingVariant && ['APPROVED', 'PENDING'].includes(product?.status)}
                                    />
                                    {fieldErrors.sku && <p className="text-[10px] text-red-500 mt-2 ml-1 font-bold italic underline decoration-red-200">! {fieldErrors.sku}</p>}
                                    {editingVariant && ['APPROVED', 'PENDING'].includes(product?.status) && (
                                        <Lock size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-accent/50" />
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Price (INR)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                className={`w-full px-6 py-4 bg-gray-50/50 border ${fieldErrors.price ? 'border-red-500' : 'border-gray-100'} rounded-2xl text-lg font-black text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all`}
                                value={variantForm.price}
                                onChange={(e) => {
                                    setVariantForm({ ...variantForm, price: e.target.value });
                                    if (fieldErrors.price) setFieldErrors(prev => { const n = { ...prev }; delete n.price; return n; });
                                }}
                                onBlur={(e) => handleBlur('price', e.target.value)}
                                required
                            />
                            {fieldErrors.price && <p className="text-[10px] text-red-500 mt-2 ml-1 font-bold italic underline decoration-red-200">! {fieldErrors.price}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Current Stock</label>
                            <input
                                type="number"
                                placeholder="0"
                                className={`w-full px-6 py-4 bg-gray-50/50 border ${fieldErrors.stock_quantity ? 'border-red-500' : 'border-gray-100'} rounded-2xl text-lg font-black text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all`}
                                value={variantForm.stock_quantity}
                                onChange={(e) => {
                                    setVariantForm({ ...variantForm, stock_quantity: e.target.value });
                                    if (fieldErrors.stock_quantity) setFieldErrors(prev => { const n = { ...prev }; delete n.stock_quantity; return n; });
                                }}
                                onBlur={(e) => handleBlur('stock_quantity', e.target.value)}
                                required
                            />
                            {fieldErrors.stock_quantity && <p className="text-[10px] text-red-500 mt-2 ml-1 font-bold italic underline decoration-red-200">! {fieldErrors.stock_quantity}</p>}
                        </div>

                        {/* Attribute Logic */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Attributes</h3>
                                <button
                                    type="button"
                                    onClick={addAttribute}
                                    className="text-[10px] font-black text-accent hover:underline flex items-center gap-1.5"
                                >
                                    <Plus size={14} /> Add custom attribute
                                </button>
                            </div>
                            {fieldErrors.attributes && (
                                <p className="text-[10px] text-red-500 font-bold italic mb-2">! {fieldErrors.attributes}</p>
                            )}
                            <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100">
                                {Object.entries(variantForm.attributes).map(([key, value]) => (
                                    <div key={key} className="space-y-2 relative group/attr">
                                        <label className="text-[10px] font-black text-gray-500 uppercase flex items-center justify-between tracking-widest">
                                            {key}
                                            {!['size', 'color'].includes(key.toLowerCase()) ? (
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttribute(key)}
                                                    className="text-rose-400 opacity-0 group-hover/attr:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttribute(key)}
                                                    className="text-gray-300 hover:text-rose-400 transition-colors"
                                                    title={`Remove ${key}`}
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                            )}
                                        </label>
                                        <input
                                            placeholder={`e.g., ${key.toLowerCase() === 'size' ? 'Large' :
                                                key.toLowerCase() === 'color' ? 'Gold' :
                                                    key.toLowerCase() === 'material' ? 'Cotton' :
                                                        key.toLowerCase() === 'style' ? 'Vintage' :
                                                            'Premium'
                                                }`}
                                            value={value}
                                            onChange={(e) => handleAttributeChange(key, e.target.value)}
                                            onBlur={() => handleBlur(`attributes.${key}`, value)}
                                            className={`w-full px-6 py-3 bg-white border ${fieldErrors[`attributes.${key}`] ? 'border-red-500' : 'border-gray-100'} rounded-xl text-sm font-black text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all`}
                                        />
                                        {fieldErrors[`attributes.${key}`] && (
                                            <p className="text-[9px] text-red-500 font-bold italic mt-1 ml-1 animate-in slide-in-from-left-2">
                                                ! {fieldErrors[`attributes.${key}`]}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={`md:col-span-2 flex items-center gap-4 p-6 rounded-2xl transition-all ${['APPROVED', 'PENDING'].includes(product?.status) ? 'bg-gray-50 opacity-60' : 'bg-primary/5 border border-primary/10'}`}>
                            <input
                                type="checkbox"
                                id="is_default"
                                checked={variantForm.is_default}
                                onChange={(e) => setVariantForm({ ...variantForm, is_default: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                                disabled={['APPROVED', 'PENDING'].includes(product?.status)}
                            />
                            <label htmlFor="is_default" className="text-xs font-black text-primary uppercase tracking-widest cursor-pointer select-none">
                                Primary Product Choice (Default Variant)
                            </label>
                            {['APPROVED', 'PENDING'].includes(product?.status) && <Lock size={14} className="text-accent ml-auto" />}
                        </div>

                        {/* Variant Gallery */}
                        <div className="md:col-span-2 space-y-4 pt-6">
                            <div className="flex items-center gap-3">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Variant Images</h3>
                                <div className="group relative">
                                    <AlertCircle size={12} className="text-gray-300 cursor-help" />
                                    <div className="absolute left-0 top-6 w-64 p-4 bg-black text-[9px] text-white font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-2xl normal-case">
                                        <p className="font-black text-accent uppercase mb-1 tracking-widest">Variation Rule:</p>
                                        Only upload photos if this variant is **visually different** (e.g. Color). If left empty, the generic Product Images will be used.
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-6">
                                {imagePreviews.map((preview, idx) => (
                                    <div key={idx} className="relative w-28 h-28 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden group/img">
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const previewToRemove = imagePreviews[idx];
                                                const newPreviews = imagePreviews.filter((_, i) => i !== idx);
                                                setImagePreviews(newPreviews);
                                                if (typeof previewToRemove === 'string' && (previewToRemove.startsWith('blob:') || previewToRemove.startsWith('data:'))) {
                                                    const existingCount = imagePreviews.filter(p => typeof p === 'string' && p.startsWith('http')).length;
                                                    const binaryIdx = idx - existingCount;
                                                    if (binaryIdx >= 0) {
                                                        const newFiles = [...selectedImages];
                                                        newFiles.splice(binaryIdx, 1);
                                                        setSelectedImages(newFiles);
                                                    }
                                                }
                                            }}
                                            className="absolute inset-0 bg-rose-600/60 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                                <label className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group">
                                    <Plus size={24} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black uppercase mt-2 tracking-widest">Upload</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-8">
                            <button type="submit" disabled={loading} className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-2xl ${loading ? 'opacity-50' : 'bg-primary text-white hover:bg-black hover:-translate-y-1 shadow-primary/20'}`}>
                                {loading ? 'Saving...' : editingVariant ? 'Save Variant' : 'Create Variant'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {variants.length === 0 ? (
                        <div className="md:col-span-2 p-24 bg-white rounded-[3rem] border border-gray-100 text-center shadow-inner opacity-60">
                            <Boxes size={60} className="mx-auto text-primary/10 mb-6" />
                            <p className="text-primary font-black uppercase tracking-widest">No variants added yet.</p>
                            <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase tracking-widest">Start by adding a new product variation.</p>
                        </div>
                    ) : (
                        variants.map((v) => (
                            <div key={v._id} className="card-premium p-8 space-y-6 hover:shadow-2xl transition-all group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-transform group-hover:scale-110">
                                            {v.images?.[0] ? (
                                                <img src={v.images[0]} alt="Variant" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                    <Package size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-black text-primary leading-tight">
                                                    {Object.values(v.attributes || {}).filter(Boolean).join(' / ') || 'Standard'}
                                                </h3>
                                                {v.is_default && <span className="text-[10px] font-black bg-accent text-white px-3 py-1 rounded-full uppercase tracking-widest">Primary</span>}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SKU: {v.sku}</p>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(v.sku);
                                                        toast.success('SKU copied');
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-accent transition-all"
                                                >
                                                    <Copy size={12} />
                                                </button>
                                                {product && ['APPROVED', 'PENDING'].includes(product.status) && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRequestChange('VARIANT', v);
                                                        }}
                                                        className="p-3 bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm border border-primary/10 group/btn"
                                                        title="Request Change"
                                                    >
                                                        <GitPullRequest size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenForm(v)} className="p-3 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-xl transition-all"><Edit3 size={18} /></button>
                                        {!['APPROVED', 'PENDING'].includes(product?.status) && (
                                            <button onClick={() => handleDeleteVariant(v._id)} className="p-3 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 group/item">
                                        <div className="flex items-center gap-2 mb-1">
                                            <DollarSign size={14} className="text-accent" />
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Price</span>
                                        </div>
                                        <p className="text-xl font-black text-primary italic">₹{v.price.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 group/item relative overflow-hidden">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Hash size={14} className="text-accent" />
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">In Stock</span>
                                        </div>
                                        <p className="text-xl font-black text-primary italic">{v.stock_quantity || 0}</p>
                                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-accent/20 translate-x-1 group-hover/item:translate-x-0 transition-transform" />
                                    </div>
                                </div>

                                {
                                    ['APPROVED', 'PENDING'].includes(product?.status) && (
                                        <button
                                            onClick={() => {
                                                setSelectedVariant(v);
                                                setShowChangeModal(true);
                                            }}
                                            className="w-full py-3 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <GitPullRequest size={12} />
                                            Request Variant Modification
                                        </button>
                                    )
                                }
                            </div>
                        ))
                    )}
                </div>
            )
            }
            {/* Change Request Modal */}
            {
                selectedVariant && (
                    <ChangeRequestModal
                        isOpen={showChangeModal}
                        onClose={() => {
                            setShowChangeModal(false);
                            setSelectedVariant(null);
                        }}
                        entityType="VARIANT"
                        entityId={selectedVariant._id}
                        currentData={selectedVariant}
                    />
                )
            }
        </div >
    );
};

export default Variants;
