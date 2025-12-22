import { supabase } from '@/lib/supabase';
import ProductCard from './components/ProductCard';

// This interface helps TypeScript understand what your database data looks like
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category_name: string;
  image_url: string;
}

export default async function Home() {
  // 1. Fetch data from Supabase
  // We specify <Product> so TypeScript knows what fields to expect
  const { data: products, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error('Error fetching products:', error);
    return <div className="p-24 text-red-500">Failed to load bakery items.</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-12 bg-gray-50">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif text-center">
        Sugar And Icing
      </h1>
      <p className="text-lg text-gray-600 mb-12">Handmade with love in KL Sentral</p>
      
      {/* 2. Grid for the products */}
      {/* Responsive grid: 1 column on mobile, 2 on tablet, 3 on laptop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {products?.map((product: Product) => (
          <ProductCard 
            key={product.id}
            name={product.name} 
            price={product.price} 
            description={product.description}
            category={product.category_name}
          />
        ))}
      </div>
    </main>
  );
}