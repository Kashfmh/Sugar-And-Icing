'use client';

import { useCart } from '@/hooks/useCart';
import CartSkeleton from './_components/CartSkeleton';
import EmptyCartView from './_components/EmptyCartView';
import CartList from './_components/CartList';
import CartSummary from './_components/CartSummary';

export default function CartPage() {
    const { items, totalItems, isLoading } = useCart();

    if (isLoading) {
        return <CartSkeleton />;
    }

    if (items.length === 0) {
        return <EmptyCartView />;
    }

    return (
        <main className="min-h-screen bg-gray-50 py-8 md:pt-28 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-serif font-bold text-sai-charcoal mb-8">
                    Your Cart ({totalItems()} items)
                </h1>

                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Cart Items List */}
                    <div className="lg:col-span-8">
                        <CartList />
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4 mt-8 lg:mt-0">
                        <CartSummary />
                    </div>
                </div>
            </div>
        </main>
    );
}
