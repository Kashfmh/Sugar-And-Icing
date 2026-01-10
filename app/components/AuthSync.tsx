'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/hooks/useCart';

export default function AuthSync() {
    const { syncWithUser } = useCart();

    useEffect(() => {
        // Initial sync
        syncWithUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                syncWithUser();
            } else if (event === 'SIGNED_OUT') {
                // Optional: Clear cart or revert to empty?
                // For now, let's clear it to avoid showing previous user's cart
                useCart.getState().clearCart();
            }
        });

        return () => {
            subscription.unsubscribe();
        }
    }, [syncWithUser]);

    return null;
}
