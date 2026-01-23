'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { generateProductSlug } from '@/lib/slugify';
import { useProductFilters, Product } from '@/hooks/useProductFilters';
import ProductDetailModal from '@/app/components/ProductDetailModal';
import MenuHeader from './_components/MenuHeader';
import MenuFilterBar from './_components/MenuFilterBar';
import ProductGrid from './_components/ProductGrid';

const categories = ['All', 'Cupcakes', 'Brownies', 'Fruit Cakes', 'Bread'];
const categoryMap: { [key: string]: string[] } = {
    'Cupcakes': ['cupcake', 'cupcake_basic', 'cupcake_premium'],
    'Brownies': ['brownie'],
    'Fruit Cakes': ['fruitcake'],
    'Bread': ['bread']
};

const fetchProducts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('product_type', ['cupcake', 'cupcake_basic', 'cupcake_premium', 'brownie', 'fruitcake', 'bread', 'other']);
    if (error) throw error;
    return data as Product[];
}

export default function MenuPage() {
    const {
        paginatedProducts,
        sortedProducts,
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
        totalPages,
        isMobile
    } = useProductFilters({
        initialCategory: 'All',
        itemsPerPage: 12,
        categoryMap,
        onFetch: fetchProducts
    });

    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const router = useRouter();

    const handleProductClick = (product: Product) => {
        if (isMobile) {
            const slug = generateProductSlug({ id: product.id, name: product.name });
            router.push(`/products/${slug}`);
        } else {
            setSelectedProductId(product.id);
        }
    };

    return (
        <main className="min-h-screen bg-sai-white md:pb-8 relative">
            {/* Mobile Header - Simplified */}
            <header className="md:hidden sticky top-0 z-40 bg-sai-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-sai-charcoal">Other Treats</h1>
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

            <MenuHeader />

            <MenuFilterBar
                categories={categories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortBy={sortBy}
                setSortBy={setSortBy}
                paginatedCount={paginatedProducts.length}
                totalCount={sortedProducts.length}
                isFilterModalOpen={isFilterModalOpen}
                setIsFilterModalOpen={setIsFilterModalOpen}
            />

            <ProductGrid
                paginatedProducts={paginatedProducts}
                loading={loading}
                searchQuery={searchQuery}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                onClickProduct={handleProductClick}
            />

            {/* Product Detail Modal */}
            {selectedProductId && (
                <ProductDetailModal
                    productId={selectedProductId}
                    isOpen={!!selectedProductId}
                    onClose={() => setSelectedProductId(null)}
                />
            )}
        </main>
    );
}
