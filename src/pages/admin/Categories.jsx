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
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'requests'

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getCategories();
            setCategories(response.data);
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

    if (loading && categories.length === 0) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <RefreshCw size={32} className="text-accent animate-spin" />
            <div className="text-accent font-black uppercase tracking-widest text-xs italic">Structuring Taxonomy...</div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tighter uppercase italic">Product Taxonomy</h1>
                    <p className="text-gray-400 font-medium text-sm mt-1">Organize and manage catalog categories and hierarchies.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/admin/category-requests" className="px-6 py-3 bg-white border border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all flex items-center gap-2">
                        <ListChecks size={16} /> <span>Review Requests</span>
                    </Link>
                    <Button onClick={handleCreate} className="flex items-center gap-2 group">
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span>Add New Category</span>
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Categories List */}
                    <div className="card-premium overflow-hidden divide-y divide-gray-50 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                        {categories.map((cat) => (
                            <div key={cat._id} className="p-6 hover:bg-gray-50/50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-accent overflow-hidden">
                                            {cat.image ? (
                                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <FolderTree size={24} />
                                            )}
                                        </div>
                                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${cat.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-primary uppercase tracking-tight italic">{cat.name}</p>
                                            {cat.parent_id && (
                                                <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Sub</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Slug: {cat.slug}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order: {cat.sort_order}</span>
                                        <button
                                            onClick={() => handleToggleStatus(cat._id)}
                                            className={`text-[9px] font-black uppercase tracking-widest mt-1 px-2 py-0.5 rounded-md transition-colors ${cat.is_active ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}
                                        >
                                            {cat.is_active ? 'Active' : 'Hidden'}
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(cat)}
                                            className="p-3 text-gray-400 hover:text-accent hover:bg-white rounded-2xl transition-all shadow-sm hover:shadow-gray-200"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat._id)}
                                            className="p-3 text-gray-400 hover:text-red-500 hover:bg-white rounded-2xl transition-all shadow-sm hover:shadow-gray-200"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {categories.length === 0 && (
                            <div className="p-20 text-center space-y-4">
                                <div className="inline-flex p-4 bg-gray-50 rounded-full text-gray-200">
                                    <LayoutGrid size={48} />
                                </div>
                                <p className="text-gray-400 font-bold italic">No categories defined in registry.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="card-premium p-8 bg-primary text-white border-none shadow-2xl shadow-primary/20 rounded-[2.5rem]">
                        <div className="flex items-center gap-3 mb-4">
                            <Info size={20} className="text-accent" />
                            <h3 className="font-black text-lg uppercase italic tracking-tight">Taxonomy Rules</h3>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">
                            Hierarchical structures improve browsing. Ensure all categories have meaningful descriptions for SEO.
                            <br /><br />
                            <span className="text-accent italic font-bold">Note:</span> Deletion is restricted if dependencies exist.
                        </p>
                    </div>

                    <div className="card-premium p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl shadow-gray-200/50">
                        <h3 className="font-black text-primary mb-6 uppercase tracking-widest text-xs">Category Stats</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center group">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Root Categories</span>
                                <span className="font-black text-primary italic text-xl">{categories.filter(c => !c.parent_id).length}</span>
                            </div>
                            <div className="w-full h-px bg-gray-50" />
                            <div className="flex justify-between items-center group">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Sub-categories</span>
                                <span className="font-black text-primary italic text-xl">{categories.filter(c => c.parent_id).length}</span>
                            </div>
                            <div className="w-full h-px bg-gray-50" />
                            <div className="flex justify-between items-center group">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Channels</span>
                                <span className="font-black text-green-500 italic text-xl">{categories.filter(c => c.is_active).length}</span>
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
