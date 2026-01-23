import { Star } from 'lucide-react';
import AllergenBadge from '@/app/components/AllergenBadge';

interface ProductInfoProps {
    product: any;
}

export default function ProductInfo({ product }: ProductInfoProps) {
    return (
        <div>
            <h1 className="text-3xl font-serif font-bold text-sai-charcoal mb-2">
                {product.name}
            </h1>

            {/* Stats */}
            <div className="bg-gradient-to-br from-sai-pink/5 to-sai-pink/10 rounded-xl p-4 border border-sai-pink/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-lg">{product.average_rating.toFixed(1)}</span>
                        <span className="text-gray-500 text-sm">({product.review_count})</span>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Sold</div>
                        <div className="font-bold text-lg text-sai-charcoal">{product.times_sold}</div>
                    </div>
                </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                    {product.tags.slice(0, 2).map((tag: string) => (
                        <AllergenBadge key={tag} tag={tag} />
                    ))}
                    {product.tags.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{product.tags.length - 2} more
                        </span>
                    )}
                </div>
            )}

            {/* Description */}
            <p className="text-sai-gray leading-relaxed mt-4">
                {product.description}
            </p>
        </div>
    );
}
