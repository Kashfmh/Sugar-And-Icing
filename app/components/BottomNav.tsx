'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, FileText, ShoppingCart, CakeSlice, User, Bell, Package } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function BottomNav() {
    const pathname = usePathname();
    const { totalItems } = useCart();

    // Use state to avoid hydration mismatch for the badge
    const [mounted, setMounted] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        setMounted(true);

        const fetchData = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);

            if (currentUser) {
                // Fetch unread count
                const { count } = await supabase
                    .from('notifications')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', currentUser.id)
                    .eq('read', false);
                setUnreadCount(count || 0);

                // Fetch avatar
                const { data } = await supabase
                    .from('profiles')
                    .select('avatar_url')
                    .eq('id', currentUser.id)
                    .single();

                if (data) setAvatarUrl(data.avatar_url);
            } else {
                setUnreadCount(0);
                setAvatarUrl(null);
            }
        };

        fetchData();

        // Listen for auth changes to reset count immediately
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') fetchData();
            if (event === 'SIGNED_OUT') {
                setUnreadCount(0);
                setUser(null);
                setAvatarUrl(null);
            }
        });

        // Listen for profile updates
        window.addEventListener('profile-updated', fetchData);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('profile-updated', fetchData);
        };
    }, []);

    const itemCount = mounted ? totalItems() : 0;

    const navItems = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/custom-cakes', label: 'Cakes', icon: CakeSlice },
        { href: '/cart', label: 'Cart', icon: ShoppingCart, isElevated: true },
        { href: '/other-treats', label: 'Treats', icon: FileText },
        { href: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <nav className="fixed bottom-6 left-0 right-0 z-[1000] flex justify-center px-4 md:hidden">
            <div className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl px-6 py-2 flex items-center relative max-w-md w-full">
                {/* Left Group - Home and Menu */}
                <div className="flex-1 flex justify-around gap-4">
                    {navItems.slice(0, 2).map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center gap-1 transition-colors"
                            >
                                <Icon
                                    className={`w-5 h-5 ${isActive ? 'text-sai-pink' : 'text-gray-400'}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span className={`text-[10px] font-medium ${isActive ? 'text-sai-pink' : 'text-gray-500'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Center - Elevated Cart Button */}
                <div className="flex-1 flex justify-center relative">
                    <Link
                        href="/cart"
                        className="flex flex-col items-center gap-1"
                    >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                            <div className="w-14 h-14 rounded-full bg-sai-pink shadow-lg flex items-center justify-center relative transition-transform active:scale-95">
                                <ShoppingCart className="w-7 h-7 text-white" strokeWidth={2.5} />
                                {itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-sai-charcoal text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                                        {itemCount}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="h-6"></div>
                        <span className="text-[10px] font-medium text-sai-pink">
                            Cart
                        </span>
                    </Link>
                </div>

                {/* Right Group - Treats, Profile */}
                <div className="flex-1 flex justify-around gap-4">
                    {navItems.slice(3, 5).map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href === '/profile' && pathname === '/login');

                        // Checking if this is the profile item AND we have an avatar
                        const isProfileItem = item.label === 'Profile';

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center gap-1 transition-colors relative"
                            >
                                {isProfileItem && avatarUrl ? (
                                    <div className={`w-6 h-6 rounded-full relative overflow-hidden ${isActive ? 'ring-2 ring-sai-pink' : ''}`}>
                                        <Image
                                            src={avatarUrl}
                                            alt="Profile"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <Icon
                                        className={`w-5 h-5 ${isActive ? 'text-sai-pink' : 'text-gray-400'}`}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                )}

                                {mounted && (item as any).hasBadge && unreadCount > 0 && (
                                    <span className="absolute top-0 right-2 w-2.5 h-2.5 bg-sai-pink border-2 border-white rounded-full"></span>
                                )}
                                <span className={`text-[10px] font-medium ${isActive ? 'text-sai-pink' : 'text-gray-500'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
