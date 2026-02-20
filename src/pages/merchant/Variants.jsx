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
        setShowAdvanced(!!variant && !!variant.sku); // Show if editing and SKU exists
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

            // Basic Fields
            if (!editingVariant || !['APPROVED', 'PENDING'].includes(product?.status)) {
                formData.append('sku', variantForm.sku);
            }
            formData.append('price', variantForm.price);
            formData.append('stock_quantity', variantForm.stock_quantity);
            formData.append('is_default', variantForm.is_default);
            formData.append('attributes', JSON.stringify(variantForm.attributes));

            // Images logic: backend filters for string URLs starting with http
            // and saves newly uploaded binary files.
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
            toast.error(error.message || 'Saving failed');
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

    if (loading && !variants.length) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-slate-300">Syncing Master Inventory...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/merchant/products')}
                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Variant Registry</h1>
                        <p className="text-slate-500 font-medium">Product: <span className="text-primary font-black">{product?.title}</span></p>
                    </div>
                </div>
                {!showForm && (
                    <Button
                        onClick={() => handleOpenForm()}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-xl shadow-slate-200"
                    >
                        <Plus size={20} />
                        Add Variant
                    </Button>
                )}
            </div>

            {showForm ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{editingVariant ? 'Modify Variant' : 'New Configuration'}</h2>
                        <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-rose-500 font-black uppercase text-[10px] tracking-widest">Discard</button>
                    </div>

                    <form onSubmit={handleSaveVariant} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
                            >
                                {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
                                <Layers size={14} />
                            </button>
                        </div>

                        {showAdvanced && (
                            <div className="relative md:col-span-2 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
                                <Input
                                    label="SKU (Stock Keeping Unit)"
                                    placeholder="Leave blank to auto-generate"
                                    value={variantForm.sku}
                                    onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value.toUpperCase() })}
                                    disabled={editingVariant && ['APPROVED', 'PENDING'].includes(product?.status)}
                                    className={editingVariant && ['APPROVED', 'PENDING'].includes(product?.status) ? 'pr-10 bg-white' : 'bg-white'}
                                    helpText="Unique identifier for inventory tracking."
                                />
                                {editingVariant && ['APPROVED', 'PENDING'].includes(product?.status) && (
                                    <div className="absolute right-8 top-[58px] text-amber-500 pointer-events-none" title="Locked - Change Request Required">
                                        <Lock size={16} />
                                    </div>
                                )}
                            </div>
                        )}
                        <Input
                            label="Price (INR)"
                            type="number"
                            placeholder="0.00"
                            value={variantForm.price}
                            onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                            required
                        />

                        {/* Dynamic Attributes Section */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Attributes</h3>
                                <button
                                    type="button"
                                    onClick={addAttribute}
                                    className="text-[10px] font-black text-primary hover:underline flex items-center gap-1"
                                >
                                    <Plus size={12} /> ADD ATTRIBUTE
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                {Object.entries(variantForm.attributes).map(([key, value]) => (
                                    <div key={key} className="space-y-1 relative group/attr">
                                        <label className="text-[10px] font-black text-slate-500 uppercase flex items-center justify-between">
                                            {key}
                                            {!['size', 'color'].includes(key.toLowerCase()) && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttribute(key)}
                                                    className="text-rose-400 opacity-0 group-hover/attr:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                            )}
                                        </label>
                                        <Input
                                            placeholder={`Value for ${key}`}
                                            value={value}
                                            onChange={(e) => handleAttributeChange(key, e.target.value)}
                                            className="bg-white"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Input
                            label="Initial Stock"
                            type="number"
                            placeholder="0"
                            value={variantForm.stock_quantity}
                            onChange={(e) => setVariantForm({ ...variantForm, stock_quantity: e.target.value })}
                            required
                        />
                        <div className={`flex items-center gap-2 p-3 rounded-xl md:mt-7 transition-all ${['APPROVED', 'PENDING'].includes(product?.status) ? 'bg-amber-50/50 border border-amber-100 opacity-80' : 'bg-slate-50'}`}>
                            <input
                                type="checkbox"
                                id="is_default"
                                checked={variantForm.is_default}
                                onChange={(e) => setVariantForm({ ...variantForm, is_default: e.target.checked })}
                                className="w-5 h-5 rounded text-primary focus:ring-primary/20"
                                disabled={['APPROVED', 'PENDING'].includes(product?.status)}
                            />
                            <label htmlFor="is_default" className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                Set as Default Variant
                                {['APPROVED', 'PENDING'].includes(product?.status) && <Lock size={12} className="text-amber-500" />}
                            </label>
                        </div>

                        {/* Image Management */}
                        <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-50">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Visual Assets</h3>
                            <div className="flex flex-wrap gap-4">
                                {imagePreviews.map((preview, idx) => (
                                    <div key={idx} className="relative w-24 h-24 bg-slate-50 rounded-2xl border-2 border-slate-100 overflow-hidden group/img">
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
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
                                            className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all cursor-pointer bg-slate-50/50">
                                    <Plus size={20} />
                                    <span className="text-[10px] font-black uppercase mt-1">Upload</span>
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
                            <p className="text-[10px] text-slate-400 font-medium">Capture color-specific photos for this variant.</p>
                        </div>

                        <div className="md:col-span-2 pt-4">
                            <Button type="submit" loading={loading} className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 uppercase tracking-widest">
                                {editingVariant ? 'Save Changes' : 'Register Variant'}
                            </Button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                        <div className="md:col-span-2 p-20 text-center font-black animate-pulse uppercase tracking-widest text-slate-300">Syncing Master Inventory...</div>
                    ) : variants.length === 0 ? (
                        <div className="md:col-span-2 p-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-center shadow-inner">
                            <Boxes size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-black uppercase tracking-tighter">Your variant registry is currently empty.</p>
                            <p className="text-slate-300 text-[10px] mt-2 font-bold">Add configurations to start selling this product.</p>
                        </div>
                    ) : (
                        variants.map((v) => (
                            <div key={v._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden shadow-inner border border-slate-100 transition-transform group-hover:scale-110">
                                            {v.images?.[0] ? (
                                                <img src={v.images[0]} alt="Variant" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Package size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-black text-slate-900 leading-tight">
                                                    {Object.values(v.attributes || {}).filter(Boolean).join(' / ') || 'Standard'}
                                                </h3>
                                                {v.is_default && <span className="text-[8px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-tighter">Default</span>}
                                            </div>
                                            <div className="flex items-center gap-2 group/sku">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU: {v.sku}</p>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(v.sku);
                                                        toast.success('SKU copied');
                                                    }}
                                                    className="opacity-0 group-hover/sku:opacity-100 p-1 hover:bg-slate-100 rounded transition-all text-slate-400"
                                                >
                                                    <Copy size={10} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {product?.status === 'APPROVED' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedVariant(v);
                                                    setShowChangeModal(true);
                                                }}
                                                className="p-2 text-primary hover:bg-slate-50 rounded-lg transition-all"
                                                title="Request SKU Change"
                                            >
                                                <Clock size={16} />
                                            </button>
                                        )}
                                        <button onClick={() => handleOpenForm(v)} className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-all"><Edit3 size={16} /></button>
                                        {!['APPROVED', 'PENDING'].includes(product?.status) && (
                                            <button onClick={() => handleDeleteVariant(v._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <DollarSign size={12} className="text-primary" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price Point</span>
                                        </div>
                                        <p className="text-lg font-black text-slate-900 italic">₹{v.price.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Hash size={12} className="text-primary" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available</span>
                                        </div>
                                        <p className="text-lg font-black text-slate-900 italic">{v.stock_quantity || 0}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            {/* Modal - Variant SKU Modification */}
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
