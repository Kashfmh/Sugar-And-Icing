'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import SuccessCard from './_components/SuccessCard';

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const paymentStatus = searchParams.get('redirect_status');
    const paymentIntentId = searchParams.get('payment_intent');
    const { clearCart } = useCart();

    useEffect(() => {
        clearCart();

        if (paymentIntentId) {
            fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    paymentIntentId
                })
            })
                .then(res => res.json())
                .then(data => console.log("Verification Result:", data))
                .catch(err => console.error("Verification Missing:", err));
        }
    }, [clearCart, orderId, paymentIntentId]);

    return (
        <main className="min-h-screen bg-sai-white flex items-center justify-center p-4 lg:pt-20">
            <SuccessCard orderId={orderId} paymentStatus={paymentStatus} />
        </main>
    );
}
