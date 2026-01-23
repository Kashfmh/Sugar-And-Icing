export default function CartSkeleton() {
    return (
        <main className="min-h-screen bg-gray-50 py-8 md:pt-28 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse mb-8" />
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <ul className="divide-y divide-gray-100">
                                {[1, 2, 3].map((i) => (
                                    <li key={i} className="p-6 flex flex-col sm:flex-row gap-6">
                                        {/* Image Skeleton */}
                                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />

                                        <div className="flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-full">
                                                    {/* Title Skeleton */}
                                                    <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
                                                    {/* Description Skeleton */}
                                                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-3" />

                                                    {/* Metadata Skeletons */}
                                                    <div className="space-y-1">
                                                        <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse" />
                                                        <div className="h-3 w-1/4 bg-gray-200 rounded animate-pulse" />
                                                    </div>
                                                </div>
                                                {/* Price Skeleton */}
                                                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse ml-4" />
                                            </div>

                                            <div className="mt-auto pt-4 flex items-center justify-between">
                                                {/* Quantity Controls Skeleton */}
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-8 bg-gray-200 rounded-lg animate-pulse" />
                                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                                </div>
                                                {/* Remove Button Skeleton */}
                                                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {/* Summary Skeleton */}
                    <div className="lg:col-span-4 mt-8 lg:mt-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 animate-pulse">
                            <div className="h-6 w-1/2 bg-gray-200 rounded" />
                            <div className="space-y-3">
                                <div className="flex justify-between"><div className="h-4 w-1/3 bg-gray-200 rounded" /><div className="h-4 w-1/4 bg-gray-200 rounded" /></div>
                                <div className="flex justify-between"><div className="h-4 w-1/3 bg-gray-200 rounded" /><div className="h-4 w-1/4 bg-gray-200 rounded" /></div>
                                <div className="flex justify-between"><div className="h-4 w-1/3 bg-gray-200 rounded" /><div className="h-4 w-1/4 bg-gray-200 rounded" /></div>
                            </div>
                            <div className="h-px bg-gray-200 w-full" />
                            <div className="flex justify-between items-end"><div className="h-6 w-1/3 bg-gray-200 rounded" /><div className="h-8 w-1/3 bg-gray-200 rounded" /></div>
                            <div className="h-12 w-full bg-gray-200 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
