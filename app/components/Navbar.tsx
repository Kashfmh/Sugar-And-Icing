import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
      {/* The "Glass" Pill Container */}
      <div className="bg-white/80 backdrop-blur-md border border-white/40 shadow-soft rounded-full px-8 py-3 flex items-center gap-8 md:gap-12 transition-all hover:shadow-lg">
        
        {/* Left Links */}
        <Link href="/" className="text-sm font-medium text-sai-charcoal hover:text-sai-rose transition-colors">
          Home
        </Link>
        <Link href="#menu" className="text-sm font-medium text-sai-charcoal hover:text-sai-rose transition-colors">
          Menu
        </Link>

        {/* Center Logo (Icon Only for Nav) */}
        <Link href="/" className="transform hover:scale-110 transition-transform">
           {/* If you have the icon file, use it here. For now, text fallback: */}
           <div className="w-10 h-10 bg-sai-pink rounded-full flex items-center justify-center text-white font-serif font-bold text-xl shadow-md">
             S
           </div>
        </Link>

        {/* Right Links */}
        <Link href="#about" className="text-sm font-medium text-sai-charcoal hover:text-sai-rose transition-colors">
          About
        </Link>
        
        {/* Cart Button with Counter */}
        <button className="relative group">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-sai-charcoal group-hover:text-sai-rose transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <span className="absolute -top-2 -right-2 bg-sai-rose text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            0
          </span>
        </button>
      </div>
    </nav>
  );
}