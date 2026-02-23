import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface AuthUser {
    id: string;
    email: string;
    created_at: string;
}

export interface UserProfile {
    id: string;
    first_name: string;
    username?: string;
    last_name?: string;
    phone: string;
    email?: string;
    created_at: string;
    updated_at: string;
}

function sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone: string): { valid: boolean; formatted: string; error?: string } {
    const cleanPhone = phone.replace(/[\s-]/g, '');

    if (cleanPhone.match(/^(\+?60|60)[0-9]{9,10}$/)) {
        const formatted = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
        return { valid: true, formatted };
    }

    if (cleanPhone.match(/^(\+?91|91)[0-9]{10}$/)) {
        const formatted = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
        return { valid: true, formatted };
    }

    return { valid: false, formatted: cleanPhone, error: 'Please enter a valid Malaysian (+60) or Indian (+91) phone number' };
}

function isValidPassword(password: string): boolean {
    return password.length >= 8 && /[0-9]/.test(password) && /[a-zA-Z]/.test(password);
}

export async function signUp(
    email: string,
    password: string,
    firstName: string,
    phone: string,
    username?: string,
    captchaToken?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const sanitizedEmail = sanitizeInput(email.toLowerCase());
        const sanitizedFirstName = sanitizeInput(firstName);
        const sanitizedPhone = sanitizeInput(phone);
        const sanitizedUsername = username ? sanitizeInput(username).toLowerCase() : undefined;

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

        let signupData: any = null;
        let signupError: any = null;

        ({ data: signupData, error: signupError } = await supabase.auth.signUp({
            email: sanitizedEmail,
            password: password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/profile`,
                captchaToken,
                data: {
                    // We pass these as metadata so the SQL Trigger can pick them up
                    display_name: sanitizedFirstName,
                    first_name: sanitizedFirstName,
                    username: sanitizedUsername,
                    phone: phoneValidation.formatted,
                }
            }
        }));

        if (signupError) {
            console.error('Supabase signup error:', signupError);

            // If the DB trigger failed while saving the new user/profile (common message from GoTrue),
            // retry signup without passing metadata so the signup itself can succeed.
            if (signupError.message && signupError.message.includes('Database error saving new user')) {
                console.warn('Signup trigger failed; retrying signup without metadata to avoid DB trigger failure.');
                const { data: retryData, error: retryError } = await supabase.auth.signUp({
                    email: sanitizedEmail,
                    password: password,
                    options: {
                        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/profile`,
                        captchaToken,
                    }
                });

                if (retryError) {
                    console.error('Retry signup error:', retryError);
                    // replace signupError with retryError for later handling
                    signupError = retryError;
                    signupData = retryData;
                } else {
                    // Retry succeeded — return success (profile creation may need manual/migration handling).
                    return { success: true };
                }
            }

            if (signupError.message.includes('already') || signupError.message.includes('User already registered') || signupError.status === 422) {
                return { success: false, error: 'This email is already registered. Please sign in instead.' };
            }
            if (signupError.message.includes('Invalid email')) {
                return { success: false, error: 'Please enter a valid email address' };
            }
            if (signupError.message.includes('Password')) {
                return { success: false, error: 'Password is too weak.' };
            }
            return { success: false, error: signupError.message || 'Failed to create account.' };
        }

        if (!signupData || !signupData.user) {
            return { success: false, error: 'Account creation failed. Please try again.' };
        }

        if (signupData.user && (!signupData.user.identities || signupData.user.identities.length === 0)) {
            return { success: false, error: 'This email is already registered. Please sign in instead.' };
        }

        // If a username was provided, do a best-effort uniqueness check.
        if (sanitizedUsername) {
            // Enforce username rules: 3-30 chars, letters/numbers, underscores and dots; no spaces; no start/end with . or _; no consecutive . or _
            if (sanitizedUsername.length < 3) {
                return { success: false, error: 'Username must be at least 3 characters' };
            }
            if (sanitizedUsername.length > 30) {
                return { success: false, error: 'Username must be at most 30 characters' };
            }
            if (/\s/.test(sanitizedUsername)) {
                return { success: false, error: 'Username cannot contain spaces' };
            }
            if (!/^[a-z0-9._]+$/.test(sanitizedUsername)) {
                return { success: false, error: 'Username can only contain letters, numbers, dots (.) and underscores (_)' };
            }
            if (/^[._]/.test(sanitizedUsername) || /[._]$/.test(sanitizedUsername)) {
                return { success: false, error: 'Username cannot start or end with a dot or underscore' };
            }
            if (/([._])\1/.test(sanitizedUsername) || /[._]{2,}/.test(sanitizedUsername)) {
                return { success: false, error: 'Username cannot contain consecutive dots or underscores' };
            }

            try {
                const { data: existing, error: existingErr } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('username', sanitizedUsername)
                    .limit(1)
                    .maybeSingle();

                if (existingErr) {
                    // If the profiles table doesn't have a username column yet, skip uniqueness enforcement here.
                    if (existingErr.message && existingErr.message.includes('column "username"')) {
                        // continue without blocking signup
                    } else {
                        console.warn('Username uniqueness check error:', existingErr.message);
                    }
                } else if (existing) {
                    return { success: false, error: 'This username is already taken. Please choose another.' };
                }
            } catch (e: any) {
                // Ignore check failures (e.g., column missing) — migration may not have been applied.
                console.warn('Username check skipped:', e?.message || e);
            }
        }

        // NOTE: Manual profile insertion removed. 
        // It relies on the SQL Trigger "handle_new_user" to create the profile row.
        // This prevents race conditions and permission errors.
        return { success: true };

    } catch (error: any) {
        console.error('Sign up error:', error);
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function signIn(
    email: string,
    password: string,
    rememberMe: boolean = true,
    captchaToken?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const sanitizedEmail = sanitizeInput(email.toLowerCase());

        if (!isValidEmail(sanitizedEmail)) {
            return { success: false, error: 'Please enter a valid email address' };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: sanitizedEmail,
            password: password,
            options: {
                captchaToken,
            }
        });

        if (error) {
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

export async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw new Error(error.message);
    }
}

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

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !data) {
        return null;
    }

    return {
        id: data.id,
        first_name: data.first_name || '',
        username: (data as any).username || undefined,
        phone: data.phone || '',
        created_at: data.created_at || '',
        updated_at: data.updated_at || '',
    };
}

export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        return null;
    }

    return session;
}

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

export async function signInWithOAuth(provider: 'google' | 'facebook') {
    const redirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo
        }
    });

    if (error) {
        throw new Error(error.message);
    }
}