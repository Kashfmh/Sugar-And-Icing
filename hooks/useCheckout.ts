import { useState, useEffect } from 'react';
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

    // 1. Fetch User Data & Addresses
    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const [prof, addr] = await Promise.all([
                    fetchUserProfile(user.id),
                    supabase.from('addresses').select('*').eq('user_id', user.id)
                ]);

                setProfile(prof);
                setAddresses(addr.data || []);

                // Pre-fill contact info
                setContact({
                    first_name: prof?.first_name || '',
                    last_name: prof?.last_name || '',
                    email: user.email || '',
                    phone: prof?.phone || ''
                });
            }
            setLoading(false);
        }
        loadData();
    }, []);

    // 2. Initialize Stripe Payment Intent
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

    return {
        // Data
        loading,
        clientSecret,
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
    };
}