import React, { useState, useEffect } from 'react';
import {
    Package,
    AlertTriangle,
    ArrowUpDown,
    Save,
    RefreshCcw,
    Search,
    Loader2
} from 'lucide-react';
import merchantApi from '../../api/merchant';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const Inventory = () => {
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [newStockValue, setNewStockValue] = useState('');
    const [newReservedValue, setNewReservedValue] = useState('');

    useEffect(() => {
        fetchStock(page);
    }, [page]);

    const fetchStock = async (targetPage = page) => {
        try {
            setLoading(true);
            const response = await merchantApi.getStock({
                page: targetPage,
                limit: 10
            });

            const rawStock = response.data || [];

            // Map the populated backend structure to the flat list the UI expects
            const formattedStock = rawStock.map(item => ({
                ...item,
                variant_id: item.variant_id?._id || item.variant_id, // Ensure ID is extracted if populated
                product_title: item.variant_id?.product_id?.title || 'Unknown Product',
                variant_image: item.variant_id?.images?.[0] || '',
                sku: item.variant_id?.sku || 'NO-SKU',
                attributes: item.variant_id?.attributes || {},
                // Stock values are directly on the inventory record now
                stock: item.stock || 0,
                reserved_stock: item.reserved_stock || 0,
                available_stock: item.available_stock || 0
            }));

            setStock(formattedStock);
            setTotalPages(response.pagination?.pages || 1);

        } catch (error) {
            console.error('Stock fetch error:', error);
            toast.error('Failed to load stock data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStock = async (variantId) => {
        try {
            const quantity = parseInt(newStockValue);
            const reserved = parseInt(newReservedValue);

            if (isNaN(quantity) || quantity < 0) {
                toast.error('Please enter a valid total stock');
                return;
            }
            if (isNaN(reserved) || reserved < 0) {
                toast.error('Please enter a valid reserved stock');
                return;
            }
            if (reserved > quantity) {
                toast.error('Reserved stock cannot exceed total stock');
                return;
            }

            // Use the dedicated Stock Update API
            await merchantApi.updateVariantStock(variantId, {
                stock: quantity,
                reserved_stock: reserved,
                reason: 'Merchant manual update via Inventory Page'
            });

            toast.success('Stock updated successfully');
            setEditingId(null);
            fetchStock(); // Refresh data
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Update failed');
        }
    };

    const filteredStock = stock.filter(item =>
        (item.product_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Stock Management</h1>
                    <p className="text-slate-500 mt-1 font-medium">Monitor and update inventory levels for all variants.</p>
                </div>
                <Button
                    onClick={fetchStock}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </Button>
            </div>

            {/* Search */}
            <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search by SKU or Product Name..."
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Stock Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-1/3">Product & Variant</th>
                                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
                                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Available</th>
                                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Reserved</th>
                                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Total Stock</th>
                                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && stock.length === 0 ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-8 py-8"><div className="h-4 bg-slate-100 rounded w-1/3"></div></td>
                                    </tr>
                                ))
                            ) : filteredStock.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <p className="text-slate-400 font-bold italic">No variants found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredStock.map((item) => {
                                    const isEditing = editingId === (item.variant_id);

                                    return (
                                        <tr key={item.variant_id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 shadow-sm">
                                                        {item.variant_image ? (
                                                            <img src={item.variant_image} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                <Package size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="text-sm font-black text-slate-900 truncate">{item.product_title || 'Unknown Product'}</h3>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {Object.entries(item.attributes || {}).map(([key, value]) => (
                                                                <span key={key} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase border border-slate-200">
                                                                    {key}: {value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded">
                                                    #{item.sku || 'NO-SKU'}
                                                </span>
                                            </td>

                                            {/* Available Stock (Calculated) */}
                                            <td className="px-6 py-5 text-center">
                                                <span className={`text-sm font-bold ${isEditing
                                                    ? ((parseInt(newStockValue || 0) - parseInt(newReservedValue || 0)) <= 5 ? 'text-amber-600' : 'text-emerald-600')
                                                    : (item.available_stock <= 5 ? 'text-amber-600' : 'text-emerald-600')
                                                    }`}>
                                                    {isEditing ? (parseInt(newStockValue || 0) - parseInt(newReservedValue || 0)) : item.available_stock}
                                                </span>
                                            </td>

                                            {/* Reserved Stock (Editable) */}
                                            <td className="px-6 py-5 text-center">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        className="w-20 px-3 py-1.5 border-2 border-slate-200 rounded-lg text-sm font-bold focus:ring-4 focus:ring-slate-100 focus:border-slate-400 text-center"
                                                        value={newReservedValue}
                                                        onChange={(e) => setNewReservedValue(e.target.value)}
                                                        placeholder="0"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-bold text-slate-400">
                                                        {item.reserved_stock}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Total Stock (Editable) */}
                                            <td className="px-6 py-5 text-center">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        className="w-20 px-3 py-1.5 border-2 border-primary/20 rounded-lg text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary text-center"
                                                        value={newStockValue}
                                                        onChange={(e) => setNewStockValue(e.target.value)}
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleUpdateStock(item.variant_id);
                                                            if (e.key === 'Escape') setEditingId(null);
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className={`text-sm font-black ${item.stock <= 5 ? 'text-rose-600' : 'text-slate-900'}`}>
                                                            {item.stock}
                                                        </span>
                                                        {item.stock <= 5 && (
                                                            <AlertTriangle size={14} className="text-amber-500" />
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-6 py-5 text-right">
                                                {isEditing ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleUpdateStock(item.variant_id)}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                            title="Save"
                                                        >
                                                            <Save size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"
                                                            title="Cancel"
                                                        >
                                                            <ArrowUpDown size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(item.variant_id);
                                                            setNewStockValue((item.stock).toString());
                                                            setNewReservedValue((item.reserved_stock).toString());
                                                        }}
                                                        className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                        title="Update Stock"
                                                    >
                                                        <RefreshCcw size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="rounded-xl"
                    >
                        Previous
                    </Button>
                    <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setPage(i + 1)}
                                className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${page === i + 1
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="rounded-xl"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Inventory;
