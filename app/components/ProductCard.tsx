import React from 'react';

interface ProductProps {
  name: string;
  price: number;
  description: string;
  category: string;
}

const ProductCard = ({ name, price, description, category }: ProductProps) => {
  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        {/* Placeholder for now until we connect Supabase Storage */}
        <span className="text-gray-400 font-serif">Product Image</span>
      </div>
      <div className="px-6 py-4">
        <span className="text-xs font-semibold text-pink-500 uppercase tracking-wide">{category}</span>
        <div className="font-bold text-xl mb-2 text-gray-800">{name}</div>
        <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
      </div>
      <div className="px-6 pt-2 pb-6 flex justify-between items-center">
        <span className="text-2xl font-bold text-gray-900">RM {price.toFixed(2)}</span>
        <button className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;