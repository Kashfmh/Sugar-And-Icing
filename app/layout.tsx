import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import BottomNav from '@/app/components/BottomNav';
import AuthSync from '@/app/components/AuthSync';
import GlobalReviewsLauncher from '@/app/components/GlobalReviewsLauncher';

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

        {/* global auth sync */}
        <AuthSync />

        {/* navbar */}
        <div className="relative z-50">
          <Navbar />
        </div>

        {/* main content */}
        <main className="flex-grow relative">
          {children}
        </main>

        {/* global reviews launcher listens for open-reviews events */}
        <GlobalReviewsLauncher />

        {/* footer & bottom nav */}
        <Footer />
        <BottomNav />

      </body>
    </html>
  );
}