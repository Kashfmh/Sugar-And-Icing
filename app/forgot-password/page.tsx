'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Send reset link - Supabase handles whether email exists
            const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (error) {
                setError(error.message);
            } else {
                // Always show success (even if email doesn't exist - security best practice)
                setSent(true);
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
                    {sent ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-sai-charcoal mb-2">Check your email</h1>
                            <p className="text-gray-600 mb-6">
                                We've sent a password reset link to <strong>{email}</strong>
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                Didn't receive the email? Check your spam folder or{' '}
                                <button
                                    onClick={() => setSent(false)}
                                    className="text-sai-pink hover:underline"
                                >
                                    try again
                                </button>
                            </p>
                            <Link
                                href="/login"
                                className="inline-block px-6 py-3 bg-sai-charcoal text-white rounded-xl font-medium hover:bg-sai-charcoal/90 transition-colors"
                            >
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to login
                            </Link>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-sai-pink/10 rounded-full flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-sai-pink" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-sai-charcoal">Forgot Password?</h1>
                                    <p className="text-gray-500">No worries, we'll send you reset instructions</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="Enter your email"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sai-pink/20 focus:border-sai-pink outline-none transition-all"
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full px-4 py-3 bg-sai-charcoal text-white rounded-xl font-medium hover:bg-sai-charcoal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
