'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Star, ShoppingCart, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AllergenBadge from './AllergenBadge';
import { motion, AnimatePresence } from 'motion/react';
import Counter from './Counter';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
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
    const [product, setProduct] = useState<any>(null);
    const [options, setOptions] = useState<ProductOption[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedBase, setSelectedBase] = useState<string>('');
    const [selectedFrosting, setSelectedFrosting] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [designNotes, setDesignNotes] = useState('');
    // Brownie options
    const [selectedTopping, setSelectedTopping] = useState<string>('None');
    const [selectedDietaryOptions, setSelectedDietaryOptions] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen && productId) {
            fetchProductDetails();
        }
    }, [isOpen, productId]);

    async function fetchProductDetails() {
        setLoading(true);
        try {
            // Fetch product
            const { data: productData, error: productError } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (productError) throw productError;
            setProduct(productData);

            // Fetch options if customizable
            if (productData.customizable) {
                const { data: optionsData, error: optionsError } = await supabase
                    .from('product_options')
                    .select('*')
                    .eq('product_type', productData.product_type);

                if (!optionsError) {
                    setOptions(optionsData || []);
                }
            }

            // Fetch reviews
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
                // Transform profiles from array to single object
                const transformedReviews = (reviewsData || []).map((review: any) => ({
                    ...review,
                    profiles: Array.isArray(review.profiles) ? review.profiles[0] : review.profiles
                }));
                setReviews(transformedReviews);
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
        } finally {
            setLoading(false);
        }
    }

    // Support both gallery_images array and single image_url
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

        // For cupcakes with tiered pricing (6pc and 12pc sets)
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

        // For brownies (per piece pricing with toppings and dietary options)
        if (product.product_type === 'brownie') {
            let pricePerPiece = product.base_price; // RM 3

            // Check if premium topping selected (any topping makes it RM 4)
            if (selectedTopping && selectedTopping !== 'None') {
                const toppingOption = toppingOptions.find(opt => opt.option_name === selectedTopping);
                if (toppingOption?.is_premium) {
                    pricePerPiece = product.premium_price; // RM 4
                }
            }

            // Add dietary option costs (cumulative)
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

        // For other products (Fruitcake, Bread, Other)
        // Pricing is per unit
        let basePrice = product.base_price;

        // Handle generic premium logic if applicable (though usually handled by variant/options)
        const selectedBaseOption = baseOptions.find(opt => opt.option_name === selectedBase);
        const selectedFrostingOption = frostingOptions.find(opt => opt.option_name === selectedFrosting);
        const isPremium = selectedBaseOption?.is_premium || selectedFrostingOption?.is_premium;

        if (isPremium && product.premium_price) {
            basePrice = product.premium_price;
        }

        let total = basePrice * quantity;

        // Add dietary costs per unit
        selectedDietaryOptions.forEach(dietaryName => {
            const dietaryOption = dietaryOptions.find(opt => opt.option_name === dietaryName);
            if (dietaryOption) {
                total += (dietaryOption.price_modifier * quantity);
            }
        });

        return total;

        // For other products with regular pricing

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
                    {/* Animated Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Animated Modal */}
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
                        className="relative bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/95 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
                        >
                            <X className="w-5 h-5 text-sai-charcoal group-hover:text-sai-pink transition-colors" />
                        </button>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto max-h-[92vh]">

                            {loading ? (
                                <div className="grid md:grid-cols-2 gap-6 p-6">
                                    {/* Left: Image Skeleton */}
                                    <div>
                                        {/* Main Image Skeleton */}
                                        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-200 mb-4 animate-pulse" />

                                        {/* Thumbnail Gallery Skeleton */}
                                        <div className="grid grid-cols-4 gap-2">
                                            {[...Array(4)].map((_, i) => (
                                                <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right: Details Skeleton */}
                                    <div>
                                        {/* Title Skeleton */}
                                        <div className="h-9 bg-gray-200 rounded-lg w-3/4 mb-4 animate-pulse" />

                                        {/* Rating & Stats Skeleton */}
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                                        </div>

                                        {/* Tags Skeleton */}
                                        <div className="flex gap-2 mb-4">
                                            <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
                                            <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
                                            <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
                                        </div>

                                        {/* Description Skeleton */}
                                        <div className="space-y-2 mb-6">
                                            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                                            <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
                                        </div>

                                        {/* Customization Skeleton */}
                                        <div className="border-t border-gray-200 pt-4 mb-4">
                                            <div className="h-6 bg-gray-200 rounded w-48 mb-3 animate-pulse" />

                                            {/* Dropdown 1 */}
                                            <div className="mb-4">
                                                <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
                                                <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                                            </div>

                                            {/* Dropdown 2 */}
                                            <div className="mb-4">
                                                <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
                                                <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                                            </div>

                                            {/* Quantity */}
                                            <div className="mb-4">
                                                <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse" />
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                                                    <div className="w-12 h-6 bg-gray-200 rounded animate-pulse" />
                                                    <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price & Button Skeleton */}
                                        <div className="border-t border-gray-200 pt-4 mb-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <div className="h-3 bg-gray-200 rounded w-20 mb-2 animate-pulse" />
                                                    <div className="h-9 bg-gray-200 rounded w-32 animate-pulse" />
                                                </div>
                                            </div>
                                            <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                                        </div>

                                        {/* Reviews Skeleton */}
                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="h-6 bg-gray-200 rounded w-40 mb-3 animate-pulse" />
                                            <div className="space-y-3">
                                                {[...Array(2)].map((_, i) => (
                                                    <div key={i} className="bg-gray-100 rounded-lg p-3">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                                                        </div>
                                                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col lg:flex-row gap-6 p-6">
                                    {/* Left: Sticky Gallery - 40% width */}
                                    <div className="lg:w-2/5 flex-shrink-0">
                                        <div className="lg:sticky lg:top-6 space-y-4">
                                            {/* Carousel Gallery */}
                                            <Carousel className="w-full">
                                                <CarouselContent>
                                                    {images.length > 0 ? (
                                                        images.map((img, index) => (
                                                            <CarouselItem key={index}>
                                                                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                                                                    <Image
                                                                        src={img}
                                                                        alt={`${product?.name} - Image ${index + 1}`}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            </CarouselItem>
                                                        ))
                                                    ) : (
                                                        <CarouselItem>
                                                            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
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

                                            {/* Stats Card */}
                                            <div className="bg-gradient-to-br from-sai-pink/5 to-sai-pink/10 rounded-xl p-4 border border-sai-pink/20">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                                        <span className="font-bold text-lg">{product?.average_rating.toFixed(1)}</span>
                                                        <span className="text-gray-500 text-sm">({product?.review_count})</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-gray-500">Sold</div>
                                                        <div className="font-bold text-lg text-sai-charcoal">{product?.times_sold}</div>
                                                    </div>
                                                </div>

                                                {/* Customization Note */}
                                                <div className="pt-3 border-t border-sai-pink/20">
                                                    <p className="text-xs text-gray-600 leading-relaxed">
                                                        💡 <span className="font-medium">These are reference images!</span> Feel free to customize the design however you like, or request the exact same style. Your creativity, your choice! 🎨
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Scrollable Details - 60% width */}
                                    <div className="lg:w-3/5 flex-1 space-y-6">
                                        {/* Header */}
                                        <div className="mb-4">
                                            <h2 className="text-3xl font-serif font-bold text-sai-charcoal mb-2">
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
                                            <p className="text-sai-gray leading-relaxed">
                                                {product?.description}
                                            </p>
                                        </div>

                                        {/* Customization */}
                                        {product?.customizable && (
                                            <div className="border-t border-gray-200 pt-4 mb-4">
                                                <h3 className="font-semibold text-lg mb-3">Customize Your Order</h3>

                                                {/* Base Selection */}
                                                {baseOptions.length > 0 && (
                                                    <div className="mb-4">
                                                        <label className="block text-sm font-medium mb-2">Base Flavor *</label>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sai-pink focus:border-sai-pink hover:border-gray-400 transition-colors flex justify-between items-center text-left">
                                                                    <span className="text-sm">{selectedBase || "Select flavor..."}</span>
                                                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                                                                {baseOptions.map((opt) => (
                                                                    <DropdownMenuItem
                                                                        key={opt.id}
                                                                        onSelect={() => setSelectedBase(opt.option_name)}
                                                                        className="hover:bg-sai-pink/5 focus:bg-sai-pink/10 focus:text-sai-pink cursor-pointer"
                                                                    >
                                                                        {opt.option_name} {opt.is_premium && <span className="text-sai-pink ml-1">(Premium)</span>}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                )}

                                                {/* Frosting Selection */}
                                                {frostingOptions.length > 0 && (
                                                    <div className="mb-4">
                                                        <label className="block text-sm font-medium mb-2">Frosting *</label>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sai-pink focus:border-sai-pink hover:border-gray-400 transition-colors flex justify-between items-center text-left">
                                                                    <span className="text-sm">{selectedFrosting || "Select frosting..."}</span>
                                                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                                                                {frostingOptions.map((opt) => (
                                                                    <DropdownMenuItem
                                                                        key={opt.id}
                                                                        onSelect={() => setSelectedFrosting(opt.option_name)}
                                                                        className="hover:bg-sai-pink/5 focus:bg-sai-pink/10 focus:text-sai-pink cursor-pointer"
                                                                    >
                                                                        {opt.option_name} {opt.is_premium && <span className="text-sai-pink ml-1">(Premium)</span>}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                )}

                                                {/* Brownie Topping Selection */}
                                                {toppingOptions.length > 0 && (
                                                    <div className="mb-4">
                                                        <label className="block text-sm font-medium mb-2">
                                                            Add Topping <span className="text-gray-400 font-normal">(Optional, +RM 1)</span>
                                                        </label>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sai-pink focus:border-sai-pink hover:border-gray-400 transition-colors flex justify-between items-center text-left">
                                                                    <span className="text-sm">
                                                                        {selectedTopping === 'None' ? 'No topping (RM 3/pc)' :
                                                                            selectedTopping ? `${selectedTopping} (+RM 1.00)` : 'Select topping...'}
                                                                    </span>
                                                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                                                                <DropdownMenuItem
                                                                    onSelect={() => setSelectedTopping('None')}
                                                                    className="hover:bg-sai-pink/5 focus:bg-sai-pink/10 focus:text-sai-pink cursor-pointer"
                                                                >
                                                                    No topping (RM 3/pc)
                                                                </DropdownMenuItem>
                                                                {toppingOptions.map((opt) => (
                                                                    <DropdownMenuItem
                                                                        key={opt.id}
                                                                        onSelect={() => setSelectedTopping(opt.option_name)}
                                                                        className="hover:bg-sai-pink/5 focus:bg-sai-pink/10 focus:text-sai-pink cursor-pointer"
                                                                    >
                                                                        {opt.option_name} <span className="text-sai-pink ml-1">(+RM {opt.price_modifier.toFixed(2)})</span>
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                )}

                                                {/* Dietary Options (Checkboxes) */}
                                                {dietaryOptions.length > 0 && (
                                                    <div className="mb-4">
                                                        <label className="block text-sm font-medium mb-2">Dietary Options</label>
                                                        <div className="space-y-2">
                                                            {dietaryOptions.map((opt) => (
                                                                <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
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
                                                                        className="w-4 h-4 text-sai-pink border-gray-300 rounded focus:ring-sai-pink"
                                                                    />
                                                                    <span className="text-sm">
                                                                        {opt.option_name}
                                                                        {opt.is_premium ? (
                                                                            <span className="text-sai-pink ml-1">(+RM {opt.price_modifier.toFixed(2)})</span>
                                                                        ) : (
                                                                            <span className="text-green-600 ml-1">(Free)</span>
                                                                        )}
                                                                    </span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}


                                                {/* Design Notes */}
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium mb-2">
                                                        Design Notes <span className="text-gray-400 font-normal">(Optional)</span>
                                                    </label>
                                                    <textarea
                                                        value={designNotes}
                                                        onChange={(e) => setDesignNotes(e.target.value)}
                                                        placeholder="Describe your desired design, colors, themes, or any special requests..."
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sai-pink focus:border-sai-pink min-h-[100px] resize-none"
                                                        maxLength={500}
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {designNotes.length}/500 characters
                                                    </p>
                                                </div>

                                                {/* Quantity */}
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium mb-2">Quantity</label>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                            className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-12 text-center font-semibold">{quantity}</span>
                                                        <button
                                                            onClick={() => setQuantity(quantity + 1)}
                                                            className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Price & Add to Cart */}
                                        <div className="border-t border-gray-200 pt-4 mb-6">
                                            <div className="flex items-center justify-between mb-4">
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
                                            <button className="w-full bg-sai-pink text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                                                <ShoppingCart className="w-5 h-5" />
                                                Add to Cart
                                            </button>
                                        </div>

                                        {/* Reviews */}
                                        {reviews.length > 0 && (
                                            <div className="border-t border-gray-200 pt-4">
                                                <h3 className="font-semibold text-lg mb-3">Customer Reviews</h3>
                                                <div className="space-y-3">
                                                    {reviews.map((review) => (
                                                        <div key={review.id} className="bg-gray-50 rounded-lg p-3">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="flex">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            className={`w-4 h-4 ${i < review.rating
                                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                                : 'text-gray-300'
                                                                                }`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <span className="text-sm font-medium">
                                                                    {review.profiles?.first_name || 'Anonymous'}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600">{review.comment}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
