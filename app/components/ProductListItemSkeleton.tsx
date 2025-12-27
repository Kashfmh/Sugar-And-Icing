export default function ProductListItemSkeleton() {
    return (
        <article className="flex gap-4 bg-white rounded-lg overflow-hidden shadow-sm border-l-4 animate-pulse" style={{ borderLeftColor: 'var(--color-sai-pink)' }}>
            {/* Image Skeleton - Full Height */}
            <div className="w-24 flex-shrink-0 bg-gray-200" />

            {/* Content Skeleton */}
            <div className="flex-1 py-3 pr-3">
                {/* Category */}
                <div className="h-3 bg-gray-300 rounded w-20 mb-2" />

                {/* Title */}
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />

                {/* Description */}
                <div className="h-3 bg-gray-300 rounded w-full mb-3" />

                {/* Price and Button */}
                <div className="flex items-center justify-between">
                    <div className="h-6 bg-gray-300 rounded w-20" />
                    <div className="h-7 bg-gray-300 rounded-full w-16" />
                </div>
            </div>
        </article>
    );
}
