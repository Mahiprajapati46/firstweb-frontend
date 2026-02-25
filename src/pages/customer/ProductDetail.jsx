import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    ShoppingBag,
    Heart,
    Share2,
    Star,
    Truck,
    ShieldCheck,
    ChevronRight,
    ArrowLeft,
    Sparkles,
    ShoppingBasket,
    Info
} from 'lucide-react';
import customerApi from '../../api/customer';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ProductDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [selectedAttributes, setSelectedAttributes] = useState({});

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true);
                const response = await customerApi.getProductBySlug(slug);
                if (response.success && response.data) {
                    setProduct(response.data.product);
                    const fetchedVariants = response.data.variants || [];
                    setVariants(fetchedVariants);

                    const defaultVariant = response.data.default_variant || fetchedVariants[0];
                    setSelectedVariant(defaultVariant);
                    if (defaultVariant) {
                        setSelectedAttributes(defaultVariant.attributes || {});
                    }
                }
            } catch (error) {
                toast.error('Product not found or unavailable');
                navigate('/products');
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
    }, [slug, navigate]);

    const handleAddToCart = async () => {
        if (!user) {
            toast.error('Please log in to add items to your basket');
            navigate('/login', { state: { from: location } });
            return;
        }

        if (!selectedVariant) {
            toast.error('Please select all required options');
            return;
        }

        try {
            setLoading(true);
            const response = await customerApi.addToCart({
                variant_id: selectedVariant._id,
                quantity: quantity
            });

            if (response.success) {
                toast.success(`Success! ${product.title} added to basket.`);
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add item to basket');
        } finally {
            setLoading(false);
        }
    };

    const allImages = [
        ...(product?.images || []),
        ...(selectedVariant?.images || [])
    ].filter((img, idx, self) => img && self.indexOf(img) === idx);

    if (allImages.length === 0) {
        allImages.push('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1999');
    }

    useEffect(() => {
        // If a variant is selected, jump to its first image
        if (selectedVariant?.images?.length > 0) {
            const variantImg = selectedVariant.images[0];
            const index = allImages.indexOf(variantImg);
            if (index !== -1) {
                setActiveImage(index);
            }
        } else {
            // Otherwise reset to first image if current is out of bounds
            if (activeImage >= allImages.length) {
                setActiveImage(0);
            }
        }
    }, [selectedVariant?._id, allImages.length]);

    const handleAttributeSelect = (key, value) => {
        const newAttributes = { ...selectedAttributes, [key]: value };
        setSelectedAttributes(newAttributes);

        const matchingVariant = variants.find(v =>
            Object.entries(newAttributes).every(([k, val]) => v.attributes[k] === val)
        );

        setSelectedVariant(matchingVariant || null);
    };

    const isAvailable = (key, value) => {
        return variants.some(v => {
            const otherAttrsMatch = Object.entries(selectedAttributes)
                .filter(([k]) => k !== key)
                .every(([k, val]) => v.attributes[k] === val);
            return otherAttrsMatch && v.attributes[key] === value && v.stock_quantity > 0;
        });
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 animate-pulse">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    <div className="aspect-square bg-gray-50 rounded-xl"></div>
                    <div className="space-y-10">
                        <div className="h-10 bg-gray-50 rounded-md w-2/3"></div>
                        <div className="h-6 bg-gray-50 rounded-md w-1/3"></div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-50 rounded-md w-full"></div>
                            <div className="h-4 bg-gray-50 rounded-md w-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) return null;

    const attributeGroups = {};
    variants.forEach(variant => {
        Object.entries(variant.attributes || {}).forEach(([key, value]) => {
            if (!attributeGroups[key]) attributeGroups[key] = new Set();
            attributeGroups[key].add(value);
        });
    });

    return (
        <div className="bg-white min-h-screen pb-24">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Navigation & Breadcrumbs */}
                <div className="flex items-center justify-between py-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-gray-500 hover:text-gray-900 transition-colors uppercase"
                    >
                        <ArrowLeft size={14} /> Back to Products
                    </button>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <Heart size={20} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                    {/* LEFT SIDE: Image Gallery */}
                    <div className="lg:col-span-12 xl:col-span-6 space-y-6">
                        {/* Main Image */}
                        <div className="aspect-square bg-[#fcfcfc] rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center relative">
                            <img
                                src={allImages[activeImage] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1999'}
                                alt={product.title}
                                className="w-full h-full object-contain p-8"
                            />
                            {selectedVariant?.stock_quantity <= 5 && selectedVariant?.stock_quantity > 0 && (
                                <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded shadow-sm">
                                    Only {selectedVariant.stock_quantity} left
                                </div>
                            )}
                        </div>

                        {/* Small Thumbnails Below */}
                        <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                            {allImages.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`aspect-[4/5] rounded-lg border transition-all overflow-hidden ${activeImage === i ? 'border-gray-900 ring-2 ring-gray-900/5' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT SIDE: Product Info */}
                    <div className="lg:col-span-12 xl:col-span-6 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                    <ShieldCheck size={12} className="text-gray-400" /> STORE ID: {product.artisan_id?.slice(-8).toUpperCase()}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.title}</h1>

                            <div className="flex items-baseline gap-4">
                                <span className="text-3xl font-bold text-gray-900">₹{(selectedVariant?.price || product.pricing?.min_price).toLocaleString()}</span>
                                {selectedVariant?.compare_at_price > selectedVariant?.price && (
                                    <span className="text-lg text-gray-400 line-through">₹{selectedVariant.compare_at_price.toLocaleString()}</span>
                                )}
                                {selectedVariant?.compare_at_price > selectedVariant?.price && (
                                    <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded">
                                        {Math.round(((selectedVariant.compare_at_price - selectedVariant.price) / selectedVariant.compare_at_price) * 100)}% OFF
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-gray-600 leading-relaxed max-w-xl">{product.description}</p>
                        </div>

                        {/* Variant Selection */}
                        <div className="space-y-8 pt-4 border-t border-gray-50">
                            {Object.entries(attributeGroups).map(([key, values]) => {
                                const isColor = key.toLowerCase().includes('color');

                                return (
                                    <div key={key} className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">{key}</h4>
                                            <span className="text-[11px] text-gray-400 font-medium">
                                                {selectedAttributes[key] || 'Select Option'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {[...values].map((value) => {
                                                const isSelected = selectedAttributes[key] === value;
                                                const available = isAvailable(key, value);

                                                if (isColor) {
                                                    return (
                                                        <button
                                                            key={value}
                                                            onClick={() => handleAttributeSelect(key, value)}
                                                            title={value}
                                                            className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${isSelected ? 'border-gray-900 ring-2 ring-gray-900/10' : 'border-gray-100'} ${!available && !isSelected ? 'opacity-30 grayscale bg-gray-100' : ''}`}
                                                            style={{ backgroundColor: value.toLowerCase() }}
                                                        >
                                                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm"></div>}
                                                        </button>
                                                    );
                                                }

                                                return (
                                                    <button
                                                        key={value}
                                                        onClick={() => handleAttributeSelect(key, value)}
                                                        className={`h-11 min-w-[3.5rem] px-5 rounded-md text-[13px] font-semibold transition-all border ${isSelected
                                                            ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                                                            : available
                                                                ? 'border-gray-200 text-gray-900 hover:border-gray-900'
                                                                : 'border-gray-100 text-gray-400 bg-gray-50 opacity-60'
                                                            }`}
                                                    >
                                                        {value}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Quantity Selector */}
                        <div className="space-y-4 pt-4 border-t border-gray-50">
                            <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Quantity</h4>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center border border-gray-200 rounded-md overflow-hidden h-12">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-lg"
                                    >
                                        −
                                    </button>
                                    <span className="w-12 text-center text-sm font-bold text-gray-900">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-12 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-lg"
                                    >
                                        +
                                    </button>
                                </div>
                                {selectedVariant?.stock_quantity > 0 && (
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-green-600 uppercase tracking-wide">In Stock</span>
                                        <span className="text-[11px] text-gray-400">{selectedVariant.stock_quantity} units available</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-6">
                            <button
                                onClick={handleAddToCart}
                                disabled={!selectedVariant || selectedVariant.stock_quantity <= 0}
                                className="flex-1 h-14 bg-gray-900 text-white rounded-md font-bold text-[13px] uppercase tracking-widest hover:bg-black transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md"
                            >
                                {!selectedVariant ? 'Select Options' : selectedVariant.stock_quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button className="w-14 h-14 border border-gray-200 rounded-md text-gray-400 hover:text-red-500 hover:border-red-200 transition-all flex items-center justify-center">
                                <Heart size={22} />
                            </button>
                        </div>

                        {/* Features List */}
                        <div className="grid grid-cols-2 gap-4 pt-8">
                            <div className="flex items-start gap-3 p-4 bg-[#fcfcfc] border border-gray-50 rounded-lg">
                                <Truck size={18} className="text-gray-900 mt-0.5" />
                                <div>
                                    <p className="text-[11px] font-bold text-gray-900 uppercase">Free Shipping</p>
                                    <p className="text-[11px] text-gray-500">Orders over ₹1,000</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-[#fcfcfc] border border-gray-50 rounded-lg">
                                <ShieldCheck size={18} className="text-gray-900 mt-0.5" />
                                <div>
                                    <p className="text-[11px] font-bold text-gray-900 uppercase">Secure Payment</p>
                                    <p className="text-[11px] text-gray-500">100% encrypted</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
