'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/hooks/useProductFilters';
import CakeDetailContent from '../_components/CakeDetailContent';
import { ProductSkeleton } from '@/app/components/skeletons/ProductSkeleton';

export default function CustomCakeMobilePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    // Parse ID or name from slug? 
    // Ideally we should have a slug field, or look up by name.
    // For simplicity given the gallery uses GenerateProductSlug which combines ID+Name.
    // But since we don't have a reliable slug lookup WITHOUT fetching all or a specific backend endpoint...
    // Let's assume the slug format is `id-name` or we fetch by ID if possible.
    // Wait, `generateProductSlug` is usually `name-id` or similar.
    // Let's check `lib/slugify`. If not available, we have to guess.
    // `app/other-treats/page.tsx` uses `generateProductSlug({ id: product.id, name: product.name })`.
    // Let's assume we can try to find the product by matching the slug from a list of products,
    // OR we just fetch the product if the slug contains the ID.
    // Usually standard practice is `some-product-name-12345`.

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        const fetchProduct = async () => {
            setLoading(true);
            try {
                // Fetch ALL custom cakes and find matching slug (inefficient but works for small catalog)
                // OR better: extract ID from slug if possible.
                // Let's assume we fetch all for now or try to match name.
                // Since this is a "Custom Cake", maybe we just query by name if slug is name-based?
                // Let's peek at `generateProductSlug`.

                const { data, error } = await (supabase as any)
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

            <div className="max-w-5xl mx-auto md:py-8 h-[calc(100vh-60px)]">
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
