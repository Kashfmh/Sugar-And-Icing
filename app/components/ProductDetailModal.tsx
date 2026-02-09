'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Star, ShoppingCart, ChevronDown, Check, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AllergenBadge from './AllergenBadge';
import { motion, AnimatePresence } from 'motion/react';
import Counter from './Counter';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProductOption {
    id: string;
    option_category: string;
    option_name: string;
    is_premium: boolean;
    price_modifier: number;
    description?: string;
}

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    profiles?: {
        first_name: string;
    } | null;
}

interface ProductDetailModalProps {
    productId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProductDetailModal({ productId, isOpen, onClose }: ProductDetailModalProps) {
    const supabase = createClient();
    const [product, setProduct] = useState<Product | null>(null);
    const [options, setOptions] = useState<ProductOption[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedBase, setSelectedBase] = useState<string>('');
    const [selectedFrosting, setSelectedFrosting] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [designNotes, setDesignNotes] = useState('');
    const [selectedTopping, setSelectedTopping] = useState<string>('None');
    const [selectedDietaryOptions, setSelectedDietaryOptions] = useState<string[]>([]);
    const [isAdded, setIsAdded] = useState(false);

    useEffect(() => {
        if (isOpen && productId) {
            fetchProductDetails();
        }
    }, [isOpen, productId]);

    async function fetchProductDetails() {
        setLoading(true);
        try {
            const { data: productData, error: productError } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (productError) throw productError;
            setProduct(productData as Product);

            if (productData.customizable) {
                const { data: optionsData, error: optionsError } = await supabase
                    .from('product_options')
                    .select('*')
                    .eq('product_type', productData.product_type);

                if (!optionsError) {
                    setOptions((optionsData as unknown as ProductOption[]) || []);
                }
            }

            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select(`
          id,
          rating,
          comment,
          created_at,
          user_id,
          profiles(first_name)
        `)
                .eq('product_id', productId)
                .order('created_at', { ascending: false })
                .limit(5);

            if (!reviewsError) {
                const transformedReviews = (reviewsData || []).map((review: any) => ({
                    ...review,
                    profiles: Array.isArray(review.profiles) ? review.profiles[0] : review.profiles
                }));
                setReviews(transformedReviews);
            }

            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    console.log('[Modal View] Tracking for user:', user.id);
                    const { trackProductView } = await import('@/lib/services/recentlyViewedService');
                    await trackProductView(user.id, productData.id);
                }
            } catch (e) {
                console.error('[Modal View] Error tracking:', e);
            }

        } catch (error) {
            console.error('Error fetching product details:', error);
        } finally {
            setLoading(false);
        }
    }
    // ... rest of the component remains the same ...
    // combine main image with gallery
    const images = [
        product?.image_url,
        ...(product?.gallery_images || [])
    ].filter(Boolean);

    const baseOptions = options.filter(opt => opt.option_category === 'base');
    const frostingOptions = options.filter(opt => opt.option_category === 'frosting');
    const toppingOptions = options.filter(opt => opt.option_category === 'topping');
    const dietaryOptions = options.filter(opt => opt.option_category === 'dietary');

    const calculatePrice = () => {
        if (!product) return 0;

        if (product.product_type === 'cupcake_basic' || product.product_type === 'cupcake_premium') {
            let baseTotal = 0;
            // Quantity 1 = 6 pieces = base_price
            // Quantity 2 = 12 pieces = premium_price (discounted)
            if (quantity === 1) {
                baseTotal = product.base_price;
            } else if (quantity === 2 && product.premium_price) {
                baseTotal = product.premium_price;
            } else if (quantity > 2 && product.premium_price) {
                // For quantities > 2, calculate proportionally from the 12pc price
                baseTotal = product.premium_price * (quantity / 2);
            } else {
                baseTotal = product.base_price * quantity;
            }

            // Calculate dietary cost (per piece logic: 6 pieces per quantity unit)
            // Quantity 1 (6pcs) -> 6 * dietaryMod
            // Quantity 2 (12pcs) -> 12 * dietaryMod
            const totalPieces = quantity * 6;
            let dietaryCost = 0;

            selectedDietaryOptions.forEach(dietaryName => {
                const dietaryOption = dietaryOptions.find(opt => opt.option_name === dietaryName);
                if (dietaryOption) {
                    dietaryCost += (dietaryOption.price_modifier * totalPieces);
                }
            });

            return baseTotal + dietaryCost;
        }

        if (product.product_type === 'brownie') {
            let pricePerPiece = product.base_price; // RM 3

            if (selectedTopping && selectedTopping !== 'None') {
                const toppingOption = toppingOptions.find(opt => opt.option_name === selectedTopping);
                if (toppingOption?.is_premium) {
                    pricePerPiece = product.premium_price || product.base_price; // fallback to base if premium is null
                }
            }

            selectedDietaryOptions.forEach(dietaryName => {
                const dietaryOption = dietaryOptions.find(
                    opt => opt.option_name === dietaryName
                );
                if (dietaryOption) {
                    pricePerPiece += dietaryOption.price_modifier;
                }
            });

            return pricePerPiece * quantity;
        }

        // other products
        let basePrice = product.base_price;

        const selectedBaseOption = baseOptions.find(opt => opt.option_name === selectedBase);
        const selectedFrostingOption = frostingOptions.find(opt => opt.option_name === selectedFrosting);
        const isPremium = selectedBaseOption?.is_premium || selectedFrostingOption?.is_premium;

        if (isPremium && product.premium_price) {
            basePrice = product.premium_price;
        }

        let total = basePrice * quantity;

        selectedDietaryOptions.forEach(dietaryName => {
            const dietaryOption = dietaryOptions.find(opt => opt.option_name === dietaryName);
            if (dietaryOption) {
                total += (dietaryOption.price_modifier * quantity);
            }
        });

        return total;
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                            duration: 0.3
                        }}
                        className="relative bg-white rounded-3xl max-w-5xl w-full h-[90vh] md:h-[85vh] shadow-2xl overflow-hidden flex flex-col"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/95 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
                        >
                            <X className="w-5 h-5 text-sai-charcoal group-hover:text-sai-pink transition-colors" />
                        </button>

                        {loading ? (
                            <div className="flex flex-col lg:flex-row h-full overflow-hidden animate-pulse">
                                {/* Left: Gallery Skeleton */}
                                <div className="lg:w-2/5 flex flex-col h-full bg-gray-50 border-r border-gray-100">
                                    <div className="flex-1 p-6 flex items-center justify-center">
                                        <div className="aspect-square w-full max-w-[350px] rounded-2xl bg-gray-200" />
                                    </div>
                                    {/* Stats Footer Skeleton */}
                                    <div className="p-6 border-t border-gray-200 bg-white flex-shrink-0">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-200" />
                                                <div className="space-y-1">
                                                    <div className="h-4 w-16 bg-gray-200 rounded" />
                                                    <div className="h-3 w-12 bg-gray-200 rounded" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="h-3 w-8 bg-gray-200 rounded ml-auto" />
                                                <div className="h-5 w-12 bg-gray-200 rounded ml-auto" />
                                            </div>
                                        </div>
                                        <div className="h-3 w-full bg-gray-200 rounded" />
                                    </div>
                                </div>

                                {/* Right: Usage Skeleton */}
                                <div className="lg:w-3/5 flex flex-col h-full bg-white relative">
                                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                        {/* Header */}
                                        <div className="space-y-4">
                                            <div className="h-8 w-3/4 bg-gray-200 rounded-lg" />
                                            <div className="flex gap-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="h-6 w-16 bg-gray-200 rounded-full" />
                                                ))}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-4 w-full bg-gray-200 rounded" />
                                                <div className="h-4 w-5/6 bg-gray-200 rounded" />
                                            </div>
                                        </div>

                                        {/* Inputs */}
                                        <div className="space-y-6 pt-6 border-t border-gray-100">
                                            {[1, 2].map(i => (
                                                <div key={i} className="space-y-2">
                                                    <div className="h-4 w-24 bg-gray-200 rounded" />
                                                    <div className="h-12 w-full bg-gray-100 rounded-xl border border-gray-200" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer Skeleton */}
                                    <div className="px-6 py-4 border-t border-gray-100 bg-white flex-shrink-0">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="space-y-1">
                                                <div className="h-3 w-16 bg-gray-200 rounded" />
                                                <div className="h-8 w-24 bg-gray-200 rounded" />
                                            </div>
                                        </div>
                                        <div className="h-[52px] w-full bg-gray-200 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col lg:flex-row h-full overflow-hidden">
                                {/* Left: Gallery + Fixed Stats Footer */}
                                <div className="lg:w-2/5 flex flex-col h-full bg-gray-50 border-r border-gray-100">
                                    {/* Scrollable Gallery Area */}
                                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide flex flex-col justify-center">
                                        <Carousel className="w-full">
                                            <CarouselContent>
                                                {images.length > 0 ? (
                                                    images.map((img, index) => (
                                                        <CarouselItem key={index}>
                                                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
                                                                <Image
                                                                    src={img || ''}
                                                                    alt={`${product?.name} - Image ${index + 1}`}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        </CarouselItem>
                                                    ))
                                                ) : (
                                                    <CarouselItem>
                                                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
                                                            <span className="text-gray-400">No image</span>
                                                        </div>
                                                    </CarouselItem>
                                                )}
                                            </CarouselContent>
                                            {images.length > 1 && (
                                                <>
                                                    <CarouselPrevious className="left-2" />
                                                    <CarouselNext className="right-2" />
                                                </>
                                            )}
                                        </Carousel>
                                    </div>

                                    {/* Fixed Stats Card Footer */}
                                    <div className="p-6 border-t border-gray-200 bg-white flex-shrink-0">
                                        <div className="flex items-center justify-between mb-0">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-yellow-50 p-2 rounded-lg">
                                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                                </div>
                                                <div>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="font-bold text-xl text-sai-charcoal">{product?.average_rating.toFixed(1)}</span>
                                                        <span className="text-gray-400 text-sm">/ 5.0</span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{product?.review_count} Reviews</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Sold</div>
                                                <div className="font-bold text-xl text-sai-charcoal">{product?.times_sold}</div>
                                            </div>
                                        </div>

                                        {/* Info Text */}
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-xs text-gray-500 leading-relaxed flex gap-2">
                                                <Info className="w-4 h-4 text-sai-pink flex-shrink-0" />
                                                <span>
                                                    <span className="font-medium text-sai-charcoal">Note:</span> Product images are for reference. Customized items may vary slightly.
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Scrollable Content + Fixed Footer */}
                                <div className="lg:w-3/5 flex flex-col h-full bg-white relative">

                                    {/* Scrollable Details */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                        {/* Header */}
                                        <div>
                                            <h2 className="text-3xl font-serif font-bold text-sai-charcoal mb-2 pr-12">
                                                {product?.name}
                                            </h2>

                                            {/* Tags */}
                                            {product?.tags && product.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-4">
                                                    {product.tags.map((tag: string) => (
                                                        <AllergenBadge key={tag} tag={tag} />
                                                    ))}
                                                </div>
                                            )}

                                            {/* Description */}
                                            <p className="text-sai-gray leading-relaxed text-sm">
                                                {product?.description}
                                            </p>
                                        </div>

                                        {/* Customization */}
                                        {product?.customizable && (
                                            <div className="border-t border-gray-100 pt-6">
                                                <h3 className="font-semibold text-lg mb-4 text-sai-charcoal">Customize Your Order</h3>

                                                {/* Base Selection */}
                                                {baseOptions.length > 0 && (
                                                    <div className="mb-5">
                                                        <label className="block text-sm font-medium mb-2 text-gray-700">Base Flavor *</label>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sai-pink focus:border-sai-pink hover:border-sai-pink/50 transition-colors flex justify-between items-center text-left bg-gray-50/50">
                                                                    <span className="text-sm text-gray-700 font-medium">{selectedBase || "Select flavor..."}</span>
                                                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto">
                                                                {baseOptions.map((opt) => (
                                                                    <DropdownMenuItem
                                                                        key={opt.id}
                                                                        onSelect={() => setSelectedBase(opt.option_name)}
                                                                        className="py-2.5 cursor-pointer"
                                                                    >
                                                                        {opt.option_name} {opt.is_premium && <span className="text-sai-pink ml-1 text-xs font-semibold bg-pink-50 px-2 py-0.5 rounded-full">Premium</span>}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                )}

                                                {/* Frosting Selection */}
                                                {frostingOptions.length > 0 && (
                                                    <div className="mb-5">
                                                        <label className="block text-sm font-medium mb-2 text-gray-700">Frosting *</label>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sai-pink focus:border-sai-pink hover:border-sai-pink/50 transition-colors flex justify-between items-center text-left bg-gray-50/50">
                                                                    <span className="text-sm text-gray-700 font-medium">{selectedFrosting || "Select frosting..."}</span>
                                                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto">
                                                                {frostingOptions.map((opt) => (
                                                                    <DropdownMenuItem
                                                                        key={opt.id}
                                                                        onSelect={() => setSelectedFrosting(opt.option_name)}
                                                                        className="py-2.5 cursor-pointer"
                                                                    >
                                                                        {opt.option_name} {opt.is_premium && <span className="text-sai-pink ml-1 text-xs font-semibold bg-pink-50 px-2 py-0.5 rounded-full">Premium</span>}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                )}

                                                {/* Brownie Topping Selection */}
                                                {toppingOptions.length > 0 && (
                                                    <div className="mb-5">
                                                        <label className="block text-sm font-medium mb-2 text-gray-700">
                                                            Add Topping <span className="text-gray-400 font-normal">(Optional, +RM 1)</span>
                                                        </label>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sai-pink focus:border-sai-pink hover:border-sai-pink/50 transition-colors flex justify-between items-center text-left bg-gray-50/50">
                                                                    <span className="text-sm text-gray-700 font-medium">
                                                                        {selectedTopping === 'None' ? 'No topping (RM 3/pc)' :
                                                                            selectedTopping ? `${selectedTopping} (+RM 1.00)` : 'Select topping...'}
                                                                    </span>
                                                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                                                                <DropdownMenuItem
                                                                    onSelect={() => setSelectedTopping('None')}
                                                                    className="py-2.5 cursor-pointer"
                                                                >
                                                                    No topping (RM 3/pc)
                                                                </DropdownMenuItem>
                                                                {toppingOptions.map((opt) => (
                                                                    <DropdownMenuItem
                                                                        key={opt.id}
                                                                        onSelect={() => setSelectedTopping(opt.option_name)}
                                                                        className="py-2.5 cursor-pointer"
                                                                    >
                                                                        {opt.option_name} <span className="text-sai-pink ml-1 text-xs font-semibold">(+RM {opt.price_modifier.toFixed(2)})</span>
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                )}

                                                {/* Dietary Options */}
                                                {dietaryOptions.length > 0 && (
                                                    <div className="mb-5">
                                                        <label className="block text-sm font-medium mb-2 text-gray-700">Dietary Options</label>
                                                        <div className="space-y-3">
                                                            {dietaryOptions.map((opt) => (
                                                                <label key={opt.id} className="flex items-center gap-2 cursor-pointer group">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedDietaryOptions.includes(opt.option_name)}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                setSelectedDietaryOptions([...selectedDietaryOptions, opt.option_name]);
                                                                            } else {
                                                                                setSelectedDietaryOptions(selectedDietaryOptions.filter(name => name !== opt.option_name));
                                                                            }
                                                                        }}
                                                                        className="w-4 h-4 text-sai-pink border-gray-300 rounded focus:ring-sai-pink cursor-pointer"
                                                                    />
                                                                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                                                        {opt.option_name}
                                                                        {opt.is_premium ? (
                                                                            <span className="text-sai-pink ml-1 font-medium">(+RM {opt.price_modifier.toFixed(2)})</span>
                                                                        ) : (
                                                                            <span className="text-green-600 ml-1 font-medium">(Free)</span>
                                                                        )}
                                                                    </span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Design Notes */}
                                                <div className="mb-5">
                                                    <label className="block text-sm font-medium mb-2 text-gray-700">
                                                        Design Notes <span className="text-gray-400 font-normal">(Optional)</span>
                                                    </label>
                                                    <textarea
                                                        value={designNotes}
                                                        onChange={(e) => setDesignNotes(e.target.value)}
                                                        placeholder="Describe your desired design, colors, themes, or any special requests..."
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sai-pink focus:border-sai-pink min-h-[100px] resize-none text-sm placeholder:text-gray-400"
                                                        maxLength={500}
                                                    />
                                                    <p className="text-xs text-gray-400 mt-1 text-right">
                                                        {designNotes.length}/500 characters
                                                    </p>
                                                </div>

                                                {/* Quantity */}
                                                <div className="mb-2">
                                                    <label className="block text-sm font-medium mb-2 text-gray-700">Quantity</label>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                            className="w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-12 text-center font-bold text-lg text-sai-charcoal">{quantity}</span>
                                                        <button
                                                            onClick={() => setQuantity(quantity + 1)}
                                                            className="w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Reviews */}
                                        {reviews.length > 0 && (
                                            <div className="border-t border-gray-100 pt-6 pb-6">
                                                <h3 className="font-semibold text-lg mb-4 text-sai-charcoal">Customer Reviews</h3>
                                                <div className="space-y-4">
                                                    {reviews.map((review) => (
                                                        <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="flex">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            className={`w-3.5 h-3.5 ${i < review.rating
                                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                                : 'text-gray-300'
                                                                                }`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <span className="text-sm font-semibold text-gray-900">
                                                                    {review.profiles?.first_name || 'Anonymous'}
                                                                </span>
                                                                <span className="text-xs text-gray-400">
                                                                    • {new Date(review.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Fixed Footer */}
                                    <div className="px-6 py-6 border-t border-gray-100 bg-white flex-shrink-0 z-10 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <div className="text-sm text-gray-500 mb-1">Total Price</div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-3xl font-bold font-serif text-sai-charcoal">RM</span>
                                                    <Counter
                                                        value={parseFloat(calculatePrice().toFixed(2))}
                                                        fontSize={32}
                                                        padding={0}
                                                        gap={2}
                                                        textColor="var(--color-sai-charcoal)"
                                                        fontWeight="bold"
                                                        gradientHeight={8}
                                                        gradientFrom="white"
                                                        gradientTo="transparent"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const metadata: Record<string, any> = {};
                                                if (selectedBase) metadata['Base'] = selectedBase;
                                                if (selectedFrosting) metadata['Frosting'] = selectedFrosting;
                                                if (selectedTopping && selectedTopping !== 'None') metadata['Topping'] = selectedTopping;
                                                if (selectedDietaryOptions.length > 0) metadata['Dietary'] = selectedDietaryOptions.join(', ');
                                                if (designNotes) metadata['Notes'] = designNotes;

                                                const totalPrice = calculatePrice();
                                                const unitPrice = totalPrice / quantity;

                                                const uniqueId = `${product?.id}-${JSON.stringify(metadata)}`;

                                                if (product) {
                                                    useCart.getState().addItem({
                                                        id: uniqueId,
                                                        productId: product.id,
                                                        name: product.name,
                                                        price: unitPrice,
                                                        image_url: images[0] || null,
                                                        quantity: quantity,
                                                        description: product.description || null,
                                                        category: product.product_type,
                                                        metadata: metadata
                                                    });

                                                    setIsAdded(true);
                                                    setTimeout(() => {
                                                        setIsAdded(false);
                                                        onClose();
                                                    }, 1000);
                                                }
                                            }}
                                            disabled={isAdded}
                                            className={`w-full py-3 text-lg rounded-xl font-bold hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg ${isAdded ? 'bg-green-600 text-white shadow-green-200' : 'bg-sai-pink text-white shadow-pink-200'
                                                }`}
                                        >
                                            {isAdded ? (
                                                <>
                                                    <Check className="w-6 h-6" />
                                                    Added to Cart!
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart className="w-5 h-5 mr-1" />
                                                    Add to Cart
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}