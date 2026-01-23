import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartSummary() {
    const { subtotal } = useCart();
    const router = useRouter();

    const handleCheckout = () => {
        router.push('/checkout');
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">RM {subtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-gray-400 text-sm italic">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="text-gray-400 text-sm italic">Included</span>
                </div>

                <Separator />

                <div className="flex justify-between items-end">
                    <span className="text-base font-bold text-gray-900">Estimated Total</span>
                    <span className="text-2xl font-serif font-bold text-sai-pink">RM {subtotal().toFixed(2)}</span>
                </div>
            </div>

            <Button
                onClick={handleCheckout}
                className="w-full mt-8 bg-sai-pink hover:bg-sai-pink/90 text-white rounded-xl py-6 text-lg shadow-lg shadow-pink-100 transition-all active:scale-[0.98]"
            >
                Checkout
                <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="mt-4 text-xs text-center text-gray-400">
                Secure checkout with DuitNow QR
            </p>
        </div>
    );
}
