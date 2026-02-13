'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Star, Camera, Video, Trash2, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import Link from 'next/link';

const supabase = createClient();

interface ReviewMedia {
    images: File[];
    video?: File | null;
}

interface ProductReview {
    itemId: string;
    productId?: string;
    rating: number;
    text?: string;
    anonymous?: boolean;
    media?: ReviewMedia;
}

interface SubmitResult {
    success: boolean;
    message: string;
}

export default function RateOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = use(params);
    const router = useRouter();
    const { user } = useProfile();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<Record<string, ProductReview>>({});
    const [submitting, setSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [preview, setPreview] = useState<{ type: 'image' | 'video'; url: string } | null>(null);
    const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

    // Desktop redirect & Data Fetching
    useEffect(() => {
        // Redirect desktop users
        if (window.innerWidth >= 1024) {
            router.replace('/profile?tab=dashboard&open=orders');
            return;
        }

        const fetchOrder = async () => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*, order_items(*, products(name, image_url, gallery_images))')
                    .eq('id', orderId)
                    .single();

                if (error) throw error;
                setOrder(data);

                // Initialize review state
                const initial: Record<string, ProductReview> = {};
                (data.order_items || []).forEach((it: any) => {
                    let productId: string | undefined;
                    if (Array.isArray(it.products) && it.products[0]?.id) productId = it.products[0].id;
                    else if (it.products?.id) productId = it.products.id;
                    else if (it.product_id) productId = it.product_id;
                    else if (it.productId) productId = it.productId;

                    initial[it.id] = {
                        itemId: it.id,
                        productId,
                        rating: 5, // Default 5 stars
                        text: '',
                        anonymous: false,
                        media: { images: [], video: null }
                    };
                });
                setReviews(initial);

            } catch (error) {
                console.error('Error fetching order:', error);
                router.push('/orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, router]);

    // Cleanup object URLs
    useEffect(() => {
        return () => {
            Object.values(reviews).forEach(r => {
                (r.media?.images || []).forEach((f: File) => {
                    try { URL.revokeObjectURL((f as any).__preview || ''); } catch (e) { }
                });
                if (r.media?.video) {
                    try { URL.revokeObjectURL((r.media.video as any).__preview || ''); } catch (e) { }
                }
            });
        };
    }, [reviews]);

    const handleStar = (itemId: string, value: number) => {
        setReviews(r => ({ ...r, [itemId]: { ...r[itemId], rating: value } }));
    };

    const handleText = (itemId: string, txt: string) => {
        setReviews(r => ({ ...r, [itemId]: { ...r[itemId], text: txt } }));
    };

    const handleAnon = (itemId: string, val: boolean) => {
        setReviews(r => ({ ...r, [itemId]: { ...r[itemId], anonymous: val } }));
    };

    const handleImageSelect = (itemId: string, files: FileList | null) => {
        if (!files) return;
        const incoming = Array.from(files);
        setReviews(r => {
            const existing = r[itemId]?.media?.images || [] as File[];
            const prepared = incoming.map(f => {
                try { (f as any).__preview = URL.createObjectURL(f); } catch (e) { }
                return f;
            });
            const merged = [...existing, ...prepared].slice(0, 5);
            return { ...r, [itemId]: { ...r[itemId], media: { ...(r[itemId].media || { images: [], video: null }), images: merged } } };
        });
    };

    const handleVideoSelect = (itemId: string, files: FileList | null) => {
        if (!files) return;
        const f = files[0];
        try { (f as any).__preview = URL.createObjectURL(f); } catch (e) { }
        setReviews(r => {
            const existingVideo = r[itemId]?.media?.video;
            if (existingVideo) {
                alert('Only one video allowed per item');
                return r;
            }
            return ({ ...r, [itemId]: { ...r[itemId], media: { ...(r[itemId].media || { images: [], video: null }), video: f } } });
        });
    };

    const removeImage = (itemId: string, idx: number) => {
        setReviews(r => {
            const arr = [...(r[itemId].media?.images || [])];
            const f = arr.splice(idx, 1)[0];
            try { URL.revokeObjectURL((f as any).__preview || ''); } catch (e) { }
            return { ...r, [itemId]: { ...r[itemId], media: { ...(r[itemId].media || { images: [], video: null }), images: arr } } };
        });
    };

    const removeVideo = (itemId: string) => {
        setReviews(r => {
            const v = r[itemId].media?.video;
            try { URL.revokeObjectURL((v as any).__preview || ''); } catch (e) { }
            return { ...r, [itemId]: { ...r[itemId], media: { ...(r[itemId].media || { images: [], video: null }), video: null } } };
        });
    };

    const validateMedia = (media?: ReviewMedia) => {
        if (!media) return { ok: true };
        const IMG_MAX = 5 * 1024 * 1024;
        const VID_MAX = 50 * 1024 * 1024;

        if ((media.images || []).length > 5) return { ok: false, msg: 'Max 5 images per item' };
        for (const img of media.images || []) {
            if (img.size > IMG_MAX) return { ok: false, msg: 'Image too large (max 5MB)' };
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(img.type)) return { ok: false, msg: 'Invalid image format' };
        }

        if (media.video) {
            if (media.video.size > VID_MAX) return { ok: false, msg: 'Video too large (max 50MB)' };
            if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(media.video.type)) return { ok: false, msg: 'Invalid video format' };
        }

        return { ok: true };
    };

    const handleSubmit = async () => {
        if (hasSubmitted) return;
        setSubmitting(true);
        try {
            // Validation
            for (const key of Object.keys(reviews)) {
                const res = validateMedia(reviews[key].media);
                if (!res.ok) throw new Error(res.msg);
                if (!reviews[key].productId) throw new Error('Missing product info');
            }

            let successCount = 0;

            for (const key of Object.keys(reviews)) {
                const r = reviews[key];
                const mediaUrls: { images: string[]; video?: string | null } = { images: [], video: null };

                // Upload Media
                if (r.media) {
                    for (const img of r.media.images || []) {
                        try {
                            const path = `reviews/${user?.id || 'anon'}/${orderId}/${r.itemId}/${Date.now()}-${img.name}`;
                            const { error: upErr } = await supabase.storage.from('reviews').upload(path, img, { cacheControl: '3600', upsert: false });
                            if (!upErr) {
                                const { data } = supabase.storage.from('reviews').getPublicUrl(path);
                                mediaUrls.images.push(data.publicUrl);
                            }
                        } catch (e) { console.warn('Image upload failed', e); }
                    }

                    if (r.media.video) {
                        try {
                            const v = r.media.video;
                            const path = `reviews/${user?.id || 'anon'}/${orderId}/${r.itemId}/${Date.now()}-${v.name}`;
                            const { error: upErr } = await supabase.storage.from('reviews').upload(path, v, { cacheControl: '3600', upsert: false });
                            if (!upErr) {
                                const { data } = supabase.storage.from('reviews').getPublicUrl(path);
                                mediaUrls.video = data.publicUrl;
                            }
                        } catch (e) { console.warn('Video upload failed', e); }
                    }
                }

                if (!r.productId) continue;

                // Check duplicate
                const { data: existing } = await supabase
                    .from('reviews')
                    .select('id')
                    .eq('product_id', r.productId)
                    .eq('order_id', orderId)
                    .maybeSingle();

                if (existing) continue;

                // Insert
                const { error: insertErr } = await (supabase as any).from('reviews').insert([{
                    product_id: r.productId,
                    user_id: user?.id || null,
                    order_id: orderId,
                    rating: r.rating,
                    comment: r.text || null,
                    images: mediaUrls.images.length > 0 ? mediaUrls.images : null,
                    video_urls: mediaUrls.video ? [mediaUrls.video] : null,
                    is_verified_purchase: true,
                    is_anonymous: r.anonymous || false,
                }]);

                if (insertErr) throw insertErr;
                successCount++;
            }

            setHasSubmitted(true);
            setSubmitResult({ success: true, message: 'Reviews submitted successfully!' });
            window.dispatchEvent(new Event('reviews-updated'));

            // Redirect after delay
            setTimeout(() => {
                router.push('/orders');
            }, 2000);

        } catch (error: any) {
            console.error('Submit error:', error);
            setSubmitResult({ success: false, message: error.message || 'Failed to submit reviews' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-sai-cream pt-safe pb-safe flex flex-col">
                {/* Header Skeleton */}
                <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
                    <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="flex-1 p-4 space-y-6">
                    <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
                    {[1, 2].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
                            <div className="flex gap-4">
                                <div className="w-20 h-20 bg-gray-200 animate-pulse rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
                                    <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-screen bg-sai-cream pb-40">
            {/* Header */}
            <div className="sticky top-0 z-20 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
                <Link href="/orders" className="p-2 -ml-2 text-sai-charcoal hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="font-serif font-bold text-lg text-sai-charcoal">Rate Order</h1>
                <div className="w-9" /> {/* Spacer for centering */}
            </div>

            <div className="max-w-md mx-auto p-4 space-y-6">

                {submitResult && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl flex gap-3 ${submitResult.success ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}
                    >
                        {submitResult.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <p className="text-sm font-medium">{submitResult.message}</p>
                    </motion.div>
                )}

                <div className="bg-white rounded-2xl p-5 border border-sai-pink/20 shadow-sm">
                    <h2 className="font-semibold text-sai-charcoal mb-1">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
                    <p className="text-sm text-gray-500">How did you like your items?</p>
                </div>

                <div className="space-y-6">
                    {(order.order_items || []).map((it: any) => {
                        const id = it.id;
                        const state = reviews[id];
                        const product = Array.isArray(it.products) ? it.products[0] : it.products;
                        const productName = product?.name || it.product_name;

                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={id}
                                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
                            >
                                <div className="flex gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                                        {product?.image_url ? (
                                            <img src={product.image_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-sai-charcoal line-clamp-2 text-sm mb-1">{productName}</h3>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <button key={n} disabled={submitting || hasSubmitted} onClick={() => handleStar(id, n)} className="p-1 -ml-1 disabled:opacity-50 active:scale-90 transition-transform">
                                                    <Star className={`w-6 h-6 ${state?.rating >= n ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-50'}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <textarea
                                        placeholder="What did you like? What could be better?"
                                        value={state?.text || ''}
                                        onChange={(e) => handleText(id, e.target.value)}
                                        disabled={submitting || hasSubmitted}
                                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-sai-pink/20 focus:border-sai-pink transition-all outline-none resize-none min-h-[100px]"
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl cursor-pointer active:bg-gray-100 transition-colors">
                                            <Camera className="w-5 h-5 text-gray-400" />
                                            <span className="text-xs font-medium text-gray-500">Add Photos</span>
                                            <input type="file" multiple accept="image/*" className="hidden" disabled={submitting || hasSubmitted} onChange={(e) => handleImageSelect(id, e.target.files)} />
                                        </label>
                                        <label className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl cursor-pointer active:bg-gray-100 transition-colors">
                                            <Video className="w-5 h-5 text-gray-400" />
                                            <span className="text-xs font-medium text-gray-500">Add Video</span>
                                            <input type="file" accept="video/*" className="hidden" disabled={submitting || hasSubmitted} onChange={(e) => handleVideoSelect(id, e.target.files)} />
                                        </label>
                                    </div>

                                    {/* Previews */}
                                    {(state?.media?.images?.length || 0) > 0 || state?.media?.video ? (
                                        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                                            {state?.media?.images.map((f, i) => (
                                                <div key={i} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                    <img src={(f as any).__preview} className="w-full h-full object-cover" onClick={() => setPreview({ type: 'image', url: (f as any).__preview })} />
                                                    <button onClick={() => removeImage(id, i)} className="absolute top-0.5 right-0.5 bg-black/50 rounded-full p-0.5 text-white"><X className="w-3 h-3" /></button>
                                                </div>
                                            ))}
                                            {state?.media?.video && (
                                                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-black">
                                                    <video src={(state.media.video as any).__preview} className="w-full h-full object-cover" />
                                                    <button onClick={() => removeVideo(id)} className="absolute top-0.5 right-0.5 bg-black/50 rounded-full p-0.5 text-white"><X className="w-3 h-3" /></button>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}

                                    <div className="flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id={`anon-${id}`}
                                            checked={state?.anonymous || false}
                                            onChange={(e) => handleAnon(id, e.target.checked)}
                                            className="rounded border-gray-300 text-sai-pink focus:ring-sai-pink"
                                            disabled={submitting || hasSubmitted}
                                        />
                                        <label htmlFor={`anon-${id}`} className="text-sm text-gray-600">Post anonymously</label>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Sticky Submit Button */}
            <div className="fixed bottom-[80px] left-0 right-0 p-4 bg-white border-t border-gray-200 z-10 lg:hidden">
                <button
                    onClick={handleSubmit}
                    disabled={submitting || hasSubmitted}
                    className="w-full py-3.5 bg-sai-pink text-white rounded-xl font-semibold shadow-lg shadow-sai-pink/20 disabled:opacity-70 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting...
                        </>
                    ) : hasSubmitted ? (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            Submitted!
                        </>
                    ) : (
                        'Submit Reviews'
                    )}
                </button>
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {preview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4"
                    >
                        <button onClick={() => setPreview(null)} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white"><X className="w-6 h-6" /></button>
                        {preview.type === 'image' ? (
                            <img src={preview.url} className="max-w-full max-h-[90vh] object-contain" />
                        ) : (
                            <video src={preview.url} controls autoPlay className="max-w-full max-h-[90vh]" />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
