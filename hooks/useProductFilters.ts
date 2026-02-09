import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';


export interface Product {
    id: string;
    name: string;
    base_price: number;
    price?: number;
    description?: string | null;
    category_name?: string | null;
    image_url?: string | null;
    is_available?: boolean | null;
    is_best_seller?: boolean | null;
    tags?: string[] | null;
    product_type?: string | null;
}

export type SortOption = 'newest' | 'price-low' | 'price-high' | 'name';

interface UseProductFiltersProps {
    initialCategory?: string;
    itemsPerPage?: number;
    categoryMap?: { [key: string]: string[] };
    onFetch?: () => Promise<Product[]>;
}

export function useProductFilters({
    initialCategory = 'All',
    itemsPerPage = 12,
    categoryMap,
    onFetch
}: UseProductFiltersProps = {}) {
    const supabase = createClient();
    const [products, setProducts] = useState<Product[]>([]);
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, searchQuery, sortBy]);

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                if (onFetch) {
                    const data = await onFetch();
                    setProducts(data);
                } else {
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

    const filteredProducts = products.filter(product => {
        let matchesCategory = true;
        if (activeCategory !== 'All') {
            if (categoryMap) {
                const productTypes = categoryMap[activeCategory];
                matchesCategory = productTypes?.includes(product.product_type || '') || false;
            } else {
                const categoryLower = activeCategory.toLowerCase();
                matchesCategory =
                    (product.category_name?.toLowerCase() === categoryLower) ||
                    product.name.toLowerCase().includes(categoryLower) ||
                    product.description?.toLowerCase().includes(categoryLower) ||
                    false;
            }
        }

        const matchesSearch = !searchQuery ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });

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
                return 0;
        }
    });

    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

    return {
        products,
        filteredProducts,
        sortedProducts,
        paginatedProducts,
        activeCategory,
        loading,
        searchQuery,
        currentPage,
        sortBy,
        isFilterModalOpen,
        isMobile,
        totalPages,

        setActiveCategory,
        setSearchQuery,
        setSortBy,
        setCurrentPage,
        setIsFilterModalOpen,

        totalCount: sortedProducts.length,
        showingCount: paginatedProducts.length,
    };
}