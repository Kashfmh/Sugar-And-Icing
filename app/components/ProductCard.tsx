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

export default function ProductCard({ productId, name, price, description, category, image_url, tags, onClick }: Props) {
  const footerContent = (
    <div className="flex items-center justify-between">
      <div
        className="text-2xl font-bold"
        style={{
          color: 'var(--color-sai-charcoal)',
          fontFamily: 'var(--font-serif)'
        }}
      >
        RM {(price || 0).toFixed(2)}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className="px-6 py-2 rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
        style={{ backgroundColor: '#F48FB1' }}
        aria-label={`Add ${name} to cart`}
      >
        View Details
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
      displayMode="grid"
    />
  );
}
