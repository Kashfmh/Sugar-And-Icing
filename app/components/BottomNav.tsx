'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, ShoppingCart, CakeSlice, User } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

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
                            <div className="w-14 h-14 rounded-full bg-sai-pink shadow-lg flex items-center justify-center relative">
                                <ShoppingCart className="w-7 h-7 text-white" strokeWidth={2.5} />
                                <span className="absolute -top-1 -right-1 bg-sai-charcoal text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                                    0
                                </span>
                            </div>
                        </div>
                        <div className="h-6"></div>
                        <span className="text-[10px] font-medium text-sai-pink">
                            Cart
                        </span>
                    </Link>
                </div>

                {/* Right Group - Favorites and Profile */}
                <div className="flex-1 flex justify-around gap-4">
                    {navItems.slice(3, 5).map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href === '/profile' && pathname === '/login');
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
            </div>
        </nav>
    );
}
