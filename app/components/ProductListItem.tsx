import React from 'react';
import BaseCard from './BaseCard';

interface Props {
    productId: string;
    name: string;
    price: number;
    description?: string;
    category?: string;
    image_url?: string;
    tags?: string[];
    onClick?: () => void;
}

export default function ProductListItem({ productId, name, price, description, category, image_url, tags, onClick }: Props) {
    const footerContent = (
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
                onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                }}
                className="px-4 py-1.5 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--color-sai-pink)' }}
                aria-label={`View ${name} details`}
            >
                View
            </button>
        </div>
    );

    return (
        <BaseCard
            name={name}
            description={description}
            category={category}
            image_url={image_url}
            tags={tags}
            onClick={onClick}
            footerContent={footerContent}
            displayMode="list"
        />
    );
}
