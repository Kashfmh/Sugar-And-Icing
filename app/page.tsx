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
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(253, 251, 247, 0.4) 0%, rgba(253, 251, 247, 0.6) 80%, rgba(253, 251, 247, 1) 100%), url('/images/hero/baking.png')`
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-4 max-w-lg mt-12">
          {/* Decorative Bakery Icon */}
          <div className="text-sai-gold mb-2 opacity-80">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C11.5 2 11 2.19 10.59 2.59L2.59 10.59C1.8 11.37 1.8 12.63 2.59 13.41L10.59 21.41C11.37 22.2 12.63 22.2 13.41 21.41L21.41 13.41C22.2 12.63 22.2 11.37 21.41 10.59L13.41 2.59C13 2.19 12.5 2 12 2M12 4L20 12L12 20L4 12L12 4M7 10.5C6.17 10.5 5.5 11.17 5.5 12S6.17 13.5 7 13.5 8.5 12.83 8.5 12 7.83 10.5 7 10.5M12 10.5C11.17 10.5 10.5 11.17 10.5 12S11.17 13.5 12 13.5 13.5 12.83 13.5 12 12.83 10.5 12 10.5M17 10.5C16.17 10.5 15.5 11.17 15.5 12S16.17 13.5 17 13.5 18.5 12.83 18.5 12 17.83 10.5 17 10.5Z" />
            </svg>
          </div>

          {/* Brand Name in Pink */}
          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight tracking-tight drop-shadow-sm" style={{ color: 'var(--color-sai-rose)' }}>
            Sugar And Icing
          </h1>

          {/* Handwritten Tagline */}
          <p className="font-[family-name:var(--font-dancing)] text-3xl md:text-4xl transform -rotate-2 origin-center mt-2 mb-6" style={{ color: '#8c737a' }}>
            Freshly Baked in Brickfields
          </p>

          {/* CTA Button */}
          <a
            href="#menu"
            className="bg-sai-pink hover:bg-sai-rose text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all transform hover:-translate-y-1 flex items-center gap-2 text-lg"
          >
            Shop Now
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>

        {/* Wavy Divider Bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-[calc(100%+1.3px)] h-[50px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#FDFBF7"></path>
          </svg>
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