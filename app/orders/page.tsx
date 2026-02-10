'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import AuthSync from '@/app/components/AuthSync';
import LoginRequired from './_components/LoginRequired';
import OrdersHeader from './_components/OrdersHeader';
import EmptyOrders from './_components/EmptyOrders';
import OrderCard from './_components/OrderCard';
import { Loader2 } from 'lucide-react';

export default function OrdersPage() {
    const { user, orders, isLoadingData, isCheckingAuth } = useProfile();
    const router = useRouter();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                router.replace('/profile?tab=dashboard&open=orders');
            }
        };

        // check on mount
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [router]);

    if (isCheckingAuth || (isLoadingData && !user)) {
        return (
            <div className="min-h-screen pt-24 px-4 flex justify-center">
                <Loader2 className="w-8 h-8 text-sai-pink animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <LoginRequired />;
    }

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 bg-sai-cream">
            <AuthSync />
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-gray-200">
                    <OrdersHeader />

                    {orders.length > 0 ? (
                        <div className="mt-6 space-y-6">
                            {orders.map((order) => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>
                    ) : (
                        <EmptyOrders />
                    )}
                </div>
            </div>
        </div>
    );
}
