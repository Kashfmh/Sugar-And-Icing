import DraggableText from '@/app/components/DraggableText';

export default function HomeHero() {
    return (
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
                <p className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-sai-charcoal/90 mb-4 md:mb-8">
                    Handmade with love in KL Sentral, Brickfields
                </p>

                {/* Mobile Shop Now Button - Below tagline */}
                <div className="md:hidden">
                    <a
                        href="/other-treats"
                        className="group inline-flex items-center gap-2 bg-sai-charcoal hover:bg-sai-white text-sai-white hover:text-sai-charcoal px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md border-2 border-sai-charcoal"
                    >
                        <span className="relative z-10">Shop Now</span>
                        <svg
                            className="w-4 h-4 transition-transform group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </a>
                </div>
            </div>

            {/* Shop Now CTA - Left Middle (Desktop Only) */}
            <div className="hidden md:block absolute left-8 md:left-12 top-1/2 -translate-y-1/2 z-10">
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
        </section>
    );
}
