'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Bell } from 'lucide-react';
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

export default function Navbar() {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data } = await (supabase as any).from('profiles').select('avatar_url').eq('id', userId).single();
            if (data) {
                setAvatarUrl(data.avatar_url);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    useEffect(() => {
        setIsMounted(true);

        const getUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
                if (user) {
                    await fetchProfile(user.id);
                }
            } catch (error) {
                console.error('Auth check failed', error);
            } finally {
                setAuthLoading(false);
            }
        };

        getUser();

        // listen for profile updates
        const handleProfileUpdate = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await fetchProfile(user.id);
            }
        };
        window.addEventListener('profile-updated', handleProfileUpdate);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            const currentUser = session?.user ?? null;

            setUser((prev: any) => {
                if (prev?.id === currentUser?.id) return prev;
                return currentUser;
            });

            if (event === 'SIGNED_OUT') {
                setAvatarUrl(null);
                setAuthLoading(false);
            } else if (event === 'SIGNED_IN') {
                if (currentUser) {
                    await fetchProfile(currentUser.id);
                }
            } else if (event === 'TOKEN_REFRESHED' && currentUser) {
                if (!avatarUrl) await fetchProfile(currentUser.id);
            }
        });

        const handleScroll = () => setScrolled(window.scrollY > 100);
        window.addEventListener('scroll', handleScroll);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('profile-updated', handleProfileUpdate);
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const firstName = user?.user_metadata?.first_name || 'User';
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        setImageLoaded(false);
    }, [avatarUrl]);

    const navItems = [
        { name: 'Home', link: '/' },
        { name: 'Custom Cakes', link: '/custom-cakes' },
        { name: 'Other Treats', link: '/other-treats' },
        { name: 'Contact', link: '/contact' },
    ];

    return (
        <AceternityNavbar className="top-2 text-sai-charcoal">
            <NavBody>
                <Link href="/" className="relative z-20 mr-4 flex items-center space-x-8 px-2 py-1">
                    {/* Logo Icon */}
                    <div className="relative w-[35px] h-[35px]">
                        <Image
                            src={'/images/logo/icon-pink.svg'}
                            alt="Sugar And Icing"
                            fill
                            className={`rounded-lg object-contain transition-all duration-300 ${isMounted && scrolled ? 'opacity-100 scale-100' : 'opacity-100 scale-100'}`}
                        />
                    </div>

                    {/* Logo Text */}
                    <span className="font-semibold text-base relative overflow-hidden text-sai-charcoal min-w-[140px]">
                        <span className={`absolute left-0 top-1/2 -translate-y-1/2 transition-all duration-300 ${isMounted && scrolled ? 'opacity-100 translate-y-[-50%]' : 'opacity-0 translate-y-10'}`}>
                            SAI
                        </span>
                        <span className={`absolute left-0 top-1/2 -translate-y-1/2 transition-all duration-300 ${isMounted && scrolled ? 'opacity-0 -translate-y-10' : 'opacity-100 translate-y-[-50%]'}`}>
                            Sugar And Icing
                        </span>
                        <span className="opacity-0">Sugar And Icing</span>
                    </span>
                </Link>

                <NavItems items={navItems} pathname={pathname} />

                <div className="relative z-20 flex items-center gap-4">
                    <InboxTriggerButton pathname={pathname} userId={user?.id} />
                    <CartTriggerButton pathname={pathname} />

                    {!isMounted || authLoading ? (
                        <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                    ) : user ? (
                        <Link href="/profile">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:opacity-80 transition-all overflow-hidden relative ${pathname === '/profile' ? 'ring-2 ring-sai-pink/30' : ''} ${!avatarUrl ? 'bg-sai-pink' : 'bg-gray-100'}`}>
                                {avatarUrl ? (
                                    <>
                                        <Image
                                            src={avatarUrl}
                                            alt="Profile"
                                            fill
                                            className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                            onLoad={() => setImageLoaded(true)}
                                        />
                                        {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
                                    </>
                                ) : (
                                    firstName[0]?.toUpperCase()
                                )}
                            </div>
                        </Link>
                    ) : (
                        <Link href="/login" className="group">
                            <User className={`w-5 h-5 transition-colors ${pathname === '/login' ? 'text-sai-pink' : 'text-sai-charcoal group-hover:text-sai-pink'}`} strokeWidth={2} />
                        </Link>
                    )}
                </div>
            </NavBody>

            <MobileNav>
                <MobileNavHeader>
                    <Link href="/" className="flex items-center space-x-2 px-2 py-1">
                        <Image src="/icon.svg" alt="Sugar And Icing" width={52} height={52} className="rounded-lg" />
                        <span className="font-semibold text-base text-sai-charcoal">
                            {isMounted && scrolled ? 'SAI' : 'Sugar And Icing'}
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <InboxTriggerButton pathname={pathname} userId={user?.id} />
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
            </MobileNav>
        </AceternityNavbar>
    );
}

function CartTriggerButton({ pathname }: { pathname?: string }) {
    const { totalItems, isLoading } = useCart();
    const count = totalItems();

    return (
        <Link href="/cart" className="relative group p-1" aria-label="Open cart">
            <ShoppingBag className={`w-5 h-5 transition-colors ${pathname === '/cart' ? 'text-sai-pink' : 'text-sai-charcoal group-hover:text-sai-pink'}`} strokeWidth={2} />
            {!isLoading && count > 0 && (
                <span className="absolute -top-1 -right-1 bg-sai-pink text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                    {count}
                </span>
            )}
        </Link>
    );
}

function InboxTriggerButton({ pathname, userId }: { pathname?: string, userId?: string }) {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!userId) {
            setUnreadCount(0);
            return;
        }

        const fetchUnread = async () => {
            const { count } = await (supabase as any)
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('read', false);
            setUnreadCount(count || 0);
        };

        fetchUnread();

        const channel = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
                () => fetchUnread()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return (
        <Link href="/inbox" className="relative group p-1" aria-label="Open inbox">
            <Bell className={`w-5 h-5 transition-colors ${pathname === '/inbox' ? 'text-sai-pink' : 'text-sai-charcoal group-hover:text-sai-pink'}`} strokeWidth={2} />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-sai-pink text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </Link>
    );
}