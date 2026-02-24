'use client';

import { useRef } from 'react';
import GalleryCard from '@/app/components/GalleryCard';
import GalleryListItem from '@/app/components/GalleryListItem';
import ProductCardSkeleton from '@/app/components/ProductCardSkeleton';
import GalleryListItemSkeleton from '@/app/components/GalleryListItemSkeleton';
import SharedPagination from '@/app/components/ui/SharedPagination';
import { Product } from '@/hooks/useProductFilters';

interface CakeGalleryProps {
    paginatedCakes: Product[];
    loading: boolean;
    searchQuery: string;
    currentPage: number;
    setCurrentPage: (page: number | ((prev: number) => number)) => void;
    totalPages: number;
    onViewDetails: (cake: Product) => void;
}

export default function CakeGallery({
    paginatedCakes,
    loading,
    searchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    onViewDetails
}: CakeGalleryProps) {
    const galleryTopRef = useRef<HTMLElement>(null);

    const handlePageChange = (newPage: number | ((prev: number) => number)) => {
        const next = typeof newPage === 'function' ? newPage(currentPage) : newPage;
        if (next === currentPage) return;

        setCurrentPage(next);
        galleryTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <section
            ref={galleryTopRef}
            className="px-6 py-4 scroll-mt-32"
        >
            <div className="max-w-6xl mx-auto">
                {loading ? (
                    <>
                        {/* Desktop: Card Skeletons */}
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                        {/* Mobile: List Skeletons */}
                        <div className="flex flex-col gap-3 md:hidden">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <GalleryListItemSkeleton key={i} />
                            ))}
                        </div>
                    </>
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
                                    onRequestQuote={() => onViewDetails(cake)}
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
                                    onRequestQuote={() => onViewDetails(cake)}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-8">
                            <SharedPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}