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
    AlertCircle
} from 'lucide-react';
import merchantApi from '../../api/merchant';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';
import ChangeRequestModal from '../../components/merchant/ChangeRequestModal';

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
        if (variant) {
            setEditingVariant(variant);
            setVariantForm({
                sku: variant.sku,
                price: variant.price.toString(),
                stock_quantity: (variant.stock_quantity || 0).toString(),
                attributes: variant.attributes || { size: '', color: '' },
                is_default: variant.is_default || false
            });
            setImagePreviews(variant.images || []);
        } else {
            setEditingVariant(null);
            setVariantForm({
                sku: '',
                price: '',
                stock_quantity: '',
                attributes: { size: '', color: '' },
                is_default: false
            });
            setImagePreviews([]);
        }
        setSelectedImages([]);
        setShowForm(true);
        setShowAdvanced(!!variant && !!variant.sku);
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
        if (['size', 'color'].includes(key.toLowerCase())) return;
        const newAttrs = { ...variantForm.attributes };
        delete newAttrs[key];
        setVariantForm(prev => ({ ...prev, attributes: newAttrs }));
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
            formData.append('attributes', JSON.stringify(variantForm.attributes));

            imagePreviews.forEach(img => {
                if (typeof img === 'string' && img.startsWith('http')) {
                    formData.append('images', img);
                }
            });
            selectedImages.forEach(file => {
                formData.append('images', file);
            });

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

    const handleDeleteVariant = async (variantId) => {
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/merchant/products')}
                        className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-primary tracking-tight">Product Variants</h1>
                        <p className="text-gray-500 font-medium">Product: <span className="text-primary font-black uppercase">{product?.title}</span></p>
                    </div>
                </div>
                {!showForm && (
                    <button
                        onClick={() => handleOpenForm()}
                        className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        Add Variant
                    </button>
                )}
            </div>

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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">SKU (Inventory Identifier)</label>
                                <input
                                    placeholder="Leave blank to auto-generate"
                                    className={`w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-black text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all ${editingVariant && ['APPROVED', 'PENDING'].includes(product?.status) ? 'opacity-50 cursor-not-allowed pr-14' : ''}`}
                                    value={variantForm.sku}
                                    onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value.toUpperCase() })}
                                    disabled={editingVariant && ['APPROVED', 'PENDING'].includes(product?.status)}
                                />
                                {editingVariant && ['APPROVED', 'PENDING'].includes(product?.status) && (
                                    <Lock size={18} className="absolute right-12 top-[62px] text-accent" />
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Price (INR)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-lg font-black text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                                value={variantForm.price}
                                onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Current Stock</label>
                            <input
                                type="number"
                                placeholder="0"
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-lg font-black text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                                value={variantForm.stock_quantity}
                                onChange={(e) => setVariantForm({ ...variantForm, stock_quantity: e.target.value })}
                                required
                            />
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
                            <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100">
                                {Object.entries(variantForm.attributes).map(([key, value]) => (
                                    <div key={key} className="space-y-2 relative group/attr">
                                        <label className="text-[10px] font-black text-gray-500 uppercase flex items-center justify-between tracking-widest">
                                            {key}
                                            {!['size', 'color'].includes(key.toLowerCase()) && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttribute(key)}
                                                    className="text-rose-400 opacity-0 group-hover/attr:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </label>
                                        <input
                                            placeholder={`e.g., ${key === 'size' ? 'Large' : 'Gold'}`}
                                            value={value}
                                            onChange={(e) => handleAttributeChange(key, e.target.value)}
                                            className="w-full px-6 py-3 bg-white border border-gray-100 rounded-xl text-sm font-black text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                                        />
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
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Variant Images</h3>
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
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files);
                                            setSelectedImages([...selectedImages, ...files]);
                                            const previews = files.map(file => URL.createObjectURL(file));
                                            setImagePreviews([...imagePreviews, ...previews]);
                                        }}
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
                                    <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 group/item">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Hash size={14} className="text-accent" />
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">In Stock</span>
                                        </div>
                                        <p className="text-xl font-black text-primary italic">{v.stock_quantity || 0}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            {/* Change Request Modal */}
            {selectedVariant && (
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
            )}
        </div>
    );
};

export default Variants;
