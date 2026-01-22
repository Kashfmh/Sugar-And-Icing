import Image from 'next/image';
import { Loader2, Lock } from 'lucide-react';

interface OrderSummaryProps {
    cartItems: any[];
    cartTotal: number;
    isProcessing: boolean;
}

export default function OrderSummary({ cartItems, cartTotal, isProcessing }: OrderSummaryProps) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-24">
            <h2 className="text-lg font-bold text-sai-charcoal mb-4">Order Summary</h2>

            <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                            {item.image_url && <Image src={item.image_url} alt={item.name} fill className="object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-sm text-sai-pink font-semibold">RM {(item.price * item.quantity).toFixed(2)}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-between text-base font-bold text-sai-charcoal">
                <span>Total</span>
                <span>RM {cartTotal.toFixed(2)}</span>
            </div>

            {/* Desktop Pay Button - Links to the form ID "checkout-form" */}
            <div className="hidden lg:block mt-6">
                <button
                    type="submit"
                    form="checkout-form"
                    disabled={isProcessing}
                    className="w-full bg-sai-pink text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-200 hover:bg-sai-white hover:text-sai-pink hover:border-sai-pink border border-transparent hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <><Lock className="w-4 h-4" /> Pay RM {cartTotal.toFixed(2)}</>}
                </button>
            </div>
        </div>
    );
}