import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
    LayoutGrid,
    StretchHorizontal,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    Search,
    Store,
    MapPin,
    ArrowLeft
} from 'lucide-react';
import customerApi from '../../api/customer';
import toast from 'react-hot-toast';

const MerchantStorefront = () => {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [merchant, setMerchant] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ page: 1, limit: 12, total: 0 });
    const [viewMode, setViewMode] = useState('grid');
    const currentPage = parseInt(searchParams.get('page')) || 1;

    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                setLoading(true);
                const [merchantRes, productsRes] = await Promise.all([
                    customerApi.getMerchantBySlug(slug),
                    customerApi.getProducts({
                        merchant_slug: slug,
                        page: currentPage,
                        limit: meta.limit
                    })
                ]);
                setMerchant(merchantRes.data);
                setProducts(productsRes.data || []);
                setMeta(prev => ({ ...prev, total: productsRes.meta?.total || 0 }));
            } catch (error) {
                toast.error('Failed to load store data');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchStoreData();
    }, [slug, currentPage]);

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading && !merchant) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!merchant && !loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] space-y-6">
                <Store size={64} className="text-gray-300" />
                <h2 className="text-2xl font-bold text-gray-900">Store Not Found</h2>
                <Link to="/products" className="text-primary font-bold hover:underline flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to Products
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#f8f9fa] min-h-screen">
            {/* Merchant Header */}
            <div className="bg-white border-b border-gray-100 overflow-hidden pt-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
                     <Link to="/products" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors mb-8">
                        <ArrowLeft size={14} /> Back to All Products
                    </Link>
                    
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary shrink-0 border border-primary/10">
                            <Store size={40} />
                        </div>
                        <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-bold text-gray-900 tracking-tight capitalize">
                                    {merchant?.store_name}
                                </h1>
                                <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
                                    Verified Merchant
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm max-w-2xl leading-relaxed">
                                {merchant?.description || "Welcome to our official store collection. We pride ourselves on providing high-quality industrial products and exceptional service to our customers."}
                            </p>
                            <div className="flex flex-wrap gap-6 pt-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                    <MapPin size={14} className="text-primary" />
                                    {merchant?.address?.city || 'India'}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                    <LayoutGrid size={14} className="text-primary" />
                                    {meta.total} Products
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-full md:w-auto flex md:flex-col gap-3">
                            <button className="flex-1 md:w-48 py-3.5 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all">
                                Follow Store
                            </button>
                            <button className="flex-1 md:w-48 py-3.5 bg-white border border-gray-100 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-600 hover:border-primary transition-all">
                                Contact Seller
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Store Collection</h2>
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
                    </div>
                </div>

                {products.length > 0 ? (
                    <div className="space-y-16">
                        <div className={`grid gap-x-8 gap-y-12 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
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
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">{merchant?.store_name}</p>
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{product.title}</h3>
                                        <div className="flex items-baseline gap-2 pt-1">
                                            <span className="text-lg font-black text-gray-900">₹{product.pricing?.min_price?.toLocaleString()}</span>
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
                    </div>
                ) : (
                    <div className="py-24 text-center space-y-6">
                        <div className="w-20 h-20 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-gray-300 mx-auto shadow-sm">
                            <Search size={32} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-gray-900">No products found</h3>
                            <p className="text-sm text-gray-400 font-medium">This merchant hasn't listed any products yet.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MerchantStorefront;
