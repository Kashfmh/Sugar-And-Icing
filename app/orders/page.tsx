'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AuthSync from '@/app/components/AuthSync';
import LoginRequired from './_components/LoginRequired';
import OrdersHeader from './_components/OrdersHeader';
import EmptyOrders from './_components/EmptyOrders';

export default function OrdersPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserId(user.id);
        }
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-24 px-4 flex justify-center">
                <div className="w-8 h-8 border-2 border-sai-pink border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!userId) {
        return <LoginRequired />;
    }

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 bg-sai-cream">
            <AuthSync />
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-gray-200">
                    <OrdersHeader />
                    <EmptyOrders />
                </div>
            </div>
        </div>
    );
}
