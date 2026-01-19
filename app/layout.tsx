import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Dancing_Script } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import Footer from "./components/Footer";
import AuthSync from "./components/AuthSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

// New Handwritten Font
const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sugar And Icing - Handmade Treats in Brickfields",
  description: "Artisanal bakery offering handmade brownies, cakes, and sweet treats. Freshly baked with love in KL Sentral, Brickfields.",
  openGraph: {
    title: "Sugar And Icing",
    description: "Handmade with love in KL Sentral",
    images: ['/images/logo/full-logo-white.png'],
  },
};

import MainWrapper from "./components/MainWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${dancingScript.variable} antialiased bg-sai-cream text-sai-charcoal`}
      >
        <AuthSync />

        {/* Desktop Navbar - Fixed across all pages */}
        <div className="hidden md:block" data-navbar>
          <Navbar />
        </div>

        <MainWrapper>
          {children}
        </MainWrapper>

        {/* Footer - All pages */}
        <footer>
          <Footer />
        </footer>

        {/* Mobile Bottom Nav - Fixed across all pages */}
        <div data-bottom-nav>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}