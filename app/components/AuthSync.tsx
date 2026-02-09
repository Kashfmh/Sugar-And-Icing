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
        // 1. Just sync the cart on mount. No router refresh.
        syncWithUser()

        // 2. Listen for AUTH events
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {

            // LOGIC:
            // - If SIGNED_IN: Just sync the cart. DO NOT REFRESH.
            // - If TOKEN_REFRESHED: Just sync the cart. DO NOT REFRESH.
            // - If SIGNED_OUT: Clear cart, Refresh Router (to protect data), and Redirect.

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user) {
                    syncWithUser()
                }
            }
            else if (event === 'SIGNED_OUT') {
                useCart.getState().clearCart()
                router.refresh() // Valid use case: clear sensitive data from screen
                router.push('/') // Send to home
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [router, syncWithUser, supabase])

    return null
}