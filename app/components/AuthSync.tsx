'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/hooks/useCart'

export default function AuthSync() {
    const router = useRouter()
    const { syncWithUser } = useCart()
    const initialMount = useRef(true)

    useEffect(() => {
        syncWithUser()

        let currentAccessToken: string | undefined

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (initialMount.current) {
                initialMount.current = false
                currentAccessToken = session?.access_token
                return
            }

            const newAccessToken = session?.access_token

            if (currentAccessToken !== newAccessToken) {
                currentAccessToken = newAccessToken

                if (event === 'SIGNED_OUT') {
                    useCart.getState().clearCart()
                } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    syncWithUser()
                }

                router.refresh()
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [router, syncWithUser])

    return null
}