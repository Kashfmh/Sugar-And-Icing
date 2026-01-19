'use client';

import { ReactNode, useEffect, useState } from 'react';
import { validateSession } from '@/lib/services/authService';
import LoadingScreen from '@/app/components/LoadingScreen';
import { useRouter } from 'next/navigation';

export default function ProfileLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [isAuthed, setIsAuthed] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (isChecking) {
            document.body.style.overflow = 'hidden';
            const navbar = document.querySelector('[data-navbar]');
            const footer = document.querySelector('footer');
            const bottomNav = document.querySelector('[data-bottom-nav]');
            
            if (navbar) navbar.style.display = 'none';
            if (footer) footer.style.display = 'none';
            if (bottomNav) bottomNav.style.display = 'none';

            return () => {
                document.body.style.overflow = 'auto';
                if (navbar) navbar.style.display = '';
                if (footer) footer.style.display = '';
                if (bottomNav) bottomNav.style.display = '';
            };
        }
    }, [isChecking]);

    async function checkAuth() {
        try {
            const session = await validateSession();
            if (!session) {
                setIsChecking(false);
                router.push('/login');
                return;
            }
            setIsAuthed(true);
            setIsChecking(false);
        } catch (error) {
            setIsChecking(false);
            router.push('/login');
        }
    }

    if (isChecking) {
        return <LoadingScreen />;
    }

    if (!isAuthed) {
        return null;
    }

    return <>{children}</>;
}
