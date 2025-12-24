import { supabase } from '@/lib/supabase';
import ProductCard from './components/ProductCard';
import Navbar from './components/Navbar';
import Badge from './components/Badge';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category_name: string;
  image_url: string;
}

export default async function Home() {
  const { data: products, error } = await supabase.from('products').select('*');

  // Get first 3 products for featured section
  const featuredProducts = products?.slice(0, 3) || [];

  return (
    <main className="min-h-screen bg-sai-cream">
      {/* Desktop Navbar - hidden on mobile */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-8 md:pt-32 pb-12 px-6 flex flex-col items-center text-center">
        {/* Brand Name in Pink */}
        <h1 className="font-serif text-5xl md:text-7xl mb-4 leading-tight" style={{ color: 'var(--color-sai-rose)' }}>
          Sugar And Icing
        </h1>

        {/* Handwritten Tagline */}
        <p className="font-[family-name:var(--font-dancing)] text-xl md:text-2xl mb-8" style={{ color: 'var(--color-sai-pink)' }}>
          Freshly Baked in Brickfields
        </p>

        {/* CTA Button */}
        <a
          href="#menu"
          className="bg-sai-pink text-white px-8 py-3 rounded-full font-medium shadow-lg hover:bg-sai-rose transition-all hover:-translate-y-1 flex items-center gap-2"
        >
          Shop Now
          <ArrowRight className="w-5 h-5" />
        </a>

        {/* Hero Image */}
        <div className="mt-12 w-full max-w-2xl aspect-video relative rounded-2xl overflow-hidden shadow-xl">
          <Image
            src="/hero-cake.jpg"
            alt="Delicious cakes from Sugar And Icing"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* OUR SWEET SELECTION - Category Icons */}
      <section className="px-6 py-12 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-3xl" style={{ color: 'var(--color-sai-rose)' }}>
              Our Sweet Selection
            </h2>
            <a href="/menu" className="text-sai-pink font-medium text-sm hover:text-sai-rose transition-colors">
              VIEW ALL
            </a>
          </div>

          {/* Category Carousel */}
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {['Brownies', 'Cupcakes', 'Macarons'].map((category) => (
              <a
                key={category}
                href={`/menu?category=${category.toLowerCase()}`}
                className="flex flex-col items-center gap-2 min-w-[80px]"
              >
                <div className="w-20 h-20 rounded-full bg-sai-pink/20 flex items-center justify-center hover:bg-sai-pink/30 transition-colors">
                  <span className="text-2xl">🧁</span>
                </div>
                <span className="text-sm font-medium text-sai-charcoal">{category}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FRESH FROM THE OVEN - Featured Products */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl mb-8" style={{ color: 'var(--color-sai-rose)' }}>
            Fresh from the Oven
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product: Product) => (
              <div key={product.id} className="relative">
                {/* Badge on first product */}
                {product.id === featuredProducts[0]?.id && (
                  <div className="absolute top-4 left-4 z-10">
                    <Badge>BEST SELLER</Badge>
                  </div>
                )}
                <ProductCard
                  name={product.name}
                  price={product.price}
                  description={product.description}
                  category={product.category_name}
                  image_url={product.image_url}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CELEBRATION CAKES CARD */}
      <section className="px-6 py-12 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <div
            className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(173, 20, 87, 0.9) 0%, rgba(244, 143, 177, 0.8) 100%)'
            }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
              <h3 className="font-serif text-4xl mb-2">Celebration Cakes</h3>
              <p className="font-[family-name:var(--font-dancing)] text-xl mb-6">
                Make every moment memorable
              </p>
              <a
                href="/menu?category=cakes"
                className="bg-white text-sai-rose px-6 py-2 rounded-full font-medium hover:bg-sai-cream transition-colors"
              >
                Order Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* HANDWRITTEN TAGLINE */}
      <section className="px-6 py-16 text-center">
        <p className="font-[family-name:var(--font-dancing)] text-3xl" style={{ color: 'var(--color-sai-gold)' }}>
          Life is what you bake it ✨
        </p>
      </section>
    </main>
  );
}