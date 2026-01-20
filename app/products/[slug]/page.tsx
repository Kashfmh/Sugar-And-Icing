'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/hooks/useCart';
import Image from 'next/image';
import { Star, ShoppingCart, ArrowLeft, ChevronDown, Check } from 'lucide-react';
import Link from 'next/link';
import AllergenBadge from '@/app/components/AllergenBadge';
import Counter from '@/app/components/Counter';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductSkeleton } from '@/app/components/skeletons/ProductSkeleton';

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

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    // Extract product ID from slug
    const parts = slug?.split('-') || [];
    const productId = parts.length >= 5 ? parts.slice(-5).join('-') : '';

    const { addItem, toggleCart } = useCart();

    const [product, setProduct] = useState<any>(null);
    const [options, setOptions] = useState<ProductOption[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBase, setSelectedBase] = useState<string>('');
    const [selectedFrosting, setSelectedFrosting] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [designNotes, setDesignNotes] = useState('');
    const [selectedTopping, setSelectedTopping] = useState<string>('None');
    const [selectedDietaryOptions, setSelectedDietaryOptions] = useState<string[]>([]);
    const [isAdded, setIsAdded] = useState(false);

    useEffect(() => {
        if (productId) {
            fetchProductDetails();
        }
    }, [productId]);


    async function fetchProductDetails() {
        setLoading(true);
        try {
            // Fetch product
            const { data: productData, error: productError } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (productError || !productData) {
                notFound();
                return;
            }

            setProduct(productData);

            // Track product view for logged-in users (database)
            // Following MVC - using service layer
            try {
                const { data: { user } } = await supabase.auth.getUser();

                console.log('[Product View] User:', user?.id, 'Product:', productData.id);

                if (user) {
                    // Logged-in user: track in database
                    const { trackProductView } = await import('@/lib/services/recentlyViewedService');
                    await trackProductView(user.id, productData.id);
                    console.log('[Product View] Tracked successfully');
                } else {
                    console.log('[Product View] Guest user - not tracking');
                }
                // Guests: no tracking (as requested)
            } catch (e) {
                console.error('[Product View] Error tracking:', e);
            }

            // Fetch options if customizable
            if (productData.customizable) {
                const { data: optionsData } = await supabase
                    .from('product_options')
                    .select('*')
                    .eq('product_type', productData.product_type);

                setOptions(optionsData || []);
            }

            // Fetch reviews
            const { data: reviewsData } = await supabase
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

            if (reviewsData) {
                const transformedReviews = reviewsData.map((review: any) => ({
                    ...review,
                    profiles: Array.isArray(review.profiles) ? review.profiles[0] : review.profiles
                }));
                setReviews(transformedReviews);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    }

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

        let total = basePrice * quantity;

        // Add dietary costs per unit
        selectedDietaryOptions.forEach(dietaryName => {
            const dietaryOption = dietaryOptions.find(opt => opt.option_name === dietaryName);
            if (dietaryOption) {
                total += (dietaryOption.price_modifier * quantity);
            }
        });

        return total;
    };

    const handleAddToCart = () => {
        if (!product) return;

        const finalPrice = calculatePrice();

        // For individual items (not bulk sets like cupcakes 6/12), unit price needs to be derived
        let unitPriceForCart = 0;

        if (product.product_type === 'cupcake_basic' || product.product_type === 'cupcake_premium') {
            // Basic unit price calculation
            unitPriceForCart = finalPrice / quantity;
        } else {
            // Standard items
            unitPriceForCart = finalPrice / quantity;
        }

        const metadata = {
            base: selectedBase,
            frosting: selectedFrosting,
            topping: selectedTopping,
            dietary: selectedDietaryOptions,
            design_notes: designNotes
        };

        // Create a unique ID for this specific customization to separate it in the cart
        const customId = `${product.id}-${JSON.stringify(metadata)}-${unitPriceForCart}`;

        addItem({
            id: customId,
            productId: product.id,
            name: product.name,
            price: unitPriceForCart,
            image_url: product.image_url,
            quantity: quantity,
            description: product.description,
            category: product.category_name,
            metadata: metadata
        });

        // Visual Feedback
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000); // Reset after 2 seconds
    };



    if (loading) {
        return (
            <main className="min-h-screen bg-white md:pt-28">
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 md:hidden">
                    <Link href="/other-treats" className="inline-flex items-center gap-2 text-sai-charcoal">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </Link>
                </div>
                <div className="max-w-4xl mx-auto p-4 pb-8">
                    <ProductSkeleton />
                </div>
            </main>
        );
    }

    if (!product) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white md:pt-28">
            {/* Mobile Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 md:hidden">
                <Link href="/other-treats" className="inline-flex items-center gap-2 text-sai-charcoal">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back</span>
                </Link>
            </div>

            <div className="max-w-4xl mx-auto p-4 pb-8">
                {/* Image Gallery with Carousel */}
                <div className="mb-6">
                    <Carousel className="w-full">
                        <CarouselContent>
                            {images.length > 0 ? (
                                images.map((img, index) => (
                                    <CarouselItem key={index}>
                                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
                                            <Image
                                                src={img}
                                                alt={`${product.name} - Image ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </CarouselItem>
                                ))
                            ) : (
                                <CarouselItem>
                                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg flex items-center justify-center">
                                        <span className="text-gray-400">No image</span>
                                    </div>
                                </CarouselItem>
                            )}
                        </CarouselContent>
                        {images.length > 1 && (
                            <>
                                <CarouselPrevious className="left-3" />
                                <CarouselNext className="right-3" />
                            </>
                        )}
                    </Carousel>
                </div>

                {/* Product Info */}
                <div className="space-y-4">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-sai-charcoal mb-2">
                            {product.name}
                        </h1>

                        {/* Stats */}
                        <div className="bg-gradient-to-br from-sai-pink/5 to-sai-pink/10 rounded-xl p-4 border border-sai-pink/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-bold text-lg">{product.average_rating.toFixed(1)}</span>
                                    <span className="text-gray-500 text-sm">({product.review_count})</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500">Sold</div>
                                    <div className="font-bold text-lg text-sai-charcoal">{product.times_sold}</div>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                                {product.tags.slice(0, 2).map((tag: string) => (
                                    <AllergenBadge key={tag} tag={tag} />
                                ))}
                                {product.tags.length > 2 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                        +{product.tags.length - 2} more
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Description */}
                        <p className="text-sai-gray leading-relaxed mt-4">
                            {product.description}
                        </p>
                    </div>

                    {/* Customization */}
                    {product.customizable && (
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="font-semibold text-lg mb-3">Customize Your Order</h3>

                            {baseOptions.length > 0 && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Base Flavor *</label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex justify-between items-center text-left">
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

                            {frostingOptions.length > 0 && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Frosting *</label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex justify-between items-center text-left">
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
                                            <button className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex justify-between items-center text-left">
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
                                                    className="w-4 h-4 text-sai-pink border-gray-300 rounded"
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


                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Quantity</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50"
                                    >
                                        -
                                    </button>
                                    <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

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

                            {/* Price and Add to Cart - Inline */}
                            <div className="border-t border-gray-200 pt-4 space-y-4">
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

                                <button
                                    disabled={
                                        (baseOptions.length > 0 && !selectedBase) ||
                                        (frostingOptions.length > 0 && !selectedFrosting) ||
                                        isAdded
                                    }
                                    onClick={handleAddToCart}
                                    className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${(baseOptions.length > 0 && !selectedBase) ||
                                        (frostingOptions.length > 0 && !selectedFrosting)
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : isAdded
                                            ? 'bg-green-600 text-white'
                                            : 'bg-sai-pink text-white hover:opacity-90 active:scale-95'
                                        }`}
                                >
                                    {isAdded ? (
                                        <>
                                            <Check className="w-5 h-5" />
                                            <span>Added to Cart!</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-5 h-5" />
                                            {(baseOptions.length > 0 && !selectedBase) || (frostingOptions.length > 0 && !selectedFrosting)
                                                ? 'Select Options First'
                                                : 'Add to Cart'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Reviews */}
                    {reviews.length > 0 && (
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="font-semibold text-lg mb-3">Customer Reviews</h3>
                            <div className="space-y-3">
                                {reviews.map((review) => (
                                    <div key={review.id} className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3 h-3 ${i < review.rating
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
        </main>
    );
}
