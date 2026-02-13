import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { signIn } from '@/lib/auth';
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

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                />

                <div className="password-input-group">
                    <input
                        name="password"
                        type={showSignInPassword ? 'text' : 'password'}
                        placeholder="Password"
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

                <TurnstileWidget
                    onVerify={(token) => setTurnstileToken(token)}
                    retry="never"
                    theme="light"
                />

                {errors.general && <div className="error-message">{errors.general}</div>}

                <button type="submit" disabled={loading || !turnstileToken}>
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>

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