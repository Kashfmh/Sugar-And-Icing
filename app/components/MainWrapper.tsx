'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function MainWrapper({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    // Homepage doesn't need bottom padding (full screen, no scroll)
    const needsPadding = pathname !== '/';

    return (
        <main className={`min-h-screen ${needsPadding ? 'pb-28 md:pb-0' : ''}`}>
            {children}
        </main>
    );
}
