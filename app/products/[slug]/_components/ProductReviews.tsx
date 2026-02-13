'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface FullReview extends Review {
    is_anonymous?: boolean;
    images?: string[];
}

import { Review } from '@/hooks/useProductDetails';
import ReviewsViewerModal from '@/app/components/ReviewsViewerModal';

interface ProductReviewsProps {
    reviews: FullReview[];
    product?: {
        id: string;
        name: string;
        product_type?: string;
    };
}

export default function ProductReviews({ reviews, product }: ProductReviewsProps) {
    const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    if (reviews.length === 0) return null;

    // Calculate average rating
    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <>
            <div className="border-t border-gray-200 pt-6">
                {/* Clickable review header */}
                <button
                    onClick={() => setIsReviewsModalOpen(true)}
                    className="w-full text-left hover:opacity-80 transition-opacity"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Customer Reviews</h3>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${Number(averageRating) > i
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-semibold text-sai-charcoal ml-1">
                                    {averageRating}
                                </span>
                            </div>
                            <span className="text-xs text-gray-500">
                                ({reviews.length} reviews)
                            </span>
                        </div>
                    </div>
                </button>

                {/* Preview of first few reviews (max 3) */}
                <div className="space-y-3">
                    {reviews.slice(0, 3).map((review) => {
                        const isExpanded = !!expanded[review.id];
                        const shouldTruncate = (review.comment || '').length > 60;
                        const previewText = shouldTruncate && !isExpanded ? (review.comment || '').slice(0, 60).trim() : (review.comment || '');
                        return (
                            <div key={review.id} className="bg-gray-50 rounded-lg p-3 overflow-hidden">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3 h-3 ${i < review.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium">
                                        {review.is_anonymous ? 'Anonymous' : (review.profiles?.username || review.profiles?.first_name || 'Anonymous')}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap break-words break-all">
                                    {previewText}
                                    {shouldTruncate && !isExpanded && '... '}
                                    {shouldTruncate && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setExpanded(prev => ({ ...prev, [review.id]: !prev[review.id] })); }}
                                            className="ml-1 text-sai-pink text-sm font-medium hover:underline"
                                        >
                                            {isExpanded ? 'less' : 'more'}
                                        </button>
                                    )}
                                </p>
                                {/* Review Images */}
                                {review.images && review.images.length > 0 && (
                                    <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                                        {review.images.map((img, idx) => (
                                            <div key={idx} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                                                <img src={img} alt="Review" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* View all button */}
                {reviews.length > 3 && (
                    <button
                        onClick={() => setIsReviewsModalOpen(true)}
                        className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sai-pink hover:underline"
                    >
                        View more
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Reviews Viewer Modal */}
            {product && (
                <ReviewsViewerModal
                    isOpen={isReviewsModalOpen}
                    onClose={() => setIsReviewsModalOpen(false)}
                    productId={product.id}
                    productName={product.name}
                />
            )}
        </>
    );
}
