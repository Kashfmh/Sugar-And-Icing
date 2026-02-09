'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface AuthGuardState {
    isLoading: boolean;
    isAuthenticated: boolean;
    userId: string | null;
}

export function useAuthGuard() {
    const router = useRouter();
    const [state, setState] = useState<AuthGuardState>({
        isLoading: true,
        isAuthenticated: false,
        userId: null,
    });

    useEffect(() => {
        const supabase = createClient();

        async function checkAuthentication() {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    setState({
                        isLoading: false,
                        isAuthenticated: false,
                        userId: null,
                    });
                    router.push('/login');
                    return;
                }

                setState({
                    isLoading: false,
                    isAuthenticated: true,
                    userId: session.user.id,
                });
            } catch (error) {
                console.error('Auth check failed:', error);
                setState({
                    isLoading: false,
                    isAuthenticated: false,
                    userId: null,
                });
                router.push('/login');
            }
        }

        checkAuthentication();
    }, [router]);

    return state;
}