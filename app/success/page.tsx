'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import SuccessCard from './_components/SuccessCard';

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { clearCart } = useCart();

    useEffect(() => {
        // Double check cart is cleared on success page
        clearCart();
    }, [clearCart]);

    return (
        <main className="min-h-screen bg-sai-white flex items-center justify-center p-4">
            <SuccessCard orderId={orderId} />
        </main>
    );
}
