'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Star, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AllergenBadge from './AllergenBadge';
import { motion, AnimatePresence } from 'motion/react';
import Counter from './Counter';

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

    const images = [
        product?.image_url,
        ...(product?.gallery_images || [])
    ].filter(Boolean);

    const baseOptions = options.filter(opt => opt.option_category === 'base');
    const frostingOptions = options.filter(opt => opt.option_category === 'frosting');

    const calculatePrice = () => {
        if (!product) return 0;

        const selectedBaseOption = baseOptions.find(opt => opt.option_name === selectedBase);
        const selectedFrostingOption = frostingOptions.find(opt => opt.option_name === selectedFrosting);

        const isPremium = selectedBaseOption?.is_premium || selectedFrostingOption?.is_premium;
        const basePrice = isPremium && product.premium_price ? product.premium_price : product.base_price;

        return basePrice * quantity;
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
                                            {/* Main Image */}
                                            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
                                                {images.length > 0 ? (
                                                    <>
                                                        <Image
                                                            src={images[currentImageIndex]}
                                                            alt={product?.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                        {images.length > 1 && (
                                                            <>
                                                                <button
                                                                    onClick={prevImage}
                                                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
                                                                >
                                                                    <ChevronLeft className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={nextImage}
                                                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
                                                                >
                                                                    <ChevronRight className="w-5 h-5" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-400">
                                                        No image
                                                    </div>
                                                )}
                                            </div>

                                            {/* Thumbnail Gallery */}
                                            {images.length > 1 && (
                                                <div className="grid grid-cols-4 gap-2">
                                                    {images.map((img, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setCurrentImageIndex(idx)}
                                                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-sai-pink' : 'border-transparent'
                                                                }`}
                                                        >
                                                            <Image src={img} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Stats Card */}
                                            <div className="bg-gradient-to-br from-sai-pink/5 to-sai-pink/10 rounded-xl p-4 border border-sai-pink/20">
                                                <div className="flex items-center justify-between">
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

                                            {/* Rating & Stats */}
                                            <div className="flex items-center gap-4 text-sm mb-3">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="font-semibold">{product?.average_rating.toFixed(1)}</span>
                                                    <span className="text-gray-500">({product?.review_count} reviews)</span>
                                                </div>
                                                <div className="text-gray-500">
                                                    {product?.times_sold} sold
                                                </div>
                                            </div>

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
                                                        <label className="block text-sm font-medium mb-2">Base Flavor</label>
                                                        <select
                                                            value={selectedBase}
                                                            onChange={(e) => setSelectedBase(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sai-pink focus:border-sai-pink"
                                                        >
                                                            <option value="">Select flavor...</option>
                                                            {baseOptions.map((opt) => (
                                                                <option key={opt.id} value={opt.option_name}>
                                                                    {opt.option_name} {opt.is_premium && '(Premium)'}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                {/* Frosting Selection */}
                                                {frostingOptions.length > 0 && (
                                                    <div className="mb-4">
                                                        <label className="block text-sm font-medium mb-2">Frosting</label>
                                                        <select
                                                            value={selectedFrosting}
                                                            onChange={(e) => setSelectedFrosting(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sai-pink focus:border-sai-pink"
                                                        >
                                                            <option value="">Select frosting...</option>
                                                            {frostingOptions.map((opt) => (
                                                                <option key={opt.id} value={opt.option_name}>
                                                                    {opt.option_name} {opt.is_premium && '(Premium)'}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

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
                                            <button className="w-full bg-sai-pink text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                                                <ShoppingCart className="w-5 h-5" />
                                                Add to Cart
                                            </button>
                                        </div>

                                        {/* Reviews */}
                                        {reviews.length > 0 && (
                                            <div className="border-t border-gray-200 pt-4">
                                                <h3 className="font-semibold text-lg mb-3">Customer Reviews</h3>
                                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                                    {reviews.map((review: any) => (
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
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
