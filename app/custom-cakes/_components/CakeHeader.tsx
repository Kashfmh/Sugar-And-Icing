import { AnimatedText } from '@/app/components/ui/animated-text';

export default function CakeHeader() {
    return (
        <section className="px-6 pt-20 md:pt-28 pb-6">
            <div className="max-w-4xl mx-auto text-center">
                <p className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-sai-charcoal/70 mb-3">
                    Made Just For You
                </p>
                <h2 className="font-serif text-3xl md:text-5xl font-normal text-sai-charcoal relative inline-block px-2">
                    <AnimatedText
                        words={['Custom Cake Creations', 'Baked With Love', 'Dream Cakes', 'Made to Order']}
                        className="text-sai-pink"
                    />
                </h2>
            </div>
        </section>
    );
}
