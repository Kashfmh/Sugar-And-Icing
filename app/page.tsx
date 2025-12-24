import Navbar from './components/Navbar';
import Image from 'next/image';
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
          {/* SAI Logo Icon */}
          <div className="mb-2">
            <Image
              src="/images/logo/icon-white.png"
              alt="Sugar And Icing Logo"
              width={80}
              height={80}
              className="object-contain drop-shadow-lg"
              priority
            />
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