'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/hooks/useProductFilters';
import CakeDetailContent from '../_components/CakeDetailContent';
import { ProductSkeleton } from '@/app/components/skeletons/ProductSkeleton';

export default function CustomCakeMobilePage() {
    const supabase = createClient();
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        const fetchProduct = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('product_type', 'cake');

                if (error) throw error;

                if (data) {
                    const { generateProductSlug } = await import('@/lib/slugify');
                    const found = data.find((p: any) => generateProductSlug({ id: p.id, name: p.name }) === slug);
                    setProduct(found || null);
                }
            } catch (err) {
                console.error('Error fetching cake:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [slug]);

    if (loading) {
        return (
            <main className="min-h-screen bg-white">
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
                    <Link href="/custom-cakes" className="inline-flex items-center gap-2 text-sai-charcoal">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </Link>
                </div>
                <div className="max-w-4xl mx-auto p-4">
                    <ProductSkeleton />
                </div>
            </main>
        );
    }

    if (!product) {
        return notFound();
    }

    return (
        <main className="min-h-screen bg-white">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
                <Link href="/custom-cakes" className="inline-flex items-center gap-2 text-sai-charcoal">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back</span>
                </Link>
            </div>

            <div className="max-w-5xl mx-auto md:py-8 md:h-[calc(100vh-60px)]">
                <CakeDetailContent
                    cakeName={product.name}
                    imageUrl={product.image_url || undefined}
                    description={product.description || undefined}
                    onClose={() => router.push('/custom-cakes')}
                />
            </div>
        </main>
    );
}