import GalleryCard from '@/app/components/GalleryCard';
import GalleryListItem from '@/app/components/GalleryListItem';
import ProductCardSkeleton from '@/app/components/ProductCardSkeleton';
import GalleryListItemSkeleton from '@/app/components/GalleryListItemSkeleton';
import { Product } from '@/hooks/useProductFilters';

interface CakeGalleryProps {
    paginatedCakes: Product[];
    loading: boolean;
    searchQuery: string;
    currentPage: number;
    setCurrentPage: (page: number | ((prev: number) => number)) => void;
    totalPages: number;
    handleRequestQuote: (name: string) => void;
}

export default function CakeGallery({
    paginatedCakes,
    loading,
    searchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    handleRequestQuote
}: CakeGalleryProps) {
    return (
        <section className="px-6 py-4">
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
                                    onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
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
                                    onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
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
    );
}
