'use client';

import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// controller
import { useCheckout } from '@/hooks/useCheckout';

import ContactInfo from './_components/ContactInfo';
import DeliveryOptions from './_components/DeliveryOptions';
import PaymentForm from './_components/PaymentForm';
import OrderSummary from './_components/OrderSummary';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
    const checkout = useCheckout();

    // loading state
    if (checkout.loading || !checkout.clientSecret) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-sai-white">
                <Loader2 className="w-8 h-8 animate-spin text-sai-pink" />
            </div>
        );
    }

    // empty cart
    if (checkout.cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-sai-white gap-4">
                <p className="text-gray-500">Your cart is empty.</p>
                <Link href="/other-treats" className="text-sai-pink hover:underline">Go to Menu</Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-sai-white pb-12">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 lg:hidden">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
                    <Link href="/other-treats" className="flex items-center text-gray-500 hover:text-sai-pink transition-colors">
                        <ChevronLeft className="w-5 h-5 mr-1" /> Back
                    </Link>
                    <h1 className="ml-auto font-serif text-xl font-bold text-sai-charcoal">Checkout</h1>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8 lg:mt-16 lg:grid lg:grid-cols-12 lg:gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <ContactInfo
                        contact={checkout.contact}
                        setContact={checkout.setContact}
                        loading={checkout.loading}
                        user={checkout.user}
                    />

                    <DeliveryOptions
                        deliveryType={checkout.deliveryType}
                        setDeliveryType={checkout.setDeliveryType}
                        addresses={checkout.addresses}
                        selectedAddress={checkout.selectedAddress}
                        setSelectedAddress={checkout.setSelectedAddress}
                        userId={checkout.user?.id}
                        onRefresh={checkout.refreshAddresses}
                    />

                    {/* stripe provider wrapper */}
                    <Elements stripe={stripePromise} options={{ clientSecret: checkout.clientSecret }}>
                        <PaymentForm
                            clientSecret={checkout.clientSecret}
                            orderId={checkout.orderId!}
                            contact={checkout.contact}
                            cartTotal={checkout.cartTotal}
                            setIsProcessing={checkout.setIsProcessing}
                        />
                    </Elements>
                </div>

                <div className="lg:col-span-4 mt-8 lg:mt-0">
                    <OrderSummary
                        cartItems={checkout.cartItems}
                        cartTotal={checkout.cartTotal}
                        isProcessing={checkout.isProcessing}
                    />
                </div>
            </div>
        </main>
    );
}