'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
    const [step, setStep] = useState<'warning' | 'confirm' | 'deleting' | 'error'>('warning');
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [activeOrderCount, setActiveOrderCount] = useState<number | null>(null);
    const [checkingOrders, setCheckingOrders] = useState(false);

    useEffect(() => {
        if (isOpen) {
            checkActiveOrders();
        } else {
            // Reset state when closed
            setStep('warning');
            setConfirmText('');
            setError(null);
            setActiveOrderCount(null);
        }
    }, [isOpen]);

    const checkActiveOrders = async () => {
        setCheckingOrders(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: orders, error } = await supabase
                .from('orders')
                .select('id')
                .eq('user_id', user.id)
                .in('status', ['pending_payment', 'processing', 'preparing']);

            if (!error && orders) {
                setActiveOrderCount(orders.length);
            }
        } catch (err) {
            console.error('Error checking orders:', err);
        } finally {
            setCheckingOrders(false);
        }
    };

    const handleDelete = async () => {
        if (confirmText !== 'DELETE') return;

        setStep('deleting');
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('User not authenticated');
                setStep('error');
                return;
            }

            const response = await fetch('/api/account/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, confirmText })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || data.error || 'Failed to delete account');
                setStep('error');
                return;
            }

            // Success - sign out and redirect
            await supabase.auth.signOut({ scope: 'global' });
            window.location.href = '/';

        } catch (err: any) {
            setError(err.message || 'Something went wrong');
            setStep('error');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
                    >
                        <div className="bg-white rounded-2xl shadow-xl p-6 mx-4">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <Trash2 className="w-5 h-5 text-red-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-sai-charcoal">Delete Account</h2>
                                </div>
                                {step !== 'deleting' && (
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                )}
                            </div>

                            {/* Warning Step */}
                            {step === 'warning' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                                        <div className="flex gap-3">
                                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-red-700">This action cannot be undone</p>
                                                <p className="text-sm text-red-600 mt-1">
                                                    Deleting your account will permanently remove all your data including order history, profile information, and saved items.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {checkingOrders ? (
                                        <div className="flex items-center justify-center py-4">
                                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                            <span className="ml-2 text-gray-500">Checking active orders...</span>
                                        </div>
                                    ) : activeOrderCount !== null && activeOrderCount > 0 ? (
                                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                            <p className="font-medium text-amber-700">⚠️ You have {activeOrderCount} active order(s)</p>
                                            <p className="text-sm text-amber-600 mt-1">
                                                Please wait until all orders are completed or cancelled before deleting your account.
                                            </p>
                                        </div>
                                    ) : null}

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={onClose}
                                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => setStep('confirm')}
                                            disabled={checkingOrders || (activeOrderCount !== null && activeOrderCount > 0)}
                                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Confirm Step */}
                            {step === 'confirm' && (
                                <div className="space-y-4">
                                    <p className="text-gray-600">
                                        To confirm deletion, please type <span className="font-mono font-bold text-red-600">DELETE</span> below:
                                    </p>

                                    <input
                                        type="text"
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                        placeholder="Type DELETE to confirm"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all text-center font-mono text-lg tracking-widest"
                                    />

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => {
                                                setStep('warning');
                                                setConfirmText('');
                                            }}
                                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            disabled={confirmText !== 'DELETE'}
                                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Delete Forever
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Deleting Step */}
                            {step === 'deleting' && (
                                <div className="text-center py-8">
                                    <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
                                    <p className="text-gray-600">Deleting your account...</p>
                                    <p className="text-sm text-gray-400 mt-2">Please do not close this window</p>
                                </div>
                            )}

                            {/* Error Step */}
                            {step === 'error' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                                        <p className="font-medium text-red-700">Failed to delete account</p>
                                        <p className="text-sm text-red-600 mt-1">{error}</p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={onClose}
                                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={() => setStep('confirm')}
                                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
