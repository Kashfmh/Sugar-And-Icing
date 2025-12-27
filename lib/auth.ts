import { supabase } from './supabase';

export interface AuthUser {
    id: string;
    email: string;
    created_at: string;
}

export interface UserProfile {
    id: string;
    user_id: string;
    first_name: string;
    phone: string;
    created_at: string;
    updated_at: string;
}

/**
 * Sanitize and trim input
 */
function sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (Malaysian or Indian format with country code)
 */
function isValidPhone(phone: string): boolean {
    // Accepts: +60123456789, +91123456789, 60123456789, 91123456789
    const phoneRegex = /^(\+?60|60|\+?91|91)[0-9]{9,10}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Validate password strength
 */
function isStrongPassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    if (!/[a-zA-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one letter' };
    }
    return { valid: true };
}

/**
 * Sign up a new user with profile information
 */
export async function signUp(
    email: string,
    password: string,
    firstName: string,
    phone: string
) {
    // Sanitize inputs
    const cleanEmail = sanitizeInput(email.toLowerCase());
    const cleanFirstName = sanitizeInput(firstName);
    const cleanPhone = sanitizeInput(phone.replace(/[\s-]/g, ''));

    // Validate inputs
    if (!isValidEmail(cleanEmail)) {
        throw new Error('Please enter a valid email address');
    }

    if (!isValidPhone(cleanPhone)) {
        throw new Error('Please enter a valid phone number with country code (+60 or +91)');
    }

    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
        throw new Error(passwordCheck.message || 'Invalid password');
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
    });

    if (authError) {
        throw new Error(authError.message);
    }

    if (!authData.user) {
        throw new Error('Failed to create account');
    }

    // Create profile record
    const { error: profileError } = await supabase
        .from('profiles')
        .insert({
            user_id: authData.user.id,
            first_name: cleanFirstName,
            phone: cleanPhone,
        });

    if (profileError) {
        // If profile creation fails, we should ideally delete the auth user
        // For now, log the error
        console.error('Profile creation error:', profileError);
        throw new Error('Failed to create profile. Please contact support.');
    }

    return authData;
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string) {
    const cleanEmail = sanitizeInput(email.toLowerCase());

    if (!isValidEmail(cleanEmail)) {
        throw new Error('Please enter a valid email address');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw new Error(error.message);
    }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    return {
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
    };
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error || !data) {
        return null;
    }

    return data;
}

/**
 * Get the current session
 */
export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        return null;
    }

    return session;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
            callback({
                id: session.user.id,
                email: session.user.email || '',
                created_at: session.user.created_at,
            });
        } else {
            callback(null);
        }
    });
}
