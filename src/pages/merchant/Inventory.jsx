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
            const formattedStock = rawStock.map(item => ({
                ...item,
                variant_id: item.variant_id?._id || item.variant_id,
                product_title: item.variant_id?.product_id?.title || 'Unknown Asset',
                variant_image: item.variant_id?.images?.[0] || '',
                sku: item.variant_id?.sku || 'NO-SKU',
                attributes: item.variant_id?.attributes || {},
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
                toast.error('Invalid total stock');
                return;
            }
            if (isNaN(reserved) || reserved < 0) {
                toast.error('Invalid reserved stock');
                return;
            }
            if (reserved > quantity) {
                toast.error('Reserved exceeds total');
                return;
            }

            await merchantApi.updateVariantStock(variantId, {
                stock: quantity,
                reserved_stock: reserved,
                reason: 'Merchant manual update via Inventory Page'
            });

            toast.success('Inventory synchronized');
            setEditingId(null);
            fetchStock();
        } catch (error) {
            toast.error(error.message || 'Synchronization failed');
        }
    };

    const filteredStock = stock.filter(item =>
        (item.product_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary tracking-tight">Supply Chain Inventory</h1>
                    <p className="text-gray-500 mt-1">Manage and synchronize your physical/digital assets across the network.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Identify by SKU or Title..."
                            className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all shadow-sm w-72"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Stock Table */}
            <div className="card-premium overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Definition</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reference</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Available</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Reserved</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Total Supply</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium">
                            {loading && stock.length === 0 ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-8 py-8"><div className="h-4 bg-gray-50 rounded w-1/4"></div></td>
                                    </tr>
                                ))
                            ) : filteredStock.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Package size={48} className="text-primary" />
                                            <p className="text-sm font-bold text-primary uppercase tracking-widest">No assets identified</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredStock.map((item) => {
                                    const isEditing = editingId === (item.variant_id);

                                    return (
                                        <tr key={item.variant_id} className="hover:bg-gray-50/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-all flex items-center justify-center">
                                                        {item.variant_image ? (
                                                            <img src={item.variant_image} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package size={20} className="text-gray-300" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="text-sm font-black text-primary truncate leading-tight">{item.product_title}</h3>
                                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                            {Object.entries(item.attributes || {}).map(([key, value]) => (
                                                                <span key={key} className="text-[9px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded leading-none uppercase tracking-tighter">
                                                                    {key} · {value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="text-[10px] font-mono font-black text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                                    #{item.sku}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <span className={`text-sm font-black ${isEditing
                                                    ? ((parseInt(newStockValue || 0) - parseInt(newReservedValue || 0)) <= 5 ? 'text-amber-500' : 'text-green-500')
                                                    : (item.available_stock <= 5 ? 'text-amber-500' : 'text-green-500')
                                                    }`}>
                                                    {isEditing ? (parseInt(newStockValue || 0) - parseInt(newReservedValue || 0)) : item.available_stock}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        className="w-16 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-black text-center focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                                                        value={newReservedValue}
                                                        onChange={(e) => setNewReservedValue(e.target.value)}
                                                    />
                                                ) : (
                                                    <span className="text-sm font-black text-gray-400">
                                                        {item.reserved_stock}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        className="w-16 px-2 py-1 bg-white border border-accent rounded-lg text-xs font-black text-center focus:ring-2 focus:ring-accent outline-none"
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
                                                        <span className={`text-sm font-black ${item.stock <= 5 ? 'text-rose-500' : 'text-primary'}`}>
                                                            {item.stock}
                                                        </span>
                                                        {item.stock <= 5 && (
                                                            <AlertTriangle size={14} className="text-amber-500" />
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {isEditing ? (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => handleUpdateStock(item.variant_id)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                                        >
                                                            <Save size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all"
                                                        >
                                                            <RefreshCcw size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(item.variant_id);
                                                            setNewStockValue((item.stock).toString());
                                                            setNewReservedValue((item.reserved_stock).toString());
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-accent hover:bg-accent/5 rounded-xl transition-all"
                                                        title="Synchronize"
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
                <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="p-2.5 rounded-xl border border-gray-100 bg-white text-primary disabled:opacity-30 hover:bg-gray-50 transition-all font-black text-xs uppercase tracking-widest"
                    >
                        Prev
                    </button>
                    <div className="flex gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setPage(i + 1)}
                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${page === i + 1
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'bg-white text-gray-400 border border-gray-100 hover:border-accent hover:text-accent'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="p-2.5 rounded-xl border border-gray-100 bg-white text-primary disabled:opacity-30 hover:bg-gray-50 transition-all font-black text-xs uppercase tracking-widest"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Inventory;
