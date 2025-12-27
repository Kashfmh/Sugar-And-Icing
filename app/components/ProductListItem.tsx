import React from 'react';
import Image from 'next/image';
import AllergenBadge from './AllergenBadge';

interface Props {
    name: string;
    price: number;
    description?: string;
    category?: string;
    image_url?: string;
    tags?: string[];
}

export default function ProductListItem({ name, price, description, category, image_url, tags }: Props) {
    return (
        <article className="flex gap-4 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: 'var(--color-sai-pink)' }}>
            {/* Compact Image - Full Height */}
            <div className="w-24 flex-shrink-0 bg-sai-white flex items-center justify-center">
                {image_url ? (
                    <Image src={image_url} alt={name} width={96} height={200} className="object-cover w-full h-full" />
                ) : (
                    <div className="text-xs text-gray-400">Image</div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 py-3 pr-3">
                {category && (
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-sai-pink)' }}>
                        {category}
                    </div>
                )}

                <h3 className="text-base font-bold mb-1" style={{ color: 'var(--color-sai-pink-dark)', fontFamily: 'var(--font-serif)' }}>
                    {name}
                </h3>

                <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                    {description}
                </p>

                {/* Compact Allergen Tags */}
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {tags.slice(0, 3).map((tag) => (
                            <AllergenBadge key={tag} tag={tag} />
                        ))}
                        {tags.length > 3 && (
                            <span className="text-xs text-gray-500">+{tags.length - 3}</span>
                        )}
                    </div>
                )}

                {/* Price and Button - Compact */}
                <div className="flex items-center justify-between">
                    <div
                        className="text-lg font-bold"
                        style={{
                            color: 'var(--color-sai-charcoal)',
                            fontFamily: 'var(--font-serif)'
                        }}
                    >
                        RM {price.toFixed(2)}
                    </div>

                    <button
                        className="px-4 py-1.5 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: 'var(--color-sai-pink)' }}
                        aria-label={`Add ${name} to cart`}
                    >
                        Add
                    </button>
                </div>
            </div>
        </article>
    );
}
