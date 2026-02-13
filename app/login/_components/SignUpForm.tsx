import { Eye, EyeOff, Check, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { signUp } from '@/lib/auth';
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
            const result = await signUp(signUpEmail, signUpPassword, signUpFirstName, fullPhone, signUpUsername.trim().toLowerCase());

            if (!result.success) {
                setErrors({ general: result.error || 'Failed to sign up' });
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

                <input
                    type="text"
                    placeholder="Username (unique)"
                    value={signUpUsername}
                    onChange={(e) => setSignUpUsername(e.target.value)}
                    required
                    disabled={loading}
                />
                {errors.username && <div className="field-error">{errors.username}</div>}

                <input
                    type="text"
                    placeholder="First Name"
                    value={signUpFirstName}
                    onChange={(e) => setSignUpFirstName(e.target.value)}
                    required
                    disabled={loading}
                />
                {errors.firstName && <div className="field-error">{errors.firstName}</div>}

                <div className="phone-input-group">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                style={{
                                    backgroundColor: '#f3f4f6',
                                    border: '2px solid transparent',
                                    borderRadius: '10px',
                                    padding: '14px 16px',
                                    fontSize: '14px',
                                    fontWeight: 'normal',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    minWidth: '110px',
                                    width: 'auto',
                                    color: '#2C3E50',
                                    textTransform: 'none',
                                    letterSpacing: 'normal',
                                    marginTop: '0'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#F48FB1';
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'transparent';
                                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                                }}
                            >
                                <span>{countryCode === '+60' ? '🇲🇾 +60' : '🇮🇳 +91'}</span>
                                <ChevronDown className="w-3 h-3" />
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

                <input
                    type="email"
                    placeholder="Email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                    disabled={loading}
                />
                {errors.email && <div className="field-error">{errors.email}</div>}

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

                <TurnstileWidget
                    onVerify={(token) => setTurnstileToken(token)}
                    retry="never"
                />

                {errors.general && <div className="error-message">{errors.general}</div>}

                <button type="submit" disabled={loading || !turnstileToken}>
                    {loading ? 'Creating...' : 'Sign Up'}
                </button>

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