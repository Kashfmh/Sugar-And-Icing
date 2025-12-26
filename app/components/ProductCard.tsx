import React from 'react';
import Image from 'next/image';

interface Props {
  name: string;
  price: number;
  description?: string;
  category?: string;
  image_url?: string;
}

export default function ProductCard({ name, price, description, category, image_url }: Props) {
  return (
    <article
      className="rounded-lg overflow-hidden bg-white flex flex-col shadow-sm hover:shadow-md transition-shadow"
      style={{ borderTop: `4px solid #F48FB1` }}
    >
      {/* Image Placeholder */}
      <div className="h-48 flex items-center justify-center bg-sai-white">
        {image_url ? (
          <Image src={image_url} alt={name} width={640} height={400} className="object-cover w-full h-full" />
        ) : (
          <div className="text-sm text-gray-400">Product Image</div>
        )}
      </div>

      {/* Content Section with Pink Background */}
      <div className="p-6 flex-grow" style={{ backgroundColor: '#fce4ec' }}>
        {category && (
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F48FB1' }}>
            {category}
          </div>
        )}

        <h3 className="text-xl font-bold mb-2" style={{ color: '#C2185B', fontFamily: 'var(--font-serif)' }}>
          {name}
        </h3>

        {/* Description with 2-line limit and fixed height */}
        <p
          className="text-sm mb-4 line-clamp-2"
          style={{
            color: '#4A4A4A',
            minHeight: '2.5em' // Always reserve space for 2 lines
          }}
          title={description}
        >
          {description}
        </p>

        {/* Price and Button */}
        <div className="flex items-center justify-between mt-4">
          <div
            className="text-2xl font-bold"
            style={{
              color: '#1A237E',
              fontFamily: "'Playfair Display', Georgia, serif"
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