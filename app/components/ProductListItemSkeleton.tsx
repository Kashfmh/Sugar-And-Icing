import { Skeleton } from "@/components/ui/skeleton";

export default function ProductListItemSkeleton() {
    return (
        <article className="flex gap-4 bg-white rounded-lg overflow-hidden shadow-sm border-l-4" style={{ borderLeftColor: 'var(--color-sai-pink)' }}>
            {/* Image Skeleton - Full Height */}
            <Skeleton className="w-24 h-auto rounded-none bg-gray-200" />

            {/* Content Skeleton */}
            <div className="flex-1 py-3 pr-3">
                {/* Category */}
                <Skeleton className="h-3 w-20 mb-2 bg-gray-300" />

                {/* Title */}
                <Skeleton className="h-4 w-3/4 mb-2 bg-gray-300" />

                {/* Description */}
                <Skeleton className="h-3 w-full mb-3 bg-gray-300" />

                {/* Price and Button */}
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-20 bg-gray-300" />
                    <Skeleton className="h-7 w-16 rounded-full bg-gray-300" />
                </div>
            </div>
        </article>
    );
}
