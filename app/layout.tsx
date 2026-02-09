import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google'; // Adjust fonts if needed
import './globals.css';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import BottomNav from '@/app/components/BottomNav';
import AuthSync from '@/app/components/AuthSync';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Sugar & Icing',
  description: 'Custom cakes and treats for every occasion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-sai-white min-h-screen flex flex-col font-sans antialiased text-sai-charcoal selection:bg-sai-pink/20">

        {/* 1. Global Auth Sync (Runs once, no visual rendering) */}
        <AuthSync />

        {/* 2. Navbar: NO key={pathname} here! It must persist. */}
        <div className="relative z-50">
          <Navbar />
        </div>

        {/* 3. Main Content */}
        <main className="flex-grow relative z-0">
          {children}
        </main>

        {/* 4. Footer & Bottom Nav */}
        <Footer />
        <BottomNav />

      </body>
    </html>
  );
}