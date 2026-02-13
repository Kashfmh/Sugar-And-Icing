'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, MessageCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CAKE_SIZES, CAKE_BASES, CAKE_FROSTINGS, CAKE_DIETARY_OPTIONS } from '../constants';

interface CakeDetailContentProps {
    cakeName: string;
    imageUrl?: string;
    description?: string;
    className?: string;
    onClose?: () => void;
}

export default function CakeDetailContent({
    cakeName,
    imageUrl,
    description,
    className = "",
    onClose
}: CakeDetailContentProps) {
    // state
    const [selectedSize, setSelectedSize] = useState(CAKE_SIZES[1]);
    const [selectedBase, setSelectedBase] = useState(CAKE_BASES[0]);
    const [selectedFrosting, setSelectedFrosting] = useState(CAKE_FROSTINGS[0]);
    const [selectedDietaryOptions, setSelectedDietaryOptions] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [designNotes, setDesignNotes] = useState('');
    const [quantity, setQuantity] = useState(1);

    // build whatsapp message
    const handleRequestQuote = () => {
        const dietaryLabels = selectedDietaryOptions
            .map(id => CAKE_DIETARY_OPTIONS.find(opt => opt.id === id)?.label)
            .filter(Boolean)
            .join(', ');

        const lines = [
            `Hi! I'm interested in ordering a custom cake.`,
            ``,
            `Design Reference: ${cakeName}`,
            `Weight: ${selectedSize.weight} (serves ${selectedSize.serves})`,
            `Base Flavor: ${selectedBase.label}`,
            `Frosting: ${selectedFrosting.label}`,
            dietaryLabels ? `Dietary: ${dietaryLabels}` : null,
            message ? `Message on Cake: ${message}` : null,
            designNotes ? `Design Notes: ${designNotes}` : null,
            quantity > 1 ? `Quantity: ${quantity}` : null,
            ``,
            `Please let me know the estimated price and availability!`
        ].filter(Boolean).join('\n');

        const whatsappUrl = `https://wa.me/60108091351?text=${encodeURIComponent(lines)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className={`flex flex-col md:flex-row md:h-full ${className}`}>
            {/* Image Section (Left) */}
            <div className="w-full md:w-1/2 bg-gray-100 relative h-64 md:h-full flex-shrink-0">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={cakeName}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No Image Available
                    </div>
                )}
            </div>

            {/* Config Section (Right) */}
            <div className="w-full md:w-1/2 flex flex-col md:h-full bg-white relative">
                {/* Close Button (Desktop) */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 hidden md:flex w-10 h-10 bg-white/50 hover:bg-white rounded-full items-center justify-center backdrop-blur-sm transition-all"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                )}

                {/* Header */}
                <div className="p-6 pb-2 flex-shrink-0">
                    <h2 className="text-3xl font-serif font-bold text-sai-charcoal mb-2 pr-8">{cakeName}</h2>
                    {description && <p className="text-sai-gray leading-relaxed text-sm">{description}</p>}
                </div>

                {/* Info Block */}
                <div className="px-6 pb-4 border-b border-gray-100">
                    <div className="bg-gradient-to-br from-sai-pink/5 to-sai-pink/10 rounded-xl p-3 border border-sai-pink/20">
                        <p className="text-xs text-gray-600 leading-relaxed">
                            <Info className="w-4 h-4 text-sai-pink inline mr-1" />
                            <span className="font-medium">This is a reference image.</span> Customize the design however you like, or request the exact same style. Pricing depends on complexity.
                        </p>
                    </div>
                </div>

                {/* Scrollable Form */}
                <div className="md:flex-1 md:overflow-y-auto p-6 space-y-6 custom-scrollbar">

                    <h3 className="font-semibold text-lg text-sai-charcoal border-b border-gray-100 pb-2">Configure Your Cake</h3>

                    {/* Size Selector */}
                    <section>
                        <label className="block text-sm font-medium mb-3 flex items-center gap-2 text-sai-charcoal">
                            <span className="w-5 h-5 rounded-full bg-pink-100 text-sai-pink flex items-center justify-center text-xs font-bold">1</span>
                            Select Weight
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {CAKE_SIZES.map(size => (
                                <button
                                    key={size.id}
                                    onClick={() => setSelectedSize(size)}
                                    className={`p-3 rounded-xl border text-center transition-all ${selectedSize.id === size.id
                                        ? 'border-sai-pink bg-pink-50 ring-1 ring-sai-pink'
                                        : 'border-gray-200 hover:border-pink-200 hover:bg-pink-50/50'
                                        }`}
                                >
                                    <div className="font-bold text-gray-800">{size.weight}</div>
                                    <div className="text-[10px] text-gray-500 mt-1">{size.serves} pax</div>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Base Flavor */}
                    <section>
                        <label className="block text-sm font-medium mb-3 flex items-center gap-2 text-sai-charcoal">
                            <span className="w-5 h-5 rounded-full bg-pink-100 text-sai-pink flex items-center justify-center text-xs font-bold">2</span>
                            Base Flavor
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {CAKE_BASES.map(base => (
                                <button
                                    key={base.id}
                                    onClick={() => setSelectedBase(base)}
                                    className={`px-3 py-3 rounded-lg border text-left text-sm transition-all flex justify-between items-center ${selectedBase.id === base.id
                                        ? 'border-sai-pink bg-pink-50 text-sai-pink font-medium ring-1 ring-sai-pink'
                                        : 'border-gray-200 hover:border-pink-200 hover:bg-pink-50/50 text-gray-600'
                                        }`}
                                >
                                    <span>{base.label}</span>
                                    {base.type === 'premium' && (
                                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Prem</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Frosting */}
                    <section>
                        <label className="block text-sm font-medium mb-3 flex items-center gap-2 text-sai-charcoal">
                            <span className="w-5 h-5 rounded-full bg-pink-100 text-sai-pink flex items-center justify-center text-xs font-bold">3</span>
                            Frosting
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {CAKE_FROSTINGS.map(frosting => (
                                <button
                                    key={frosting.id}
                                    onClick={() => setSelectedFrosting(frosting)}
                                    className={`px-3 py-3 rounded-lg border text-left text-sm transition-all flex justify-between items-center ${selectedFrosting.id === frosting.id
                                        ? 'border-sai-pink bg-pink-50 text-sai-pink font-medium ring-1 ring-sai-pink'
                                        : 'border-gray-200 hover:border-pink-200 hover:bg-pink-50/50 text-gray-600'
                                        }`}
                                >
                                    <span>{frosting.label}</span>
                                    {frosting.type === 'premium' && (
                                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Prem</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Dietary Options */}
                    <section>
                        <label className="block text-sm font-medium text-sai-charcoal mb-2">Dietary Options</label>
                        <div className="space-y-2">
                            {CAKE_DIETARY_OPTIONS.map((opt) => (
                                <label key={opt.id} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={selectedDietaryOptions.includes(opt.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedDietaryOptions([...selectedDietaryOptions, opt.id]);
                                            } else {
                                                setSelectedDietaryOptions(selectedDietaryOptions.filter(id => id !== opt.id));
                                            }
                                        }}
                                        className="w-4 h-4 text-sai-pink border-gray-300 rounded focus:ring-sai-pink cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                        {opt.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* Text Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-sai-charcoal mb-2">
                                Design Notes <span className="text-gray-400 font-normal">(Optional)</span>
                            </label>
                            <textarea
                                value={designNotes}
                                onChange={(e) => setDesignNotes(e.target.value)}
                                placeholder="Describe your desired design, colors, themes..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sai-pink focus:border-sai-pink text-sm min-h-[80px] resize-none placeholder:text-gray-400"
                                maxLength={500}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-sai-charcoal mb-2">
                                Message on Cake <span className="text-gray-400 font-normal">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="e.g. Happy Birthday Sarah!"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sai-pink focus:border-sai-pink text-sm placeholder:text-gray-400"
                                maxLength={30}
                            />
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-sai-charcoal mb-2">Quantity</label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-9 h-9 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors"
                                >
                                    -
                                </button>
                                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-9 h-9 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-white flex-shrink-0 pb-32 md:pb-6">
                    <p className="text-xs text-gray-500 mb-3 text-center">
                        Pricing depends on design complexity. We'll confirm the final price on WhatsApp.
                    </p>
                    <Button
                        onClick={handleRequestQuote}
                        className="w-full py-6 text-lg rounded-xl shadow-lg bg-green-600 hover:bg-green-700 text-white"
                    >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Request Quote on WhatsApp
                    </Button>
                </div>
            </div>
        </div>
    );
}
