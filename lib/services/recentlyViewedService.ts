import { supabase } from '@/lib/supabase';

export interface RecentlyViewedProduct {
    id: string;
    user_id: string;
    product_id: string;
    viewed_at: string;
    products: {
        id: string;
        name: string;
        image_url: string;
        base_price: number;
    } | null;  // Single object, not array (Supabase returns single related row)
}

/**
 * Track a product view for logged-in user
 * Following MVC - Controller layer for business logic
 */
export async function trackProductView(userId: string, productId: string): Promise<void> {
    try {
        // Upsert to recently_viewed (update timestamp if already exists)
        const { error: upsertError } = await supabase
            .from('recently_viewed')
            .upsert({
                user_id: userId,
                product_id: productId,
                viewed_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,product_id'
            });

        if (upsertError) {
            console.error('Error tracking product view:', upsertError);
            return;
        }

        // Keep only last 10 items
        const { data: allViewed } = await supabase
            .from('recently_viewed')
            .select('id')
            .eq('user_id', userId)
            .order('viewed_at', { ascending: false });

        if (allViewed && allViewed.length > 10) {
            const toDelete = allViewed.slice(10).map(item => item.id);
            await supabase
                .from('recently_viewed')
                .delete()
                .in('id', toDelete);
        }
    } catch (error) {
        console.error('Error in trackProductView:', error);
    }
}

/**
 * Get recently viewed products for a user
 * Following MVC - Controller layer
 */
export async function getRecentlyViewed(
    userId: string,
    limit: number = 10
): Promise<RecentlyViewedProduct[]> {
    try {
        const { data, error } = await supabase
            .from('recently_viewed')
            .select(`
                id,
                user_id,
                product_id,
                viewed_at,
                products (
                    id,
                    name,
                    image_url,
                    base_price
                )
            `)
            .eq('user_id', userId)
            .order('viewed_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching recently viewed:', error);
            return [];
        }

        // Filter out any items with null products (deleted products) and cast properly
        return ((data || []) as any[])
            .filter(item => item.products !== null)
            .map(item => ({
                ...item,
                products: Array.isArray(item.products) ? item.products[0] : item.products
            })) as RecentlyViewedProduct[];
    } catch (error) {
        console.error('Error in getRecentlyViewed:', error);
        return [];
    }
}
