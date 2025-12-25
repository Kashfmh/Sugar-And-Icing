'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, ShoppingCart, Heart, User } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/menu', label: 'Menu', icon: FileText },
        { href: '/cart', label: 'Cart', icon: ShoppingCart, isElevated: true },
        { href: '/favorites', label: 'Favorites', icon: Heart },
        { href: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <nav className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 md:hidden">
            <div className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-lg rounded-full px-6 py-3 flex items-center gap-1 relative">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    if (item.isElevated) {
                        // Elevated cart button in center
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center gap-1 mx-2 relative"
                            >
                                {/* Elevated circle */}
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                                    <div className="w-14 h-14 rounded-full bg-sai-pink shadow-lg flex items-center justify-center relative">
                                        <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                                        {/* Cart badge - TODO: connect to cart state */}
                                        <span className="absolute -top-1 -right-1 bg-sai-charcoal text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                                            0
                                        </span>
                                    </div>
                                </div>
                                {/* Spacer for elevated button */}
                                <div className="h-6"></div>
                                <span className="text-[10px] font-medium text-sai-pink">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    }

                    // Regular nav items
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center gap-1 px-3 py-1 transition-colors"
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
        </nav>
    );
}
