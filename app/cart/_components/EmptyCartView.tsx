import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

export default function EmptyCartView() {
    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center space-y-4 max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-10 h-10 text-gray-400" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-serif font-bold text-sai-charcoal">Your cart is empty</h1>
                    <p className="text-gray-500">Looks like you haven't added any treats yet.</p>
                </div>
                <Button
                    asChild
                    className="mt-4 bg-sai-pink hover:bg-sai-pink/90 text-white rounded-full px-8"
                >
                    <Link href="/other-treats">Browse Menu</Link>
                </Button>
            </div>
        </main>
    );
}
