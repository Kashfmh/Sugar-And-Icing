import NumberBadge from '@/components/ui/number-badge';

export default function OrderSteps() {
    return (
        <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-16 px-4 md:px-8 pb-16">
            <div className="max-w-6xl mx-auto">
                <h3 className="font-serif text-3xl text-center text-sai-charcoal mb-8">
                    How Custom Orders Work
                </h3>

                {/* Desktop: 3 columns */}
                <div className="hidden md:grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <NumberBadge number={1} size="lg" className="mx-auto mb-4" />
                        <h4 className="font-semibold text-sai-charcoal mb-2">Share Your Vision</h4>
                        <p className="text-sm text-sai-gray">
                            Message us on WhatsApp with your cake idea, occasion, and preferences
                        </p>
                    </div>
                    <div className="text-center">
                        <NumberBadge number={2} size="lg" className="mx-auto mb-4" />
                        <h4 className="font-semibold text-sai-charcoal mb-2">Get a Quote</h4>
                        <p className="text-sm text-sai-gray">
                            We'll discuss details like size, design, flavors, and provide pricing
                        </p>
                    </div>
                    <div className="text-center">
                        <NumberBadge number={3} size="lg" className="mx-auto mb-4" />
                        <h4 className="font-semibold text-sai-charcoal mb-2">Enjoy Your Cake</h4>
                        <p className="text-sm text-sai-gray">
                            We'll bake it fresh and deliver to your location in KL Sentral area
                        </p>
                    </div>
                </div>

                {/* Mobile: Compact list */}
                <div className="md:hidden space-y-4">
                    <div className="flex gap-3 items-start">
                        <NumberBadge number={1} size="md" className="flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-sai-charcoal mb-1">Share Your Vision</h4>
                            <p className="text-sm text-sai-gray">Message us on WhatsApp with your cake idea</p>
                        </div>
                    </div>
                    <div className="flex gap-3 items-start">
                        <NumberBadge number={2} size="md" className="flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-sai-charcoal mb-1">Get a Quote</h4>
                            <p className="text-sm text-sai-gray">We'll discuss size, design, and pricing</p>
                        </div>
                    </div>
                    <div className="flex gap-3 items-start">
                        <NumberBadge number={3} size="md" className="flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-sai-charcoal mb-1">Enjoy Your Cake</h4>
                            <p className="text-sm text-sai-gray">Fresh baked and delivered in KL Sentral</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
