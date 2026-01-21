'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AuthSync from '@/app/components/AuthSync';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    // Placeholder for actual orders data fetching logic
    // const [orders, setOrders] = useState([]); 

    const router = useRouter();

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
        return (
            <div className="min-h-screen pt-32 px-4">
                <div className="max-w-md mx-auto text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-sai-charcoal">Log In to View Orders</h1>
                    <p className="text-gray-600">Please sign in to access your order history.</p>
                    <Link
                        href="/login?next=/orders"
                        className="inline-block px-8 py-3 bg-sai-charcoal text-white rounded-xl font-medium hover:bg-sai-charcoal/90 transition-colors"
                    >
                        Log In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 bg-sai-cream">
            <AuthSync />
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-gray-200">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-sai-charcoal font-serif">Order History</h1>
                            <p className="text-gray-500 text-sm">Track past and current orders</p>
                        </div>
                        <div className="px-3 py-1 bg-pink-50 text-sai-pink text-xs font-bold rounded-full border border-pink-100">
                            0 Active
                        </div>
                    </div>

                    {/* Empty State for now */}
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-sai-charcoal mb-2">No orders yet</h3>
                        <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                            Looks like you haven&apos;t placed any orders yet. Treat yourself to something sweet!
                        </p>
                        <button
                            onClick={() => router.push('/custom-cakes')}
                            className="px-6 py-2.5 bg-sai-pink text-white rounded-xl font-medium hover:bg-sai-pink/90 transition-colors shadow-sm"
                        >
                            Start Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
