'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AllergenBadge from '@/app/components/AllergenBadge';
import Counter from '@/app/components/Counter';

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
    const slug = params.slug as string;

    // Extract product ID from slug (everything after last segment of name)
    // Format: "cupcakes-12-pieces-uuid-goes-here" -> "uuid-goes-here" 
    const parts = slug?.split('-') || [];
    // UUID is always last 5 segments (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx split by hyphens)
    const productId = parts.length >= 5 ? parts.slice(-5).join('-') : '';

    const [product, setProduct] = useState<any>(null);
    const [options, setOptions] = useState<ProductOption[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedBase, setSelectedBase] = useState<string>('');
    const [selectedFrosting, setSelectedFrosting] = useState<string>('');
    const [quantity, setQuantity] = useState(1);

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sai-pink"></div>
            </div>
        );
    }

    if (!product) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white">
            {/* Mobile Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
                <Link href="/other-treats" className="inline-flex items-center gap-2 text-sai-charcoal">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back</span>
                </Link>
            </div>

            <div className="max-w-4xl mx-auto p-4 pb-8">
                {/* Image Gallery */}
                <div className="mb-6">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg mb-3">
                        {images.length > 0 ? (
                            <>
                                <Image
                                    src={images[currentImageIndex]}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all shadow-lg"
                                        >
                                            <ChevronLeft className="w-5 h-5 text-sai-charcoal" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all shadow-lg"
                                        >
                                            <ChevronRight className="w-5 h-5 text-sai-charcoal" />
                                        </button>
                                        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm font-medium">
                                            {currentImageIndex + 1} / {images.length}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                No image
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx
                                        ? 'border-sai-pink'
                                        : 'border-gray-200'
                                        }`}
                                >
                                    <Image src={img} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
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
                                {product.tags.map((tag: string) => (
                                    <AllergenBadge key={tag} tag={tag} />
                                ))}
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
                                    <select
                                        value={selectedBase}
                                        onChange={(e) => setSelectedBase(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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

                            {frostingOptions.length > 0 && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Frosting *</label>
                                    <select
                                        value={selectedFrosting}
                                        onChange={(e) => setSelectedFrosting(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                                        (frostingOptions.length > 0 && !selectedFrosting)
                                    }
                                    className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${(baseOptions.length > 0 && !selectedBase) ||
                                        (frostingOptions.length > 0 && !selectedFrosting)
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-sai-pink text-white hover:opacity-90'
                                        }`}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {(baseOptions.length > 0 && !selectedBase) || (frostingOptions.length > 0 && !selectedFrosting)
                                        ? 'Select Options First'
                                        : 'Add to Cart'}
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
