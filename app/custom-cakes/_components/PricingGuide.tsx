export default function PricingGuide() {
    return (
        <section className="px-6 py-12 bg-white">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h3 className="font-serif text-3xl md:text-4xl text-sai-charcoal mb-3">
                        Pricing Guide
                    </h3>
                    <p className="text-sai-gray text-sm md:text-base">
                        Starting prices based on cake size • Final price depends on design complexity
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {/* 6 inch */}
                    <div className="bg-gradient-to-br from-pink-50 to-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow border border-pink-100">
                        <div className="text-center">
                            <div className="relative mx-auto mb-4" style={{ width: '60px', height: '60px' }}>
                                <div
                                    className="absolute inset-0 rounded-full flex items-center justify-center font-bold text-white text-sm"
                                    style={{ backgroundColor: 'var(--color-sai-pink)' }}
                                >
                                    6"
                                </div>
                            </div>
                            <h4 className="font-serif text-lg md:text-xl font-bold text-sai-charcoal mb-2">
                                Small
                            </h4>
                            <p className="text-xs text-sai-gray mb-3">
                                Serves 8-10
                            </p>
                            <div className="bg-white rounded-lg py-2 px-3 border border-pink-200">
                                <p className="text-xs text-sai-gray mb-1">Starting from</p>
                                <p className="text-2xl font-bold" style={{ color: 'var(--color-sai-pink)' }}>
                                    RM 80
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 8 inch */}
                    <div className="bg-gradient-to-br from-pink-50 to-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow border border-pink-100 relative">
                        <div className="absolute -top-2 -right-2 bg-sai-pink text-white text-xs font-bold px-2 py-1 rounded-full">
                            Popular
                        </div>
                        <div className="text-center">
                            <div className="relative mx-auto mb-4" style={{ width: '75px', height: '75px' }}>
                                <div
                                    className="absolute inset-0 rounded-full flex items-center justify-center font-bold text-white text-base"
                                    style={{ backgroundColor: 'var(--color-sai-pink)' }}
                                >
                                    8"
                                </div>
                            </div>
                            <h4 className="font-serif text-lg md:text-xl font-bold text-sai-charcoal mb-2">
                                Medium
                            </h4>
                            <p className="text-xs text-sai-gray mb-3">
                                Serves 12-16
                            </p>
                            <div className="bg-white rounded-lg py-2 px-3 border border-pink-200">
                                <p className="text-xs text-sai-gray mb-1">Starting from</p>
                                <p className="text-2xl font-bold" style={{ color: 'var(--color-sai-pink)' }}>
                                    RM 120
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 10 inch */}
                    <div className="bg-gradient-to-br from-pink-50 to-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow border border-pink-100">
                        <div className="text-center">
                            <div className="relative mx-auto mb-4" style={{ width: '90px', height: '90px' }}>
                                <div
                                    className="absolute inset-0 rounded-full flex items-center justify-center font-bold text-white text-lg"
                                    style={{ backgroundColor: 'var(--color-sai-pink)' }}
                                >
                                    10"
                                </div>
                            </div>
                            <h4 className="font-serif text-lg md:text-xl font-bold text-sai-charcoal mb-2">
                                Large
                            </h4>
                            <p className="text-xs text-sai-gray mb-3">
                                Serves 20-25
                            </p>
                            <div className="bg-white rounded-lg py-2 px-3 border border-pink-200">
                                <p className="text-xs text-sai-gray mb-1">Starting from</p>
                                <p className="text-2xl font-bold" style={{ color: 'var(--color-sai-pink)' }}>
                                    RM 180
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 12 inch */}
                    <div className="bg-gradient-to-br from-pink-50 to-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow border border-pink-100">
                        <div className="text-center">
                            <div className="relative mx-auto mb-4" style={{ width: '105px', height: '105px' }}>
                                <div
                                    className="absolute inset-0 rounded-full flex items-center justify-center font-bold text-white text-xl"
                                    style={{ backgroundColor: 'var(--color-sai-pink)' }}
                                >
                                    12"
                                </div>
                            </div>
                            <h4 className="font-serif text-lg md:text-xl font-bold text-sai-charcoal mb-2">
                                Extra Large
                            </h4>
                            <p className="text-xs text-sai-gray mb-3">
                                Serves 30-35
                            </p>
                            <div className="bg-white rounded-lg py-2 px-3 border border-pink-200">
                                <p className="text-xs text-sai-gray mb-1">Starting from</p>
                                <p className="text-2xl font-bold" style={{ color: 'var(--color-sai-pink)' }}>
                                    RM 250
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-sai-gray max-w-2xl mx-auto">
                        💡 <span className="font-semibold">Note:</span> Prices vary based on design complexity, layers, decorations, and special requests.
                        Multi-tier cakes and custom designs may have different pricing. <span className="font-semibold" style={{ color: 'var(--color-sai-pink)' }}>Contact us for a personalized quote!</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
