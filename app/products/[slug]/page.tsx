'use client';

import { useParams, notFound } from 'next/navigation';
import { useProductDetails } from '@/hooks/useProductDetails';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ProductSkeleton } from '@/app/components/skeletons/ProductSkeleton';
import ProductGallery from './_components/ProductGallery';
import ProductInfo from './_components/ProductInfo';
import AddToCartForm from './_components/AddToCartForm';
import ProductReviews from './_components/ProductReviews';

export default function ProductPage() {
    const params = useParams();
    const slug = params.slug as string;

    const { product, options, reviews, loading } = useProductDetails(slug);

    if (loading) {
        return (
            <main className="min-h-screen bg-white md:pt-28">
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 md:hidden">
                    <Link href="/other-treats" className="inline-flex items-center gap-2 text-sai-charcoal">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </Link>
                </div>
                <div className="max-w-4xl mx-auto p-4 pb-8">
                    <ProductSkeleton />
                </div>
            </main>
        );
    }

    if (!product) {
        notFound();
    }

    const images = [
        product?.image_url,
        ...(product?.gallery_images || [])
    ].filter(Boolean);

    return (
        <main className="min-h-screen bg-white md:pt-28">
            {/* mobile header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 md:hidden">
                <Link href="/other-treats" className="inline-flex items-center gap-2 text-sai-charcoal">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back</span>
                </Link>
            </div>

            <div className="max-w-4xl mx-auto p-4 pb-8">
                <ProductGallery images={images} productName={product.name} />

                <div className="space-y-4">
                    <ProductInfo product={product} />

                    {/* customization form */}
                    <AddToCartForm product={product} options={options} />

                    <ProductReviews reviews={reviews} />
                </div>
            </div>
        </main>
    );
}
