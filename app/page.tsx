import { supabase } from '@/lib/supabase';
import ProductCard from './components/ProductCard';
import Navbar from './components/Navbar';

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

  return (
    <main className="min-h-screen bg-sai-cream">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 flex flex-col items-center text-center">
        {/* Decorative Tagline */}
        <span className="ribbon text-sm md:text-base mb-2">
          Freshly Baked in Brickfields
        </span>

        {/* Main Title */}
        <h1 className="font-serif text-5xl md:text-7xl text-sai-rose mb-6 leading-tight">
          Sugar And Icing
        </h1>

        <p className="text-sai-charcoal max-w-lg mx-auto text-lg mb-8 leading-relaxed">
          Premium homemade brownies, fruit cakes, and treats made with <span className="font-bold text-sai-rose">100% pure butter</span> and love.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4">
          <a href="#menu" className="bg-sai-rose text-white px-8 py-3 rounded-full font-medium shadow-lg hover:bg-sai-pink transition-all hover:-translate-y-1">
            Order Now
          </a>
          <a href="#about" className="bg-white text-sai-rose border-2 border-sai-rose px-8 py-3 rounded-full font-medium hover:bg-sai-blush transition-all">
            Our Story
          </a>
        </div>
      </section>

      {/* WAVY DIVIDER (SVG) */}
      <div className="w-full overflow-hidden leading-[0]">
        <svg className="relative block w-[calc(100%+1.3px)] h-[50px] rotate-180" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#F6D7E0"></path>
        </svg>
      </div>

      {/* MENU SECTION */}
      <section id="menu" className="bg-sai-blush py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl text-sai-rose text-center mb-12">Current Menu</h2>
          {error ? (
            <p className="text-center text-red-400">Unable to load menu.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          )}
        </div>
      </section>
    </main>
  );
}