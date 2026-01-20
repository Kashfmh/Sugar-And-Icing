'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    sortBy: 'newest' | 'price-low' | 'price-high' | 'name';
    onSortChange: (sort: 'newest' | 'price-low' | 'price-high' | 'name') => void;
}

export default function FilterModal({ isOpen, onClose, sortBy, onSortChange }: FilterModalProps) {
    const [tempSort, setTempSort] = useState(sortBy);

    const handleApply = () => {
        onSortChange(tempSort);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-[1100] md:hidden"
                onClick={onClose}
            />

            {/* Bottom Sheet */}
            <div className="fixed bottom-0 left-0 right-0 bg-sai-white rounded-t-3xl z-[1100] md:hidden animate-slide-up">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-sai-charcoal">Sort & Filter</h3>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Sort Options */}
                    <div className="space-y-3 mb-6">
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Sort By</p>

                        {[
                            { value: 'newest', label: 'Newest First' },
                            { value: 'price-low', label: 'Price: Low to High' },
                            { value: 'price-high', label: 'Price: High to Low' },
                            { value: 'name', label: 'Name: A-Z' },
                        ].map((option) => (
                            <label
                                key={option.value}
                                className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-sai-pink/10 hover:border-sai-pink/50 transition-all"
                            >
                                <input
                                    type="radio"
                                    name="sort"
                                    value={option.value}
                                    checked={tempSort === option.value}
                                    onChange={() => setTempSort(option.value as any)}
                                    className="w-5 h-5 text-sai-pink focus:ring-sai-pink"
                                />
                                <span className="text-sai-charcoal">{option.label}</span>
                            </label>
                        ))}
                    </div>

                    {/* Apply Button */}
                    <button
                        onClick={handleApply}
                        className="w-full py-4 bg-sai-pink text-white rounded-xl font-semibold hover:bg-sai-pink/90 transition-colors"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </>
    );
}
