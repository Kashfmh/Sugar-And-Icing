'use client';

import { useState } from 'react';
import { ChevronRight, Camera } from 'lucide-react';
import Counter from '@/app/components/Counter';
import { CAKE_SIZES, CAKE_BASES, CAKE_FROSTINGS } from '../constants';



export default function CakeBuilder() {
    const [selectedSize, setSelectedSize] = useState(CAKE_SIZES[1]);
    const [selectedBase, setSelectedBase] = useState(CAKE_BASES[0]);
    const [selectedFrosting, setSelectedFrosting] = useState(CAKE_FROSTINGS[0]);
    const [designNotes, setDesignNotes] = useState('');

    // pricing logic
    const isPremiumSelection = selectedBase.type === 'premium' || selectedFrosting.type === 'premium';
    const estimatedPrice = isPremiumSelection ? selectedSize.premiumPrice : selectedSize.basicPrice;

    const handleWhatsAppRedirect = () => {
        const message = `Hi! I'd like a quote for a custom cake from scratch:
- Weight: ${selectedSize.weight} (approx ${selectedSize.serves} pax)
- Base: ${selectedBase.label}
- Frosting: ${selectedFrosting.label}
- Design Concept: ${designNotes || 'Not specified (will share image)'}
- Estimated Base Price: RM ${estimatedPrice} (Excluding custom design cost)

I have a reference image I'd like to share.`;

        const url = `https://wa.me/60108091351?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleTierCakeInquiry = () => {
        const message = "Hi! I'm interested in a custom multi-tier cake. Can we discuss pricing and designs?";
        const url = `https://wa.me/60108091351?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <section className="py-12 px-6 bg-white" id="calculator">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif font-bold text-sai-charcoal mb-4">Design From Scratch</h2>
                    <p className="text-gray-600 max-w-lg mx-auto">
                        Got a unique idea? Build your base here and chat with us on WhatsApp to finalize the design.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Controls */}
                    <div className="space-y-8">
                        {/* Size Selection */}
                        <div>
                            <h3 className="font-semibold text-sai-charcoal mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-pink-100 text-sai-pink flex items-center justify-center text-sm">1</span>
                                Choose Weight
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                {CAKE_SIZES.map((size) => (
                                    <button
                                        key={size.id}
                                        onClick={() => setSelectedSize(size)}
                                        className={`p-3 rounded-xl border text-center transition-all ${selectedSize.id === size.id
                                            ? 'border-sai-pink bg-pink-50 ring-1 ring-sai-pink'
                                            : 'border-gray-200 hover:border-pink-200'
                                            }`}
                                    >
                                        <div className="font-bold text-sai-charcoal">{size.label}</div>
                                        <div className="text-xs text-gray-500 mt-1">{size.weight}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Base Selection */}
                        <div>
                            <h3 className="font-semibold text-sai-charcoal mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-pink-100 text-sai-pink flex items-center justify-center text-sm">2</span>
                                Pick Base Flavor
                            </h3>
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {CAKE_BASES.map((base) => (
                                    <button
                                        key={base.id}
                                        onClick={() => setSelectedBase(base)}
                                        className={`px-3 py-2 rounded-lg border text-left text-sm transition-all flex justify-between items-center ${selectedBase.id === base.id
                                            ? 'border-sai-pink bg-pink-50 text-sai-pink font-medium'
                                            : 'border-gray-100 hover:bg-gray-50 text-gray-600'
                                            }`}
                                    >
                                        {base.label}
                                        {base.type === 'premium' && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Prem</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Frosting Selection */}
                        <div>
                            <h3 className="font-semibold text-sai-charcoal mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-pink-100 text-sai-pink flex items-center justify-center text-sm">3</span>
                                Pick Frosting
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {CAKE_FROSTINGS.map((frosting) => (
                                    <button
                                        key={frosting.id}
                                        onClick={() => setSelectedFrosting(frosting)}
                                        className={`px-3 py-2 rounded-lg border text-left text-sm transition-all flex justify-between items-center ${selectedFrosting.id === frosting.id
                                            ? 'border-sai-pink bg-pink-50 text-sai-pink font-medium'
                                            : 'border-gray-100 hover:bg-gray-50 text-gray-600'
                                            }`}
                                    >
                                        {frosting.label}
                                        {frosting.type === 'premium' && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Prem</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Design Section */}
                        <div>
                            <h3 className="font-semibold text-sai-charcoal mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-pink-100 text-sai-pink flex items-center justify-center text-sm">4</span>
                                Design Idea
                            </h3>
                            <div className="relative">
                                <textarea
                                    value={designNotes}
                                    onChange={(e) => setDesignNotes(e.target.value)}
                                    placeholder="Describe your theme, colors, or idea..."
                                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-sai-pink focus:ring-sai-pink text-sm min-h-[100px] resize-none p-4"
                                />
                                <div className="absolute bottom-3 right-3 text-gray-400">
                                    <Camera className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                *You can share reference photos on WhatsApp after clicking "Get Quote"
                            </p>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-gray-50 rounded-2xl p-6 h-fit sticky top-24 border border-gray-100">
                        <h3 className="font-serif text-xl font-bold text-sai-charcoal mb-6">Your Estimate</h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-200 border-dashed">
                                <div>
                                    <div className="font-medium text-sai-charcoal">{selectedSize.label}</div>
                                    <div className="text-sm text-gray-500">{selectedSize.weight} • Serves {selectedSize.serves}</div>
                                </div>
                                <div className="font-mono text-gray-400">
                                    RM {isPremiumSelection ? selectedSize.premiumPrice : selectedSize.basicPrice}
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Base Flavor</span>
                                <span className="text-sm font-medium text-sai-charcoal flex items-center gap-2">
                                    {selectedBase.label}
                                    {selectedBase.type === 'premium' && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-1 rounded font-bold">PREM</span>}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Frosting</span>
                                <span className="text-sm font-medium text-sai-charcoal flex items-center gap-2">
                                    {selectedFrosting.label}
                                    {selectedFrosting.type === 'premium' && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-1 rounded font-bold">PREM</span>}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end mb-2">
                            <span className="text-gray-500 font-medium">Estimated Price</span>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-bold text-sai-pink">RM</span>
                                <Counter
                                    value={estimatedPrice}
                                    fontSize={30}
                                    padding={0}
                                    gap={2}
                                    textColor="var(--color-sai-pink)"
                                    fontWeight="bold"
                                    gradientHeight={8}
                                    gradientFrom="gray-50"
                                    gradientTo="transparent"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mb-6 text-right w-full">
                            *Final price may vary based on design complexity
                        </p>

                        <button
                            onClick={handleWhatsAppRedirect}
                            className="w-full py-4 bg-sai-pink text-white rounded-xl font-bold hover:bg-sai-pink/90 transition-all shadow-lg shadow-pink-200 flex items-center justify-center gap-2 mb-4"
                        >
                            Get Quote on WhatsApp
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                            <p className="text-sm text-sai-charcoal font-medium mb-2">Need something bigger?</p>
                            <button
                                onClick={handleTierCakeInquiry}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium underline decoration-indigo-200 underline-offset-4"
                            >
                                Inquire about Tier Cakes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
