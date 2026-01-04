import { Skeleton } from "@/components/ui/skeleton"

export function ProductSkeleton() {
    return (
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            {/* Image Skeleton */}
            <div className="w-full md:w-1/2">
                <div className="aspect-square relative rounded-2xl overflow-hidden bg-gray-100">
                    <Skeleton className="w-full h-full" />
                </div>
            </div>

            {/* Details Skeleton */}
            <div className="w-full md:w-1/2 space-y-6">
                <div>
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-6 w-1/4 rounded-full" />
                </div>

                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <Skeleton className="h-6 w-1/3 mb-4" />

                    {/* Options Placeholders */}
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                </div>

                {/* Action Button Skeleton */}
                <div className="pt-4">
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
            </div>
        </div>
    )
}
