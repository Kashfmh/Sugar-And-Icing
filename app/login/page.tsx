'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Check, X } from 'lucide-react';
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
            await signUp(signUpEmail, signUpPassword, signUpFirstName, fullPhone);
            router.push('/profile');
            router.refresh();
        } catch (err: any) {
            setErrors({ general: err.message || 'Failed to sign up' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Logo - Top Left */}
            <div className="auth-logo">
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

            {/* Tabs - Single Instance for Mobile */}
            <div className="auth-tabs-mobile">
                <div className="tabs-wrapper">
                    <button
                        type="button"
                        className={`tab-button ${!isSignUp ? 'active' : ''}`}
                        onClick={() => { setIsSignUp(false); setErrors({}); }}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        className={`tab-button ${isSignUp ? 'active' : ''}`}
                        onClick={() => { setIsSignUp(true); setErrors({}); }}
                    >
                        Sign Up
                    </button>
                    <div className={`tab-indicator ${isSignUp ? 'right' : 'left'}`}></div>
                </div>
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

                        {errors.general && <div className="error-message">{errors.general}</div>}
                        <button type="submit" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
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
