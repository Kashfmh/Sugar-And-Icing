'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
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

    // Sign Up State
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
    const [signUpFirstName, setSignUpFirstName] = useState('');
    const [signUpPhone, setSignUpPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+60'); // Malaysia default
    const [showSignUpPassword, setShowSignUpPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password strength calculation
    const calculatePasswordStrength = (password: string): { strength: number; label: string; color: string } => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        if (strength <= 2) return { strength: 33, label: 'Weak', color: '#ef4444' };
        if (strength <= 3) return { strength: 66, label: 'Medium', color: '#f59e0b' };
        return { strength: 100, label: 'Strong', color: '#10b981' };
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
            await signIn(signInEmail, signInPassword);
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

            {/* Mobile Toggle Tabs */}
            <div className="mobile-toggle-tabs">
                <div className="mobile-toggle-container">
                    <button
                        className={`mobile-tab ${!isSignUp ? 'active' : ''}`}
                        onClick={() => { setIsSignUp(false); setErrors({}); }}
                    >
                        Sign In
                    </button>
                    <button
                        className={`mobile-tab ${isSignUp ? 'active' : ''}`}
                        onClick={() => { setIsSignUp(true); setErrors({}); }}
                    >
                        Sign Up
                    </button>
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
                        </div>
                        {errors.password && <div className="field-error">{errors.password}</div>}

                        {/* Password Strength Indicator */}
                        {signUpPassword && (
                            <div className="password-strength">
                                <div className="strength-bar-bg">
                                    <div
                                        className="strength-bar-fill"
                                        style={{
                                            width: `${passwordStrength.strength}%`,
                                            backgroundColor: passwordStrength.color
                                        }}
                                    />
                                </div>
                                <span className="strength-label" style={{ color: passwordStrength.color }}>
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
