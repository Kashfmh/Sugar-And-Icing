import { AnimatedText } from '@/app/components/ui/animated-text';

export default function MenuHeader() {
    return (
        <section className="px-6 pt-20 md:pt-28 pb-6">
            <div className="max-w-4xl mx-auto text-center">
                <p className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-sai-charcoal/70 mb-3">
                    Sweet cravings sorted
                </p>
                <h2 className="font-serif text-4xl md:text-5xl font-normal text-sai-charcoal relative inline-block">
                    <AnimatedText
                        words={['Freshly Baked', 'Made With Love', 'Crafted Daily', 'Baked to Perfection']}
                        className="text-sai-pink"
                    />
                </h2>
            </div>
        </section>
    );
}
