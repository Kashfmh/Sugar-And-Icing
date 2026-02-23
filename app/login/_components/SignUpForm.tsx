import { Eye, EyeOff, Check, X, ChevronDown } from 'lucide-react';
import { IconBrandGoogle, IconBrandFacebookFilled } from '@tabler/icons-react';
import { useState } from 'react';
import { signUp, signInWithOAuth } from '@/lib/auth';
import confetti from 'canvas-confetti';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/hooks/useCart';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TurnstileWidget from '@/app/components/TurnstileWidget';

interface SignUpFormProps {
    setIsSignUp: (isSignUp: boolean) => void;
    setErrors: (errors: { [key: string]: string }) => void;
    errors: { [key: string]: string };
    onSuccess: (email: string) => void;
}

export default function SignUpForm({ setIsSignUp, setErrors, errors, onSuccess }: SignUpFormProps) {
    const [loading, setLoading] = useState(false);
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
    const [signUpFirstName, setSignUpFirstName] = useState('');
    const [signUpUsername, setSignUpUsername] = useState('');
    const [signUpPhone, setSignUpPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+60');
    const [showSignUpPassword, setShowSignUpPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    const calculatePasswordStrength = (password: string) => {
        if (!password) return { score: 0, level: 'empty', label: '', color: '#e5e7eb', bars: 0 };

        let score = 0;
        if (password.length > 5) score += 1;
        if (password.length > 8) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        if (score <= 2) return { score, level: 'weak', label: 'Weak', color: '#ef4444', bars: 1 };
        if (score <= 4) return { score, level: 'medium', label: 'Medium', color: '#f59e0b', bars: 2 };
        return { score, level: 'strong', label: 'Strong', color: '#10b981', bars: 4 };
    };

    const passwordStrength = calculatePasswordStrength(signUpPassword);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const newErrors: { [key: string]: string } = {};

        if (!signUpFirstName.trim()) newErrors.firstName = 'First name is required';
        else if (signUpFirstName.length > 50) newErrors.firstName = 'First name must be less than 50 characters';
        else if (!/^[a-zA-Z\s]+$/.test(signUpFirstName)) newErrors.firstName = 'First name can only contain letters and spaces';

        if (!signUpPhone.trim()) newErrors.phone = 'Phone number is required';
        else if (signUpPhone.length < 9) newErrors.phone = 'Phone number must be at least 9 digits';

        if (!signUpEmail.trim()) newErrors.email = 'Email is required';
        else if (!validateEmail(signUpEmail)) newErrors.email = 'Please enter a valid email address';

        if (!signUpPassword) newErrors.password = 'Password is required';
        else if (signUpPassword.length < 8) newErrors.password = 'Password must be at least 8 characters';
        else if (!/[0-9]/.test(signUpPassword)) newErrors.password = 'Password must contain at least one number';

        if (signUpPassword !== signUpConfirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        // Username validation (3-30 chars, letters/numbers, underscores and dots)
        if (!signUpUsername.trim()) {
            newErrors.username = 'Username is required';
        } else {
            const uname = signUpUsername.trim();

            if (uname.length < 3) {
                newErrors.username = 'Username must be at least 3 characters';
            } else if (uname.length > 30) {
                newErrors.username = 'Username must be at most 30 characters';
            } else if (/\s/.test(uname)) {
                newErrors.username = 'Username cannot contain spaces';
            } else if (!/^[A-Za-z0-9._]+$/.test(uname)) {
                newErrors.username = 'Username can only contain letters, numbers, dots (.) and underscores (_)';
            } else if (/^[._]/.test(uname) || /[._]$/.test(uname)) {
                newErrors.username = 'Username cannot start or end with a dot or underscore';
            } else if (/([._])\1/.test(uname) || /[._]{2,}/.test(uname)) {
                newErrors.username = 'Username cannot contain consecutive dots or underscores';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const fullPhone = countryCode + signUpPhone;
            const result = await signUp(signUpEmail, signUpPassword, signUpFirstName, fullPhone, signUpUsername.trim().toLowerCase(), turnstileToken || undefined);

            if (!result.success) {
                setErrors({ general: result.error || 'Failed to sign up' });
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

            onSuccess(signUpEmail);
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch (err: any) {
            setErrors({ general: err.message || 'Failed to sign up' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container sign-up-container">
            <form onSubmit={handleSignUp}>
                <h1>Create Account</h1>
                <span className="auth-subtitle">Join us for sweet moments</span>

                <label className="text-sm font-semibold text-gray-700 mt-4 mb-1 block">Username</label>
                <input
                    type="text"
                    placeholder="Enter a unique username"
                    value={signUpUsername}
                    onChange={(e) => setSignUpUsername(e.target.value)}
                    required
                    disabled={loading}
                />
                {errors.username && <div className="field-error">{errors.username}</div>}

                <label className="text-sm font-semibold text-gray-700 mt-4 mb-1 block">First Name</label>
                <input
                    type="text"
                    placeholder="Enter your first name"
                    value={signUpFirstName}
                    onChange={(e) => setSignUpFirstName(e.target.value)}
                    required
                    disabled={loading}
                />
                {errors.firstName && <div className="field-error">{errors.firstName}</div>}

                <label className="text-sm font-semibold text-gray-700 mt-4 mb-1 block">Phone Number</label>
                <div className="phone-input-group">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    borderBottom: '2px solid #e5e7eb',
                                    borderRadius: '0',
                                    padding: '16px 8px',
                                    fontSize: '15px',
                                    fontWeight: 'normal',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    minWidth: '90px',
                                    width: 'auto',
                                    color: '#2C3E50',
                                    textTransform: 'none',
                                    letterSpacing: 'normal',
                                    marginTop: '8px',
                                    boxShadow: 'none',
                                    transition: 'border-color 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.setProperty('border-bottom-color', '#F48FB1');
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.setProperty('border-bottom-color', '#e5e7eb');
                                }}
                            >
                                <span>{countryCode === '+60' ? '🇲🇾 +60' : '🇮🇳 +91'}</span>
                                <ChevronDown className="w-3 h-3 ml-2" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => setCountryCode('+60')} className="hover:bg-sai-pink/5 focus:bg-sai-pink/10 focus:text-sai-pink cursor-pointer">🇲🇾 +60</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setCountryCode('+91')} className="hover:bg-sai-pink/5 focus:bg-sai-pink/10 focus:text-sai-pink cursor-pointer">🇮🇳 +91</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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

                <label className="text-sm font-semibold text-gray-700 mt-4 mb-1 block">Email</label>
                <input
                    type="email"
                    placeholder="Enter your email address"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                    disabled={loading}
                />
                {errors.email && <div className="field-error">{errors.email}</div>}

                <label className="text-sm font-semibold text-gray-700 mt-4 mb-1 block">Password</label>
                <div className="password-input-group">
                    <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        placeholder="Create a password (min 8 chars, 1 number)"
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
                    {signUpPassword && (
                        <div className="password-status-icon">
                            <div className={`status-circle ${passwordStrength.level === 'weak' ? 'status-weak' : passwordStrength.level === 'medium' ? 'status-medium' : 'status-strong'}`}>
                                {passwordStrength.level === 'weak' ? <X className="w-4 h-4 text-white" /> : <Check className="w-4 h-4 text-white" />}
                            </div>
                        </div>
                    )}
                </div>
                {errors.password && <div className="field-error">{errors.password}</div>}

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

                <label className="text-sm font-semibold text-gray-700 mt-4 mb-1 block">Confirm Password</label>
                <div className="password-input-group">
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
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

                <div className="flex justify-center w-full my-4">
                    <TurnstileWidget
                        onVerify={(token) => {
                            setTurnstileToken(token);
                            if (errors.general && errors.general.includes('timeout-or-duplicate')) {
                                const newErrors = { ...errors };
                                delete newErrors.general;
                                setErrors(newErrors);
                            }
                        }}
                        retry="auto"
                        theme="light"
                    />
                </div>

                {errors.general && <div className="error-message">{errors.general}</div>}

                <button type="submit" disabled={loading || !turnstileToken}>
                    {loading ? 'Creating...' : 'Sign Up'}
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
                    <span>Already have an account? </span>
                    <button type="button" onClick={() => { setIsSignUp(false); setErrors({}); }}>
                        Log in
                    </button>
                </div>
            </form>
        </div>
    );
}