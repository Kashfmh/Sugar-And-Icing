"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import RateOrderModal from '@/app/components/RateOrderModal';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export default function MobileReviewPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params?.orderId as string;
    const [order, setOrder] = useState<any | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined' && window.innerWidth >= 768) {
            // Desktop users should not see mobile page; redirect to profile and ask to open modal
            router.push(`/profile?openRate=${orderId}`);
            return;
        }

        // Load order details for this user (best-effort)
        (async () => {
            try {
                const { data } = await supabase.from('orders').select('*, order_items(*, products(name, image_url, gallery_images))').eq('id', orderId).limit(1).single();
                setOrder(data || null);
            } catch (e) {
                console.error('Failed to load order', e);
            }
        })();
    }, [orderId]);

    if (!mounted) return null;

    if (!order) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-white">
            <RateOrderModal isOpen={true} onClose={() => router.back()} order={order} userId={order.user_id} />
        </div>
    );
}
