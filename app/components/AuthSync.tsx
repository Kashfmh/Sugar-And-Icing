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

        return () => {
            subscription.unsubscribe();
        }
    }, [syncWithUser]);

    return null;
}
