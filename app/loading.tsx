import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <main className="min-h-screen overflow-hidden relative">
            {/* Background Skeleton */}
            <div className="absolute inset-0 bg-gray-50" />

            {/* Hero Section Skeleton - Right Aligned */}
            <section className="relative min-h-screen flex items-center justify-end px-6 md:px-16 pt-24 md:pt-32">
                <div className="relative z-10 w-full max-w-2xl flex flex-col items-end">

                    {/* Draggable Text / Heading Skeleton */}
                    <div className="w-full h-[600px] hidden md:block relative">
                        <div className="absolute right-0 top-1/4 w-3/4 h-32">
                            <Skeleton className="w-full h-full bg-gray-200" />
                        </div>
                        <div className="absolute right-20 top-1/2 w-1/2 h-32">
                            <Skeleton className="w-full h-full bg-gray-200" />
                        </div>
                    </div>

                    {/* Mobile Text Skeleton */}
                    <div className="block md:hidden w-full text-right mb-8">
                        <Skeleton className="h-12 w-3/4 ml-auto mb-4 bg-gray-200" />
                        <Skeleton className="h-10 w-1/2 ml-auto bg-gray-200" />
                    </div>

                    {/* Tagline Skeleton */}
                    <Skeleton className="h-4 w-64 bg-gray-200" />
                </div>

                {/* Social Icons Skeleton */}
                <div className="absolute bottom-8 left-8 flex flex-col gap-4 hidden md:flex">
                    <Skeleton className="h-8 w-40 rounded-lg bg-gray-200" />
                    <div className="flex gap-5">
                        <Skeleton className="w-8 h-8 rounded-full bg-gray-200" />
                        <Skeleton className="w-8 h-8 rounded-full bg-gray-200" />
                        <Skeleton className="w-8 h-8 rounded-full bg-gray-200" />
                    </div>
                </div>
            </section>
        </main>
    );
}
