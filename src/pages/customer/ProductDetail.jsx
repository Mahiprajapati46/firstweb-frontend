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

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true);
                const response = await customerApi.getProductBySlug(slug);
                if (response.success && response.data) {
                    setProduct(response.data.product);
                    setVariants(response.data.variants || []);
                    setSelectedVariant(response.data.default_variant || response.data.variants?.[0]);
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

        try {
            setLoading(true);
            const response = await customerApi.addToCart({
                variant_id: selectedVariant._id,
                quantity: quantity
            });

            if (response.success) {
                toast.success(`Success! ${product.title} added to basket.`);
                // Trigger a global cart refresh event if needed, or rely on Layout hook
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add item to basket');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container-custom max-w-7xl mx-auto px-6 py-20 animate-pulse">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    <div className="aspect-square bg-white border border-[#e5e5d1]/30 rounded-[3rem]"></div>
                    <div className="space-y-10">
                        <div className="h-10 bg-gray-100 rounded-full w-2/3"></div>
                        <div className="h-6 bg-gray-50 rounded-full w-1/3"></div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-50 rounded-full w-full"></div>
                            <div className="h-4 bg-gray-50 rounded-full w-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) return null;

    const allImages = product.images?.length > 0 ? product.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1999'];

    return (
        <div className="bg-[#f8f9fa] min-h-screen pt-6 pb-24">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Navigation & Breadcrumbs */}
                <div className="flex items-center justify-between mb-6 px-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Products
                    </button>
                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-500 transition-all shadow-sm">
                            <Heart size={20} />
                        </button>
                        <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary transition-all shadow-sm">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Image Gallery */}
                    <div className="space-y-6">
                        <div className="max-h-[500px] bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex items-center justify-center">
                            <img
                                src={allImages[activeImage] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1999'}
                                alt={product.title}
                                className="max-w-full max-h-[500px] object-contain p-6"
                            />
                        </div>
                        {allImages.length > 1 && (
                            <div className="grid grid-cols-5 gap-4">
                                {allImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`aspect-square rounded-xl border-2 overflow-hidden transition-all bg-white ${activeImage === i ? 'border-primary' : 'border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                                    Verified Product
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                    <ShieldCheck size={12} className="text-primary" /> Store ID: {product.artisan_id?.slice(-8).toUpperCase()}
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-tight">{product.title}</h1>
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-black text-gray-900">₹{selectedVariant?.price || product.pricing?.min_price}</span>
                                {selectedVariant?.compare_at_price > selectedVariant?.price && (
                                    <span className="text-xs font-bold text-gray-300 line-through">₹{selectedVariant.compare_at_price}</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">{product.description}</p>
                        </div>

                        {/* Variant Selection */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Variant</h4>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants?.map((variant) => (
                                        <button
                                            key={variant._id}
                                            disabled={variant.stock <= 0}
                                            onClick={() => setSelectedVariant(variant)}
                                            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all border-2 ${selectedVariant?._id === variant._id
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : variant.stock <= 0
                                                    ? 'opacity-40 cursor-not-allowed border-gray-50'
                                                    : 'border-gray-100 text-gray-600 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex flex-col items-start gap-1">
                                                <span>{variant.color} / {variant.size}</span>
                                                <span className="text-[10px] opacity-60">₹{variant.price}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!selectedVariant || selectedVariant.stock <= 0}
                                    className="flex-1 px-10 py-5 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-secondary transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    <ShoppingBag size={20} />
                                    {selectedVariant?.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                                <button className="p-5 border border-gray-200 rounded-2xl text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all">
                                    <Heart size={20} />
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                        <Truck size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">Free Delivery</p>
                                        <p className="text-[10px] font-medium text-gray-400">On all orders</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">7-Day Returns</p>
                                        <p className="text-[10px] font-medium text-gray-400">Easy exchange</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extra Details */}
                        <div className="pt-10 border-t border-gray-100 space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Product Details</h4>
                            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400">Category</p>
                                    <p className="text-xs font-bold text-gray-900 italic">{product.category_id?.name || 'Accessories'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400">Availability</p>
                                    <p className="text-xs font-bold text-emerald-500 italic">In Stock</p>
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
