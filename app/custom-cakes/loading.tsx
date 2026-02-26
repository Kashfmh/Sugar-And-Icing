import React from "react";
import ProductCardSkeleton from '@/app/components/ProductCardSkeleton';
import GalleryListItemSkeleton from '@/app/components/GalleryListItemSkeleton';

export default function Loading() {
    return (
        <main className="min-h-screen bg-sai-white relative pb-24 md:pb-0 animate-pulse">
            {/* Mobile Header Skeleton */}
            <header className="md:hidden sticky top-0 z-40 bg-sai-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="h-6 w-32 bg-gray-200 rounded"></div>
                    <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                </div>
            </header>

            {/* Cake Header Skeleton */}
            <section className="px-6 pt-20 md:pt-28 pb-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="h-3 md:h-4 w-40 mx-auto bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 md:h-14 w-64 md:w-96 mx-auto bg-pink-100 rounded-xl"></div>
                </div>
            </section>

            {/* Cake Filter Bar Skeleton */}
            {/* Desktop */}
            <section className="hidden md:block px-6 py-6 border-b border-gray-100/0">
                <div className="max-w-6xl mx-auto">
                    {/* Search Bar */}
                    <div className="mb-6 max-w-md mx-auto">
                        <div className="h-12 w-full bg-gray-50 border border-gray-200 rounded-[0.75rem]"></div>
                    </div>

                    {/* Categories Tabs */}
                    <div className="flex justify-center gap-2 mb-4">
                        <div className="h-10 w-16 bg-sai-pink/40 rounded-full"></div>
                        <div className="h-10 w-24 bg-gray-50 border border-gray-200 rounded-full"></div>
                        <div className="h-10 w-24 bg-gray-50 border border-gray-200 rounded-full"></div>
                        <div className="h-10 w-24 bg-gray-50 border border-gray-200 rounded-full"></div>
                        <div className="h-10 w-28 bg-gray-50 border border-gray-200 rounded-full"></div>
                    </div>

                    {/* Results Count & Sort Dropdown */}
                    <div className="flex items-center justify-between mb-4 mt-8">
                        <div className="h-5 w-48 bg-gray-200 rounded"></div>
                        <div className="h-10 w-36 bg-gray-50 border border-gray-200 rounded-[0.75rem]"></div>
                    </div>
                </div>
            </section>

            {/* Mobile Filter Bar Skeleton */}
            <section className="md:hidden px-6 pt-6 pb-4">
                <div className="flex gap-2">
                    <div className="flex-1 h-12 bg-gray-50 border border-gray-200 rounded-xl"></div>
                    <div className="w-12 h-12 rounded-xl bg-sai-pink/40"></div>
                </div>
            </section>
            <section className="md:hidden px-6 pb-6">
                <div className="flex gap-2 overflow-hidden">
                    <div className="h-10 w-16 bg-sai-pink/40 rounded-full flex-shrink-0"></div>
                    <div className="h-10 w-24 bg-gray-50 border border-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="h-10 w-24 bg-gray-50 border border-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="h-10 w-24 bg-gray-50 border border-gray-200 rounded-full flex-shrink-0"></div>
                </div>
            </section>

            {/* Cake Gallery Skeleton */}
            <section className="px-6 py-4">
                <div className="max-w-6xl mx-auto">
                    {/* Desktop Grid */}
                    <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>

                    {/* Mobile List */}
                    <div className="flex flex-col gap-3 md:hidden">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <GalleryListItemSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
