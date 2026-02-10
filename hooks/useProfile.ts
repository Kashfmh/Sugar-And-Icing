import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    validateSession,
    signOut,
    loadAllUserData,
    updateUserProfile,
    UserProfile,
    Address,
    SpecialOccasion,
} from '@/lib/services/authService';
import { Order, Profile } from '@/types';

export type Tab = 'dashboard' | 'edit-profile' | 'settings';

export interface FormData {
    first_name: string;
    last_name: string;
    phone: string;
    dob: string;
    preferred_contact_method: string;
    favorite_flavors: string[];
    dietary_restrictions: string[];
    notification_preferences: {
        order_updates: boolean;
        marketing: boolean;
        reminders: boolean;
    };
}

export interface Status {
    type: 'success' | 'error';
    message: string;
}

export interface RecentlyViewedItem {
    id: string;
    name: string;
    image_url: string;
    price: number;
    viewed_at: string;
    slug: string;
}

export function useProfile() {
    const supabase = createClient();
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [occasions, setOccasions] = useState<SpecialOccasion[]>([]);
    const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [status, setStatus] = useState<Status | null>(null);

    const [formData, setFormData] = useState<FormData>({
        first_name: '',
        last_name: '',
        phone: '',
        dob: '',
        preferred_contact_method: 'whatsapp',
        favorite_flavors: [],
        dietary_restrictions: [],
        notification_preferences: {
            order_updates: true,
            marketing: false,
            reminders: true
        }
    });

    useEffect(() => {
        initializeProfile();
    }, []);

    useEffect(() => {
        if (user?.id) {
            loadRecentlyViewed();
            loadOrders();

            loadOrders();

            const channel = supabase
                .channel('orders-channel')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'orders',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        loadOrders();
                    }
                )
                .subscribe();

            const handleProfileUpdate = () => initializeProfile(true);
            window.addEventListener('profile-updated', handleProfileUpdate);

            return () => {
                supabase.removeChannel(channel);
                window.removeEventListener('profile-updated', handleProfileUpdate);
            };
        }
    }, [user?.id]);

    async function loadOrders() {
        try {
            if (!user) return;

            const { data, count, error } = await supabase
                .from('orders')
                .select('*, order_items(*, products(name, image_url, gallery_images))', { count: 'exact' })
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedOrders: Order[] = (data || []).map((order: any) => ({
                ...order,
                items_count: order.order_items?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) || 0
            }));

            setOrders(formattedOrders);
            setTotalOrders(count || 0);
        } catch (error) {
            console.error('Failed to load orders:', error);
        }
    }
    // ... rest of the file stays the same
    useEffect(() => {
        if (profile) {
            populateFormData(profile);
        }
    }, [profile]);

    useEffect(() => {
        if (status) {
            const timer = setTimeout(() => {
                setStatus(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    async function initializeProfile(background = false) {
        try {
            if (!background) setIsCheckingAuth(true);

            const session = await validateSession();

            if (!session) {
                // Only redirect if NOT a background refresh
                // (Though if session is gone, we should handle it)
                if (!background) router.push('/login');
                return;
            }

            if (!background) setIsCheckingAuth(false);
            if (!background) setIsLoadingData(true);

            setUser(session.user);

            const [profileData, addressesData, occasionsData] = await loadAllUserData(session.user.id);

            setProfile(profileData);
            setAddresses(addressesData);
            setOccasions(occasionsData);
        } catch (error: any) {
            console.error('Profile initialization failed:', error);
        } finally {
            if (!background) {
                setIsCheckingAuth(false);
                setIsLoadingData(false);
            }
        }
    }

    async function loadRecentlyViewed() {
        try {
            if (!user) return;

            const { getRecentlyViewed } = await import('@/lib/services/recentlyViewedService');
            const data = await getRecentlyViewed(user.id, 10);

            const formatted: RecentlyViewedItem[] = data.map((item: any) => ({
                id: item.product_id,
                name: item.products?.name || 'Unknown Product',
                image_url: item.products?.image_url || '',
                price: item.products?.base_price || 0,
                viewed_at: item.viewed_at,
                slug: item.products?.id
            }));

            setRecentlyViewed(formatted);
        } catch (error) {
            console.error('[Recently Viewed] Load error:', error);
        }
    }

    function populateFormData(profileData: UserProfile) {
        setFormData({
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            phone: profileData.phone || '',
            dob: profileData.dob || '',
            preferred_contact_method: profileData.preferred_contact_method || 'whatsapp',
            favorite_flavors: profileData.favorite_flavors || [],
            dietary_restrictions: profileData.dietary_restrictions || [],
            notification_preferences: profileData.notification_preferences || {
                order_updates: true,
                marketing: false,
                reminders: true
            }
        });
    }

    function handleReset() {
        if (profile) {
            populateFormData(profile);
            setStatus(null);
        }
    }

    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault();
        setIsUpdating(true);
        setStatus(null);

        try {
            const updates = {
                ...formData,
                dob: formData.dob === '' ? null : formData.dob,
            };

            await updateUserProfile(user.id, updates);

            const [updatedProfile, updatedAddresses, updatedOccasions] = await loadAllUserData(user.id);

            setProfile(updatedProfile);
            setAddresses(updatedAddresses);
            setOccasions(updatedOccasions);

            setStatus({ type: 'success', message: 'Profile updated successfully!' });
        } catch (error: any) {
            console.error('Profile update failed:', error);
            const msg = error.message?.includes('date')
                ? 'Invalid date format provided.'
                : 'Failed to update profile. Please try again.';

            setStatus({ type: 'error', message: msg });
        } finally {
            setIsUpdating(false);
        }
    }

    async function handleSignOut() {
        try {
            await signOut();
            router.push('/login');
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    }

    return {
        isCheckingAuth,
        isLoadingData,
        user,
        profile,
        isUpdating,
        activeTab,
        addresses,
        occasions,
        recentlyViewed,
        orders,
        totalOrders,
        status,
        formData,
        setActiveTab,
        setFormData,
        setProfile,
        handleUpdateProfile,
        handleReset,
        handleSignOut,
        initializeProfile,
        router
    };
}