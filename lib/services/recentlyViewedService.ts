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
    } | null;
}

export async function trackProductView(userId: string, productId: string): Promise<void> {

    try {
        const dataToInsert = {
            user_id: userId,
            product_id: productId,
            viewed_at: new Date().toISOString()
        };

        const { data: upsertData, error: upsertError } = await (supabase as any)
            .from('recently_viewed')
            .upsert(dataToInsert, {
                onConflict: 'user_id,product_id'
            })
            .select();

        if (upsertError) {
            console.error('[trackProductView] UPSERT ERROR:', upsertError);
            return;
        }

        console.log('[trackProductView] Upsert successful, result:', upsertData);

        const { data: allViewed, error: fetchError } = await (supabase as any)
            .from('recently_viewed')
            .select('id')
            .eq('user_id', userId)
            .order('viewed_at', { ascending: false });

        console.log('[trackProductView] Current count:', allViewed?.length);

        if (fetchError) {
            console.error('[trackProductView] FETCH ERROR:', fetchError);
            return;
        }

        if (allViewed && allViewed.length > 10) {
            const toDelete = allViewed.slice(10).map((item: any) => item.id);
            console.log('[trackProductView] Deleting old items:', toDelete.length);

            const { error: deleteError } = await (supabase as any)
                .from('recently_viewed')
                .delete()
                .in('id', toDelete);

            if (deleteError) {
                console.error('[trackProductView] DELETE ERROR:', deleteError);
            }
        }

        console.log('[trackProductView] COMPLETE');
    } catch (error) {
        console.error('[trackProductView] EXCEPTION:', error);
    }
}

export async function getRecentlyViewed(
    userId: string,
    limit: number = 10
): Promise<RecentlyViewedProduct[]> {
    try {
        const { data, error } = await (supabase as any)
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
