import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Shared types
export interface Product {
    id: string;
    name: string;
    base_price: number;
    price?: number; // Some components might use 'price' instead of 'base_price'
    description?: string | null;
    category_name: string;
    image_url?: string | null;
    is_available?: boolean;
    is_best_seller?: boolean;
    tags?: string[];
    product_type?: string;
}

export type SortOption = 'newest' | 'price-low' | 'price-high' | 'name';

interface UseProductFiltersProps {
    initialCategory?: string;
    itemsPerPage?: number;
    categoryMap?: { [key: string]: string[] }; // Map UI category to product_type(s)
    onFetch?: () => Promise<Product[]>; // Optional custom fetch function
}

export function useProductFilters({
    initialCategory = 'All',
    itemsPerPage = 12,
    categoryMap,
    onFetch
}: UseProductFiltersProps = {}) {
    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Filter reset on change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, searchQuery, sortBy]);

    // Data fetching
    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                if (onFetch) {
                    const data = await onFetch();
                    setProducts(data);
                } else {
                    // Default fetch if no custom fetch provided
                    const { data, error } = await supabase
                        .from('products')
                        .select('*');

                    if (error) throw error;
                    setProducts(data || []);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [onFetch]);

    // Filtering logic
    const filteredProducts = products.filter(product => {
        // Category Filter
        let matchesCategory = true;
        if (activeCategory !== 'All') {
            if (categoryMap) {
                // Use category mapping if provided (e.g., Other Treats)
                const productTypes = categoryMap[activeCategory];
                matchesCategory = productTypes?.includes(product.product_type || '') || false;
            } else {
                // Default behavior: check if category matches name/description/category field 
                // Or implementing Custom Cakes logic where category matches name/desc
                const categoryLower = activeCategory.toLowerCase();
                matchesCategory =
                    (product.category_name?.toLowerCase() === categoryLower) ||
                    product.name.toLowerCase().includes(categoryLower) ||
                    product.description?.toLowerCase().includes(categoryLower) ||
                    false;
            }
        }

        // Search Filter
        const matchesSearch = !searchQuery ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    // Sort logic
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return (a.base_price || 0) - (b.base_price || 0);
            case 'price-high':
                return (b.base_price || 0) - (a.base_price || 0);
            case 'name':
                return a.name.localeCompare(b.name);
            case 'newest':
            default:
                return 0; // Assuming default order from DB is acceptable or timestamps if available
        }
    });

    // Pagination logic
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

    return {
        // State
        products,
        filteredProducts, // Expose if needed
        sortedProducts,   // Expose if needed
        paginatedProducts,
        activeCategory,
        loading,
        searchQuery,
        currentPage,
        sortBy,
        isFilterModalOpen,
        isMobile,
        totalPages,

        // Setters
        setActiveCategory,
        setSearchQuery,
        setCurrentPage,
        setSortBy,
        setIsFilterModalOpen,

        // Helper
        totalCount: sortedProducts.length,
        showingCount: paginatedProducts.length,
    };
}
