import Link from 'next/link';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

interface SuccessCardProps {
    orderId: string | null;
}

export default function SuccessCard({ orderId }: SuccessCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
        >
            <div className="bg-sai-pink/10 p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-serif font-bold text-sai-charcoal mb-2">Order Confirmed!</h1>
                <p className="text-gray-600">
                    Thank you for your order. We've received your request and payment receipt.
                </p>
            </div>

            <div className="p-8 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Order ID</p>
                    <p className="font-mono font-medium text-sai-charcoal select-all">{orderId || 'Processing...'}</p>
                </div>

                <div className="space-y-4 text-sm text-gray-600">
                    <p>
                        We will verify your payment shortly. You will receive a confirmation message via WhatsApp or Email once verified.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Payment Status: <span className="font-medium text-orange-500">Pending Verification</span></li>
                        <li>Preparation: Will start after verification</li>
                    </ul>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <Link
                        href="/"
                        className="w-full bg-sai-pink text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Return Home
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
