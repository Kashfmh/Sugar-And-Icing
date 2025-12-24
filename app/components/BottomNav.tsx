'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UtensilsCrossed, ShoppingBag, User } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/menu', icon: UtensilsCrossed, label: 'Menu' },
        { href: '/cart', icon: ShoppingBag, label: 'Cart', badge: 0 }, // TODO: Connect to cart state
        { href: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 backdrop-blur-md border-t border-white/40 px-4 py-3 safe-area-bottom">
            <div className="flex items-center justify-around max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center gap-1 relative"
                        >
                            <div className="relative">
                                <Icon
                                    className={`w-6 h-6 transition-colors ${isActive ? 'text-sai-rose' : 'text-sai-charcoal/60'
                                        }`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-sai-rose text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span
                                className={`text-[10px] font-medium transition-colors ${isActive ? 'text-sai-rose' : 'text-sai-charcoal/60'
                                    }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
