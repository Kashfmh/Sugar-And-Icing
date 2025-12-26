'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '../components/ProductCard';
import CategoryTabs from '../components/CategoryTabs';
import Badge from '../components/Badge';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { ArrowLeft } from 'lucide-react';
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

    const filteredProducts = activeCategory === 'All'
        ? products
        : products.filter(p => p.category_name === activeCategory);

    return (
        <main className="min-h-screen bg-white pb-24 md:pb-8">
            {/* Desktop Navbar */}
            <div className="hidden md:block">
                <Navbar />
            </div>

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

            {/* Tagline */}
            <section className="px-6 pt-8 pb-4">
                <h2 className="text-2xl text-center text-sai-charcoal/70">
                    Sweet cravings sorted
                </h2>
                <p className="font-serif text-3xl text-center mt-2 text-sai-charcoal">
                    Freshly Baked
                </p>
            </section>

            {/* Category Tabs */}
            <section className="px-6 py-6">
                <CategoryTabs
                    categories={categories}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                />
            </section>

            {/* Products Grid */}
            <section className="px-6 py-4">
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-sai-charcoal/60">Loading delicious treats...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-sai-charcoal/60">No products found in this category.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product, index) => (
                                <div key={product.id} className="relative">
                                    {/* Best Seller Badge on first product */}
                                    {index === 0 && (
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
                    )}
                </div>
            </section>

            {/* Mobile Bottom Navigation */}
            <BottomNav />
        </main>
    );
}
