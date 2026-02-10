import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Counter from '@/app/components/Counter';

export default function CartSummary() {
    const { subtotal } = useCart();
    const router = useRouter();
    const [isGuest, setIsGuest] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setIsGuest(!user);
        });
    }, []);

    const handleCheckout = () => {
        if (isGuest) return;
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
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-serif font-bold text-sai-pink">RM</span>
                        <Counter
                            value={subtotal()}
                            fontSize={24}
                            padding={0}
                            gap={2}
                            textColor="var(--color-sai-pink)"
                            fontWeight="bold"
                            gradientHeight={0}
                            gradientFrom="white"
                            gradientTo="transparent"
                        />
                    </div>
                </div>
            </div>

            <Button
                onClick={handleCheckout}
                disabled={isGuest}
                className={`w-full mt-8 rounded-xl py-6 text-lg shadow-lg transition-all active:scale-[0.98] ${isGuest
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none hover:bg-gray-300 pointer-events-none'
                        : 'bg-sai-pink hover:bg-sai-pink/90 text-white shadow-pink-100'
                    }`}
            >
                {isGuest ? 'Login to Checkout' : 'Checkout'}
                {!isGuest && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>

            {isGuest && (
                <p className="text-xs text-center text-gray-400 mt-2">
                    Please <span className="font-medium text-sai-pink cursor-pointer hover:underline" onClick={() => router.push('/login?redirect=/checkout')}>sign in</span> to complete your purchase.
                </p>
            )}

            <p className="mt-4 text-xs text-center text-gray-400">
                Secure checkout with DuitNow QR
            </p>
        </div>
    );
}
