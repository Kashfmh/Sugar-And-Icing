import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchUserProfile } from '@/lib/services/authService';
import { useCart } from '@/hooks/useCart';

export function useCheckout() {
    const { items, subtotal } = useCart();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [addresses, setAddresses] = useState<any[]>([]);

    // Global Payment State (To sync the Desktop Button in OrderSummary with the Form)
    const [isProcessing, setIsProcessing] = useState(false);

    // Form State
    const [contact, setContact] = useState({ first_name: '', last_name: '', email: '', phone: '' });
    const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
    const [selectedAddress, setSelectedAddress] = useState<string>('');

    const refreshAddresses = async () => {
        if (!user) return;
        const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id);
        setAddresses(data || []);
    };

    // 1. Fetch User Data & Addresses
    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const profile = await fetchUserProfile(user.id);
                setProfile(profile);

                // Fetch addresses directly using the new helper or inline
                const { data: addrData } = await supabase.from('addresses').select('*').eq('user_id', user.id);
                setAddresses(addrData || []);

                // Pre-fill contact info
                setContact({
                    first_name: profile?.first_name || '',
                    last_name: profile?.last_name || '',
                    email: user.email || '',
                    phone: profile?.phone || ''
                });
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const [orderId, setOrderId] = useState<string | null>(null);

    // 2. Initialize Stripe Payment Intent (Create Order First)
    const initializedRef = useRef(false);

    useEffect(() => {
        async function initPayment() {
            if (initializedRef.current) return;

            if (items.length > 0 && user) {
                initializedRef.current = true; // Lock immediately
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;

                fetch('/api/payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify({
                        items,
                        userId: user.id || null, // Keeping this for explicit logic compatibility
                        userEmail: user.email || null
                    }),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.error) {
                            console.error("Payment Init Error:", data.error);
                        } else {
                            setClientSecret(data.clientSecret);
                            setOrderId(data.orderId);
                        }
                    })
                    .catch(err => console.error("Fetch Error:", err));
            }
        }
        initPayment();
    }, [items, user]);

    return {
        // Data
        loading,
        clientSecret,
        orderId,
        user,
        profile,
        addresses,
        cartItems: items,
        cartTotal: subtotal(),

        // State
        contact,
        deliveryType,
        selectedAddress,
        isProcessing,

        // Setters
        setContact,
        setDeliveryType,
        setSelectedAddress,
        setIsProcessing,
        refreshAddresses, // Exposed helper
    };
}