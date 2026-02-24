interface SharedPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number | ((prev: number) => number)) => void;
}

export default function SharedPagination({
    currentPage,
    totalPages,
    onPageChange,
}: SharedPaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center flex-wrap gap-2 mt-8">
            <button
                onClick={() => onPageChange((p: number) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 min-w-[4rem] rounded border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600 border-gray-200"
            >
                Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`px-3 py-1.5 rounded border min-w-[2.5rem] text-sm font-medium transition-colors ${currentPage === p
                            ? 'bg-sai-pink text-white border-sai-pink shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    {p}
                </button>
            ))}
            <button
                onClick={() => onPageChange((p: number) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 min-w-[4rem] rounded border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600 border-gray-200"
            >
                Next
            </button>
        </div>
    );
}
