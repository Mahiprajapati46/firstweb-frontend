import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Search, X, Check, ChevronDown } from 'lucide-react';

const SearchableSelect = ({
    options = [],
    selectedValues = [],
    onSelect,
    onRemove,
    placeholder = "Search categories...",
    label = "Categories",
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dropdownStyle, setDropdownStyle] = useState({});
    const containerRef = useRef(null);
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Compute dropdown position from trigger's bounding rect
    const updateDropdownPosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setDropdownStyle({
            position: 'fixed',
            top: rect.bottom + 8, // 8px margin below the trigger
            left: rect.left,
            width: rect.width,
            zIndex: 99999, // Ensure it's above other content
        });
    };

    const handleOpen = () => {
        if (disabled) return;
        updateDropdownPosition();
        setIsOpen(prev => !prev);
    };

    // Close dropdown when clicking outside (check both trigger and portaled dropdown)
    useEffect(() => {
        const handleClickOutside = (event) => {
            const inTrigger = containerRef.current && containerRef.current.contains(event.target);
            const inDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);
            if (!inTrigger && !inDropdown) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Recalculate position on scroll/resize when dropdown is open
    useEffect(() => {
        if (!isOpen) return;
        const recalc = () => updateDropdownPosition();
        window.addEventListener('scroll', recalc, true); // Use capture phase for scroll
        window.addEventListener('resize', recalc);
        return () => {
            window.removeEventListener('scroll', recalc, true);
            window.removeEventListener('resize', recalc);
        };
    }, [isOpen]); // Re-run when isOpen changes

    return (
        <div className="space-y-3" ref={containerRef}>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">
                {label}
            </label>

            <div className={`relative ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
                {/* Trigger / Search Input */}
                <div
                    ref={triggerRef}
                    onClick={handleOpen}
                    className={`flex flex-wrap items-center gap-2 w-full px-6 py-4 bg-gray-50/50 border rounded-2xl transition-all min-h-[60px] cursor-text ${isOpen ? 'border-primary ring-4 ring-primary/5' : 'border-gray-100 hover:border-primary/20'
                        }`}
                >
                    {/* Selected Tags */}
                    {selectedValues.map(valId => {
                        const option = options.find(o => o._id === valId);
                        if (!option) return null;
                        return (
                            <span
                                key={valId}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest animate-in zoom-in-95 duration-200"
                            >
                                {option.name}
                                {!disabled && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemove(valId);
                                        }}
                                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                    >
                                        <X size={10} />
                                    </button>
                                )}
                            </span>
                        );
                    })}

                    <input
                        type="text"
                        placeholder={selectedValues.length === 0 ? placeholder : ""}
                        className="flex-1 bg-transparent border-none outline-none text-sm font-black text-primary placeholder:text-gray-300 min-w-[120px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => {
                            if (!disabled) {
                                updateDropdownPosition(); // Update position when input is focused
                                setIsOpen(true);
                            }
                        }}
                        disabled={disabled}
                    />

                    <ChevronDown
                        size={18}
                        className={`text-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>

                {/* Dropdown — portaled to body to escape all overflow clipping */}
                {isOpen && !disabled && ReactDOM.createPortal(
                    <div
                        ref={dropdownRef}
                        style={dropdownStyle}
                        className="bg-white border border-gray-100 rounded-[2rem] shadow-2xl shadow-primary/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                        <div className="max-h-[280px] overflow-y-auto p-2 boutique-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => {
                                    const isSelected = selectedValues.includes(option._id);
                                    return (
                                        <button
                                            key={option._id}
                                            type="button"
                                            onClick={() => {
                                                isSelected ? onRemove(option._id) : onSelect(option._id);
                                                setSearchTerm(''); // Clear search on select
                                            }}
                                            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-left transition-all group ${isSelected
                                                ? 'bg-primary/5 text-primary font-black'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-primary font-bold'
                                                }`}
                                        >
                                            <span className="text-sm">{option.name}</span>
                                            {isSelected && <Check size={16} className="text-primary" />}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="px-6 py-8 text-center text-gray-400">
                                    <Search size={24} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No categories found</p>
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </div>
    );
};

export default SearchableSelect;
