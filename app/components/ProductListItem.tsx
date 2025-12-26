import React from 'react';
import Image from 'next/image';

interface Props {
    name: string;
    price: number;
    description?: string;
    category?: string;
    image_url?: string;
}

export default function ProductListItem({ name, price, description, category, image_url }: Props) {
    return (
        <article className="flex gap-4 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: '#F48FB1' }}>
            {/* Compact Image */}
            <div className="w-24 h-24 flex-shrink-0 bg-sai-white flex items-center justify-center">
                {image_url ? (
                    <Image src={image_url} alt={name} width={96} height={96} className="object-cover w-full h-full" />
                ) : (
                    <div className="text-xs text-gray-400">Image</div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 py-3 pr-3">
                {category && (
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#F48FB1' }}>
                        {category}
                    </div>
                )}

                <h3 className="text-base font-bold mb-1" style={{ color: '#C2185B', fontFamily: 'var(--font-serif)' }}>
                    {name}
                </h3>

                <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                    {description}
                </p>

                {/* Price and Button - Compact */}
                <div className="flex items-center justify-between">
                    <div
                        className="text-lg font-bold"
                        style={{
                            color: '#1A237E',
                            fontFamily: "'Playfair Display', Georgia, serif"
                        }}
                    >
                        RM {price.toFixed(2)}
                    </div>

                    <button
                        className="px-4 py-1.5 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#F48FB1' }}
                        aria-label={`Add ${name} to cart`}
                    >
                        Add
                    </button>
                </div>
            </div>
        </article>
    );
}
