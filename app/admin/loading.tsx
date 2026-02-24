export default function AdminLoading() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-6">
                <div>
                    <div className="h-8 w-64 bg-neutral-200 rounded-lg mb-2"></div>
                    <div className="h-4 w-40 bg-neutral-100 rounded-md"></div>
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-32 bg-neutral-200 rounded-lg"></div>
                    <div className="h-10 w-32 bg-neutral-200 rounded-lg"></div>
                </div>
            </div>

            {/* Filter / Top Cards Row Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                            <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                            <div className="h-8 w-8 bg-neutral-100 rounded-full"></div>
                        </div>
                        <div className="h-8 w-32 bg-neutral-200 rounded mt-4"></div>
                    </div>
                ))}
            </div>

            {/* Main Content Area (Table/Grid) Skeleton */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden p-6 mt-4">
                <div className="h-10 bg-neutral-100 rounded-lg mb-6 w-full max-w-md"></div>

                <div className="space-y-4">
                    {/* Table Header row */}
                    <div className="flex gap-4 border-b border-neutral-100 pb-4">
                        <div className="h-4 w-12 bg-neutral-200 rounded"></div>
                        <div className="h-4 w-1/4 bg-neutral-200 rounded"></div>
                        <div className="h-4 w-1/5 bg-neutral-200 rounded"></div>
                        <div className="h-4 w-1/6 bg-neutral-200 rounded"></div>
                        <div className="h-4 w-1/6 bg-neutral-200 rounded"></div>
                    </div>
                    {/* Table Rows */}
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-4 items-center py-3">
                            <div className="h-4 w-4 bg-neutral-200 rounded"></div>
                            <div className="flex items-center gap-3 w-1/4">
                                <div className="h-10 w-10 rounded-full bg-neutral-200 flex-shrink-0"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-full bg-neutral-200 rounded"></div>
                                    <div className="h-3 w-2/3 bg-neutral-100 rounded"></div>
                                </div>
                            </div>
                            <div className="h-4 w-1/5 bg-neutral-100 rounded"></div>
                            <div className="h-4 w-1/6 bg-neutral-100 rounded"></div>
                            <div className="h-8 w-1/6 bg-neutral-200 rounded-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
