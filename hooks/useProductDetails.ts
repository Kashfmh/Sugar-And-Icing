import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export interface ProductOption {
    id: string;
    option_category: string;
    option_name: string;
    is_premium: boolean;
    price_modifier: number;
    description?: string;
}

export interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    profiles?: {
        first_name: string;
    } | null;
}

export function useProductDetails(slug: string) {
    const [product, setProduct] = useState<any>(null);
    const [options, setOptions] = useState<ProductOption[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // Extract product ID from slug
    const parts = slug?.split('-') || [];
    const productId = parts.length >= 5 ? parts.slice(-5).join('-') : '';

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
                // Return null product to let page handle 404
                setProduct(null);
                setLoading(false);
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

            // Track view
            trackView(productId);

        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    }

    async function trackView(pid: string) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { trackProductView } = await import('@/lib/services/recentlyViewedService');
                await trackProductView(user.id, pid);
            }
        } catch (e) {
            console.error('[Product View] Error tracking:', e);
        }
    }

    return { product, options, reviews, loading };
}
