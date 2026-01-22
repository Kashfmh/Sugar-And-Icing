'use client';

import { useState, useEffect } from 'react';
import { fetchUserProfile } from '@/lib/services/authService';
import AddressManager from '../components/AddressManager';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Loader2, AlertCircle, Calendar, Lock } from 'lucide-react';
import NumberBadge from '@/components/ui/number-badge';

// Initialize Stripe outside component to avoid re-loading on render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
    const { items, subtotal, clearCart } = useCart();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [contact, setContact] = useState({ first_name: '', last_name: '', email: '', phone: '' });
    const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
    const [selectedAddress, setSelectedAddress] = useState<string>('');
    const [addressError, setAddressError] = useState<string | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [showAddressManager, setShowAddressManager] = useState(false);
    // State for pay button on desktop
    const [payButtonLoading, setPayButtonLoading] = useState(false);
    const [payButtonDisabled, setPayButtonDisabled] = useState(true);

    // Fetch user profile and addresses if signed in
    useEffect(() => {
        (async () => {
            setLoadingProfile(true);
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const prof = await fetchUserProfile(user.id);
                setProfile(prof);
                setContact({
                    first_name: prof?.first_name || '',
                    last_name: prof?.last_name || '',
                    email: user.email || '',
                    phone: prof?.phone || ''
                });
                // Fetch addresses
                const { data: addr } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('user_id', user.id);
                setAddresses(addr || []);
            }
            setLoadingProfile(false);
        })();
    }, []);

    // Fetch the PaymentIntent as soon as the page loads
    useEffect(() => {
        if (items.length > 0) {
            fetch('/api/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }),
            })
                .then((res) => res.json())
                .then((data) => setClientSecret(data.clientSecret));
        }
    }, [items]);

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-sai-white gap-4">
                <p className="text-gray-500">Your cart is empty.</p>
                <Link href="/other-treats" className="text-sai-pink hover:underline">Go to Menu</Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-sai-white pb-12">
            {/* Mobile Only Top Bar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 block lg:hidden">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
                    <Link href="/other-treats" className="flex items-center text-gray-500 hover:text-sai-pink transition-colors">
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Back to Menu
                    </Link>
                    <h1 className="ml-auto font-serif text-xl font-bold text-sai-charcoal">Secure Checkout</h1>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8 lg:mt-16 lg:grid lg:grid-cols-12 lg:gap-8">
                {/* LEFT COLUMN: Payment Form */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Contact Info Section */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                        <h2 className="text-lg font-bold text-sai-charcoal mb-4 flex items-center gap-2">
                            <NumberBadge number={1} size="sm" />
                            Contact Details
                        </h2>
                        {loadingProfile ? (
                            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-sai-pink" /></div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={contact.first_name}
                                            onChange={e => setContact({ ...contact, first_name: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sai-pink/50 focus:border-sai-pink outline-none transition-all"
                                            placeholder="e.g. Aakash"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={contact.last_name}
                                            onChange={e => setContact({ ...contact, last_name: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sai-pink/50 focus:border-sai-pink outline-none transition-all"
                                            placeholder="e.g. Sharma"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            required
                                            type="email"
                                            value={contact.email}
                                            onChange={e => setContact({ ...contact, email: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sai-pink/50 focus:border-sai-pink outline-none transition-all"
                                            placeholder="user@example.com"
                                            disabled={!!user}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            required
                                            type="tel"
                                            value={contact.phone}
                                            onChange={e => setContact({ ...contact, phone: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sai-pink/50 focus:border-sai-pink outline-none transition-all"
                                            placeholder="012-345 6789"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Pickup/Delivery Section */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                        <h2 className="text-lg font-bold text-sai-charcoal mb-4 flex items-center gap-2">
                            <NumberBadge number={2} size="sm" />
                            Pickup or Delivery
                        </h2>
                        <div className="flex gap-4 mb-4">
                            <button
                                className={`px-6 py-2 rounded-lg font-semibold border transition-all ${deliveryType === 'pickup' ? 'bg-sai-pink text-white border-sai-pink' : 'bg-white border-gray-300 text-sai-charcoal'} cursor-pointer`}
                                onClick={() => setDeliveryType('pickup')}
                            >Pickup</button>
                            <button
                                className={`px-6 py-2 rounded-lg font-semibold border transition-all ${deliveryType === 'delivery' ? 'bg-sai-pink text-white border-sai-pink' : 'bg-white border-gray-300 text-sai-charcoal'} cursor-pointer`}
                                onClick={() => setDeliveryType('delivery')}
                            >Delivery</button>
                        </div>
                        {deliveryType === 'delivery' && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Address</label>
                                {addresses.length === 0 ? (
                                    <div className="text-gray-500 text-sm mb-2">No addresses found. <button className="text-sai-pink underline cursor-pointer" onClick={() => setShowAddressManager(true)}>Add Address</button></div>
                                ) : (
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sai-pink/50 focus:border-sai-pink outline-none transition-all"
                                        value={selectedAddress}
                                        onChange={e => setSelectedAddress(e.target.value)}
                                    >
                                        <option value="">Select an address...</option>
                                        {addresses.map(addr => (
                                            <option key={addr.id} value={addr.id}>
                                                {addr.label} - {addr.address_line1}, {addr.city}, {addr.state} {addr.postcode}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {addressError && <div className="text-red-600 text-xs mt-1">{addressError}</div>}
                                <button className="text-xs text-sai-pink underline mt-2 cursor-pointer" onClick={() => setShowAddressManager(true)}>Manage Addresses</button>
                                {showAddressManager && (
                                    <div className="mt-4"><AddressManager addresses={addresses} onUpdate={() => {}} userId={user?.id} /></div>
                                )}
                            </div>
                        )}
                        {deliveryType === 'pickup' && (
                            <div className="bg-sai-pink/10 border border-sai-pink/30 rounded-xl p-4 text-sai-charcoal text-sm space-y-2 mb-2">
                                <div><span className="font-bold">Pickup Address:</span> Lot 633, Jalan Tebing, Brickfields, 50470 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur</div>
                                <div><span className="font-bold">Floor/Unit:</span> 09-08</div>
                                <div className="w-full h-48 rounded-lg overflow-hidden my-2">
                                    <iframe
                                        title="Google Maps - Lot 633, Jalan Tebing"
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.8539772419504!2d101.68806847923217!3d3.1332604451309667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc49c2f127bec1%3A0xbd153c0952983f28!2s633%20Residency!5e0!3m2!1sen!2sus!4v1769099212891!5m2!1sen!2sus" 
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>
                                <div className="text-xs text-gray-500">Timing details will be sent to your preferred contact method after payment.</div>
                            </div>
                        )}
                    </section>

                    {/* Payment Section */}
                    {clientSecret ? (
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <CheckoutForm 
                                clientSecret={clientSecret}
                                setPayButtonLoading={setPayButtonLoading}
                                setPayButtonDisabled={setPayButtonDisabled}
                            />
                        </Elements>
                    ) : (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-sai-pink" />
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Order Summary */}
                <div className="lg:col-span-4 mt-8 lg:mt-0">
                    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-24">
                        <h2 className="text-lg font-bold text-sai-charcoal mb-4">Order Summary</h2>
                        <div className="space-y-4 mb-6">
                            {items.map((item) => (
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
                            <span>RM {subtotal().toFixed(2)}</span>
                        </div>
                        {/* Pay button below order summary on desktop only */}
                        <div className="hidden lg:block mt-6">
                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={payButtonDisabled || payButtonLoading}
                                className="w-full bg-sai-pink text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-200 hover:bg-sai-white hover:text-sai-pink hover:border-sai-pink border border-transparent hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {payButtonLoading ? <Loader2 className="animate-spin" /> : <><Lock className="w-4 h-4" /> Pay RM {subtotal().toFixed(2)}</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

// Sub-component for the actual form logic
function CheckoutForm({ clientSecret, setPayButtonLoading, setPayButtonDisabled }: { clientSecret: string, setPayButtonLoading: (b: boolean) => void, setPayButtonDisabled: (b: boolean) => void }) {
    const stripe = useStripe();
    const elements = useElements();

    // Sync pay button state to parent for desktop button
    useEffect(() => {
        setPayButtonDisabled(!stripe || !elements);
    }, [stripe, elements, setPayButtonDisabled]);
    const router = useRouter();
    const { items, subtotal, clearCart } = useCart();
    
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setPayButtonLoading(true);
        setErrorMessage(null);

        try {
            // 1. Trigger Stripe Validation
            const { error: submitError } = await elements.submit();
            if (submitError) throw submitError;

            // 2. Save Order to Supabase FIRST (Status: Pending)
            // This ensures we have a record even if the user closes the window mid-payment
            const { data: { user } } = await supabase.auth.getUser();
            
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user?.id || null,
                    total_amount: subtotal(),
                    status: 'pending_payment', // Important: Not paid yet
                    guest_info: formData,
                    // Store the payment intent ID so we can match it in the webhook later
                    // You might need to add a column or use a metadata field
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 3. Save Order Items
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_name: item.name,
                quantity: item.quantity,
                price_at_purchase: item.price,
                // product_id: ... (handle UUID logic if needed)
            }));

            await supabase.from('order_items').insert(orderItems);

            // 4. Confirm Payment with Stripe
            const { error } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/success?orderId=${order.id}`,
                    payment_method_data: {
                        billing_details: {
                            name: formData.name,
                            email: formData.email,
                        }
                    }
                },
            });

            // This point is only reached if there is an immediate error (e.g. card declined)
            if (error) {
                setErrorMessage(error.message || "Payment failed");
            } else {
                clearCart();
            }

        } catch (err: any) {
            console.error(err);
            setErrorMessage(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
            setPayButtonLoading(false);
        }
    };

    return (
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Stripe Payment Section */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h2 className="text-lg font-bold text-sai-charcoal flex items-center gap-2">
                    <NumberBadge number={3} size="sm" /> Card Details
                </h2>
                <div className="border border-gray-200 rounded-xl p-4">
                    <PaymentElement />
                </div>
            </section>

            {errorMessage && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex gap-2">
                    <AlertCircle className="w-5 h-5" /> {errorMessage}
                </div>
            )}

            {/* Pay button for mobile only */}
            <div className="block lg:hidden">
                <button
                    type="submit"
                    disabled={!stripe || loading}
                    className="w-full bg-sai-pink text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-200 hover:bg-sai-white hover:text-sai-pink hover:border-sai-pink border border-transparent hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Lock className="w-4 h-4" /> Pay RM {subtotal().toFixed(2)}</>}
                </button>
            </div>
        </form>
    );
}