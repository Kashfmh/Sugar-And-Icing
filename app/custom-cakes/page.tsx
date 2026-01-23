'use client';

import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { useProductFilters, Product } from '@/hooks/useProductFilters'; // Use hook
import CakeHeader from './_components/CakeHeader';
import CakeFilterBar from './_components/CakeFilterBar';
import CakeGallery from './_components/CakeGallery';
import PricingGuide from './_components/PricingGuide';
import OrderSteps from './_components/OrderSteps';

// Move fetch function outside component to prevent re-creation on every render
const fetchCustomCakes = async () => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('product_type', 'cake'); // Only custom cakes

    if (error) throw error;
    return data as Product[];
}

export default function CustomCakesPage() {
    const categories = ['All', 'Birthday', 'Holiday', 'Wedding', 'Anniversary'];

    const {
        paginatedProducts: paginatedCakes,
        sortedProducts: sortedCakes, // Used for count
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        currentPage,
        setCurrentPage,
        loading,
        isFilterModalOpen,
        setIsFilterModalOpen,
        totalPages
    } = useProductFilters({
        initialCategory: 'All',
        itemsPerPage: 12,
        onFetch: fetchCustomCakes
        // No categoryMap passed, so it uses the default logic (matching string in name/desc/category_name)
    });

    const handleRequestQuote = (cakeName: string) => {
        const message = `Hi! I'm interested in a custom cake similar to your "${cakeName}". Can we discuss the size, design, and pricing?`;
        const whatsappUrl = `https://wa.me/60108091351?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <main className="min-h-screen bg-sai-white relative">
            {/* Mobile Header */}
            <header className="md:hidden sticky top-0 z-40 bg-sai-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-sai-charcoal">Custom Cakes</h1>
                    <Link href="/">
                        <Image
                            src="/images/logo/icon-pink.svg"
                            alt="Sugar And Icing"
                            width={40}
                            height={40}
                            className="object-contain"
                        />
                    </Link>
                </div>
            </header>

            {/* Components */}
            <CakeHeader />

            <CakeFilterBar
                categories={categories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortBy={sortBy}
                setSortBy={setSortBy}
                paginatedCount={paginatedCakes.length}
                totalCount={sortedCakes.length}
                isFilterModalOpen={isFilterModalOpen}
                setIsFilterModalOpen={setIsFilterModalOpen}
            />

            <CakeGallery
                paginatedCakes={paginatedCakes}
                loading={loading}
                searchQuery={searchQuery}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                handleRequestQuote={handleRequestQuote}
            />

            <PricingGuide />

            <OrderSteps />
        </main>
    );
}
