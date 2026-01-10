'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, CartItem } from '@/hooks/useCart';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Upload, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, clearCart, totalItems } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        deliveryDate: '',
        deliveryTime: '',
        notes: ''
    });

    // File Upload State
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auth Pre-fill
    useEffect(() => {
        setMounted(true);
        const loadUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch profile if needed, for now just use auth email
                setFormData(prev => ({ ...prev, email: user.email || '' }));
            }
        };
        loadUser();
    }, []);

    // Redirect if cart empty
    useEffect(() => {
        if (mounted && items.length === 0) {
            router.push('/other-treats');
        }
    }, [items, mounted, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File size too large. Please upload an image under 5MB.');
                return;
            }
            setReceiptFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!receiptFile) {
                throw new Error('Please upload your payment receipt.');
            }

            // 1. Upload Receipt
            const fileExt = receiptFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('payment-receipts')
                .upload(filePath, receiptFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('payment-receipts')
                .getPublicUrl(filePath);

            // 2. Create Order
            const { data: { user } } = await supabase.auth.getUser();

            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user?.id || null, // Null for guests
                    guest_info: {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        address: formData.address,
                        notes: formData.notes
                    },
                    status: 'pending_verification',
                    total_amount: subtotal(),
                    receipt_url: publicUrl,
                    delivery_date: formData.deliveryDate ? new Date(formData.deliveryDate).toISOString() : null,
                    delivery_slot: formData.deliveryTime
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 3. Create Order Items
            const orderItems = items.map(item => ({
                order_id: orderData.id,
                product_id: item.id.includes('-') ? item.id.split('-')[0] : item.id, // Try to extract UUID if basic item, otherwise use ID (might fail FK if strictly UUID)
                // Wait, product_id must be UUID in schema. 
                // Simple fix: Store product name if ID is not a valid UUID or just store name always.
                // In Setup SQL: product_id uuid references products(id).
                // My CartItem.id might be 'uuid' or 'uuid-{options}'.
                // So splitting by '-' and taking first part is usually safe if products list item IDs are bare UUIDs.
                // But let's be safe: if product_id insert fails, it might be an issue.
                // Actually, let's use product_name as main reference in line items for safety.
                // Modified SQL allows product_id to be nullable? "product_id uuid references public.products(id)". Yes, nullable by default unless "not null".
                // I'll try to pass product_id if it looks like a UUID (36 chars), otherwise null.
                product_name: item.name,
                quantity: item.quantity,
                price_at_purchase: item.price,
                metadata: item.metadata
            }));

            // Clean up productId for insertion
            const sanitizedOrderItems = orderItems.map(item => {
                const potentialId = item.product_id.includes('-') ? item.product_id.split('-')[0] : item.product_id;
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(potentialId);
                return {
                    ...item,
                    product_id: isUuid ? potentialId : null
                };
            });

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(sanitizedOrderItems);

            if (itemsError) throw itemsError;

            // 4. Success
            clearCart();
            router.push(`/success?orderId=${orderData.id}`);

        } catch (err: any) {
            console.error('Checkout error:', err);
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-sai-white">
                <Loader2 className="w-8 h-8 animate-spin text-sai-pink" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-sai-white pb-12">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
                    <Link href="/other-treats" className="flex items-center text-gray-500 hover:text-sai-pink transition-colors">
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Back to Menu
                    </Link>
                    <h1 className="ml-auto font-serif text-xl font-bold text-sai-charcoal">Checkout</h1>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Forms */}
                <div className="md:col-span-7 space-y-8">

                    {/* 1. Contact Info */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-sai-charcoal mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-sai-pink text-white flex items-center justify-center text-xs">1</span>
                            Contact Details
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sai-pink/50 focus:border-sai-pink outline-none transition-all"
                                    placeholder="e.g. Aakash"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sai-pink/50 focus:border-sai-pink outline-none transition-all"
                                        placeholder="user@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        required
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sai-pink/50 focus:border-sai-pink outline-none transition-all"
                                        placeholder="012-345 6789"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                                <textarea
                                    required
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sai-pink/50 focus:border-sai-pink outline-none transition-all resize-none h-24"
                                    placeholder="Full address for delivery..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* 2. Delivery Slot */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-sai-charcoal mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-sai-pink text-white flex items-center justify-center text-xs">2</span>
                            Delivery Slot
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <div className="relative">
                                    <input
                                        required
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={formData.deliveryDate}
                                        onChange={e => setFormData({ ...formData, deliveryDate: e.target.value })}
                                        className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sai-pink/50 focus:border-sai-pink outline-none transition-all cursor-pointer"
                                    />
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time Preference</label>
                                <select
                                    required
                                    value={formData.deliveryTime}
                                    onChange={e => setFormData({ ...formData, deliveryTime: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sai-pink/50 focus:border-sai-pink outline-none transition-all cursor-pointer bg-white"
                                >
                                    <option value="">Select a time...</option>
                                    <option value="morning">Morning (9am - 12pm)</option>
                                    <option value="afternoon">Afternoon (12pm - 4pm)</option>
                                    <option value="evening">Evening (4pm - 8pm)</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                            <input
                                type="text"
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sai-pink/50 focus:border-sai-pink outline-none transition-all"
                                placeholder="Gate code, leave at reception, etc."
                            />
                        </div>
                    </section>

                    {/* 3. Payment */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-sai-charcoal mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-sai-pink text-white flex items-center justify-center text-xs">3</span>
                            Payment
                        </h2>

                        <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300 mb-6">
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Scan to Pay via DuitNow / TNG</p>

                            {/* QR Code Placeholder */}
                            <div className="w-48 h-48 bg-white p-2 rounded-lg shadow-sm border border-gray-200 mb-4 relative overflow-hidden">
                                {/* REPLACE THIS WITH ACTUAL QR IMAGE */}
                                <div className="absolute inset-0 flex items-center justify-center flex-col text-gray-400">
                                    <div className="w-32 h-32 border-4 border-gray-800 rounded bg-white flex items-center justify-center">
                                        <span className="font-bold text-gray-800 text-2xl">QR</span>
                                    </div>
                                    <span className="text-xs mt-2">DuitNow QR</span>
                                </div>
                            </div>

                            <p className="text-lg font-bold text-sai-charcoal mb-1">Total: RM {subtotal().toFixed(2)}</p>
                            <p className="text-xs text-gray-500">Review amount before paying</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Upload Payment Receipt</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
                            >
                                {previewUrl ? (
                                    <div className="relative w-full h-32">
                                        <Image
                                            src={previewUrl}
                                            alt="Receipt preview"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-sai-pink/10 flex items-center justify-center text-sai-pink">
                                            <Upload className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm text-gray-600">Click to upload screenshot</p>
                                        <p className="text-xs text-gray-400">JPG, PNG up to 5MB</p>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                    </section>

                </div>


                {/* RIGHT COLUMN: Order Summary */}
                <div className="md:col-span-5">
                    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-24">
                        <h2 className="text-lg font-bold text-sai-charcoal mb-4">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-3">
                                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                                        {item.image_url ? (
                                            <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-xs text-gray-400">IMG</div>
                                        )}
                                        <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-tl-md">
                                            x{item.quantity}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                        <p className="text-sm text-sai-pink font-semibold">RM {(item.price * item.quantity).toFixed(2)}</p>

                                        {/* Metadata Display */}
                                        {item.metadata && Object.keys(item.metadata).length > 0 && (
                                            <div className="text-[10px] text-gray-500 mt-1 space-y-0.5 border-l-2 border-gray-100 pl-2">
                                                {Object.entries(item.metadata).map(([key, value]) => (
                                                    <p key={key}><span className="font-medium">{key}:</span> {String(value)}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 space-y-2 mb-6 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>RM {subtotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="border-t border-gray-200 my-2 pt-2 flex justify-between text-base font-bold text-sai-charcoal">
                                <span>Total</span>
                                <span>RM {subtotal().toFixed(2)}</span>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-sm text-red-600">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={loading || !receiptFile}
                            className="w-full bg-sai-pink text-white py-3.5 rounded-xl font-bold shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Place Order"
                            )}
                        </button>

                        <p className="text-xs text-center text-gray-400 mt-4">
                            By placing this order, you agree to our Terms of Service.
                        </p>
                    </div>
                </div>

            </div>
        </main>
    );
}
