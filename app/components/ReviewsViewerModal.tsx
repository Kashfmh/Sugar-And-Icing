"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Image as ImageIcon, Video, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface FullReview {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    comment: string;
    images: string[] | null;
    video_urls: string[] | null;
    created_at: string;
    metadata?: Record<string, any>;
    profiles?: {
        first_name: string;
        last_name: string;
        username?: string | null;
    } | null;
}

interface ReviewsViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
}

export default function ReviewsViewerModal({
    isOpen,
    onClose,
    productId,
    productName
}: ReviewsViewerModalProps) {
    const supabase = createClient();
    const [reviews, setReviews] = useState<FullReview[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [preview, setPreview] = useState<{ type: 'image' | 'video'; url: string } | null>(null);
    const ITEMS_PER_PAGE = 5;

    // Filters
    const [selectedRatings, setSelectedRatings] = useState<number[]>([1, 2, 3, 4, 5]);
    const [mediaOnly, setMediaOnly] = useState(false);

    // Fetch reviews on mount
    useEffect(() => {
        if (isOpen) {
            fetchReviews();
        }
    }, [isOpen, productId]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase as any)
                .from('reviews')
                .select(`
                    id,
                    product_id,
                    user_id,
                    rating,
                    comment,
                    images,
                    video_urls,
                    created_at,
                    profiles:user_id (first_name, last_name, username)
                `)
                .eq('product_id', productId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Failed to fetch reviews:', error);
                setReviews([]);
                return;
            }

            // Parse reviews and extract unique metadata keys
            const allReviews = (data || []) as any[];
            setReviews(allReviews);

            // Metadata keys are pre-configured per product type, so no need to extract from reviews
            // since metadata isn't stored in reviews table
        } catch (e) {
            console.error('Error fetching reviews:', e);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter reviews based on active filters
    const filteredReviews = reviews.filter(review => {
        // Rating filter
        if (!selectedRatings.includes(review.rating)) return false;

        // Media filter
        if (mediaOnly && !((review.images && review.images.length > 0) || (review.video_urls && review.video_urls.length > 0))) {
            return false;
        }

        return true;
    });

    // Pagination
    const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
    const paginatedReviews = filteredReviews.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Average rating
    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const toggleRating = (rating: number) => {
        setSelectedRatings(prev =>
            prev.includes(rating)
                ? prev.filter(r => r !== rating)
                : [...prev, rating]
        );
        setCurrentPage(1);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[125] flex items-center justify-center p-4">
                    <motion.div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 10, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-6">
                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-serif font-bold text-sai-charcoal mb-2">
                                    {productName} Reviews
                                </h2>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-5 h-5 ${Number(averageRating) > i
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-lg font-semibold text-sai-charcoal">
                                            {averageRating}
                                        </span>
                                    </div>
                                    <span className="text-gray-600">
                                        {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-4">
                                {/* Rating Filter */}
                                <div>
                                    <h3 className="font-semibold text-sm text-sai-charcoal mb-2">Rating</h3>
                                    <div className="flex gap-2 flex-wrap">
                                        {[1, 2, 3, 4, 5].map(rating => (
                                            <button
                                                key={rating}
                                                onClick={() => toggleRating(rating)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                    selectedRatings.includes(rating)
                                                        ? 'bg-yellow-400 text-white'
                                                        : 'bg-white border border-gray-200 text-gray-600'
                                                }`}
                                            >
                                                {rating} ★
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Media Filter */}
                                <div>
                                    <button
                                        onClick={() => {
                                            setMediaOnly(!mediaOnly);
                                            setCurrentPage(1);
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                            mediaOnly
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white border border-gray-200 text-gray-600'
                                        }`}
                                    >
                                        <ImageIcon className="w-4 h-4" />
                                        With Media Only
                                    </button>
                                </div>
                            </div>

                            {/* Reviews List */}
                            {loading ? (
                                <div className="text-center py-8 text-gray-500">Loading reviews...</div>
                            ) : paginatedReviews.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    {reviews.length === 0 ? 'No reviews yet' : 'No reviews match your filters'}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {paginatedReviews.map(review => (
                                        <div key={review.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                            {/* Review Header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${i < review.rating
                                                                        ? 'fill-yellow-400 text-yellow-400'
                                                                        : 'text-gray-300'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm font-medium text-sai-charcoal">
                                                            {review.profiles?.username || review.profiles?.first_name || 'Anonymous'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Comment */}
                                            {review.comment && (
                                                <p className="text-sm text-gray-700 mb-3">{review.comment}</p>
                                            )}

                                            {/* Media */}
                                            {((review.images && review.images.length > 0) || (review.video_urls && review.video_urls.length > 0)) && (
                                                <div className="flex gap-2 flex-wrap">
                                                    {(review.images || []).map((img, idx) => (
                                                        <div
                                                            key={`img-${idx}`}
                                                            onClick={() => setPreview({ type: 'image', url: img })}
                                                            className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center"
                                                        >
                                                            <img src={img} alt="review" className="w-full h-full object-cover" />
                                                        </div>
                                                    ))}
                                                    {(review.video_urls || []).map((video, idx) => (
                                                        <div
                                                            key={`vid-${idx}`}
                                                            onClick={() => setPreview({ type: 'video', url: video })}
                                                            className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center"
                                                        >
                                                            <Video className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-3 mt-6">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-50 hover:bg-gray-50"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    <span className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </span>

                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-50 hover:bg-gray-50"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Fullscreen Preview */}
                    {preview && (
                        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                            <div
                                className="absolute inset-0 bg-black/80"
                                onClick={() => setPreview(null)}
                            />
                            <div className="relative z-[140] max-w-3xl w-full">
                                <button
                                    onClick={() => setPreview(null)}
                                    className="absolute top-4 right-4 z-50 p-2 text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                                {preview.type === 'image' ? (
                                    <img src={preview.url} className="w-full max-h-[80vh] object-contain mx-auto" />
                                ) : (
                                    <video src={preview.url} controls className="w-full max-h-[80vh] mx-auto" />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </AnimatePresence>
    );
}
