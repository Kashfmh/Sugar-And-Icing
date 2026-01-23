import ProductCard from '@/app/components/ProductCard';
import ProductCardSkeleton from '@/app/components/ProductCardSkeleton';
import ProductListItem from '@/app/components/ProductListItem';
import ProductListItemSkeleton from '@/app/components/ProductListItemSkeleton';
import { Product } from '@/hooks/useProductFilters';

interface ProductGridProps {
    paginatedProducts: Product[];
    loading: boolean;
    searchQuery: string;
    currentPage: number;
    setCurrentPage: (page: number | ((prev: number) => number)) => void;
    totalPages: number;
    onClickProduct: (product: Product) => void;
}

export default function ProductGrid({
    paginatedProducts,
    loading,
    searchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    onClickProduct
}: ProductGridProps) {
    return (
        <section className="px-6 py-4">
            <div className="max-w-6xl mx-auto">
                {loading ? (
                    <>
                        {/* Desktop: Card Skeletons */}
                        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                        {/* Mobile: List Skeletons */}
                        <div className="md:hidden flex flex-col gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <ProductListItemSkeleton key={i} />
                            ))}
                        </div>
                    </>
                ) : paginatedProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-sai-charcoal/60">
                            {searchQuery ? `No products found for "${searchQuery}"` : 'No products found in this category.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop: Card Grid */}
                        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedProducts.map((product) => (
                                <div key={product.id} className="relative">
                                    <ProductCard
                                        productId={product.id}
                                        name={product.name}
                                        price={product.base_price}
                                        description={product.description || undefined}
                                        category={product.category_name}
                                        image_url={product.image_url || undefined}
                                        tags={product.tags}
                                        onClick={() => onClickProduct(product)}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Mobile: Compact List */}
                        <div className="md:hidden flex flex-col gap-4">
                            {paginatedProducts.map((product) => (
                                <ProductListItem
                                    key={product.id}
                                    productId={product.id}
                                    name={product.name}
                                    price={product.base_price}
                                    description={product.description || undefined}
                                    category={product.category_name}
                                    image_url={product.image_url || undefined}
                                    tags={product.tags}
                                    onClick={() => onClickProduct(product)}
                                />
                            ))}
                        </div>

                        {/* Pagination Controls */}
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
