import Link from 'next/link';
import { CheckCircle, Home, ShoppingBag, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';

interface SuccessCardProps {
    orderId: string | null;
    paymentStatus?: string | null;
}

export default function SuccessCard({ orderId, paymentStatus }: SuccessCardProps) {
    const isSuccess = paymentStatus === 'succeeded';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
        >
            <div className="bg-sai-pink/10 p-8 text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isSuccess ? 'bg-green-100' : 'bg-orange-100'}`}>
                    <CheckCircle className={`w-10 h-10 ${isSuccess ? 'text-green-600' : 'text-orange-500'}`} />
                </div>
                <h1 className="text-3xl font-serif font-bold text-sai-charcoal mb-2">
                    {isSuccess ? 'Order Confirmed!' : 'Processing Order'}
                </h1>
                <p className="text-gray-600">
                    {isSuccess
                        ? "Thank you for your order. We has received your payment."
                        : "We've received your request. Please wait while we verify."}
                </p>
            </div>

            <div className="p-8 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Order ID</p>
                    <p className="font-mono font-medium text-sai-charcoal select-all">{orderId || 'Processing...'}</p>
                </div>

                <div className="space-y-4 text-sm text-gray-600">
                    <p>
                        You will receive a confirmation message via WhatsApp or Email shortly.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>
                            Payment Status: {' '}
                            {isSuccess ? (
                                <span className="font-medium text-green-600">Paid (Stripe)</span>
                            ) : (
                                <span className="font-medium text-orange-500">Pending Verification</span>
                            )}
                        </li>
                        <li>Preparation: Will start immediately</li>
                    </ul>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <Link
                        href="/profile"
                        className="w-full bg-sai-pink text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <ClipboardList className="w-4 h-4" />
                        View Order Status
                    </Link>
                    <Link
                        href="/other-treats"
                        className="w-full py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 border border-gray-200"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Browse More Treats
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
