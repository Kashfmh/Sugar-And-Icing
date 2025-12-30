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
function isValidPhone(phone: string): { valid: boolean; formatted: string; error?: string } {
    const cleanPhone = phone.replace(/[\s-]/g, '');

    // Malaysian number (+60)
    if (cleanPhone.match(/^(\+?60|60)[0-9]{9,10}$/)) {
        const formatted = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
        return { valid: true, formatted };
    }

    // Indian number (+91)
    if (cleanPhone.match(/^(\+?91|91)[0-9]{10}$/)) {
        const formatted = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
        return { valid: true, formatted };
    }

    return { valid: false, formatted: cleanPhone, error: 'Please enter a valid Malaysian (+60) or Indian (+91) phone number' };
}

/**
 * Validate password strength
 */
function isValidPassword(password: string): boolean {
    return password.length >= 8 && /[0-9]/.test(password) && /[a-zA-Z]/.test(password);
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

        if (sanitizedFirstName.length > 50) {
            return { success: false, error: 'First name must be less than 50 characters' };
        }

        if (!/^[a-zA-Z\s]+$/.test(sanitizedFirstName)) {
            return { success: false, error: 'First name can only contain letters and spaces' };
        }

        // Sign up the user with metadata
        const { data, error } = await supabase.auth.signUp({
            email: sanitizedEmail,
            password: password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/profile`,
                data: {
                    display_name: sanitizedFirstName,
                    phone: phoneValidation.formatted,
                    first_name: sanitizedFirstName,
                }
            }
        });

        console.log('=== SIGNUP DEBUG ===');
        console.log('Has user:', !!data?.user);
        console.log('Has session:', !!data?.session);
        console.log('Has error:', !!error);
        console.log('User ID:', data?.user?.id);
        if (error) {
            console.log('Error:', error.message, error.status, error.code);
        }
        console.log('==================');

        if (error) {
            console.error('Supabase signup error:', error);

            // Specific error messages based on Supabase error codes
            if (error.message.includes('already') ||
                error.message.includes('User already registered') ||
                error.status === 422 ||
                error.code === 'user_already_exists' ||
                error.message.includes('duplicate')) {
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

        // CRITICAL: When email confirmation is ON, Supabase returns success for duplicates
        // The ONLY way to detect existing users is to check if identities is empty
        // New user: identities array has entries
        // Existing user: identities array is EMPTY
        if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
            console.log('DUPLICATE DETECTED: identities array is empty');
            return { success: false, error: 'This email is already registered. Please sign in instead.' };
        }

        // Create user profile
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
                id: data.user.id,  // Changed from user_id to id
                first_name: sanitizedFirstName,
                phone: phoneValidation.formatted,
            }]);

        if (profileError) {
            console.error('Profile creation error:', profileError);
            console.error('Profile error details:', {
                message: profileError.message,
                code: profileError.code,
                details: profileError.details,
                hint: profileError.hint
            });

            // User account was successfully created, profile creation failed
            // Still return success so user can login - they can add profile info later
            // TODO: Fix profiles table schema or permissions
            console.warn('User account created but profile not saved. User can still login.');
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
export async function signIn(
    email: string,
    password: string,
    rememberMe: boolean = true
): Promise<{ success: boolean; error?: string }> {
    try {
        const sanitizedEmail = sanitizeInput(email.toLowerCase());

        if (!isValidEmail(sanitizedEmail)) {
            return { success: false, error: 'Please enter a valid email address' };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: sanitizedEmail,
            password: password,
        });

        if (error) {
            // Specific error messages based on Supabase error codes
            if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid')) {
                return { success: false, error: 'Incorrect email or password. Please try again.' };
            }
            if (error.message.includes('Email not confirmed')) {
                return { success: false, error: 'Please verify your email before signing in.' };
            }
            if (error.message.includes('rate limit')) {
                return { success: false, error: 'Too many login attempts. Please try again in a few minutes.' };
            }
            if (error.message.includes('User not found')) {
                return { success: false, error: 'No account found with this email. Please sign up first.' };
            }
            return { success: false, error: error.message || 'Failed to sign in. Please try again.' };
        }

        if (!data.user) {
            return { success: false, error: 'Sign in failed. Please check your credentials.' };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Sign in error:', error);
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
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
