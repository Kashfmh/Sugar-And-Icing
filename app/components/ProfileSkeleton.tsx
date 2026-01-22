export default function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-sai-white pt-24 pb-20 lg:pb-12 animate-pulse">
            {/* Hero Skeleton */}
            <div className="max-w-7xl mx-auto px-6 pb-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        {/* Title */}
                        <div className="h-10 lg:h-12 w-48 lg:w-64 bg-gray-200 rounded-lg mb-2"></div>
                        {/* Subtitle */}
                        <div className="h-5 lg:h-6 w-40 lg:w-48 bg-gray-200 rounded-lg mb-4"></div>
                        {/* Description - hidden on mobile */}
                        <div className="hidden lg:block">
                            <div className="h-4 w-full max-w-2xl bg-gray-100 rounded mb-2"></div>
                            <div className="h-4 w-3/4 max-w-xl bg-gray-100 rounded mb-4"></div>
                        </div>
                        {/* Badges */}
                        <div className="flex gap-2 lg:gap-3">
                            <div className="h-8 w-20 bg-pink-100 rounded-full border border-pink-200"></div>
                            <div className="h-8 w-20 bg-gray-100 rounded-full border border-gray-200"></div>
                        </div>
                    </div>
                    {/* Decorative placeholder - desktop only */}
                    <div className="hidden lg:block w-80 h-56 bg-gray-100 rounded-2xl"></div>
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="max-w-7xl mx-auto px-6 border-b border-gray-200">
                <div className="flex gap-6 lg:gap-8">
                    <div className="h-5 lg:h-6 w-20 lg:w-24 bg-gray-200 rounded pb-4"></div>
                    <div className="h-5 lg:h-6 w-20 lg:w-24 bg-gray-100 rounded pb-4"></div>
                    <div className="h-5 lg:h-6 w-16 lg:w-20 bg-gray-100 rounded pb-4"></div>
                </div>
            </div>

            {/* Dashboard Content Skeleton */}
            <div className="max-w-7xl mx-auto px-6 py-6 lg:py-8">
                <div className="space-y-4 lg:space-y-6">
                    {/* Top Row: User Stats & Quick Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                        {/* Card 1 - Order History - More compact on mobile */}
                        <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-gray-200 shadow-sm">
                            <div className="flex items-start justify-between mb-4 lg:mb-6">
                                <div className="h-4 lg:h-5 w-24 lg:w-32 bg-gray-200 rounded"></div>
                                <div className="h-6 w-14 bg-pink-100 rounded-full"></div>
                            </div>
                            <div className="mb-4 lg:mb-6">
                                <div className="h-10 lg:h-14 w-12 lg:w-16 bg-gray-300 rounded mb-2"></div>
                                <div className="h-3 lg:h-4 w-20 lg:w-24 bg-gray-100 rounded"></div>
                            </div>
                            {/* Chart placeholder - smaller on mobile */}
                            <div className="h-20 lg:h-32 mb-4 lg:mb-6 bg-gray-50 rounded-lg"></div>
                            <div className="h-10 bg-gray-100 rounded-xl"></div>
                        </div>

                        {/* Card 2 - Account Stats */}
                        <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-gray-200 shadow-sm">
                            <div className="flex items-start justify-between mb-4 lg:mb-6">
                                <div className="h-4 lg:h-5 w-24 lg:w-32 bg-gray-200 rounded"></div>
                                <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
                            </div>
                            <div className="mb-4 lg:mb-6">
                                <div className="h-10 lg:h-14 w-20 lg:w-28 bg-pink-200 rounded mb-2"></div>
                                <div className="h-3 lg:h-4 w-20 lg:w-24 bg-gray-100 rounded"></div>
                            </div>
                            <div className="space-y-3 lg:space-y-4 mb-4 lg:mb-6">
                                <div className="h-3 lg:h-4 w-full bg-gray-100 rounded"></div>
                                <div className="h-3 lg:h-4 w-full bg-gray-100 rounded"></div>
                            </div>
                            <div className="h-10 lg:h-11 bg-gray-300 rounded-xl mt-auto"></div>
                        </div>

                        {/* Card 3 - Quick Actions */}
                        <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-gray-200 shadow-sm">
                            <div className="flex items-start justify-between mb-4 lg:mb-6">
                                <div className="h-4 lg:h-5 w-24 lg:w-28 bg-gray-200 rounded"></div>
                                <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
                            </div>
                            <div className="mb-4 lg:mb-6">
                                <div className="h-10 lg:h-14 w-12 lg:w-16 bg-pink-200 rounded mb-2"></div>
                                <div className="h-3 lg:h-4 w-28 lg:w-32 bg-gray-100 rounded"></div>
                            </div>
                            <div className="space-y-2 lg:space-y-3">
                                <div className="h-12 lg:h-14 bg-pink-50 rounded-xl border border-pink-100"></div>
                                <div className="h-12 lg:h-14 bg-pink-50 rounded-xl border border-pink-100"></div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Engagement Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                        {/* Card 4 - Cake Calendar */}
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-indigo-100">
                            <div className="flex items-start justify-between mb-3 lg:mb-4">
                                <div className="h-4 lg:h-5 w-32 lg:w-36 bg-indigo-200 rounded"></div>
                                <div className="h-6 w-16 bg-white/80 rounded-full"></div>
                            </div>
                            <div className="mb-4 lg:mb-6">
                                <div className="h-6 lg:h-8 w-3/4 bg-indigo-200 rounded mb-2"></div>
                                <div className="h-3 lg:h-4 w-full bg-indigo-100 rounded"></div>
                            </div>
                            <div className="h-10 lg:h-11 bg-indigo-600/20 rounded-xl"></div>
                        </div>

                        {/* Card 5 - Sweet Preferences */}
                        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-orange-100">
                            <div className="flex items-start justify-between mb-3 lg:mb-4">
                                <div className="h-4 lg:h-5 w-32 lg:w-40 bg-orange-200 rounded"></div>
                                <div className="h-4 w-10 bg-orange-300 rounded"></div>
                            </div>
                            <div className="space-y-3 lg:space-y-4">
                                <div>
                                    <div className="h-3 w-16 bg-orange-200/50 rounded mb-2"></div>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="h-6 w-16 bg-white rounded-md border border-orange-200"></div>
                                        <div className="h-6 w-16 bg-white rounded-md border border-orange-200"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="h-3 w-24 bg-orange-200/50 rounded mb-2"></div>
                                    <div className="h-4 w-full bg-orange-100 rounded"></div>
                                </div>
                            </div>
                        </div>

                        {/* Card 6 - Recently Viewed */}
                        <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-gray-200 shadow-sm">
                            <div className="h-4 lg:h-5 w-28 lg:w-32 bg-gray-200 rounded mb-4"></div>
                            <div className="space-y-3 lg:space-y-4">
                                <div className="flex gap-3 items-center">
                                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-lg flex-shrink-0"></div>
                                    <div className="flex-1">
                                        <div className="h-3 lg:h-4 w-3/4 bg-gray-200 rounded mb-1"></div>
                                        <div className="h-3 w-1/4 bg-gray-100 rounded"></div>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-lg flex-shrink-0"></div>
                                    <div className="flex-1">
                                        <div className="h-3 lg:h-4 w-3/4 bg-gray-200 rounded mb-1"></div>
                                        <div className="h-3 w-1/4 bg-gray-100 rounded"></div>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-lg flex-shrink-0"></div>
                                    <div className="flex-1">
                                        <div className="h-3 lg:h-4 w-3/4 bg-gray-200 rounded mb-1"></div>
                                        <div className="h-3 w-1/4 bg-gray-100 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}