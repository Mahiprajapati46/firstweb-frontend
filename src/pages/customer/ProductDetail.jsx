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
        <div className="bg-[#fdfaf5] min-h-screen pb-32 pt-12">
            <div className="container-custom max-w-7xl mx-auto px-6">
                {/* Navigation & Breadcrumbs */}
                <div className="flex items-center justify-between mb-16">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#9f8170] hover:text-primary transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Catalogue
                    </button>
                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-white border border-[#e5e5d1] rounded-2xl text-primary hover:text-red-500 hover:border-red-100 transition-all shadow-sm">
                            <Heart size={20} />
                        </button>
                        <button className="p-3 bg-white border border-[#e5e5d1] rounded-2xl text-primary hover:text-[#c19a6b] hover:border-[#c19a6b30] transition-all shadow-sm">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                    {/* Media Gallery */}
                    <div className="space-y-8 sticky top-32">
                        <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-white border border-[#e5e5d1]/50 shadow-2xl group">
                            <img
                                src={allImages[activeImage]}
                                alt={product.title}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute top-8 left-8">
                                <span className="px-4 py-2 bg-primary/95 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                    Authentic Goods
                                </span>
                            </div>
                        </div>
                        {allImages.length > 1 && (
                            <div className="flex items-center gap-6 overflow-x-auto pb-4 no-scrollbar">
                                {allImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-[#c19a6b] shadow-xl scale-105' : 'border-transparent grayscale opacity-50 hover:opacity-100 hover:grayscale-0'}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#c19a6b]">
                                <Sparkles size={14} />
                                Artisan Collection
                            </div>
                            <h1 className="text-6xl font-black text-primary tracking-tighter leading-tight italic serif capitalize">{product.title}</h1>
                            <div className="flex items-center gap-6 pt-2">
                                <div className="flex items-center gap-1 text-amber-400">
                                    <Star size={16} fill="currentColor" />
                                    <Star size={16} fill="currentColor" />
                                    <Star size={16} fill="currentColor" />
                                    <Star size={16} fill="currentColor" />
                                    <Star size={16} className="text-gray-200" />
                                    <span className="ml-2 text-xs font-black text-primary underline underline-offset-4">128 Interactions</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <p className="text-lg text-[#9f8170] font-medium leading-relaxed italic">
                                {product.description}
                            </p>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-end gap-4 p-8 bg-white border border-[#e5e5d1]/50 rounded-[2.5rem] shadow-sm">
                            <div className="flex-1 space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#c19a6b]">Current Value</p>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-5xl font-black text-primary tracking-tighter">₹ {selectedVariant?.price || product.pricing?.base_price}</span>
                                    {product.pricing?.compare_at_price > (selectedVariant?.price || product.pricing?.base_price) && (
                                        <span className="text-lg font-bold text-gray-300 line-through italic">₹ {product.pricing.compare_at_price}</span>
                                    )}
                                </div>
                            </div>
                            <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                Tax Inclusive
                            </div>
                        </div>

                        {/* Variant Selection */}
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#c19a6b]">Select Specification</h4>
                                <div className="flex flex-wrap gap-4">
                                    {variants.map((variant) => (
                                        <button
                                            key={variant._id}
                                            onClick={() => setSelectedVariant(variant)}
                                            className={`px-8 py-5 rounded-3xl text-sm font-black transition-all border-2 flex items-center gap-3 ${selectedVariant?._id === variant._id
                                                ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/20 scale-105'
                                                : 'bg-white text-primary border-[#e5e5d1] hover:border-[#c19a6b]'}`}
                                        >
                                            {variant.attributes.size && <span>{variant.attributes.size}</span>}
                                            {variant.attributes.color && (
                                                <div
                                                    className="w-4 h-4 rounded-full border border-white/20"
                                                    style={{ backgroundColor: variant.attributes.color.toLowerCase() }}
                                                />
                                            )}
                                            {!variant.attributes.size && !variant.attributes.color && <span>Standard Edition</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quantity & Add to Cart */}
                        <div className="flex items-center gap-6 pt-8">
                            <div className="flex items-center bg-white border border-[#e5e5d1] rounded-2xl p-1 shadow-sm shrink-0">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-12 h-12 flex items-center justify-center text-primary hover:text-[#c19a6b] transition-colors"
                                >
                                    -
                                </button>
                                <span className="w-10 text-center font-black text-primary">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-12 h-12 flex items-center justify-center text-primary hover:text-[#c19a6b] transition-colors"
                                >
                                    +
                                </button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                disabled={loading}
                                className={`flex-1 px-10 py-6 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-4 group ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <ShoppingBasket size={18} />
                                {loading ? 'Processing...' : 'Add to Basket'}
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-6 pt-12">
                            <div className="flex items-center gap-4 p-6 bg-white border border-[#e5e5d1]/30 rounded-[2rem]">
                                <div className="w-10 h-10 bg-[#c19a6b10] rounded-xl flex items-center justify-center text-[#c19a6b]">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Swift Delivery</p>
                                    <p className="text-[8px] font-bold text-[#9f8170] tracking-wider italic">2-4 Business Days</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-6 bg-white border border-[#e5e5d1]/30 rounded-[2rem]">
                                <div className="w-10 h-10 bg-[#c19a6b10] rounded-xl flex items-center justify-center text-[#c19a6b]">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Matte Guarantee</p>
                                    <p className="text-[8px] font-bold text-[#9f8170] tracking-wider italic">100% Authentic Source</p>
                                </div>
                            </div>
                        </div>

                        {!user && (
                            <div className="p-8 bg-[#c19a6b05] border border-[#c19a6b20] rounded-[2.5rem] flex gap-6 mt-12 group hover:bg-[#c19a6b10] transition-colors">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#c19a6b] shadow-sm shrink-0">
                                    <Info size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-primary italic">Guest Discovery Experience</h4>
                                    <p className="text-xs font-medium text-[#9f8170] leading-relaxed italic">
                                        You are currently in guest mode. While you can explore every artisan detail, you'll need to <Link to="/login" state={{ from: location }} className="text-primary font-black underline underline-offset-4 decoration-[#c19a6b]/30 hover:decoration-[#c19a6b]">Authenticate</Link> to secure these items in your personal basket and proceed with our premium checkout infrastructure.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
