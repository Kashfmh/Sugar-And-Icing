import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-sai-white pt-24">
            <div className="max-w-7xl mx-auto px-6 pb-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <Skeleton className="h-12 w-48 mb-2 bg-gray-200" />
                        <Skeleton className="h-4 w-full max-w-2xl bg-gray-100" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 border-b border-gray-200">
                <div className="flex gap-8">
                    <Skeleton className="h-4 w-24 bg-gray-200" />
                    <Skeleton className="h-4 w-24 bg-gray-200" />
                    <Skeleton className="h-4 w-24 bg-gray-200" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-3xl p-8 border border-gray-200">
                                <div className="flex items-start justify-between mb-6">
                                    <Skeleton className="h-5 w-32 bg-gray-200" />
                                    <Skeleton className="h-6 w-16 bg-gray-100 rounded-full" />
                                </div>
                                <Skeleton className="h-12 w-24 mb-2 bg-gray-200" />
                                <Skeleton className="h-3 w-32 mb-6 bg-gray-100" />
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-full bg-gray-100" />
                                    <Skeleton className="h-3 w-full bg-gray-100" />
                                    <Skeleton className="h-3 w-2/3 bg-gray-100" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-3xl p-8 border border-gray-200">
                                <div className="flex items-start justify-between mb-4">
                                    <Skeleton className="h-5 w-32 bg-gray-200" />
                                </div>
                                <div className="space-y-3">
                                    <Skeleton className="h-3 w-full bg-gray-100" />
                                    <Skeleton className="h-3 w-full bg-gray-100" />
                                    <Skeleton className="h-3 w-3/4 bg-gray-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
