import { supabase } from '@/lib/supabase';

export interface UserProfile {
    id: string;
    user_id: string;
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
        .eq('user_id', userId)
        .single();

    if (error) throw error;
    return data as UserProfile;
}

export async function fetchUserAddresses(userId: string) {
    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

    if (error) throw error;
    return data as Address[];
}

export async function fetchUserOccasions(userId: string) {
    const { data, error } = await supabase
        .from('special_occasions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

    if (error) throw error;
    return data as SpecialOccasion[];
}

export async function loadAllUserData(userId: string) {
    return Promise.all([
        fetchUserProfile(userId),
        fetchUserAddresses(userId),
        fetchUserOccasions(userId)
    ]);
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { error } = await supabase
        .from('profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

    if (error) throw error;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}
