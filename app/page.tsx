
import DraggableText from './components/DraggableText';
import Image from 'next/image';
import { Instagram, Facebook, Twitter } from 'lucide-react';

export default async function Home() {
  return (
    <main className="min-h-screen overflow-hidden relative">

      {/* Background Image with Transparency */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
        style={{ backgroundImage: "url('/images/hero/baking.png')" }}
      />


      {/* Hero Section - Right Aligned */}
      <section className="relative min-h-screen flex items-center justify-end px-6 md:px-16 pt-24 md:pt-32">


        {/* Right Aligned Content */}
        <div className="relative z-10 text-right max-w-2xl">
          {/* Desktop - Interactive Draggable Text */}
          <div className="hidden md:block">
            <DraggableText />
          </div>

          {/* Mobile - Regular Text */}
          <div className="block md:hidden">
            <h1 className="font-serif text-5xl font-normal leading-[1.1] mb-4 text-sai-charcoal">
              Sugar And Icing
            </h1>
            <h2 className="font-serif text-4xl font-normal leading-[1.1] mb-8 text-sai-charcoal">
              Baked Fresh For You.
            </h2>
          </div>

          {/* Tagline - Playground Style */}
          <p className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-sai-charcoal/90 mb-8">
            Handmade with love in KL Sentral, Brickfields
          </p>

          {/* Optional CTA - hidden for cleaner look */}
          {/* <button className="bg-sai-charcoal text-white px-8 py-3 rounded-lg font-semibold hover:bg-sai-charcoal/90 transition-all">
            View Menu
          </button> */}
        </div>

        {/* Decorative Strawberries/Fruits - Right Side (Optional) */}
        {/* You can add decorative elements here if you have images */}

        {/* Shop Now CTA - Left Middle */}
        <div className="absolute left-8 md:left-12 top-1/2 -translate-y-1/2 z-10">
          <a
            href="/other-treats"
            className="group relative inline-flex items-center gap-3 bg-sai-charcoal hover:bg-sai-white text-sai-white hover:text-sai-charcoal px-8 py-4 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg border-2 border-sai-charcoal"
          >
            <span className="relative z-10">Shop Now</span>
            <svg
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>

        {/* Social Icons - Bottom Left */}
        <div className="absolute bottom-8 left-8 flex flex-col gap-4 hidden md:flex">
          {/* Socials Label */}
          <div className="bg-sai-charcoal text-white px-4 py-2 rounded-lg text-sm font-semibold mb-2 w-fit cursor-default select-none">
            Follow My Socials
          </div>

          {/* Social Icons */}
          <div className="flex gap-5">
            <a
              href="https://wa.me/60108091351?text=Hi,%20I%20am%20looking%20to%20buying%20something.%20Are%20you%20available?"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-sai-pink transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </a>
            <a
              href="https://facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-sai-pink transition-colors"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-sai-pink transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Keep current bottom nav for mobile */}

    </main >
  );
}
