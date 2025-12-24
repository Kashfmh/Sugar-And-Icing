import Navbar from './components/Navbar';
import { ArrowRight } from 'lucide-react';

export default async function Home() {
  return (
    <main className="h-screen bg-sai-cream overflow-hidden">
      {/* Desktop Navbar - hidden on mobile */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* FULL-SCREEN LANDING PAGE */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6">
        {/* Background Image with Gradient Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(253, 251, 247, 0.3) 0%, rgba(253, 251, 247, 0.5) 60%, rgba(253, 251, 247, 0.8) 100%), url('/images/hero/baking.png')`
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-4 max-w-lg">
          {/* Decorative Bakery Icon */}
          <div className="text-sai-gold mb-2 opacity-80">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C11.5 2 11 2.19 10.59 2.59L2.59 10.59C1.8 11.37 1.8 12.63 2.59 13.41L10.59 21.41C11.37 22.2 12.63 22.2 13.41 21.41L21.41 13.41C22.2 12.63 22.2 11.37 21.41 10.59L13.41 2.59C13 2.19 12.5 2 12 2M12 4L20 12L12 20L4 12L12 4M7 10.5C6.17 10.5 5.5 11.17 5.5 12S6.17 13.5 7 13.5 8.5 12.83 8.5 12 7.83 10.5 7 10.5M12 10.5C11.17 10.5 10.5 11.17 10.5 12S11.17 13.5 12 13.5 13.5 12.83 13.5 12 12.83 10.5 12 10.5M17 10.5C16.17 10.5 15.5 11.17 15.5 12S16.17 13.5 17 13.5 18.5 12.83 18.5 12 17.83 10.5 17 10.5Z" />
            </svg>
          </div>

          {/* Brand Name in Pink */}
          <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight drop-shadow-sm" style={{ color: 'var(--color-sai-rose)' }}>
            Sugar And Icing
          </h1>

          {/* Handwritten Tagline */}
          <p className="font-[family-name:var(--font-dancing)] text-3xl md:text-5xl transform -rotate-2 origin-center mt-2 mb-8" style={{ color: '#8c737a' }}>
            Freshly Baked in Brickfields
          </p>

          {/* CTA Button */}
          <a
            href="/menu"
            className="bg-sai-pink hover:bg-sai-rose text-white font-bold px-10 py-4 rounded-full shadow-xl transition-all transform hover:-translate-y-1 hover:scale-105 flex items-center gap-3 text-xl"
          >
            Shop Now
            <ArrowRight className="w-6 h-6" />
          </a>
        </div>
      </section>
    </main>
  );
}