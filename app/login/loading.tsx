import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[20px] shadow-2xl relative overflow-hidden w-full max-w-[768px] min-h-[480px] flex">

                {/* Form Skeleton */}
                <div className="w-full md:w-1/2 p-12 flex flex-col items-center justify-center">
                    <Skeleton className="h-8 w-48 mb-2 bg-gray-200" />
                    <Skeleton className="h-4 w-32 mb-8 bg-gray-200" />

                    <div className="w-full space-y-4">
                        <Skeleton className="h-10 w-full bg-gray-100" />
                        <Skeleton className="h-10 w-full bg-gray-100" />
                        <Skeleton className="h-12 w-full rounded-full mt-4 bg-pink-100" />
                    </div>
                </div>

                {/* Overlay/Image Skeleton (Hidden on small screens) */}
                <div className="hidden md:block w-1/2 bg-gradient-to-br from-pink-400 to-pink-600 p-12 flex flex-col items-center justify-center text-white">
                    <Skeleton className="h-10 w-48 mb-4 bg-white/20" />
                    <Skeleton className="h-16 w-3/__ bg-white/20 rounded-lg" />
                </div>
            </div>
        </div>
    );
}
