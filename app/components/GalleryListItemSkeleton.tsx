export default function GalleryListItemSkeleton() {
    return (
        <div className="flex gap-3 bg-sai-white rounded-xl overflow-hidden shadow-sm border border-gray-200 animate-pulse p-3">
            {/* Image Skeleton */}
            <div className="w-24 h-24 rounded-lg bg-gray-200 flex-shrink-0" />

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between py-1">
                {/* Title */}
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />

                {/* Description lines */}
                <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>

                {/* Button */}
                <div className="h-8 bg-gray-200 rounded-lg w-28 mt-2" />
            </div>
        </div>
    );
}
