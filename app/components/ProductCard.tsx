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
      className="rounded-lg shadow-md overflow-hidden bg-white flex flex-col"
      style={{ borderTop: `6px solid var(--color-sai-pink)` }}
    >
      {/* Image / media */}
      <div className="h-48 flex items-center justify-center" style={{ backgroundColor: 'var(--color-sai-cream)' }}>
        {image_url ? (
          <Image src={image_url} alt={name} width={640} height={400} className="object-cover w-full h-full" />
        ) : (
          <div className="text-sm text-gray-400">Product Image</div>
        )}
      </div>

      {/* Main content (white) */}
      <div className="p-6 bg-white flex-grow">
        {category && (
          <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-sai-pink)' }}>
            {category}
          </div>
        )}

        <h3 className="text-lg font-bold mt-2" style={{ color: 'var(--color-sai-rose)' }}>
          {name}
        </h3>

        <p className="text-sm mt-2" style={{ color: 'var(--color-sai-charcoal)' }}>
          {description}
        </p>
      </div>

      {/* Footer stripe (blush) with price + button */}
      <div className="px-6 py-4 relative" style={{ backgroundColor: 'var(--color-sai-blush)', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between">
          <div className="text-xl font-extrabold" style={{ color: 'var(--color-sai-charcoal)' }}>
            RM {price.toFixed(2)}
          </div>

          {/* Round Pink Add Button */}
          <button
            className="w-12 h-12 rounded-full bg-sai-pink hover:bg-sai-rose transition-all shadow-md flex items-center justify-center text-white text-2xl font-light hover:scale-110"
            aria-label={`Add ${name} to cart`}
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}