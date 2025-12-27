'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth';
import Image from 'next/image';

export default function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await signUp(email, password);
            // Auto-login after signup, redirect to profile
            router.push('/profile');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Failed to sign up');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-sai-white flex items-center justify-center px-6 py-12">
            {/* Logo */}
            <div className="absolute top-6 left-6">
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

            {/* Sign Up Form */}
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4" style={{ borderTopColor: 'var(--color-sai-pink)' }}>
                    <h1 className="font-serif text-3xl text-center text-sai-charcoal mb-2">
                        Create Account
                    </h1>
                    <p className="text-center text-sai-gray text-sm mb-8">
                        Join us for sweet moments
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-sai-charcoal mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sai-pink/50 focus:border-sai-pink transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-sai-charcoal mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sai-pink/50 focus:border-sai-pink transition-all"
                                placeholder="••••••••"
                            />
                            <p className="text-xs text-sai-gray mt-1">At least 6 characters</p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-sai-charcoal mb-2">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sai-pink/50 focus:border-sai-pink transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: 'var(--color-sai-pink)' }}
                        >
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-6 text-center text-sm text-sai-gray">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: 'var(--color-sai-pink)' }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
