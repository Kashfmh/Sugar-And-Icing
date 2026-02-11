"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Camera, Video, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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

interface RateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any; // keep loose to avoid tight coupling
    userId?: string;
}

interface SubmitResult {
    success: boolean;
    message: string;
}

export default function RateOrderModal({ isOpen, onClose, order, userId }: RateOrderModalProps) {
    const [reviews, setReviews] = useState<Record<string, ProductReview>>({});
    const [submitting, setSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [preview, setPreview] = useState<{ type: 'image' | 'video'; url: string } | null>(null);
    const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

    useEffect(() => {
        if (isOpen && order) {
            // Initialize review state per order item
            const initial: Record<string, ProductReview> = {};
            (order.order_items || []).forEach((it: any) => {
                // Try multiple ways to extract product_id
                let productId: string | undefined = undefined;
                
                // Try: it.products[0].id (array)
                if (Array.isArray(it.products) && it.products[0]?.id) {
                    productId = it.products[0].id;
                }
                // Try: it.products.id (object)
                else if (it.products?.id) {
                    productId = it.products.id;
                }
                // Try: it.product_id (direct field)
                else if (it.product_id) {
                    productId = it.product_id;
                }
                // Try: it.productId (camelCase)
                else if (it.productId) {
                    productId = it.productId;
                }
                
                // Log if we can't find it for debugging
                if (!productId) {
                    console.warn('Could not extract product_id from order item:', it);
                }
                
                initial[it.id] = {
                    itemId: it.id,
                    productId,
                    rating: 5,
                    text: '',
                    anonymous: false,
                    media: { images: [], video: null }
                };
            });
            setReviews(initial);
            document.body.style.overflow = 'hidden';
        }

        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, order]);

    // cleanup object URLs when modal closes
    useEffect(() => {
        return () => {
            // revoke created URLs
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

    if (!isOpen || !order) return null;

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
            // attach preview URLs to incoming files
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
                // already have a video, ignore additional
                alert('You can only upload one video per product review. Remove the existing video to add another.');
                return r;
            }
            return ({ ...r, [itemId]: { ...r[itemId], media: { ...(r[itemId].media || { images: [], video: null }), video: f } } });
        });
    };

    const validateMedia = (media?: ReviewMedia) => {
        if (!media) return { ok: true };
        const IMG_MAX = 5 * 1024 * 1024; // 5MB per image
        const VID_MAX = 50 * 1024 * 1024; // 50MB video

        if ((media.images || []).length > 5) return { ok: false, msg: 'You can upload up to 5 images.' };
        for (const img of media.images || []) {
            if (img.size > IMG_MAX) return { ok: false, msg: 'Each image must be <= 5MB' };
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(img.type)) return { ok: false, msg: 'Invalid image type' };
        }

        if (media.video) {
            if (media.video.size > VID_MAX) return { ok: false, msg: 'Video must be <= 50MB' };
            if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(media.video.type)) return { ok: false, msg: 'Invalid video type' };
        }

        return { ok: true };
    };

    const handleSubmit = async () => {
        if (hasSubmitted) return;
        setSubmitting(true);
        try {
            // Validate all media
            for (const key of Object.keys(reviews)) {
                const res = validateMedia(reviews[key].media);
                if (!res.ok) throw new Error(res.msg);
            }

            // Validate product_id exists for all items
            for (const key of Object.keys(reviews)) {
                if (!reviews[key].productId) {
                    throw new Error(`Missing product information for one or more items. Please refresh and try again.`);
                }
            }

            // Upload media to supabase storage and create review entries
            let successCount = 0;
            const errors: string[] = [];
            const ratedProductNames: string[] = [];

            for (const key of Object.keys(reviews)) {
                const r = reviews[key];
                const orderItem = (order.order_items || []).find((it: any) => it.id === r.itemId);
                const product = orderItem ? (Array.isArray(orderItem.products) ? orderItem.products[0] : orderItem.products) : null;
                const productName = product?.name || orderItem?.product_name || 'Unknown Product';
                
                ratedProductNames.push(productName);
                
                const mediaUrls: { images: string[]; video?: string | null } = { images: [], video: null };

                // Try to upload media, but don't fail the entire submission if storage isn't available
                if (r.media) {
                    // images
                    for (const img of r.media.images || []) {
                        try {
                            const path = `reviews/${userId || 'anon'}/${order.id}/${r.itemId}/${Date.now()}-${img.name}`;
                            const { error: uploadErr } = await supabase.storage.from('reviews').upload(path, img, { cacheControl: '3600', upsert: false });
                            if (uploadErr) {
                                console.warn('Image upload skipped:', uploadErr.message);
                                // Don't throw - just skip this image
                            } else {
                                const { data } = supabase.storage.from('reviews').getPublicUrl(path);
                                mediaUrls.images.push((data as any).publicUrl || '');
                            }
                        } catch (e: any) {
                            console.warn('Image upload failed:', e.message);
                            // Continue without this image
                        }
                    }

                    if (r.media.video) {
                        try {
                            const v = r.media.video;
                            const path = `reviews/${userId || 'anon'}/${order.id}/${r.itemId}/${Date.now()}-${v.name}`;
                            const { error: uploadErr } = await supabase.storage.from('reviews').upload(path, v, { cacheControl: '3600', upsert: false });
                            if (uploadErr) {
                                console.warn('Video upload skipped:', uploadErr.message);
                                // Don't throw - just skip video
                            } else {
                                const { data } = supabase.storage.from('reviews').getPublicUrl(path);
                                mediaUrls.video = (data as any).publicUrl || null;
                            }
                        } catch (e: any) {
                            console.warn('Video upload failed:', e.message);
                            // Continue without video
                        }
                    }
                }

                // Backend: avoid duplicate reviews for same product+order
                const { data: existing, error: checkErr } = await (supabase as any)
                    .from('reviews')
                    .select('id')
                    .eq('product_id', r.productId)
                    .eq('order_id', order.id)
                    .limit(1)
                    .maybeSingle();

                if (checkErr) {
                    console.warn('Failed to check existing reviews:', checkErr);
                }

                // If a review already exists for this order + product, skip inserting another
                if (existing && (existing as any).id) {
                    console.info('Skipping duplicate review insert for', r.productId, order.id);
                    continue;
                }

                // Insert review record into `reviews` table - THIS should succeed
                const reviewRecord = {
                    product_id: r.productId,
                    user_id: userId || null,
                    order_id: order.id,
                    rating: r.rating,
                    comment: r.text || null,
                    images: mediaUrls.images && mediaUrls.images.length > 0 ? mediaUrls.images : null,
                    video_urls: mediaUrls.video ? [mediaUrls.video] : null,
                    is_verified_purchase: true,
                    created_at: new Date().toISOString()
                };

                const { error: insertErr } = await (supabase as any).from('reviews').insert([reviewRecord]);

                if (insertErr) {
                    console.error('Failed to insert review row:', insertErr);
                    throw new Error(`Failed to save review: ${insertErr.message || 'Database error'}`);
                }

                successCount++;
            }

            // Create a notification for the successful review submission
            if (userId && successCount > 0) {
                const notificationTitle = 'Review Posted!';
                const notificationMessage = `Your review for order ${order.id.substring(0, 8)}... has been posted. Products rated: ${ratedProductNames.join(', ')}`;
                
                const { error: notifErr } = await (supabase as any).from('notifications').insert([{
                    user_id: userId,
                    title: notificationTitle,
                    message: notificationMessage,
                    type: 'review',
                    read: false,
                    created_at: new Date().toISOString()
                }]);

                if (notifErr) {
                    console.warn('Failed to create notification:', notifErr);
                } else {
                    // Dispatch event to update notification inbox
                    window.dispatchEvent(new Event('notifications-updated'));
                }
            }

            // Dispatch event for UI updates
            window.dispatchEvent(new Event('reviews-updated'));

            // Show success message and auto-close
            setSubmitResult({
                success: true,
                message: `Successfully submitted ${successCount} product review${successCount !== 1 ? 's' : ''}. Thank you for your feedback!`
            });

            // Lock further submissions immediately
            setHasSubmitted(true);

            // Auto-close after 3 seconds
            setTimeout(() => {
                onClose();
            }, 3000);
        } catch (err: any) {
            console.error('Submit error:', err);
            setSubmitResult({
                success: false,
                message: err.message || 'Failed to submit reviews. Please try again.'
            });
        } finally {
            setSubmitting(false);
        }
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

    const openPreview = (type: 'image' | 'video', url: string) => {
        setPreview({ type, url });
    };

    const closePreview = () => setPreview(null);

    const closeResultMessage = () => {
        setSubmitResult(null);
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={submitting ? undefined : onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />

                        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ type: 'spring', damping: 20 }} className="relative bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100">
                            <button onClick={submitting ? undefined : onClose} disabled={submitting} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"><X className="w-5 h-5" /></button>

                            <div className="p-6">
                                <h3 className="text-xl font-serif font-bold text-sai-charcoal">Rate Your Order</h3>
                                <p className="text-sm text-gray-500 mt-1">Leave product-level reviews for items in this order.</p>

                                {/* Inline success/error message */}
                                {submitResult && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={`mt-4 p-4 rounded-lg flex gap-3 ${
                                            submitResult.success
                                                ? 'bg-green-50 border border-green-200'
                                                : 'bg-red-50 border border-red-200'
                                        }`}
                                    >
                                        {submitResult.success ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1">
                                            <p className={submitResult.success ? 'text-green-800 text-sm' : 'text-red-800 text-sm'}>
                                                {submitResult.message}
                                            </p>
                                        </div>
                                        {!submitResult.success && (
                                            <button
                                                onClick={closeResultMessage}
                                                className="text-red-600 hover:text-red-700 flex-shrink-0"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </motion.div>
                                )}

                                <div className="mt-6 space-y-6">
                                    {(order.order_items || []).map((it: any) => {
                                        const id = it.id;
                                        const state = reviews[id];
                                        const product = Array.isArray(it.products) ? it.products[0] : it.products;
                                        return (
                                            <div key={id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {product?.image_url ? <img src={product.image_url} alt={product?.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>}
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="font-medium text-sai-charcoal">{product?.name || it.product_name}</div>
                                                                
                                                                {/* Metadata details to distinguish product variants */}
                                                                {it.metadata && Object.keys(it.metadata).length > 0 && (
                                                                    <div className="flex flex-wrap gap-2 mt-1 mb-1">
                                                                        {Object.entries(it.metadata).map(([key, val]) => {
                                                                            const value = String(val || '').trim();
                                                                            if (!value) return null;
                                                                            return (
                                                                                <span key={key} className="text-xs px-2 py-0.5 bg-pink-50 text-pink-700 rounded border border-pink-100">
                                                                                    {value}
                                                                                </span>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                                
                                                                <div className="text-xs text-gray-500">Qty: {it.quantity}</div>
                                                            </div>

                                                            <div className="flex items-center gap-1">
                                                                    {[1,2,3,4,5].map(n => (
                                                                        <button key={n} disabled={submitting} onClick={() => handleStar(id, n)} className="p-1 disabled:opacity-50">
                                                                            {state?.rating >= n ? (
                                                                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                                                            ) : (
                                                                                <Star className="w-5 h-5 text-yellow-400 stroke-yellow-400" />
                                                                            )}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                        </div>

                                                        <div className="mt-3">
                                                            <div className="relative">
                                                                <textarea maxLength={100} disabled={submitting || hasSubmitted} value={state?.text || ''} onChange={(e) => handleText(id, e.target.value)} placeholder="Share more thoughts on the product to help other buyers." className="mt-3 w-full min-h-[80px] max-h-36 p-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 resize-y overflow-auto disabled:opacity-50" />
                                                                <div className="absolute right-3 bottom-3 text-xs text-gray-400">{(state?.text || '').length}/100</div>
                                                            </div>

                                                            <div className="mt-3 grid grid-cols-2 gap-3">
                                                                    <label className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 text-sm cursor-pointer opacity-50 disabled:opacity-50">
                                                                    <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full">
                                                                        <Camera className="w-6 h-6 text-gray-400" />
                                                                    </div>
                                                                    <div className="text-sm font-medium">Photo ({(state?.media?.images || []).length}/5)</div>
                                                                    <input className="hidden" disabled={submitting || hasSubmitted} type="file" accept="image/*" multiple onChange={(e) => handleImageSelect(id, e.target.files)} />
                                                                </label>

                                                                    <label className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 text-sm cursor-pointer opacity-50 disabled:opacity-50">
                                                                    <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full">
                                                                        <Video className="w-6 h-6 text-gray-400" />
                                                                    </div>
                                                                    <div className="text-sm font-medium">Video ({state?.media?.video ? 1 : 0}/1)</div>
                                                                    <input className="hidden" disabled={submitting || hasSubmitted} type="file" accept="video/*" onChange={(e) => handleVideoSelect(id, e.target.files)} />
                                                                </label>
                                                            </div>

                                                            {/* Thumbnails */}
                                                            <div className="mt-3 grid grid-cols-5 gap-2">
                                                                {(state?.media?.images || []).map((f: File, i: number) => (
                                                                    <div key={i} className="relative w-full h-20 bg-gray-100 rounded overflow-hidden cursor-pointer">
                                                                        <img src={(f as any).__preview} alt={`img-${i}`} className="w-full h-full object-cover" onClick={() => openPreview('image', (f as any).__preview)} />
                                                                        <button disabled={submitting || hasSubmitted} onClick={(e) => { e.stopPropagation(); removeImage(id, i); }} className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white disabled:opacity-50"><Trash2 className="w-3 h-3" /></button>
                                                                    </div>
                                                                ))}

                                                                {state?.media?.video ? (
                                                                    <div className="relative w-full h-20 bg-black rounded overflow-hidden col-span-1 cursor-pointer">
                                                                        <video src={(state?.media?.video as any).__preview} className="w-full h-full object-cover" onClick={() => openPreview('video', (state?.media?.video as any).__preview)} />
                                                                        <button disabled={submitting || hasSubmitted} onClick={(e) => { e.stopPropagation(); removeVideo(id); }} className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white disabled:opacity-50"><Trash2 className="w-3 h-3" /></button>
                                                                    </div>
                                                                ) : null}
                                                            </div>

                                                            <div className="flex items-center gap-2 mt-3">
                                                                <input id={`anon-${id}`} disabled={submitting || hasSubmitted} type="checkbox" checked={state?.anonymous || false} onChange={(e) => handleAnon(id, e.target.checked)} />
                                                                <label htmlFor={`anon-${id}`} className="text-sm text-gray-600">Review Anonymously</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Fullscreen preview modal */}
                                {preview && (
                                    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                                        <div className="absolute inset-0 bg-black/80" onClick={closePreview} />
                                        <div className="relative z-[140] max-w-3xl w-full">
                                            <button onClick={closePreview} className="absolute top-4 right-4 z-50 p-2 text-white"><X className="w-6 h-6" /></button>
                                            {preview.type === 'image' ? (
                                                <img src={preview.url} className="w-full max-h-[80vh] object-contain mx-auto" />
                                            ) : (
                                                <video src={preview.url} controls className="w-full max-h-[80vh] mx-auto" />
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 flex items-center justify-end gap-3">
                                    <button disabled={submitting || hasSubmitted} onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-50">Cancel</button>
                                    <button disabled={submitting || hasSubmitted} onClick={handleSubmit} className="px-5 py-2.5 bg-sai-pink text-white rounded-xl shadow-lg disabled:opacity-70">{submitting ? 'Submitting...' : hasSubmitted ? 'Submitted' : 'Submit Reviews'}</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
