import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderTree, Edit3, Trash2, ChevronRight, LayoutGrid, ListChecks, CheckCircle2, XCircle, Info, RefreshCw } from 'lucide-react';
import adminApi from '../../api/admin';
import Button from '../../components/ui/Button';
import CategoryModal from '../../components/admin/CategoryModal';
import { toast } from 'react-hot-toast';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getCategories();
            // Sort by sort_order
            const sorted = response.data.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            setCategories(sorted);
        } catch (error) {
            toast.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedCategory(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category? This operation will fail if there are sub-categories or active products.')) return;

        try {
            await adminApi.deleteCategory(id);
            toast.success('Category deleted');
            fetchCategories();
        } catch (error) {
            toast.error(error.message || 'Deletion blocked by data integrity rules');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await adminApi.toggleCategoryStatus(id);
            toast.success('Status updated');
            fetchCategories();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const rootCategories = categories.filter(c => !c.parent_id || !categories.find(p => p._id === c.parent_id));
    const getSubCategories = (parentId) => categories.filter(c => c.parent_id === parentId);

    const renderCategoryTree = (cat, depth = 0) => {
        const subCats = getSubCategories(cat._id);
        const isOrphan = cat.parent_id && !categories.find(p => p._id === cat.parent_id);

        return (
            <div key={cat._id} className="space-y-4">
                {/* Category Card */}
                <div className={`bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden ${depth > 0 ? 'ml-10 bg-slate-50/40 rounded-xl p-4' : ''}`}>
                    {/* Branch Lines for nested items */}
                    {depth > 0 && (
                        <>
                            <div className="absolute -left-5 top-0 bottom-0 w-px bg-slate-200/60" />
                            <div className="absolute -left-5 top-1/2 w-4 h-px bg-slate-200/60" />
                        </>
                    )}

                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div className={`bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 overflow-hidden shadow-inner ${depth > 0 ? 'w-10 h-10' : 'w-14 h-14'}`}>
                                    {cat.image ? (
                                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <FolderTree size={depth > 0 ? 18 : 24} />
                                    )}
                                </div>
                                <div className={`absolute -top-0.5 -right-0.5 rounded-full border-2 border-white ${cat.is_active ? 'bg-emerald-500 shadow-emerald-100 shadow-lg' : 'bg-slate-300'} ${depth > 0 ? 'w-2.5 h-2.5' : 'w-4 h-4'}`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className={`font-outfit font-semibold text-primary tracking-tight ${depth > 0 ? 'text-sm' : 'text-lg'}`}>
                                        {cat.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5">
                                        {isOrphan && (
                                            <span className="text-[8px] bg-rose-50 text-rose-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-rose-100">
                                                Orphaned
                                            </span>
                                        )}
                                        {subCats.length > 0 && (
                                            <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-slate-200/50">
                                                {subCats.length} Sub
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-0.5">
                                    <p className="text-[10px] font-medium text-slate-400">Slug: <span className="font-semibold text-slate-500">{cat.slug}</span></p>
                                    <p className="text-[10px] font-medium text-slate-400">Order: <span className="font-semibold text-primary/70">{cat.sort_order}</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => handleToggleStatus(cat._id)}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border ${cat.is_active ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-slate-400 bg-slate-50 border-slate-200'}`}
                            >
                                {cat.is_active ? 'Active' : 'Hidden'}
                            </button>
                            <button
                                onClick={() => handleEdit(cat)}
                                className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-all"
                                title="Edit Category"
                            >
                                <Edit3 size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(cat._id)}
                                disabled={subCats.length > 0}
                                title={subCats.length > 0 ? "Cannot delete category with sub-categories" : "Delete category"}
                                className={`p-2 rounded-lg transition-all ${subCats.length > 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recursively Render Sub-categories */}
                {subCats.length > 0 && (
                    <div className="space-y-4">
                        {subCats.map(sub => renderCategoryTree(sub, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (loading && categories.length === 0) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <RefreshCw size={32} className="text-accent animate-spin" />
            <div className="text-accent font-bold uppercase tracking-widest text-[10px]">Updating Taxonomy...</div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-outfit">Product Taxonomy</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1 font-inter">Organize and manage catalog categories and hierarchies.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/admin/category-requests" className="px-5 py-2.5 bg-white border border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm font-inter">
                        <ListChecks size={16} /> <span>Review Requests</span>
                    </Link>
                    <Button onClick={handleCreate} className="flex items-center gap-2 group shadow-lg shadow-primary/5 font-inter">
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span>Add New Category</span>
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    {/* Categories Hierarchical List */}
                    <div className="space-y-6">
                        {rootCategories.map((cat) => renderCategoryTree(cat))}

                        {categories.length === 0 && (
                            <div className="p-32 text-center space-y-6 bg-white border border-dashed border-slate-200 rounded-2xl">
                                <div className="inline-flex p-6 bg-slate-50 rounded-full text-slate-300">
                                    <LayoutGrid size={64} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-outfit font-bold text-slate-600">Empty Taxonomy</h3>
                                    <p className="text-slate-400 text-sm font-medium">Start by defining your primary root categories.</p>
                                </div>
                                <Button onClick={handleCreate} className="mx-auto">Initialize Registry</Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-primary text-white p-8 rounded-2xl shadow-xl shadow-primary/10 relative overflow-hidden group">
                        {/* Decorative Background Element */}
                        <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                            <FolderTree size={180} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                                    <Info size={20} className="text-accent" />
                                </div>
                                <h3 className="font-outfit font-bold text-lg tracking-tight">Taxonomy Rules</h3>
                            </div>
                            <div className="space-y-6 font-inter">
                                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                    Hierarchical structures improve browsing. Ensure all categories have meaningful descriptions for SEO.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-1 h-auto bg-accent rounded-full" />
                                        <div>
                                            <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">Hierarchy</p>
                                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Limit depths to 2 levels for the best desktop and mobile UX.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-1 h-auto bg-accent rounded-full" />
                                        <div>
                                            <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">Integrity</p>
                                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Deletion is restricted if active products or child nodes exist.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm font-inter">
                        <h3 className="font-outfit font-bold text-slate-400 mb-8 uppercase tracking-widest text-[10px]">Category Summary</h3>
                        <div className="space-y-8">
                            <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Root Channels</span>
                                    <p className="text-[11px] text-slate-400 font-medium tracking-tight">Entry points</p>
                                </div>
                                <span className="font-outfit font-bold text-primary text-3xl">{rootCategories.length}</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sub-categories</span>
                                    <p className="text-[11px] text-slate-400 font-medium tracking-tight">Classifications</p>
                                </div>
                                <span className="font-outfit font-bold text-primary text-3xl">{categories.filter(c => c.parent_id).length}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Status</span>
                                    <p className="text-[11px] text-slate-400 font-medium tracking-tight">Live taxonomies</p>
                                </div>
                                <span className="font-outfit font-bold text-emerald-500 text-3xl">{categories.filter(c => c.is_active).length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Modal */}
            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                category={selectedCategory}
                categories={categories}
                onRefresh={fetchCategories}
            />
        </div>
    );
};

export default AdminCategories;
