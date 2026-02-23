import { Eye, EyeOff } from 'lucide-react';
import { IconBrandGoogle, IconBrandFacebookFilled } from '@tabler/icons-react';
import { useState } from 'react';
import { signIn, signInWithOAuth } from '@/lib/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/hooks/useCart';
import TurnstileWidget from '@/app/components/TurnstileWidget';

interface SignInFormProps {
    setIsSignUp: (isSignUp: boolean) => void;
    setErrors: (errors: { [key: string]: string }) => void;
    errors: { [key: string]: string };
}

export default function SignInForm({ setIsSignUp, setErrors, errors }: SignInFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect');
    const [loading, setLoading] = useState(false);
    const [signInEmail, setSignInEmail] = useState('');
    const [signInPassword, setSignInPassword] = useState('');
    const [showSignInPassword, setShowSignInPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const formData = new FormData(e.currentTarget);
        const email = (formData.get('email') as string) || signInEmail;
        const password = (formData.get('password') as string) || signInPassword;

        if (!email || !password) {
            setErrors({ general: 'Please enter both email and password' });
            setLoading(false);
            return;
        }

        try {
            const result = await signIn(email, password, rememberMe, turnstileToken || undefined);

            if (!result.success) {
                setErrors({ general: result.error || 'Failed to sign in' });
                // Reset turnstile token on failure so the form forces them to get a new one
                if (window.turnstile) {
                    window.turnstile.reset();
                }
                setTurnstileToken(null);
                return;
            }

            // Get user and merge cart
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await useCart.getState().mergeLocalCart(user.id);
            }

            if (redirect) {
                window.location.href = redirect;
            } else {
                window.location.href = '/profile';
            }
        } catch (err: any) {
            setErrors({ general: 'Server error. Please try again later.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container sign-in-container">
            <form onSubmit={handleSignIn}>
                <h1>Welcome Back</h1>
                <span className="auth-subtitle">Sign in to your account</span>

                <label className="text-sm font-semibold text-gray-700 mt-4 mb-1 block">Email</label>
                <input
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                />

                <label className="text-sm font-semibold text-gray-700 mt-4 mb-1 block">Password</label>
                <div className="password-input-group">
                    <input
                        name="password"
                        type={showSignInPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        required
                        disabled={loading}
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        tabIndex={-1}
                    >
                        {showSignInPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <div className="remember-me-container">
                    <label className="remember-me-label">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="remember-me-checkbox"
                        />
                        <span className="remember-me-text">Remember me for 30 days</span>
                    </label>
                </div>

                <a
                    href="/forgot-password"
                    className="forgot-password-link"
                >
                    Forgot password?
                </a>

                <div className="flex justify-center w-full my-4">
                    <TurnstileWidget
                        onVerify={(token) => {
                            setTurnstileToken(token);
                            if (errors.general && errors.general.includes('timeout-or-duplicate')) {
                                setErrors({});
                            }
                        }}
                        retry="auto"
                        theme="light"
                    />
                </div>

                {errors.general && <div className="error-message">{errors.general}</div>}

                <button type="submit" disabled={loading || !turnstileToken}>
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500 font-medium">Or</span>
                    </div>
                </div>

                <div className="flex flex-row justify-center sm:justify-start gap-4 mb-6 w-full">
                    <button type="button" className="social-btn" onClick={async () => {
                        try { await signInWithOAuth('facebook'); }
                        catch (err: any) { setErrors({ general: 'Failed to initialize Facebook login' }); }
                    }}>
                        <IconBrandFacebookFilled className="w-7 h-7 sm:w-5 sm:h-5 sm:mr-2 text-[#1877F2]" />
                        <span className="hidden sm:inline">Facebook</span>
                    </button>
                    <button type="button" className="social-btn" onClick={async () => {
                        try { await signInWithOAuth('google'); }
                        catch (err: any) { setErrors({ general: 'Failed to initialize Google login' }); }
                    }}>
                        <svg className="w-7 h-7 sm:w-5 sm:h-5 sm:mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="hidden sm:inline">Google</span>
                    </button>
                </div>

                <div className="auth-bottom-link">
                    <span>Don't have an account? </span>
                    <button type="button" onClick={() => { setIsSignUp(true); setErrors({}); }}>
                        Sign up
                    </button>
                </div>
            </form>
        </div>
    );
}