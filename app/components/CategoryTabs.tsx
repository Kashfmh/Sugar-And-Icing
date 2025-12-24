'use client';

import { useState } from 'react';

interface CategoryTabsProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export default function CategoryTabs({
    categories,
    activeCategory,
    onCategoryChange,
}: CategoryTabsProps) {
    return (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => onCategoryChange(category)}
                    className={`px-6 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all ${activeCategory === category
                            ? 'bg-sai-pink text-white shadow-md'
                            : 'bg-white text-sai-charcoal border border-sai-pink/30'
                        }`}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}
