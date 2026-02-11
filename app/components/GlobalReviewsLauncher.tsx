"use client";

import { useEffect, useState } from 'react';
import ReviewsViewerModal from '@/app/components/ReviewsViewerModal';

export default function GlobalReviewsLauncher() {
    const [isOpen, setIsOpen] = useState(false);
    const [productId, setProductId] = useState<string | null>(null);
    const [productName, setProductName] = useState<string>('');

    useEffect(() => {
        const handler = (e: any) => {
            const detail = e?.detail || {};
            setProductId(detail.productId || null);
            setProductName(detail.productName || '');
            setIsOpen(true);
        };

        window.addEventListener('open-reviews', handler as EventListener);
        return () => window.removeEventListener('open-reviews', handler as EventListener);
    }, []);

    return (
        <>
            {productId && (
                <ReviewsViewerModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    productId={productId}
                    productName={productName}
                />
            )}
        </>
    );
}
