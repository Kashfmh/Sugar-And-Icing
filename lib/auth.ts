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
): Promise<{ success: boolean; error?: string }> {
    try {
        // Sanitize inputs
        const sanitizedEmail = sanitizeInput(email.toLowerCase());
        const sanitizedFirstName = sanitizeInput(firstName);
        const sanitizedPhone = sanitizeInput(phone);

        // Validate inputs
        if (!isValidEmail(sanitizedEmail)) {
            return { success: false, error: 'Please enter a valid email address' };
        }

        const phoneValidation = isValidPhone(sanitizedPhone);
        if (!phoneValidation.valid) {
            return { success: false, error: phoneValidation.error };
        }

        if (!isValidPassword(password)) {
            return { success: false, error: 'Password must be at least 8 characters with at least one letter and one number' };
        }

        if (sanitizedFirstName.length < 2) {
            return { success: false, error: 'First name must be at least 2 characters' };
        }

        // Sign up the user
        const { data, error } = await supabase.auth.signUp({
            email: sanitizedEmail,
            password: password,
        });

        if (error) {
            // Specific error messages based on Supabase error codes
            if (error.message.includes('already registered') || error.message.includes('User already registered')) {
                return { success: false, error: 'This email is already registered. Please sign in instead.' };
            }
            if (error.message.includes('Invalid email')) {
                return { success: false, error: 'Please enter a valid email address' };
            }
            if (error.message.includes('Password')) {
                return { success: false, error: 'Password is too weak. Use at least 8 characters with letters and numbers.' };
            }
            if (error.message.includes('rate limit')) {
                return { success: false, error: 'Too many attempts. Please try again in a few minutes.' };
            }
            return { success: false, error: error.message || 'Failed to create account. Please try again.' };
        }

        if (!data.user) {
            return { success: false, error: 'Account creation failed. Please try again.' };
        }

        // Create user profile
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
                user_id: data.user.id, // Changed from 'id' to 'user_id' to match UserProfile interface
                first_name: sanitizedFirstName,
                phone: phoneValidation.formatted,
                created_at: new Date().toISOString(),
            }]);

        if (profileError) {
            console.error('Profile creation error:', profileError);
            // User was created but profile failed - still allow login
            if (profileError.message.includes('duplicate')) {
                return { success: true }; // Profile already exists, that's okay
            }
            return { success: false, error: 'Account created but profile setup failed. Please contact support.' };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Sign up error:', error);
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}

/**
 * Sign in an existing user
 */
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
