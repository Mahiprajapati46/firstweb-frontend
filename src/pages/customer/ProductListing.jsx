import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    LayoutGrid,
    StretchHorizontal,
    ArrowUpRight
} from 'lucide-react';
import customerApi from '../../api/customer';
import toast from 'react-hot-toast';

const ProductListing = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ page: 1, limit: 12, total: 0 });
    const [viewMode, setViewMode] = useState('grid');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
    const [debouncedPrice, setDebouncedPrice] = useState(priceRange);

    const currentCategory = searchParams.get('category') || '';
    const currentPage = parseInt(searchParams.get('page')) || 1;

    // Debounce price changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedPrice(priceRange);
        }, 800);
        return () => clearTimeout(timer);
    }, [priceRange]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [currentCategory, currentPage, debouncedPrice]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await customerApi.getProducts({
                page: currentPage,
                limit: meta.limit,
                category: currentCategory,
                minPrice: debouncedPrice.min,
                maxPrice: debouncedPrice.max
            });
            setProducts(response.data || []);
            setMeta(prev => ({ ...prev, total: response.meta?.total || 0 }));
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await customerApi.getCategoriesTree();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleCategoryChange = (slug) => {
        const params = new URLSearchParams(searchParams);
        if (slug) params.set('category', slug);
        else params.delete('category');
        params.set('page', '1');
        setSearchParams(params);
    };

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="bg-[#f8f9fa] min-h-screen pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Breadcrumbs & Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-primary italic">Products</span>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                            {currentCategory ? categories.find(c => c.slug === currentCategory)?.name : 'All Products'}
                        </h1>
                    </div>

                    {/* View & Sort Actions */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-primary'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-primary'}`}
                            >
                                <StretchHorizontal size={18} />
                            </button>
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-600 hover:border-primary transition-all shadow-sm">
                            <Filter size={16} className="text-primary" />
                            Filter
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sidebar Filters */}
                    <aside className="hidden lg:block space-y-10 sticky top-32 h-fit">
                        {/* Category Filter */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Categories</h4>
                            <div className="space-y-1">
                                <button
                                    onClick={() => handleCategoryChange('')}
                                    className={`w-full text-left py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${!currentCategory ? 'bg-white text-primary border border-gray-100 shadow-sm' : 'text-gray-500 hover:text-primary hover:bg-white'}`}
                                >
                                    All Products
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat._id}
                                        onClick={() => handleCategoryChange(cat.slug)}
                                        className={`w-full text-left py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${currentCategory === cat.slug ? 'bg-white text-primary border border-gray-100 shadow-sm' : 'text-gray-500 hover:text-primary hover:bg-white'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Price Dynamics</h4>
                            <div className="space-y-6">
                                <div className="relative h-6 flex items-center">
                                    {/* Track Background */}
                                    <div className="absolute w-full h-1 bg-gray-100 rounded-full"></div>

                                    {/* Active Track Highlight */}
                                    <div
                                        className="absolute h-1 bg-primary rounded-full transition-all duration-300"
                                        style={{
                                            left: `${(priceRange.min / 200000) * 100}%`,
                                            right: `${100 - (priceRange.max / 200000) * 100}%`
                                        }}
                                    ></div>

                                    {/* Inputs */}
                                    <input
                                        type="range"
                                        min="0"
                                        max="200000"
                                        step="500"
                                        value={priceRange.min}
                                        onChange={(e) => {
                                            const val = Math.min(Number(e.target.value), priceRange.max - 5000);
                                            setPriceRange(prev => ({ ...prev, min: val }));
                                        }}
                                        className="absolute w-full h-1 bg-transparent appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md"
                                    />
                                    <input
                                        type="range"
                                        min="0"
                                        max="200000"
                                        step="500"
                                        value={priceRange.max}
                                        onChange={(e) => {
                                            const val = Math.max(Number(e.target.value), priceRange.min + 5000);
                                            setPriceRange(prev => ({ ...prev, max: val }));
                                        }}
                                        className="absolute w-full h-1 bg-transparent appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight">Minimum</p>
                                        <div className="px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-primary">
                                            ₹ {priceRange.min.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-right">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight">Maximum</p>
                                        <div className="px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-primary">
                                            ₹ {priceRange.max.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/5 relative overflow-hidden group">
                            <ArrowUpRight className="absolute -top-2 -right-2 text-primary opacity-5 group-hover:opacity-10 transition-opacity" size={60} />
                            <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2">Curated Service</p>
                            <p className="text-xs font-medium text-primary/60 leading-relaxed italic">
                                Use price filters to identify specialized collections within your desired budget.
                            </p>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-12">
                        {loading ? (
                            <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                {Array(6).fill(0).map((_, i) => (
                                    <div key={i} className="animate-pulse space-y-4">
                                        <div className="aspect-[4/5] bg-white border border-gray-50 rounded-2xl"></div>
                                        <div className="h-4 bg-gray-50 rounded-full w-2/3"></div>
                                        <div className="h-3 bg-gray-50 rounded-full w-1/3"></div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className={`grid gap-x-8 gap-y-12 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                    {products.map((product) => (
                                        <Link
                                            key={product._id}
                                            to={`/products/${product.slug}`}
                                            className={`group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 ${viewMode === 'list' ? 'flex flex-col md:flex-row gap-6 p-6' : 'flex flex-col'}`}
                                        >
                                            <div className={`relative overflow-hidden bg-gray-50 ${viewMode === 'list' ? 'w-full md:w-48 aspect-square rounded-xl shrink-0' : 'aspect-[4/5]'}`}>
                                                <img
                                                    src={product.images?.[0]}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-primary shadow-sm">
                                                        <ArrowUpRight size={18} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`p-5 space-y-2 ${viewMode === 'list' ? 'flex-1 p-0' : ''}`}>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Store Collection</p>
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{product.title}</h3>
                                                {viewMode === 'list' && (
                                                    <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2 mt-2 mb-4">{product.description}</p>
                                                )}
                                                <div className="flex items-baseline gap-2 pt-1">
                                                    <span className="text-lg font-black text-gray-900">₹{product.pricing?.min_price}</span>
                                                    {product.pricing?.max_price > product.pricing?.min_price && (
                                                        <span className="text-[10px] font-bold text-gray-300 line-through">₹{product.pricing.max_price}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-gray-100">
                                    <p className="text-xs font-bold text-gray-400">
                                        Showing <span className="text-gray-900">{products.length}</span> of <span className="text-gray-900">{meta.total}</span> products
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2 hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-all"
                                        >
                                            <ChevronLeft size={16} /> Previous
                                        </button>
                                        <div className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-xl font-black text-xs">
                                            {currentPage}
                                        </div>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage * meta.limit >= meta.total}
                                            className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2 hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-all"
                                        >
                                            Next <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="py-24 text-center space-y-6">
                                <div className="w-20 h-20 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-gray-300 mx-auto shadow-sm">
                                    <Search size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold text-gray-900">No products found</h3>
                                    <p className="text-sm text-gray-400 font-medium">Try changing your filters or search term.</p>
                                </div>
                                <button
                                    onClick={() => handleCategoryChange('')}
                                    className="px-8 py-3.5 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all"
                                >
                                    Clear all Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductListing;

