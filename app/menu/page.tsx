'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '../components/ProductCard';
import CategoryTabs from '../components/CategoryTabs';
import Badge from '../components/Badge';
import BottomNav from '../components/BottomNav';
import FilterModal from '../components/FilterModal';
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    category_name: string;
    image_url: string;
    is_best_seller?: boolean;
}

export default function MenuPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'name'>('newest');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const itemsPerPage = 12;

    const categories = ['All', 'Signature Cakes', 'Brownies', 'Cupcakes', 'Fruit Cakes'];

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }

    // Filter by category and search
    let filteredProducts = activeCategory === 'All'
        ? products
        : products.filter(p => p.category_name === activeCategory);

    // Apply search filter
    if (searchQuery) {
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Apply sorting
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
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
        <main className="min-h-screen bg-white pb-24 md:pb-8">
            {/* Mobile Header - Simplified */}
            <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-4">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-sai-charcoal">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="font-serif text-2xl text-sai-charcoal">
                        Our Menu
                    </h1>
                </div>
            </header>

            {/* Tagline Section - Refined */}
            <section className="px-6 pt-20 md:pt-28 pb-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-sai-charcoal/70 mb-3">
                        Sweet cravings sorted
                    </p>
                    <h2 className="font-serif text-4xl md:text-5xl font-normal text-sai-charcoal">
                        Freshly Baked
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
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sai-pink/50 focus:border-sai-pink"
                        >
                            <option value="newest">Newest First</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name">Name: A-Z</option>
                        </select>
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
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                        )}
                    </button>
                </div>

                {/* Product Count (Mobile) */}
                <p className="text-xs text-gray-500 mt-3">
                    {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
                </p>
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
                        <div className="text-center py-12">
                            <p className="text-sai-charcoal/60">Loading delicious treats...</p>
                        </div>
                    ) : paginatedProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-sai-charcoal/60">
                                {searchQuery ? `No products found for "${searchQuery}"` : 'No products found in this category.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedProducts.map((product, index) => (
                                    <div key={product.id} className="relative">
                                        {/* Best Seller Badge on first product */}
                                        {index === 0 && currentPage === 1 && !searchQuery && activeCategory === 'All' && (
                                            <div className="absolute top-4 left-4 z-10">
                                                <Badge>BEST SELLER</Badge>
                                            </div>
                                        )}
                                        <ProductCard
                                            name={product.name}
                                            price={product.price}
                                            description={product.description}
                                            category={product.category_name}
                                            image_url={product.image_url}
                                        />
                                    </div>
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
        </main>
    );
}
