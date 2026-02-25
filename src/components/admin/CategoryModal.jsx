import React, { useState, useEffect } from 'react';
import { X, FolderTree, Image as ImageIcon, Plus, Trash2, RefreshCw, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import { toast } from 'react-hot-toast';
import adminApi from '../../api/admin';

const CategoryModal = ({ isOpen, onClose, category, categories, onRefresh }) => {
    const [formData, setFormData] = useState({
        name: '',
        parent_id: '',
        sort_order: 0,
        description: '',
        is_active: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                parent_id: category.parent_id || '',
                sort_order: category.sort_order || 0,
                description: category.description || '',
                is_active: category.is_active ?? true
            });
            setImagePreview(category.image || null);
        } else {
            setFormData({
                name: '',
                parent_id: '',
                sort_order: 0,
                description: '',
                is_active: true
            });
            setImagePreview(null);
        }
        setImageFile(null);
    }, [category, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let savedCategory;
            if (category) {
                const response = await adminApi.updateCategory(category._id, formData);
                savedCategory = response.data;
                toast.success('Category updated successfully');
            } else {
                const response = await adminApi.createCategory(formData);
                savedCategory = response.data;
                toast.success('Category created successfully');
            }

            // Handle image upload if a new file was selected
            if (imageFile) {
                await adminApi.uploadCategoryImage(savedCategory._id, imageFile);
                toast.success('Image uploaded successfully');
            }

            onRefresh();
            onClose();
        } catch (error) {
            toast.error(error.message || 'Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-[2.5rem] border border-gray-100 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header - Fixed */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 border border-slate-100 text-primary rounded-2xl shadow-inner">
                            <FolderTree size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight font-outfit">
                                {category ? 'Edit' : 'Create'} Category
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-inter">Taxonomy Management</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Content - Scrollable */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-inter">
                            {/* Name */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g. Electronics, Home & Garden"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                                />
                            </div>

                            {/* Parent Category */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-1">Parent Category</label>
                                <div className="relative">
                                    <select
                                        value={formData.parent_id || ''}
                                        onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-semibold text-primary focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none appearance-none"
                                    >
                                        <option value="">Root Category</option>
                                        {categories
                                            .filter(c => c._id !== category?._id)
                                            .map(c => (
                                                <option key={c._id} value={c._id}>{c.name}</option>
                                            ))
                                        }
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronRight size={16} className="rotate-90" />
                                    </div>
                                </div>
                            </div>

                            {/* Sort Order */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sort Weight (Order)</label>
                                <input
                                    type="number"
                                    value={formData.sort_order}
                                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe this category's scope..."
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-semibold text-primary focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all min-h-[100px] outline-none"
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category Image</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon size={24} className="text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            id="cat-image"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                        <label
                                            htmlFor="cat-image"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
                                        >
                                            <Plus size={14} /> {imagePreview ? 'Change' : 'Upload'} Image
                                        </label>
                                        <p className="text-[9px] text-gray-400 mt-2 font-medium italic">Recommended: 512x512px SVG or Transparent PNG</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Toggle */}
                            <div className="md:col-span-2 flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <input
                                    type="checkbox"
                                    id="is-active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 rounded-lg text-accent border-gray-200 focus:ring-accent transition-all"
                                />
                                <label htmlFor="is-active" className="text-xs font-bold text-primary uppercase tracking-widest cursor-pointer">
                                    Active (Visible in Storefront)
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Actions - Fixed at bottom */}
                    <div className="p-8 bg-gray-50/30 border-t border-gray-50 flex gap-4 flex-shrink-0 font-inter">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-4 border border-gray-100 text-gray-500 text-[10px] font-semibold uppercase tracking-widest rounded-2xl hover:bg-white transition-all shadow-sm hover:shadow-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-3 px-12 py-4 bg-primary text-white text-[10px] font-semibold uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw size={14} className="animate-spin" /> : category ? 'Update Category' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal;
