'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 hidden md:flex justify-center w-full px-4">
      <div className="glass-nav rounded-full px-8 py-4 flex items-center gap-8">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity mr-2">
          <Image
            src="/images/logo/icon-white.png"
            alt="Sugar And Icing"
            width={40}
            height={40}
            className="object-contain"
          />
        </Link>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-sai-gold/30"></div>

        {/* Navigation Links */}
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`text-sm font-bold uppercase tracking-wide transition-colors ${pathname === item.href
              ? 'text-sai-rose'
              : 'text-sai-charcoal hover:text-sai-pink'
              }`}
          >
            {item.label}
          </Link>
        ))}

        {/* Divider */}
        <div className="h-6 w-[1px] bg-sai-gold/30"></div>

        {/* Cart Icon with Badge */}
        <Link href="/cart" className="relative group">
          <ShoppingBag className="w-6 h-6 text-sai-gold group-hover:text-sai-pink transition-colors" />
          {/* TODO: Connect to cart state */}
          <span className="absolute -top-2 -right-2 bg-sai-rose text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-sm">
            0
          </span>
        </Link>

        {/* Profile Icon */}
        <Link href="/profile" className="group">
          <User className="w-6 h-6 text-sai-gold group-hover:text-sai-pink transition-colors" />
        </Link>
      </div>
    </nav>
  );
}