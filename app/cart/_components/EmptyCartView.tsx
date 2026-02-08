import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default function EmptyCartView() {
    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center space-y-4 max-w-md">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold text-sai-charcoal">Your cart is empty</h1>
                <p className="text-gray-600">Looks like you haven't added any treats yet.</p>
                <Link
                    href="/other-treats"
                    className="inline-block px-8 py-3 bg-sai-charcoal text-white rounded-xl font-medium hover:bg-sai-charcoal/90 transition-colors"
                >
                    Browse Menu
                </Link>
            </div>
        </main>
    );
}
