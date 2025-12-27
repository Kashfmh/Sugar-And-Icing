'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import GalleryCard from '../components/GalleryCard';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import BottomNav from '../components/BottomNav';

interface CakeGalleryItem {
    id: string;
    name: string;
    description?: string | null;
    image_url?: string | null;
    category_name: string;
}

export default function CustomCakesPage() {
    const [cakes, setCakes] = useState<CakeGalleryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomCakes();
    }, []);

    async function fetchCustomCakes() {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('category_name', 'Cakes');

            if (error) throw error;
            setCakes(data || []);
        } catch (error) {
            console.error('Error fetching custom cakes:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleRequestQuote = (cakeName: string) => {
        const message = `Hi! I'm interested in a custom cake similar to your "${cakeName}". Can we discuss the size, design, and pricing?`;
        const whatsappUrl = `https://wa.me/60108091351?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <main className="min-h-screen bg-sai-white pb-24 md:pb-8 relative">
            {/* Brand Logo - Top Left Floating */}
            <div className="absolute top-4 left-4 z-40 hidden md:block">
                <Image
                    src="/images/logo/full-logo-pink.png"
                    alt="Sugar And Icing"
                    width={80}
                    height={80}
                    className="object-contain hover:scale-105 transition-transform duration-300"
                    priority
                />
            </div>
            <div className="fixed top-4 right-4 z-50 block md:hidden">
                <Image
                    src="/images/logo/icon-pink.png"
                    alt="Sugar And Icing"
                    width={35}
                    height={35}
                    className="object-contain"
                    priority
                />
            </div>

            {/* Mobile Header */}
            <header className="md:hidden sticky top-0 z-40 bg-sai-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-4">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-sai-charcoal">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="font-serif text-2xl text-sai-charcoal">
                        Custom Cakes
                    </h1>
                </div>
            </header>

            {/* Hero Section */}
            <section className="px-6 pt-20 md:pt-28 pb-8">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-sai-charcoal/70 mb-3">
                        Made Just For You
                    </p>
                    <h2 className="font-serif text-4xl md:text-5xl font-normal text-sai-charcoal mb-4">
                        Custom Cake Creations
                    </h2>
                    <p className="text-base md:text-lg text-sai-gray max-w-2xl mx-auto mb-6">
                        Every cake is uniquely crafted to match your vision. From birthdays to celebrations,
                        we bring your dream cake to life with love and attention to detail.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => handleRequestQuote('a custom cake')}
                            className="btn-primary flex items-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Start Your Custom Order
                        </button>
                        <p className="text-sm text-sai-gray">
                            Starting from <span className="font-bold text-sai-pink">RM 80</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="px-6 py-4">
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 h-64 rounded-t-lg" />
                                    <div className="bg-white p-6 rounded-b-lg space-y-3">
                                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                                        <div className="h-4 bg-gray-200 rounded w-full" />
                                        <div className="h-10 bg-gray-200 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : cakes.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-sai-charcoal/60">No custom cake examples available yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cakes.map((cake) => (
                                <GalleryCard
                                    key={cake.id}
                                    name={cake.name}
                                    description={cake.description || undefined}
                                    image_url={cake.image_url || undefined}
                                    onRequestQuote={() => handleRequestQuote(cake.name)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="px-6 py-12 bg-sai-light-gray">
                <div className="max-w-4xl mx-auto">
                    <h3 className="font-serif text-3xl text-center text-sai-charcoal mb-8">
                        How Custom Orders Work
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-sai-pink text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                                1
                            </div>
                            <h4 className="font-semibold text-sai-charcoal mb-2">Share Your Vision</h4>
                            <p className="text-sm text-sai-gray">
                                Message us on WhatsApp with your cake idea, occasion, and preferences
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-sai-pink text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                                2
                            </div>
                            <h4 className="font-semibold text-sai-charcoal mb-2">Get a Quote</h4>
                            <p className="text-sm text-sai-gray">
                                We'll discuss details like size, design, flavors, and provide pricing
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-sai-pink text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                                3
                            </div>
                            <h4 className="font-semibold text-sai-charcoal mb-2">Enjoy Your Cake</h4>
                            <p className="text-sm text-sai-gray">
                                We'll bake it fresh and deliver to your location in KL Sentral area
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile Bottom Navigation */}
            <BottomNav />
        </main>
    );
}
