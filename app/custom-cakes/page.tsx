'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import GalleryCard from '../components/GalleryCard';
import GalleryListItem from '../components/GalleryListItem';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import CategoryTabs from '../components/CategoryTabs';
import FilterModal from '../components/FilterModal';
import { AnimatedText } from '../components/ui/animated-text';
import { Select } from '../components/ui/select';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Search, SlidersHorizontal, MessageCircle } from 'lucide-react';
import BottomNav from '../components/BottomNav';

interface CakeGalleryItem {
    id: string;
    name: string;
    description?: string | null;
    image_url?: string | null;
    category_name: string;
    product_type?: string;
}

export default function CustomCakesPage() {
    const [cakes, setCakes] = useState<CakeGalleryItem[]>([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<'newest' | 'name'>('newest');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const itemsPerPage = 12;

    const categories = ['All', 'Birthday', 'Holiday', 'Wedding', 'Anniversary'];

    useEffect(() => {
        fetchCustomCakes();
    }, []);

    async function fetchCustomCakes() {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('product_type', 'Cake'); // Only custom cakes

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

    // Filter cakes by category and search
    const filteredCakes = cakes.filter(cake => {
        if (activeCategory === 'All') {
            const matchesSearch = !searchQuery ||
                cake.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cake.description?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        }

        // Check if category matches name or description
        const categoryLower = activeCategory.toLowerCase();
        const matchesCategory =
            cake.name.toLowerCase().includes(categoryLower) ||
            cake.description?.toLowerCase().includes(categoryLower) ||
            false;

        const matchesSearch = !searchQuery ||
            cake.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cake.description?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    const sortedCakes = [...filteredCakes].sort((a, b) => {
        if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        }
        return 0; // newest (default order)
    });

    // Pagination
    const totalPages = Math.ceil(sortedCakes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCakes = sortedCakes.slice(startIndex, startIndex + itemsPerPage);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, searchQuery, sortBy]);

    return (
        <main className="min-h-screen bg-sai-white pb-24 md:pb-8 relative">
            {/* Brand Logo */}
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

            {/* Tagline Section */}
            <section className="px-6 pt-20 md:pt-28 pb-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-sai-charcoal/70 mb-3">
                        Made Just For You
                    </p>
                    <h2 className="font-serif text-4xl md:text-5xl font-normal text-sai-charcoal relative inline-block">
                        <AnimatedText
                            words={['Custom Cake Creations', 'Baked With Love', 'Dream Cakes', 'Made to Order']}
                            className="text-sai-pink"
                        />
                    </h2>
                </div>
            </section>

            {/* Desktop: Search & Filters */}
            <section className="hidden md:block px-6 py-6">
                <div className="max-w-6xl mx-auto">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative max-w-md mx-auto">
                            <input
                                type="text"
                                placeholder="Search cake designs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 pl-11 pr-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sai-pink/50 focus:border-sai-pink transition-all"
                            />
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex justify-center mb-4">
                        <CategoryTabs
                            categories={categories}
                            activeCategory={activeCategory}
                            onCategoryChange={setActiveCategory}
                        />
                    </div>

                    {/* Results Bar */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-semibold">{paginatedCakes.length}</span> of <span className="font-semibold">{sortedCakes.length}</span> designs
                        </p>
                        <Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            options={[
                                { value: 'newest', label: 'Newest First' },
                                { value: 'name', label: 'Name: A-Z' },
                            ]}
                        />
                    </div>
                </div>
            </section>

            {/* Mobile: Search + Filter Button */}
            <section className="md:hidden px-6 pt-6 pb-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search cake designs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sai-pink/50 focus:border-sai-pink"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setIsFilterModalOpen(true)}
                        className="relative w-12 h-12 rounded-xl bg-sai-pink text-white flex items-center justify-center hover:bg-sai-pink/90 transition-colors"
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                        {sortBy !== 'newest' && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-sai-white" />
                        )}
                    </button>
                </div>
            </section>

            {/* Mobile: Category Tabs */}
            <section className="md:hidden px-6 pb-6">
                <CategoryTabs
                    categories={categories}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                />
            </section>

            {/* Filter Modal */}
            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                sortBy={sortBy as any}
                onSortChange={(newSort) => {
                    if (newSort === 'newest' || newSort === 'name') {
                        setSortBy(newSort);
                    }
                }}
            />

            {/* Gallery Grid */}
            <section className="px-6 py-4">
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : paginatedCakes.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-sai-charcoal/60">
                                {searchQuery ? `No designs found for "${searchQuery}"` : 'No cake designs found in this category.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Grid */}
                            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedCakes.map((cake) => (
                                    <GalleryCard
                                        key={cake.id}
                                        name={cake.name}
                                        description={cake.description || undefined}
                                        image_url={cake.image_url || undefined}
                                        onRequestQuote={() => handleRequestQuote(cake.name)}
                                    />
                                ))}
                            </div>

                            {/* Mobile List */}
                            <div className="flex flex-col gap-3 md:hidden">
                                {paginatedCakes.map((cake) => (
                                    <GalleryListItem
                                        key={cake.id}
                                        name={cake.name}
                                        description={cake.description || undefined}
                                        image_url={cake.image_url || undefined}
                                        onRequestQuote={() => handleRequestQuote(cake.name)}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-8">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    >
                                        Previous
                                    </button>

                                    <div className="flex gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-lg transition-colors ${currentPage === page
                                                    ? 'bg-sai-pink text-white'
                                                    : 'border border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="px-6 py-12 bg-sai-light-gray">
                <div className="max-w-4xl mx-auto">
                    <h3 className="font-serif text-3xl text-center text-sai-charcoal mb-8">
                        How Custom Orders Work
                    </h3>

                    {/* Desktop: 3 columns */}
                    <div className="hidden md:grid md:grid-cols-3 gap-6">
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

                    {/* Mobile: Compact list */}
                    <div className="md:hidden space-y-4">
                        <div className="flex gap-3 items-start">
                            <div className="w-10 h-10 rounded-full bg-sai-pink text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                                1
                            </div>
                            <div>
                                <h4 className="font-semibold text-sai-charcoal mb-1">Share Your Vision</h4>
                                <p className="text-sm text-sai-gray">Message us on WhatsApp with your cake idea</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <div className="w-10 h-10 rounded-full bg-sai-pink text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                                2
                            </div>
                            <div>
                                <h4 className="font-semibold text-sai-charcoal mb-1">Get a Quote</h4>
                                <p className="text-sm text-sai-gray">We'll discuss size, design, and pricing</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <div className="w-10 h-10 rounded-full bg-sai-pink text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                                3
                            </div>
                            <div>
                                <h4 className="font-semibold text-sai-charcoal mb-1">Enjoy Your Cake</h4>
                                <p className="text-sm text-sai-gray">Fresh baked and delivered in KL Sentral</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <BottomNav />
        </main>
    );
}
