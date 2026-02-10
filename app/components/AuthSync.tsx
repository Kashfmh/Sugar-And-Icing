'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/hooks/useCart'

export default function AuthSync() {
    const router = useRouter()
    const { syncWithUser } = useCart()
    const supabase = createClient()

    useEffect(() => {
        // 1. Initial Cart Sync
        syncWithUser()

        // Channel reference for cleanup
        let realtimeChannel: any = null;

        const setupRealtime = async (user: any) => {
            if (!user?.id) return;

            // Remove existing channel if any
            if (realtimeChannel) {
                supabase.removeChannel(realtimeChannel);
            }

            realtimeChannel = supabase
                .channel('global-user-changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'cart_items',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        syncWithUser();
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'profiles',
                        filter: `id=eq.${user.id}`
                    },
                    () => {
                        window.dispatchEvent(new Event('profile-updated'));
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'addresses',
                        filter: `user_id=eq.${user.id}`
                    },
                    () => {
                        window.dispatchEvent(new Event('profile-updated'));
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    () => {
                        window.dispatchEvent(new Event('notifications-updated'));
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'special_occasions',
                        filter: `user_id=eq.${user.id}`
                    },
                    () => {
                        window.dispatchEvent(new Event('profile-updated'));
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: 'DELETE',
                        schema: 'public',
                        table: 'profiles',
                        filter: `id=eq.${user.id}`
                    },
                    async () => {
                        console.log('Account deleted, signing out...');
                        await supabase.auth.signOut();
                        useCart.getState().clearCart();
                        router.replace('/');
                        window.location.reload(); // Force reload to clear all states
                    }
                )
                .subscribe();
        };

        // 2. Listen for AUTH events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user) {
                    syncWithUser()
                    setupRealtime(session.user)
                }
            }
            else if (event === 'SIGNED_OUT') {
                if (realtimeChannel) supabase.removeChannel(realtimeChannel)
                useCart.getState().clearCart()
                router.refresh()
                router.push('/')
            }
        })

        // Initial setup if already logged in
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setupRealtime(user);
        });

        // 3. Global Focus Listener (Refetch on Tab Switch)
        const handleFocus = () => {
            // Force check cart
            syncWithUser();
            // Force components to re-fetch
            window.dispatchEvent(new Event('profile-updated'));
            window.dispatchEvent(new Event('notifications-updated'));
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            subscription.unsubscribe()
            if (realtimeChannel) supabase.removeChannel(realtimeChannel)
            window.removeEventListener('focus', handleFocus);
        }
    }, [])

    return null
}