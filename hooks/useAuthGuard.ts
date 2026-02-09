'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface AuthGuardState {
    isLoading: boolean
    isAuthenticated: boolean
    userId: string | null
}

export function useAuthGuard() {
    const router = useRouter()
    const [state, setState] = useState<AuthGuardState>({
        isLoading: true,
        isAuthenticated: false,
        userId: null,
    })

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (!session) {
                    setState({ isLoading: false, isAuthenticated: false, userId: null })
                    router.push('/login')
                    return
                }

                setState({
                    isLoading: false,
                    isAuthenticated: true,
                    userId: session.user.id,
                })
            } catch (error) {
                console.error('Auth guard check failed:', error)
                setState({ isLoading: false, isAuthenticated: false, userId: null })
                router.push('/login')
            }
        }

        checkAuth()
    }, [router])

    return state
}