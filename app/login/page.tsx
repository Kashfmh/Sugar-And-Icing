'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Check, X, ArrowLeft } from 'lucide-react';
import './auth.css';

export default function AuthPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const router = useRouter();

    // Sign In State
    const [signInEmail, setSignInEmail] = useState('');
    const [signInPassword, setSignInPassword] = useState('');
    const [showSignInPassword, setShowSignInPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true); // Default to true

    // Sign Up State
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
    const [signUpFirstName, setSignUpFirstName] = useState('');
    const [signUpPhone, setSignUpPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+60'); // Malaysia default
    const [showSignUpPassword, setShowSignUpPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [signupEmail, setSignupEmail] = useState(''); // Store email for success message

    // Enhanced password strength calculation
    const calculatePasswordStrength = (password: string): {
        score: number;
        level: 'empty' | 'weak' | 'medium' | 'strong';
        label: string;
        color: string;
        bars: number;
    } => {
        if (!password) return { score: 0, level: 'empty', label: '', color: '#e5e7eb', bars: 0 };

        let score = 0;

        // Length checks
        if (password.length > 5) score += 1;
        if (password.length > 8) score += 1;

        // Character variety
        if (/[A-Z]/.test(password)) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        // Determine level
        let level: 'empty' | 'weak' | 'medium' | 'strong' = 'empty';
        let label = '';
        let color = '#e5e7eb';
        let bars = 0;

        if (score <= 2) {
            level = 'weak';
            label = 'Weak';
            color = '#ef4444';
            bars = 1;
        } else if (score <= 4) {
            level = 'medium';
            label = 'Medium';
            color = '#f59e0b';
            bars = 2;
        } else {
            level = 'strong';
            label = 'Strong';
            color = '#10b981';
            bars = 4;
        }

        return { score, level, label, color, bars };
    };

    const passwordStrength = calculatePasswordStrength(signUpPassword);

    // Email validation
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            await signIn(signInEmail, signInPassword, rememberMe);
            router.push('/profile');
            router.refresh();
        } catch (err: any) {
            setErrors({ general: err.message || 'Failed to sign in' });
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};

        // Validate first name
        if (!signUpFirstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        // Validate phone
        if (!signUpPhone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (signUpPhone.length < 9) {
            newErrors.phone = 'Phone number must be at least 9 digits';
        }

        // Validate email
        if (!signUpEmail.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(signUpEmail)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Validate password
        if (!signUpPassword) {
            newErrors.password = 'Password is required';
        } else if (signUpPassword.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/[0-9]/.test(signUpPassword)) {
            newErrors.password = 'Password must contain at least one number';
        }

        // Validate password confirmation
        if (signUpPassword !== signUpConfirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const fullPhone = countryCode + signUpPhone;
            const result = await signUp(signUpEmail, signUpPassword, signUpFirstName, fullPhone);

            if (!result.success) {
                // Show the specific error message
                setErrors({ general: result.error || 'Failed to sign up' });
                return;
            }

            // Success - show verification message instead of redirecting
            setSignupEmail(signUpEmail);
            setSignupSuccess(true);
        } catch (err: any) {
            setErrors({ general: err.message || 'Failed to sign up' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Success Message Overlay */}
            {signupSuccess && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                        {/* Success Icon */}
                        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-sai-charcoal mb-3">
                            Check Your Email! 📬
                        </h2>

                        {/* Message */}
                        <p className="text-gray-600 mb-2">
                            We've sent a confirmation link to:
                        </p>
                        <p className="font-semibold text-sai-pink mb-6">
                            {signupEmail}
                        </p>

                        {/* Instructions */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                            <p className="text-sm text-gray-700 mb-2">
                                <span className="font-semibold">Next steps:</span>
                            </p>
                            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                                <li>Open the email from Supabase Auth</li>
                                <li>Click the confirmation link</li>
                                <li>Return here and sign in</li>
                            </ol>
                        </div>

                        {/* Button */}
                        <button
                            onClick={() => {
                                setSignupSuccess(false);
                                setIsSignUp(false); // Switch to sign in form
                            }}
                            className="w-full bg-sai-pink text-white py-3 rounded-lg font-semibold hover:bg-sai-pink/90 transition-colors"
                        >
                            Got it, take me to Sign In
                        </button>

                        {/* Footer Note */}
                        <p className="text-xs text-gray-500 mt-4">
                            Didn't receive the email? Check your spam folder
                        </p>
                    </div>
                </div>
            )}

            {/* Mobile Header - Consistent with other pages */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-[1001] bg-white border-b border-gray-200">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/" className="flex items-center gap-2 text-sai-charcoal">
                        <ArrowLeft size={24} />
                        <span className="font-semibold text-lg">Login</span>
                    </Link>
                    <Image
                        src="/images/logo/full-logo-pink.png"
                        alt="Sugar And Icing"
                        width={50}
                        height={50}
                        className="object-contain"
                    />
                </div>
            </header>

            {/* Desktop Logo - Top Left */}
            <div className="auth-logo hidden md:block">
                <Link href="/">
                    <Image
                        src="/images/logo/full-logo-pink.png"
                        alt="Sugar And Icing"
                        width={80}
                        height={80}
                        className="object-contain"
                    />
                </Link>
            </div>

            <div className={`auth-container ${isSignUp ? 'right-panel-active' : ''}`}>
                {/* Sign Up Form */}
                <div className="form-container sign-up-container">
                    <form onSubmit={handleSignUp}>
                        <h1>Create Account</h1>
                        <span className="auth-subtitle">Join us for sweet moments 🍰</span>

                        <input
                            type="text"
                            placeholder="First Name"
                            value={signUpFirstName}
                            onChange={(e) => setSignUpFirstName(e.target.value)}
                            required
                            disabled={loading}
                        />
                        {errors.firstName && <div className="field-error">{errors.firstName}</div>}

                        {/* Phone with Country Code */}
                        <div className="phone-input-group">
                            <select
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="country-code-select"
                                disabled={loading}
                            >
                                <option value="+60">🇲🇾 +60</option>
                                <option value="+91">🇮🇳 +91</option>
                            </select>
                            <input
                                type="tel"
                                placeholder="123456789"
                                value={signUpPhone}
                                onChange={(e) => setSignUpPhone(e.target.value.replace(/\D/g, ''))}
                                required
                                disabled={loading}
                                className="phone-input"
                            />
                        </div>
                        {errors.phone && <div className="field-error">{errors.phone}</div>}

                        <input
                            type="email"
                            placeholder="Email"
                            value={signUpEmail}
                            onChange={(e) => setSignUpEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                        {errors.email && <div className="field-error">{errors.email}</div>}

                        {/* Password with Eye Toggle */}
                        <div className="password-input-group">
                            <input
                                type={showSignUpPassword ? 'text' : 'password'}
                                placeholder="Password (min 8 chars, 1 number)"
                                value={signUpPassword}
                                onChange={(e) => setSignUpPassword(e.target.value)}
                                required
                                minLength={8}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                                tabIndex={-1}
                            >
                                {showSignUpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            {/* Checkmark/X indicator */}
                            {signUpPassword && (
                                <div className="password-status-icon">
                                    <div className={`status-circle ${passwordStrength.level === 'weak' ? 'status-weak' : passwordStrength.level === 'medium' ? 'status-medium' : 'status-strong'}`}>
                                        {passwordStrength.level === 'weak' ? (
                                            <X className="w-4 h-4 text-white" />
                                        ) : (
                                            <Check className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        {errors.password && <div className="field-error">{errors.password}</div>}

                        {/* Enhanced Password Strength Indicator */}
                        {signUpPassword && (
                            <div className="password-strength-enhanced">
                                <div className="strength-bars">
                                    {[1, 2, 3, 4].map((bar) => (
                                        <div
                                            key={bar}
                                            className={`strength-bar ${bar <= passwordStrength.bars ? 'active' : ''}`}
                                            style={{ backgroundColor: bar <= passwordStrength.bars ? passwordStrength.color : '#e5e7eb' }}
                                        />
                                    ))}
                                </div>
                                <span className="strength-label-enhanced" style={{ color: passwordStrength.color }}>
                                    {passwordStrength.label}
                                </span>
                            </div>
                        )}

                        {/* Confirm Password */}
                        <div className="password-input-group">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm Password"
                                value={signUpConfirmPassword}
                                onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
                        {errors.general && <div className="error-message">{errors.general}</div>}

                        <button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Sign Up'}
                        </button>

                        {/* Mobile Bottom Link */}
                        <div className="auth-bottom-link">
                            <span>Already have an account? </span>
                            <button type="button" onClick={() => { setIsSignUp(false); setErrors({}); }}>
                                Log in
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sign In Form */}
                <div className="form-container sign-in-container">
                    <form onSubmit={handleSignIn}>
                        <h1>Welcome Back</h1>
                        <span className="auth-subtitle">Sign in to your account</span>

                        <input
                            type="email"
                            placeholder="Email"
                            value={signInEmail}
                            onChange={(e) => setSignInEmail(e.target.value)}
                            required
                            disabled={loading}
                        />

                        {/* Password with Eye Toggle */}
                        <div className="password-input-group">
                            <input
                                type={showSignInPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={signInPassword}
                                onChange={(e) => setSignInPassword(e.target.value)}
                                required
                                disabled={loading}
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

                        {/* Remember Me Checkbox */}
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

                        {/* Forgot Password Link */}
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

                        {/* Mobile Bottom Link */}
                        <div className="auth-bottom-link">
                            <span>Don't have an account? </span>
                            <button type="button" onClick={() => { setIsSignUp(true); setErrors({}); }}>
                                Sign up
                            </button>
                        </div>
                    </form>
                </div>

                {/* Overlay - Desktop Only */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <p>To keep connected with us please login with your personal info</p>
                            <button className="ghost" onClick={() => { setIsSignUp(false); setErrors({}); }}>
                                Sign In
                            </button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Hello, Friend!</h1>
                            <p>Enter your details and start your journey with delicious treats</p>
                            <button className="ghost" onClick={() => { setIsSignUp(true); setErrors({}); }}>
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
