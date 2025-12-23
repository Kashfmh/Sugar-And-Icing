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
      className="rounded-lg shadow-md overflow-hidden bg-white"
      style={{
        borderTop: `6px solid var(--color-sai-pink)`,
      }}
    >
      <div className="h-48 flex items-center justify-center" style={{ backgroundColor: 'var(--color-sai-cream)' }}>
        {image_url ? (
          <Image src={image_url} alt={name} width={640} height={400} className="object-cover w-full h-full" />
        ) : (
          <div className="text-sm text-gray-400">Product Image</div>
        )}
      </div>

      <div className="p-6" style={{ backgroundColor: 'var(--color-sai-blush)' }}>
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

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xl font-extrabold" style={{ color: 'var(--color-sai-charcoal)' }}>
            RM {price.toFixed(2)}
          </div>
          <button
            className="btn-sai"
            style={{
              backgroundColor: 'var(--color-sai-pink)',
              boxShadow: '0 6px 18px rgba(244,143,177,0.18)',
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}