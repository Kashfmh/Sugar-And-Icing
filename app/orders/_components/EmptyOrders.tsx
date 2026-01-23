import { ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EmptyOrders() {
    const router = useRouter();

    return (
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
    );
}
