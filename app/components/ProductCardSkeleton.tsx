export default function ProductCardSkeleton() {
    return (
        <article
            className="rounded-lg overflow-hidden bg-white flex flex-col shadow-sm animate-pulse"
            style={{ borderTop: `4px solid #F48FB1` }}
        >
            {/* Image Skeleton */}
            <div className="h-48 bg-gray-200" />

            {/* Content Skeleton */}
            <div className="p-6 flex-grow" style={{ backgroundColor: '#fce4ec' }}>
                {/* Category */}
                <div className="h-3 bg-gray-300 rounded w-24 mb-3" />

                {/* Title */}
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-3" />

                {/* Description lines */}
                <div className="h-4 bg-gray-300 rounded w-full mb-2" />
                <div className="h-4 bg-gray-300 rounded w-5/6 mb-4" />

                {/* Price and Button */}
                <div className="flex items-center justify-between mt-4">
                    <div className="h-8 bg-gray-300 rounded w-24" />
                    <div className="h-10 bg-gray-300 rounded-full w-32" />
                </div>
            </div>
        </article>
    );
}
