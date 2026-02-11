'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { useCheckout } from '@/hooks/useCheckout';

import ContactInfo from './_components/ContactInfo';
import DeliveryOptions from './_components/DeliveryOptions';
import PaymentForm from './_components/PaymentForm';
import OrderSummary from './_components/OrderSummary';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
    const router = useRouter();
    const checkout = useCheckout();

    useEffect(() => {
        if (!checkout.loading && !checkout.user) {
            router.push('/login?redirect=/checkout');
        }
    }, [checkout.loading, checkout.user, router]);


    if (checkout.loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-sai-white">
                <Loader2 className="w-8 h-8 animate-spin text-sai-pink" />
            </div>
        );
    }

    if (checkout.error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-sai-white gap-4 p-4 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-2">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Something went wrong</h2>
                <p className="text-gray-500 max-w-md">{checkout.error}</p>
                <div className="flex gap-3 mt-4">
                    <Link href="/other-treats" className="text-sai-pink hover:underline font-medium">Return to Menu</Link>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">Try Again</button>
                </div>
            </div>
        );
    }

    if (checkout.cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-sai-white gap-4">
                <p className="text-gray-500">Your cart is empty.</p>
                <Link href="/other-treats" className="text-sai-pink hover:underline">Go to Menu</Link>
            </div>
        );
    }

    if (!checkout.clientSecret) {
        // Fallback loader if clientSecret missing but no error (shouldn't happen with new logic, but safe to have)
        return (
            <div className="min-h-screen flex items-center justify-center bg-sai-white">
                <Loader2 className="w-8 h-8 animate-spin text-sai-pink" />
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
                        deliveryDate={checkout.deliveryDate}
                        setDeliveryDate={checkout.setDeliveryDate}
                        deliverySlot={checkout.deliverySlot}
                        setDeliverySlot={checkout.setDeliverySlot}
                    />

                    <Elements stripe={stripePromise} options={{ clientSecret: checkout.clientSecret }}>
                        <PaymentForm
                            clientSecret={checkout.clientSecret}
                            orderId={checkout.orderId!}
                            contact={checkout.contact}
                            cartTotal={checkout.cartTotal}
                            setIsProcessing={checkout.setIsProcessing}
                            deliveryType={checkout.deliveryType}
                            selectedAddress={checkout.selectedAddress}
                            deliveryDate={checkout.deliveryDate}
                            deliverySlot={checkout.deliverySlot}
                            addressSnapshot={checkout.addresses.find((a: any) => a.id === checkout.selectedAddress)}
                        />
                    </Elements>
                </div>

                <div className="lg:col-span-4 mt-8 lg:mt-0">
                    <OrderSummary
                        cartItems={checkout.cartItems}
                        cartTotal={checkout.cartTotal}
                        isProcessing={checkout.isProcessing}
                        contact={checkout.contact}
                        deliveryType={checkout.deliveryType}
                        selectedAddress={checkout.selectedAddress}
                        deliveryDate={checkout.deliveryDate}
                        deliverySlot={checkout.deliverySlot}
                    />
                </div>
            </div>
        </main>
    );
}