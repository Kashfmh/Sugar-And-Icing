'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import ProductListItem from '../components/ProductListItem';
import ProductListItemSkeleton from '../components/ProductListItemSkeleton';
import CategoryTabs from '../components/CategoryTabs';
import Badge from '../components/Badge';
import BottomNav from '../components/BottomNav';
import FilterModal from '../components/FilterModal';
import { AnimatedText } from '../components/ui/animated-text';
import { ArrowLeft, Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import Image from 'next/image';
import ProductDetailModal from '../components/ProductDetailModal';
import { useRouter } from 'next/navigation';
import { generateProductSlug } from '@/lib/slugify';

interface Product {
    id: string;
    name: string;
    base_price: number;
    price: number;
    description?: string | null;
    category_name: string;
    image_url?: string | null;
    is_available?: boolean;
    is_best_seller?: boolean;
    tags?: string[];
    product_type?: string;
}

export default function MenuPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'name'>('newest');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const router = useRouter();
    const itemsPerPage = 12;

    const categories = ['All', 'Cupcakes', 'Brownies', 'Fruit Cakes', 'Bread'];

    useEffect(() => {
        fetchProducts();
    }, []);

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    async function fetchProducts() {
        try {
            // Get all treats (everything except custom cakes)
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .in('product_type', ['cupcake', 'cupcake_basic', 'cupcake_premium', 'brownie', 'fruitcake', 'bread', 'other']);

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
        } finally {
            setLoading(false);
        }
    }

    const handleProductClick = (product: Product) => {
        if (isMobile) {
            // Navigate to dedicated product page on mobile
            const slug = generateProductSlug({ id: product.id, name: product.name });
            router.push(`/products/${slug}`);
        } else {
            // Show modal on desktop
            setSelectedProductId(product.id);
        }
    };

    // Filter products by category and search
    const filteredProducts = products.filter(product => {
        // Map display category names to product_type values
        let matchesCategory = true;
        if (activeCategory !== 'All') {
            const categoryMap: { [key: string]: string[] } = {
                'Cupcakes': ['cupcake', 'cupcake_basic', 'cupcake_premium'],
                'Brownies': ['brownie'],
                'Fruit Cakes': ['fruitcake'],
                'Bread': ['bread']
            };
            const productTypes = categoryMap[activeCategory];
            matchesCategory = productTypes?.includes(product.product_type || '') || false;
        }

        const matchesSearch = !searchQuery ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.base_price - b.base_price;
            case 'price-high':
                return b.base_price - a.base_price;
            case 'name':
                return a.name.localeCompare(b.name);
            case 'newest':
            default:
                return 0;
        }
    });

    // Pagination
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, searchQuery, sortBy]);

    return (
        <main className="min-h-screen bg-sai-white pb-24 md:pb-8 relative">
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

            {/* Tagline Section - Refined with Animated Text */}
            <section className="px-6 pt-20 md:pt-28 pb-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-sai-charcoal/70 mb-3">
                        Sweet cravings sorted
                    </p>
                    <h2 className="font-serif text-4xl md:text-5xl font-normal text-sai-charcoal relative inline-block">
                        <AnimatedText
                            words={['Freshly Baked', 'Made With Love', 'Crafted Daily', 'Baked to Perfection']}
                            className="text-sai-pink"
                        />
                    </h2>
                </div>
            </section>

            {/* Desktop: Search & Filters Toolbar */}
            <section className="hidden md:block px-6 py-6">
                <div className="max-w-6xl mx-auto">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative max-w-md mx-auto">
                            <input
                                type="text"
                                placeholder="Search products..."
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

                    {/* Category Filters - Centered */}
                    <div className="flex justify-center mb-4">
                        <CategoryTabs
                            categories={categories}
                            activeCategory={activeCategory}
                            onCategoryChange={setActiveCategory}
                        />
                    </div>

                    {/* Results Bar: Count + Sort */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-semibold">{paginatedProducts.length}</span> of <span className="font-semibold">{sortedProducts.length}</span> products
                        </p>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center gap-2">
                                    <span className="text-sm">
                                        {sortBy === 'newest' && 'Newest First'}
                                        {sortBy === 'price-low' && 'Price: Low to High'}
                                        {sortBy === 'price-high' && 'Price: High to Low'}
                                        {sortBy === 'name' && 'Name: A-Z'}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onSelect={() => setSortBy('newest')}
                                    className="hover:bg-sai-pink/5 focus:bg-sai-pink/10 focus:text-sai-pink cursor-pointer"
                                >
                                    Newest First
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onSelect={() => setSortBy('price-low')}
                                    className="hover:bg-sai-pink/5 focus:bg-sai-pink/10 focus:text-sai-pink cursor-pointer"
                                >
                                    Price: Low to High
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onSelect={() => setSortBy('price-high')}
                                    className="hover:bg-sai-pink/5 focus:bg-sai-pink/10 focus:text-sai-pink cursor-pointer"
                                >
                                    Price: High to Low
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onSelect={() => setSortBy('name')}
                                    className="hover:bg-sai-pink/5 focus:bg-sai-pink/10 focus:text-sai-pink cursor-pointer"
                                >
                                    Name: A-Z
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </section>

            {/* Mobile: Search Bar + Filter Button */}
            <section className="md:hidden px-6 pt-6 pb-4">
                <div className="flex gap-2">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search products..."
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

                    {/* Filter Button */}
                    <button
                        onClick={() => setIsFilterModalOpen(true)}
                        className="relative w-12 h-12 rounded-xl bg-sai-pink text-white flex items-center justify-center hover:bg-sai-pink/90 transition-colors"
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                        {/* Active filter indicator */}
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
                sortBy={sortBy}
                onSortChange={setSortBy}
            />

            {/* Products Grid */}
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
                                {paginatedProducts.map((product, index) => (
                                    <div key={product.id} className="relative">
                                        <ProductCard
                                            productId={product.id}
                                            name={product.name}
                                            price={product.base_price}
                                            description={product.description || undefined}
                                            category={product.category_name}
                                            image_url={product.image_url || undefined}
                                            tags={product.tags}
                                            onClick={() => handleProductClick(product)}
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
                                        onClick={() => handleProductClick(product)}
                                    />
                                ))}
                            </div>

                            {/* Pagination Controls */}
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

            {/* Mobile Bottom Navigation */}
            <BottomNav />

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
