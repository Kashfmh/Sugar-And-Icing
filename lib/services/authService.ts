import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';

const supabase = createClient();

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type AddressRow = Database['public']['Tables']['addresses']['Row'];
type OccasionRow = Database['public']['Tables']['special_occasions']['Row'];

export interface UserProfile extends Omit<ProfileRow, 'notification_preferences'> {
    notification_preferences: {
        order_updates: boolean;
        marketing: boolean;
        reminders: boolean;
    };
    // Email is already in ProfileRow (verified by lint error)

    // Explicitly define fields missing in generated types or for type safety
    username?: string | null;
    last_username_change?: string | null;
    favorite_frosting?: string | null;
}

export interface Address extends AddressRow { }

export interface SpecialOccasion extends OccasionRow {
    // legacy support if needed, or mapped fields
    last_reminded_year?: number | null;
}

export async function validateSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
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

    const rawData = data as any;
    const notification_preferences = rawData.notification_preferences || {
        order_updates: true,
        marketing: false,
        reminders: true
    };

    return {
        ...data,
        notification_preferences
    } as UserProfile;
}

export async function fetchUserAddresses(userId: string): Promise<Address[]> {
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

export async function fetchUserOccasions(userId: string): Promise<SpecialOccasion[]> {
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
    // Username cooldown logic
    if (typeof updates.username !== 'undefined') {
        // Fetch current profile to check last_username_change
        const { data: current, error: fetchErr } = await supabase
            .from('profiles')
            .select('username, last_username_change' as any)
            .eq('id', userId)
            .maybeSingle() as any;
        if (fetchErr) {
            console.error('Username cooldown check failed:', fetchErr.message || fetchErr);
            // Allow username change if fetch fails (fallback: treat as no cooldown)
        } else {
            const now = Date.now();
            const lastChange = current?.last_username_change ? new Date(current.last_username_change).getTime() : 0;
            // 14 days in milliseconds
            const COOLDOWN_PERIOD = 14 * 24 * 60 * 60 * 1000;

            if (lastChange && (now - lastChange) < COOLDOWN_PERIOD) {
                // Only throw if they are actually trying to change it to something NEW
                if (updates.username !== current?.username) {
                    throw new Error('Username can only be changed once every 14 days.');
                }
            }
            // If username is actually changing, update last_username_change
            if (updates.username !== current?.username) {
                updates.last_username_change = new Date().toISOString();
            }
        }
    }


    const payload = {
        ...updates,
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
        .from('profiles')
        .update(payload as any)
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
