import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { signIn } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface SignInFormProps {
    setIsSignUp: (isSignUp: boolean) => void;
    setErrors: (errors: { [key: string]: string }) => void;
    errors: { [key: string]: string };
}

export default function SignInForm({ setIsSignUp, setErrors, errors }: SignInFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [signInEmail, setSignInEmail] = useState('');
    const [signInPassword, setSignInPassword] = useState('');
    const [showSignInPassword, setShowSignInPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

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
            const result = await signIn(email, password, rememberMe);

            if (!result.success) {
                setErrors({ general: result.error || 'Failed to sign in' });
                return;
            }

            router.push('/profile');
            router.refresh();
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

                <button
                    type="button"
                    className="forgot-password-link"
                    onClick={() => alert('Password reset feature coming soon! Please contact support at support@sugarandicing.com')}
                >
                    Forgot password?
                </button>

                {errors.general && <div className="error-message">{errors.general}</div>}

                <button type="submit" disabled={loading}>
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
