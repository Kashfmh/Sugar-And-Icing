import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useCart } from '@/hooks/useCart';
import { Loader2, AlertCircle, Lock } from 'lucide-react';
import NumberBadge from '@/components/ui/number-badge';
import { isValidEmail, isValidPhone, isValidName } from '@/lib/validators';

interface PaymentFormProps {
    clientSecret: string;
    orderId: string;
    contact: any;
    cartTotal: number;
    setIsProcessing: (b: boolean) => void;
    deliveryType: 'pickup' | 'delivery';
    selectedAddress: string;
    deliveryDate: string;
    deliverySlot: string;
    addressSnapshot: any;
}

export default function PaymentForm({
    clientSecret, orderId, contact, cartTotal, setIsProcessing,
    deliveryType, selectedAddress, deliveryDate, deliverySlot, addressSnapshot
}: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const { clearCart } = useCart();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isContactValid = isValidName(contact.first_name) && isValidName(contact.last_name) && isValidEmail(contact.email) && isValidPhone(contact.phone);
    // Delivery validation: if delivery, need address + date + slot
    const isDeliveryValid = deliveryType === 'pickup' || (deliveryType === 'delivery' && selectedAddress && deliveryDate && deliverySlot);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Strict check: orderId must be a valid non-empty string and NOT "undefined"
        if (!stripe || !elements || !orderId || orderId === 'undefined' || orderId === 'null') {
            console.error("Missing Stripe or Invalid Order ID:", orderId);
            setError("Critical Error: Order ID is missing. Please refresh the page.");
            return;
        }

        setLoading(true);
        setIsProcessing(true);
        setError(null);

        try {
            const { error: submitError } = await elements.submit();
            if (submitError) throw submitError;

            // Update Order Details before payment
            const updateRes = await fetch(`/api/account/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deliveryType,
                    deliveryAddressSnapshot: deliveryType === 'delivery' ? addressSnapshot : null,
                    deliveryDate: deliveryType === 'delivery' ? deliveryDate : null,
                    deliverySlot: deliveryType === 'delivery' ? deliverySlot : null,
                    paymentMethod: 'card' // Currently only supports card via Stripe Elements
                })
            });

            if (!updateRes.ok) {
                const errData = await updateRes.json();
                throw new Error(errData.error || 'Failed to save order details');
            }

            const { error: payError } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/success?orderId=${orderId}`,
                    payment_method_data: {
                        billing_details: {
                            name: `${contact.first_name} ${contact.last_name}`,
                            email: contact.email,
                            phone: contact.phone
                        }
                    }
                },
            });

            if (payError) setError(payError.message || "Payment failed");
            else clearCart();

        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
            setIsProcessing(false);
        }
    };

    return (
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h2 className="text-lg font-bold text-sai-charcoal flex items-center gap-2">
                    <NumberBadge number={3} size="sm" /> Card Details
                </h2>
                <div className="border border-gray-200 rounded-xl p-4">
                    <PaymentElement />
                </div>
            </section>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex gap-2">
                    <AlertCircle className="w-5 h-5" /> {error}
                </div>
            )}

            <div className="block lg:hidden">
                <button
                    type="submit"
                    disabled={!stripe || loading || !isContactValid || !isDeliveryValid}
                    className="w-full bg-sai-pink text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-200 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Lock className="w-4 h-4" /> Pay RM {cartTotal.toFixed(2)}</>}
                </button>
                {!isContactValid && (
                    <p className="text-xs text-red-500 text-center mt-2">
                        Please fill in all contact details correctly to proceed.
                    </p>
                )}
                {isContactValid && !isDeliveryValid && (
                    <p className="text-xs text-red-500 text-center mt-2">
                        {deliveryType === 'delivery' && !selectedAddress
                            ? "Please select a delivery address."
                            : "Please select a delivery date and time slot."}
                    </p>
                )}
            </div>
        </form>
    );
}