import { Skeleton } from "@/components/ui/skeleton";

export default function ProductCardSkeleton() {
    return (
        <article
            className="rounded-lg overflow-hidden bg-white flex flex-col shadow-sm"
            style={{ borderTop: `4px solid var(--color-sai-pink)` }}
        >
            {/* Image Skeleton */}
            <Skeleton className="h-48 w-full rounded-none bg-gray-200" />

            {/* Content Skeleton */}
            <div className="p-6 flex-grow" style={{ backgroundColor: 'var(--color-sai-pink-light)' }}>
                {/* Category */}
                <Skeleton className="h-3 w-24 mb-3 bg-gray-300" />

                {/* Title */}
                <Skeleton className="h-6 w-3/4 mb-3 bg-gray-300" />

                {/* Description lines */}
                <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full bg-gray-300" />
                    <Skeleton className="h-4 w-5/6 bg-gray-300" />
                </div>

                {/* Price and Button */}
                <div className="flex items-center justify-between mt-4">
                    <Skeleton className="h-8 w-24 bg-gray-300" />
                    <Skeleton className="h-10 w-32 rounded-full bg-gray-300" />
                </div>
            </div>
        </article>
    );
}
