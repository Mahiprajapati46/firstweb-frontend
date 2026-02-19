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
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    const currentCategory = searchParams.get('category') || '';
    const currentPage = parseInt(searchParams.get('page')) || 1;

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [currentCategory, currentPage]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await customerApi.getProducts({
                page: currentPage,
                limit: meta.limit,
                category: currentCategory
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
        <div className="bg-[#fdfaf5] min-h-screen pt-12">
            <div className="container-custom max-w-7xl mx-auto px-6">
                {/* Breadcrumbs & Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#9f8170]">
                            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-primary italic">Catalogue</span>
                        </div>
                        <h1 className="text-6xl font-black text-primary tracking-tighter">
                            {currentCategory ? categories.find(c => c.slug === currentCategory)?.name : 'All Collections'}
                        </h1>
                    </div>

                    {/* View & Sort Actions */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-white border border-[#e5e5d1] rounded-2xl p-1 shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-primary'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-primary'}`}
                            >
                                <StretchHorizontal size={18} />
                            </button>
                        </div>
                        <button className="flex items-center gap-3 px-6 py-4 bg-white border border-[#e5e5d1] rounded-2xl text-xs font-black uppercase tracking-widest text-primary hover:border-[#c19a6b] transition-all group shadow-sm">
                            <SlidersHorizontal size={16} className="text-[#c19a6b]" />
                            Refine
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sidebar Filters */}
                    <aside className="hidden lg:block space-y-12 sticky top-32 h-fit">
                        {/* Category Filter */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#c19a6b]">Categories</h4>
                            <div className="space-y-3">
                                <button
                                    onClick={() => handleCategoryChange('')}
                                    className={`w-full text-left py-2 px-4 rounded-xl text-sm font-bold transition-all ${!currentCategory ? 'bg-[#c19a6b10] text-primary border-l-4 border-[#c19a6b]' : 'text-gray-400 hover:bg-white'}`}
                                >
                                    All Products
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat._id}
                                        onClick={() => handleCategoryChange(cat.slug)}
                                        className={`w-full text-left py-2 px-4 rounded-xl text-sm font-bold transition-all ${currentCategory === cat.slug ? 'bg-[#c19a6b10] text-primary border-l-4 border-[#c19a6b]' : 'text-gray-400 hover:bg-white'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Aesthetic Divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-[#e5e5d1] to-transparent"></div>

                        {/* Price Range Placeholder */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#c19a6b]">Price Range</h4>
                            <div className="px-2">
                                <div className="h-1 bg-gray-100 rounded-full relative">
                                    <div className="absolute inset-x-0 h-full bg-[#c19a6b] rounded-full"></div>
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#c19a6b] rounded-full shadow-lg"></div>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#c19a6b] rounded-full shadow-lg"></div>
                                </div>
                                <div className="flex items-center justify-between mt-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                    <span>₹ 0</span>
                                    <span>₹ 1,00,000+</span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Product Grid/List */}
                    <div className="lg:col-span-3 space-y-16">
                        {loading ? (
                            <div className={`grid gap-10 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                {Array(6).fill(0).map((_, i) => (
                                    <div key={i} className="animate-pulse space-y-6">
                                        <div className="aspect-[4/5] bg-white border border-[#e5e5d1]/30 rounded-[2.5rem]"></div>
                                        <div className="h-6 bg-gray-100 rounded-full w-2/3"></div>
                                        <div className="h-4 bg-gray-50 rounded-full w-1/3"></div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className={`grid gap-x-10 gap-y-16 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                    {products.map((product) => (
                                        <Link
                                            key={product._id}
                                            to={`/products/${product.slug}`}
                                            className={`group ${viewMode === 'list' ? 'flex flex-col md:flex-row gap-8 items-center bg-white p-8 rounded-[2.5rem] border border-[#e5e5d1]/30 hover:shadow-2xl transition-all duration-700' : 'space-y-6'}`}
                                        >
                                            <div className={`relative overflow-hidden bg-white border border-[#e5e5d1]/30 rounded-[2.5rem] group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-700 ${viewMode === 'list' ? 'w-full md:w-64 aspect-square shrink-0' : 'aspect-[4/5]'}`}>
                                                <img
                                                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1999'}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                />
                                                <div className="absolute top-6 right-6 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                                    <div className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-[#c19a6b] shadow-xl">
                                                        <ArrowUpRight size={20} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`space-y-2 ${viewMode === 'list' ? 'flex-1 py-4 text-center md:text-left' : ''}`}>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c19a6b]">New In Store</p>
                                                <h3 className="text-xl font-black text-primary tracking-tight group-hover:text-[#c19a6b] transition-colors line-clamp-2">{product.title}</h3>
                                                {viewMode === 'list' && (
                                                    <p className="text-sm text-[#9f8170] font-medium leading-relaxed italic mt-4 mb-6">{product.description?.substring(0, 150)}...</p>
                                                )}
                                                <div className="flex items-center gap-3 pt-2">
                                                    <span className="text-lg font-black text-primary">₹ {product.pricing?.base_price}</span>
                                                    {product.pricing?.compare_at_price > product.pricing?.base_price && (
                                                        <span className="text-xs font-bold text-gray-400 line-through italic">₹ {product.pricing.compare_at_price}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div className="flex items-center justify-between pt-20 border-t border-[#e5e5d1]/30">
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                                        Showing <span className="text-primary">{products.length}</span> of <span className="text-primary">{meta.total}</span> products
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-6 py-4 bg-white border border-[#e5e5d1] rounded-2xl text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:border-[#c19a6b] disabled:opacity-20 disabled:hover:border-[#e5e5d1] transition-all"
                                        >
                                            <ChevronLeft size={16} /> Previous
                                        </button>
                                        <div className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-2xl font-black text-xs">
                                            {currentPage}
                                        </div>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage * meta.limit >= meta.total}
                                            className="px-6 py-4 bg-white border border-[#e5e5d1] rounded-2xl text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:border-[#c19a6b] disabled:opacity-20 disabled:hover:border-[#e5e5d1] transition-all"
                                        >
                                            Next <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="py-40 text-center space-y-8">
                                <div className="w-24 h-24 bg-white rounded-[2rem] border border-[#e5e5d1] flex items-center justify-center text-[#c19a6b] mx-auto shadow-sm">
                                    <Search size={40} className="opacity-20" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-primary tracking-tighter italic serif">No match found</h3>
                                    <p className="text-sm text-[#9f8170] font-medium italic">Try refining your selection or browsing other categories.</p>
                                </div>
                                <button
                                    onClick={() => handleCategoryChange('')}
                                    className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all"
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

