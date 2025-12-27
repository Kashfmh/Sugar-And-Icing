'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Home' },
        { href: '/custom-cakes', label: 'Custom Cakes' },
        { href: '/menu', label: 'Other Treats' },
        { href: '/contact', label: 'Contact' },
    ];

    return (
        <nav className="fixed top-6 left-0 right-0 z-50 hidden md:flex justify-center w-full px-4">
            <div className="glass-nav rounded-full px-8 py-3 flex items-center gap-6">
                {/* Navigation Links */}
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`text-sm font-semibold uppercase tracking-wide transition-colors ${pathname === item.href
                            ? 'text-sai-pink'
                            : 'text-sai-charcoal hover:text-sai-pink'
                            }`}
                    >
                        {item.label}
                    </Link>
                ))}

                {/* Divider */}
                <div className="h-4 w-[1px] bg-sai-border"></div>

                {/* Cart Icon with Badge */}
                <Link href="/cart" className="relative group">
                    <ShoppingBag className="w-5 h-5 text-sai-charcoal group-hover:text-sai-pink transition-colors" strokeWidth={2} />
                    <span className="absolute -top-2 -right-2 bg-sai-pink text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                        0
                    </span>
                </Link>

                {/* Profile Icon */}
                <Link href="/profile" className="group">
                    <User className="w-5 h-5 text-sai-charcoal group-hover:text-sai-pink transition-colors" strokeWidth={2} />
                </Link>
            </div>
        </nav>
    );
}
