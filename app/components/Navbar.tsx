'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AnimatePresence, motion } from 'motion/react';
import {
    Navbar as AceternityNavbar,
    NavBody,
    NavItems,
    MobileNav,
    MobileNavHeader,
    MobileNavMenu,
    MobileNavToggle,
} from '@/components/ui/resizable-navbar';
import { useCart } from '@/hooks/useCart';
// import CartDrawer from './CartDrawer';

export default function Navbar() {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        supabase.auth.getUser().then(({ data }) => setUser(data.user));

        // Track scroll for text change
        const handleScroll = () => setScrolled(window.scrollY > 100);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User';

    const navItems = [
        { name: 'Home', link: '/' },
        { name: 'Custom Cakes', link: '/custom-cakes' },
        { name: 'Other Treats', link: '/other-treats' },
        { name: 'Contact', link: '/contact' },
    ];

    return (
        <AceternityNavbar className="top-2 text-sai-charcoal">
            {/* Desktop Navbar */}
            <NavBody>
                <Link href="/" className="relative z-20 mr-4 flex items-center space-x-8 px-2 py-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={'pink'}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Image
                                src={'/images/logo/icon-pink.svg'}
                                alt="Sugar And Icing"
                                width={35}
                                height={35}
                                className="rounded-lg"
                            />
                        </motion.div>
                    </AnimatePresence>
                    <span className={`font-semibold text-base relative overflow-hidden text-sai-charcoal`}>
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={isMounted && scrolled ? 'sai' : 'full'}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className="inline-block"
                            >
                                {isMounted && scrolled ? 'SAI' : 'Sugar And Icing'}
                            </motion.span>
                        </AnimatePresence>
                    </span>
                </Link>

                {/* Nav Items */}
                <NavItems items={navItems} pathname={pathname} />

                {/* CTA Buttons */}
                <div className="relative z-20 flex items-center gap-4">
                    {/* Cart Trigger */}
                    <CartTriggerButton pathname={pathname} />

                    {!isMounted ? (
                        /* Skeleton for Profile/Login */
                        <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                    ) : user ? (
                        <Link href="/profile">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:opacity-80 transition-all ${pathname === '/profile' ? 'bg-sai-pink ring-2 ring-sai-pink/30' : 'bg-sai-pink'
                                }`}>
                                {firstName[0]?.toUpperCase()}
                            </div>
                        </Link>
                    ) : (
                        <Link href="/login" className="group">
                            <User className={`w-5 h-5 transition-colors ${pathname === '/login' ? 'text-sai-pink' : 'text-sai-charcoal group-hover:text-sai-pink'
                                }`} strokeWidth={2} />
                        </Link>
                    )}
                </div>
            </NavBody >

            {/* Mobile Navbar */}
            < MobileNav >
                <MobileNavHeader>
                    <Link href="/" className="flex items-center space-x-2 px-2 py-1">
                        <Image
                            src="/icon.svg"
                            alt="Sugar And Icing"
                            width={52}
                            height={52}
                            className="rounded-lg"
                        />
                        <span className="font-semibold text-base text-sai-charcoal relative overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={isMounted && scrolled ? 'sai' : 'full'}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="inline-block"
                                >
                                    {isMounted && scrolled ? 'SAI' : 'Sugar And Icing'}
                                </motion.span>
                            </AnimatePresence>
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <CartTriggerButton pathname={pathname} />
                        <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
                    </div>
                </MobileNavHeader>

                <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
                    {navItems.map((item, idx) => (
                        <Link
                            key={`mobile-${idx}`}
                            href={item.link}
                            onClick={() => setIsOpen(false)}
                            className="text-sm font-medium text-neutral-600 hover:text-sai-pink transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="border-t border-gray-200 pt-4 mt-4 w-full flex flex-col gap-3">
                        {user ? (
                            <>
                                <Link
                                    href="/profile"
                                    onClick={() => setIsOpen(false)}
                                    className="text-sm font-medium text-neutral-600 hover:text-sai-pink transition-colors"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="text-sm font-medium text-neutral-600 hover:text-sai-pink transition-colors text-left"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setIsOpen(false)}
                                className="text-sm font-medium text-neutral-600 hover:text-sai-pink transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </MobileNavMenu>
            </MobileNav >
            {/* <CartDrawer /> */}
        </AceternityNavbar >
    );
}

// Separate component to avoid hydration issues if needed, or just cleaner code
function CartTriggerButton({ pathname }: { pathname?: string }) {
    const { totalItems, isLoading } = useCart();

    // During hydration or loading, don't show count badge to prevent flicker 0 -> N
    // Or show a small skeleton dot if critical?
    // User requested: "loses its number indicator... fix this"
    // If we just hide the Badge until loaded, it won't "flash" 0 then N.
    // It will be empty then pop N.

    // Wait, useCart uses `persist`. If hydration is instant (localStorage), 
    // `isLoading` goes false very fast.

    // Issue: "loses its number indicator... for a split second"
    // This happens because `isLoading` is likely FALSE initially (default state) -> Wait, I set default to TRUE in previous step.
    // So now it should be consistent.

    const count = totalItems();

    // If loading, we might show a small pulse or just the icon without badge?
    // If I show badge '0' while loading, that is the bug.
    // So I only show badge if !isLoading.

    return (
        <Link href="/cart" className="relative group p-1" aria-label="Open cart">
            <ShoppingBag className={`w-5 h-5 transition-colors ${pathname === '/cart' ? 'text-sai-pink' : 'text-sai-charcoal group-hover:text-sai-pink'
                }`} strokeWidth={2} />
            {!isLoading && count > 0 && (
                <span className="absolute -top-1 -right-1 bg-sai-pink text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                    {count}
                </span>
            )}
        </Link>
    );
}
