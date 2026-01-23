import CategoryTabs from '@/app/components/CategoryTabs';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FilterModal from '@/app/components/FilterModal';

interface MenuFilterBarProps {
    categories: string[];
    activeCategory: string;
    setActiveCategory: (cat: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    sortBy: 'newest' | 'price-low' | 'price-high' | 'name';
    setSortBy: (sort: 'newest' | 'price-low' | 'price-high' | 'name') => void;
    paginatedCount: number;
    totalCount: number;
    isFilterModalOpen: boolean;
    setIsFilterModalOpen: (open: boolean) => void;
}

export default function MenuFilterBar({
    categories,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    paginatedCount,
    totalCount,
    isFilterModalOpen,
    setIsFilterModalOpen
}: MenuFilterBarProps) {
    return (
        <>
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
                            Showing <span className="font-semibold">{paginatedCount}</span> of <span className="font-semibold">{totalCount}</span> products
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
        </>
    );
}
