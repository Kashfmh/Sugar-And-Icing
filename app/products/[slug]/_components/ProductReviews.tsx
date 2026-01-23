import { Star } from 'lucide-react';
import { Review } from '@/hooks/useProductDetails';

interface ProductReviewsProps {
    reviews: Review[];
}

export default function ProductReviews({ reviews }: ProductReviewsProps) {
    if (reviews.length === 0) return null;

    return (
        <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-lg mb-3">Customer Reviews</h3>
            <div className="space-y-3">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-lg p-3">
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
                                {review.profiles?.first_name || 'Anonymous'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
