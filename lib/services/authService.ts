import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface UserProfile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    dob: string | null;
    preferred_contact_method: string | null;
    favorite_flavors: string[];
    favorite_frosting: string | null;
    dietary_restrictions: string[];
    notification_preferences: {
        order_updates: boolean;
        marketing: boolean;
        reminders: boolean;
    };
}

export interface Address {
    id: string;
    label: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postcode: string;
    is_default: boolean;
}

export interface SpecialOccasion {
    id: string;
    name: string;
    date: string;
    type: string;
    reminder_enabled: boolean;
}

export async function validateSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

export async function fetchUserProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            console.log('Profile not found for user', userId);
            return null;
        }
        console.error('Profile fetch error:', error.message || error.toString());
        throw new Error(error.message || 'Failed to load profile');
    }
    return data as unknown as UserProfile;
}

export async function fetchUserAddresses(userId: string) {
    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

    if (error) {
        console.error('Address fetch error:', error.message || error.toString());
        throw new Error(error.message || 'Failed to load addresses');
    }
    return data as Address[];
}

export async function fetchUserOccasions(userId: string) {
    const { data, error } = await supabase
        .from('special_occasions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

    if (error) {
        console.error('Occasions fetch error:', error.message || error.toString());
        throw new Error(error.message || 'Failed to load special occasions');
    }
    return data as SpecialOccasion[];
}

export async function loadAllUserData(userId: string) {
    return Promise.all([
        fetchUserProfile(userId).catch(() => null),
        fetchUserAddresses(userId).catch(() => []),
        fetchUserOccasions(userId).catch(() => [])
    ]);
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { error } = await supabase
        .from('profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

    if (error) {
        console.error('Profile update error:', error.message || error.toString());
        throw new Error(error.message || 'Failed to update profile');
    }
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}