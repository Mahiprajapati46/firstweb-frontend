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
    Info,
    CheckCircle2,
    Store
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
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true);
                const response = await customerApi.getProductBySlug(slug);
                if (response.success && response.data) {
                    setProduct(response.data.product);
                    const fetchedVariants = response.data.variants || [];
                    setVariants(fetchedVariants);

                    // Fetch reviews using Product ID
                    fetchReviews(response.data.product._id);

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

    const fetchReviews = async (productId) => {
        if (!productId) return;
        try {
            setReviewsLoading(true);
            const response = await customerApi.getProductReviews(productId);
            if (response.success && response.data) {
                setReviews(response.data);
            }
        } catch (error) {
            console.error('Fetch Reviews Error:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

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

    // 🖼️ Phase 14: Stabilize Image Gallery & Image-to-Variant Mapping
    const { allImages, imageMap } = React.useMemo(() => {
        const productImages = product?.images || [];
        const map = new Map();

        // 1. Identify all unique variant images and map them back to their first variant
        const variantImages = [];
        variants.forEach(v => {
            (v.images || []).forEach(img => {
                if (!map.has(img)) {
                    map.set(img, v);
                    variantImages.push(img);
                }
            });
        });

        // 2. Collect unique global images
        const uniqueGlobal = productImages.filter(img => !map.has(img));

        // 3. Combine: Variant Priority (distinct visual options) then Global extras
        const result = [...variantImages, ...uniqueGlobal].filter(Boolean);

        if (result.length === 0) {
            result.push('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1999');
        }
        return { allImages: result, imageMap: map };
    }, [product?.images, variants]);

    useEffect(() => {
        // If a variant is selected, jump to its first image
        if (selectedVariant?.images?.length > 0) {
            const variantImg = selectedVariant.images[0];
            const index = allImages.indexOf(variantImg);
            if (index !== -1) {
                setActiveImage(index);
            }
        }
    }, [selectedVariant?._id, allImages]);

    const handleThumbnailClick = (img, index) => {
        setActiveImage(index);

        // 🔗 Bi-directional Sync: If this image belongs to a variant, select it
        const mappedVariant = imageMap.get(img);
        if (mappedVariant && mappedVariant._id !== selectedVariant?._id) {
            setSelectedVariant(mappedVariant);
            setSelectedAttributes(mappedVariant.attributes || {});
        }
    };

    const handleAttributeSelect = (key, value) => {
        const newAttributes = { ...selectedAttributes, [key]: value };
        setSelectedAttributes(newAttributes);

        // Helper to get attribute value case-insensitively
        const getAttr = (attrs, target) => {
            const entry = Object.entries(attrs || {}).find(([k]) => k.toLowerCase() === target.toLowerCase());
            return entry ? entry[1] : undefined;
        };

        // Find exact match first
        let matchingVariant = variants.find(v =>
            Object.entries(newAttributes).every(([k, val]) => getAttr(v.attributes, k) === val)
        );

        // If no exact match, find "Best Match" (pivoting)
        // This prevents the UI from "locking up" when selecting conflicting attributes
        if (!matchingVariant) {
            matchingVariant = variants.find(v => getAttr(v.attributes, key) === value);
            if (matchingVariant) {
                // Synchronize attributes to the new "pivot" variant
                // Need to carefully preserve the keys as they appear in the UI
                const syncedAttrs = {};
                Object.keys(attributeGroups).forEach(k => {
                    syncedAttrs[k] = getAttr(matchingVariant.attributes, k);
                });
                setSelectedAttributes(syncedAttrs);
            }
        }

        if (matchingVariant) {
            setSelectedVariant(matchingVariant);
            // If the selected variant has images, switch to its first image
            if (matchingVariant.images?.length > 0) {
                // The images will be at the start of allImages now
                setActiveImage(0);
            }
        } else {
            setSelectedVariant(null);
        }
    };

    const isAvailable = (key, value) => {
        // 💎 Phase 14: In a "Smart Pivot" system, an option is "available" if IT EXISTS AT ALL.
        const getAttr = (attrs, target) => {
            const entry = Object.entries(attrs || {}).find(([k]) => k.toLowerCase() === target.toLowerCase());
            return entry ? entry[1] : undefined;
        };
        return variants.some(v => getAttr(v.attributes, key) === value && v.stock_quantity > 0);
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

    // 💎 Phase 14: Normalize Attribute Grouping (Handles mismatched casing from merchant)
    const attributeGroups = {};
    const uniqueValuesPerKey = {};

    variants.forEach(variant => {
        Object.entries(variant.attributes || {}).forEach(([key, value]) => {
            if (!value) return;
            const normalizedKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
            if (!attributeGroups[normalizedKey]) {
                attributeGroups[normalizedKey] = new Set();
                uniqueValuesPerKey[normalizedKey] = new Set();
            }
            attributeGroups[normalizedKey].add(value);
            uniqueValuesPerKey[normalizedKey].add(value);
        });
    });

    const activeAttributeGroups = Object.fromEntries(
        Object.entries(attributeGroups).filter(([key]) => uniqueValuesPerKey[key].size > 1)
    );

    // Get the "Specs" for display (the redundant ones we filtered out)
    const productSpecs = Object.entries(attributeGroups)
        .filter(([key]) => uniqueValuesPerKey[key].size === 1)
        .map(([key, values]) => ({ key, value: Array.from(values)[0] }));

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
                                    onClick={() => handleThumbnailClick(img, i)}
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
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                    <ShieldCheck size={12} className="text-gray-400" /> STORE ID: {product.merchant_id?._id?.slice(-8).toUpperCase()}
                                </span>
                                {product.merchant_id && (
                                    <Link 
                                        to={`/store/${product.merchant_id.store_slug}`}
                                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1.5"
                                    >
                                        <Store size={12} /> Visit {product.merchant_id.store_name}
                                    </Link>
                                )}
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

                            {/* 💎 Phase 14: Dynamic Specs (Redundant Attributes) */}
                            {productSpecs.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {productSpecs.map((spec, i) => (
                                        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{spec.key}:</span>
                                            <span className="text-[10px] font-bold text-primary italic uppercase">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Variant Selection */}
                        <div className="space-y-8 pt-4 border-t border-gray-50">
                            {Object.entries(activeAttributeGroups).map(([key, values]) => {
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
                                                            type="button"
                                                            onClick={() => handleAttributeSelect(key, value)}
                                                            title={value}
                                                            disabled={!available && !isSelected}
                                                            className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${isSelected ? 'border-gray-900 ring-2 ring-gray-900/10' : 'border-gray-100'} ${!available && !isSelected ? 'opacity-20 grayscale bg-gray-100 cursor-not-allowed' : ''}`}
                                                            style={{ backgroundColor: value.toLowerCase() }}
                                                        >
                                                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm"></div>}
                                                        </button>
                                                    );
                                                }

                                                return (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => handleAttributeSelect(key, value)}
                                                        disabled={!available && !isSelected}
                                                        className={`h-11 min-w-[3.5rem] px-5 rounded-md text-[13px] font-semibold transition-all border ${isSelected
                                                            ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                                                            : available
                                                                ? 'border-gray-200 text-gray-900 hover:border-gray-900'
                                                                : 'border-gray-100 text-gray-300 bg-gray-50 opacity-40 cursor-not-allowed'
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

            {/* Reviews Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 pt-20">
                <div className="border-t border-gray-100 pt-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <h2 className="text-2xl font-black text-primary italic mb-2">Verified Feedback</h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Digital Reputation & Client Dialogue</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-3xl font-black text-primary italic">{(product.stats?.average_rating || 0).toFixed(1)}</p>
                                <div className="flex gap-0.5 text-accent mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill={i < Math.round(product.stats?.average_rating || 0) ? "currentColor" : "none"} />
                                    ))}
                                </div>
                            </div>
                            <div className="h-12 w-px bg-gray-100"></div>
                            <div>
                                <p className="text-xl font-black text-primary">{product.stats?.total_reviews || 0}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Reviews</p>
                            </div>
                        </div>
                    </div>

                    {reviewsLoading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-50 rounded-3xl animate-pulse"></div>)}
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="bg-gray-50/50 rounded-3xl p-16 text-center border border-gray-100">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary/20 mx-auto mb-6">
                                <Star size={32} />
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-primary/40 italic">Signature feed is currently empty</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {reviews.map((review) => (
                                <div key={review._id} className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl hover:shadow-primary/5 transition-all group">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-black italic text-sm">
                                                {review.user_id?.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-primary">{review.user_id?.full_name || 'Verified Client'}</h4>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex gap-0.5 text-accent">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />
                                                        ))}
                                                    </div>
                                                    {review.is_verified_purchase && (
                                                        <div className="flex items-center gap-1 text-emerald-600">
                                                            <CheckCircle2 size={10} />
                                                            <span className="text-[9px] font-bold uppercase tracking-wider">Verified Purchase</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                            {new Date(review.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed italic border-l-2 border-gray-50 pl-4">
                                        "{review.comment}"
                                    </p>

                                    {review.merchant_reply && (
                                        <div className="mt-6 pt-6 border-t border-gray-50">
                                            <p className="text-[9px] font-black text-accent uppercase tracking-widest mb-2 flex items-center gap-2">
                                                Official Response <ShieldCheck size={12} />
                                            </p>
                                            <p className="text-xs text-gray-500 font-medium italic pl-4 border-l border-accent/20">
                                                {review.merchant_reply.comment}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
