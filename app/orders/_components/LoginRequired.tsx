import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function LoginRequired() {
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
