import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Hash, RefreshCw, LayoutGrid } from 'lucide-react';
import customerApi from '../../api/customer';
import toast from 'react-hot-toast';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await customerApi.getCategoriesTree();
                setCategories(response.data || []);
            } catch (error) {
                toast.error('Failed to load categories');
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className="min-h-screen bg-[#f8f9fa] pt-24 pb-24">
            <div className="premium-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
                                <LayoutGrid size={20} />
                            </div>
                            <span className="text-secondary text-[11px] font-black uppercase tracking-[0.4em]">Full Directory</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tighter">Marketplace Taxonomy</h1>
                        <p className="text-secondary/60 font-medium max-w-xl text-lg">
                            Explore our curated catalog across all specialized manufacturing and commerce sectors.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="h-80 bg-white border border-secondary/5 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : categories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories.map((cat) => (
                            <Link
                                key={cat._id}
                                to={`/products?category=${cat.slug}`}
                                className="group relative h-72 bg-white border border-secondary/10 rounded-[2rem] overflow-hidden transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
                            >
                                {/* Category Image */}
                                <div className="absolute inset-0 bg-secondary/5 transition-transform duration-1000 group-hover:scale-110">
                                    {cat.image ? (
                                        <img
                                            src={cat.image}
                                            alt={cat.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ShoppingBag size={64} strokeWidth={1} className="text-primary/5" />
                                        </div>
                                    )}
                                </div>

                                {/* Overlay */}
                                <div className={`absolute inset-0 transition-opacity duration-700 ${cat.image ? 'bg-gradient-to-t from-primary/80 via-primary/10 to-transparent group-hover:from-primary/90' : 'bg-white/90 group-hover:bg-primary/95'}`} />

                                {/* Content */}
                                <div className="absolute inset-x-8 bottom-8 z-10">
                                    <div className="space-y-2 transform transition-transform duration-700 group-hover:-translate-y-1">
                                        <div className="flex items-center gap-2">
                                            <Hash size={10} className={cat.image ? 'text-secondary/60' : 'text-primary/40'} />
                                            <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${cat.image ? 'text-secondary/60' : 'text-primary/40'}`}>
                                                {cat.slug}
                                            </p>
                                        </div>
                                        <h3 className={`text-2xl font-black tracking-tighter ${cat.image ? 'text-white' : 'text-primary'} group-hover:text-secondary italic`}>
                                            {cat.name}
                                        </h3>
                                        <p className={`text-xs font-medium line-clamp-1 leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-2 group-hover:translate-y-0 ${cat.image ? 'text-white/70' : 'text-primary/60'}`}>
                                            {cat.description || `Browse our premium ${cat.name} collection.`}
                                        </p>
                                    </div>

                                    <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-100">
                                        <ArrowRight size={20} />
                                    </div>
                                </div>

                                {/* Decorator for imageless */}
                                {!cat.image && (
                                    <div className="absolute -top-10 -right-10 opacity-5 transition-transform duration-1000 group-hover:rotate-12">
                                        <span className="text-[12rem] font-black text-primary select-none italic">{cat.name?.charAt(0)}</span>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-40 text-center space-y-8 bg-white rounded-[4rem] border border-secondary/5 shadow-sm">
                        <div className="w-24 h-24 bg-secondary/5 rounded-[2.5rem] flex items-center justify-center text-primary/10 mx-auto">
                            <LayoutGrid size={48} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-primary tracking-tighter italic">No Active Categories Found</h2>
                            <p className="text-secondary/40 font-bold uppercase tracking-widest text-[10px]">Taxonomy directory is currently being updated</p>
                        </div>
                        <Link to="/" className="btn-boutique-primary inline-flex">
                            Back to Collection
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Categories;
