import CategoryTabs from '@/app/components/CategoryTabs';
import { SlidersHorizontal } from 'lucide-react';
import FilterModal from '@/app/components/FilterModal';
import SharedSearchBar from '@/app/components/ui/SharedSearchBar';
import SharedFilterDropdown from '@/app/components/ui/SharedFilterDropdown';

interface CakeFilterBarProps {
    categories: string[];
    activeCategory: string;
    setActiveCategory: (cat: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    sortBy: 'newest' | 'name' | 'price-low' | 'price-high';
    setSortBy: (sort: 'newest' | 'name' | 'price-low' | 'price-high') => void;
    paginatedCount: number;
    totalCount: number;
    isFilterModalOpen: boolean;
    setIsFilterModalOpen: (open: boolean) => void;
}

export default function CakeFilterBar({
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
}: CakeFilterBarProps) {
    return (
        <>
            {/* Desktop: Search & Filters */}
            <section className="hidden md:block px-6 py-6">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6 max-w-md mx-auto">
                        <SharedSearchBar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            placeholder="Search cake designs..."
                        />
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
                            Showing <span className="font-semibold">{paginatedCount}</span> of <span className="font-semibold">{totalCount}</span> designs
                        </p>
                        <SharedFilterDropdown
                            options={[
                                { label: 'Newest First', value: 'newest' },
                                { label: 'Name: A-Z', value: 'name' }
                            ]}
                            activeValue={sortBy}
                            onFilterChange={(val) => setSortBy(val as any)}
                            triggerLabel={
                                sortBy === 'newest' ? 'Newest First' : 'Name: A-Z'
                            }
                            triggerIcon={null}
                        />
                    </div>
                </div>
            </section>

            {/* Mobile: Search + Filter Button */}
            <section className="md:hidden px-6 pt-6 pb-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <SharedSearchBar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            placeholder="Search cake designs..."
                        />
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
                sortBy={sortBy}
                onSortChange={setSortBy}
            />
        </>
    );
}
