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

export default function ProductCard({ name, price, description, category, image_url, tags }: Props) {
  return (
    <article
      className="rounded-lg overflow-hidden bg-white flex flex-col shadow-sm hover:shadow-md transition-shadow h-full"
      style={{ borderTop: `4px solid var(--color-sai-pink)` }}
    >
      {/* Image Placeholder - HEADER */}
      <div className="h-48 flex items-center justify-center bg-sai-white flex-shrink-0">
        {image_url ? (
          <Image src={image_url} alt={name} width={640} height={400} className="object-cover w-full h-full" />
        ) : (
          <div className="text-sm text-gray-400">Product Image</div>
        )}
      </div>

      {/* Content Section - BODY (grows to fill space) */}
      <div className="p-6 flex flex-col flex-grow" style={{ backgroundColor: 'var(--color-sai-pink-light)' }}>
        {/* Category */}
        {category && (
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-sai-pink)' }}>
            {category}
          </div>
        )}

        {/* Product Name */}
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-sai-pink-dark)', fontFamily: 'var(--font-serif)' }}>
          {name}
        </h3>

        {/* Description - fixed 2 lines */}
        <p
          className="text-sm mb-4 line-clamp-2"
          style={{
            color: 'var(--color-sai-text-gray)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '3em',
            maxHeight: '3em'
          }}
          title={description}
        >
          {description}
        </p>

        {/* Allergen Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map((tag) => (
              <AllergenBadge key={tag} tag={tag} />
            ))}
          </div>
        )}

        {/* Spacer to push footer to bottom */}
        <div className="flex-grow" />

        {/* FOOTER - Price and Button (always at bottom) */}
        <div className="flex items-center justify-between mt-auto">
          <div
            className="text-2xl font-bold"
            style={{
              color: 'var(--color-sai-charcoal)',
              fontFamily: 'var(--font-serif)'
            }}
          >
            RM {price.toFixed(2)}
          </div>

          <button
            className="px-6 py-2 rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#F48FB1' }}
            aria-label={`Add ${name} to cart`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}