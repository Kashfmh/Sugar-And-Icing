import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { fetchUserProfile } from '@/lib/services/authService';
import { useCart } from '@/hooks/useCart';
import { useSearchParams, useRouter } from 'next/navigation';

export function useCheckout() {
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    let urlOrderId = searchParams.get('orderId');

    // Force "undefined" string to be actual null
    if (urlOrderId === 'undefined' || urlOrderId === 'null') {
        urlOrderId = null;
    }

    const { items, subtotal, clearCart } = useCart();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [addresses, setAddresses] = useState<any[]>([]);

    const [isProcessing, setIsProcessing] = useState(false);
    const [existingOrder, setExistingOrder] = useState<any>(null);
    const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

    const [contact, setContact] = useState({ first_name: '', last_name: '', email: '', phone: '' });
    const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
    const [selectedAddress, setSelectedAddress] = useState<string>('');
    const [deliveryDate, setDeliveryDate] = useState<string>('');
    const [deliverySlot, setDeliverySlot] = useState<string>('');

    const refreshAddresses = async () => {
        if (!user) return;
        const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id);
        setAddresses(data || []);
    };

    // User Data Loading
    useEffect(() => {
        async function loadUserData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user) {
                    const profile = await fetchUserProfile(user.id);
                    setProfile(profile);

                    const { data: addrData } = await supabase.from('addresses').select('*').eq('user_id', user.id);
                    setAddresses(addrData || []);

                    setContact({
                        first_name: profile?.first_name || '',
                        last_name: profile?.last_name || '',
                        email: user.email || '',
                        phone: profile?.phone || ''
                    });
                } else {
                    // If no user, stop loading immediately (auth guard should handle redirect usually)
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to load user data:", err);
                setLoading(false);
            }
        }
        loadUserData();
    }, []); // Run once on mount

    const initializedRef = useRef(false);

    // Payment/Order Initialization Logic
    useEffect(() => {
        async function initPayment() {
            // Wait for user to be loaded
            if (!user) {
                return;
            }

            // If we have an order ID in URL, we MUST be in loading state until we fetch it
            if (urlOrderId) {
                // If already initialized for THIS orderId, skip
                if (initializedRef.current === true && existingOrder?.id === urlOrderId) {
                    return;
                }

                setLoading(true);
                initializedRef.current = true;

                try {
                    console.log("Fetching order:", urlOrderId);
                    // Fetch existing order
                    const { data: order, error: orderError } = await supabase
                        .from('orders')
                        .select('*, order_items(*, products(*))')
                        .eq('id', urlOrderId)
                        .single();

                    if (orderError || !order) {
                        console.error("Order fetch error:", orderError);
                        setError("Order not found.");
                        setLoading(false);
                        return;
                    }

                    setExistingOrder(order);

                    // Check status
                    if (['paid', 'processing', 'shipped', 'delivered', 'completed', 'refunded', 'cancelled'].includes(order.status)) {
                        setError(`This order is already ${order.status}.`);
                        setLoading(false);
                        return;
                    }

                    // Get Payment Intent
                    const { data: { session } } = await supabase.auth.getSession();
                    const token = session?.access_token;

                    const res = await fetch('/api/payment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token ? `Bearer ${token}` : ''
                        },
                        body: JSON.stringify({
                            userId: user.id,
                            orderId: urlOrderId
                        }),
                    });

                    const data = await res.json();

                    if (data.error) {
                        setError(data.error);
                    } else {
                        setClientSecret(data.clientSecret);
                    }

                } catch (err) {
                    console.error("Payment init error:", err);
                    setError("Failed to load payment details.");
                } finally {
                    setLoading(false);
                }
                return;
            }

            // Case 2: Creating New Order from Cart
            if (items.length > 0 && !urlOrderId) {
                if (initializedRef.current) return;
                initializedRef.current = true;
                setLoading(true);

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    const token = session?.access_token;

                    const res = await fetch('/api/payment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token ? `Bearer ${token}` : ''
                        },
                        body: JSON.stringify({
                            items,
                            userId: user.id,
                            userEmail: user.email || null
                        }),
                    });

                    const data = await res.json();

                    if (data.error || !data.orderId) {
                        console.error("Order creation failed or no ID returned:", data);
                        setError(data.error || "Failed to retrieve order ID.");
                        setLoading(false);
                    } else {
                        setClientSecret(data.clientSecret);
                        setCreatedOrderId(data.orderId);
                        clearCart();
                        // Redirect to the same page with orderId
                        // Keep loading true
                        router.replace(`/checkout?orderId=${data.orderId}`);
                    }
                } catch (err) {
                    console.error("Create order error:", err);
                    setError("Failed to create order.");
                    setLoading(false);
                }
                return;
            }

            // Case 3: No items, No Order ID -> Empty State
            if (items.length === 0 && !urlOrderId) {
                // Nothing to load
                setLoading(false);
            }

        }

        initPayment();
    }, [user, items, urlOrderId, clearCart, router, supabase]);


    // Reset initializedRef when orderId changes (e.g. navigation)
    useEffect(() => {
        if (urlOrderId && existingOrder?.id !== urlOrderId) {
            initializedRef.current = false;
        }
    }, [urlOrderId, existingOrder]);

    // Auto-select address logic when addresses change
    useEffect(() => {
        if (addresses.length > 0) {
            // Check if selected address still exists
            const exists = addresses.find(a => a.id === selectedAddress);
            if (!exists) {
                // Try to find default
                const defaultAddr = addresses.find(a => a.is_default);
                if (defaultAddr) {
                    setSelectedAddress(defaultAddr.id);
                } else {
                    // Fallback to first
                    setSelectedAddress(addresses[0].id);
                }
            }
        } else {
            setSelectedAddress('');
        }
    }, [addresses, selectedAddress]);


    // Derived values
    const displayItems = existingOrder
        ? existingOrder.order_items.map((item: any) => {
            const product = Array.isArray(item.products) ? item.products[0] : item.products;
            return {
                id: item.id, // technically order item id, but works for display
                productId: item.product_id,
                name: item.product_name,
                price: item.price_at_purchase,
                quantity: item.quantity,
                image_url: product?.image_url,
                description: product?.description,
                category: product?.product_type,
                metadata: item.metadata || {} // Ensure metadata handles null
            };
        })
        : items;

    const displayTotal = existingOrder ? existingOrder.total_amount : subtotal();

    return {
        loading,
        error,
        clientSecret,
        orderId: urlOrderId || createdOrderId || null, // expose the actual active order ID
        user,
        profile,
        addresses,
        cartItems: displayItems,
        cartTotal: displayTotal,

        contact,
        deliveryType,
        selectedAddress,
        deliveryDate,
        deliverySlot,
        isProcessing,

        setContact,
        setDeliveryType,
        setSelectedAddress,
        setDeliveryDate,
        setDeliverySlot,
        setIsProcessing,
        refreshAddresses,
    };
}