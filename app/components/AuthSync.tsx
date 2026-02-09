'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/hooks/useCart';

export default function AuthSync() {
    const { syncWithUser } = useCart();

    useEffect(() => {
        syncWithUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                syncWithUser();
            } else if (event === 'SIGNED_OUT') {
                useCart.getState().clearCart();
            }
        });

        // Refresh session when tab becomes visible again
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible') {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (session && !error) {
                    // Trigger a token refresh if needed
                    await supabase.auth.refreshSession();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            subscription.unsubscribe();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
    }, [syncWithUser]);

    return null;
}
