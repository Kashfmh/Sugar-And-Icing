export default function LoadingScreen() {
    return (
        <>
            <div className="fixed inset-0 bg-sai-white z-[999999] flex flex-col items-center justify-center pointer-events-auto">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-sai-pink rounded-full animate-spin mb-4" />
                <p className="text-sai-charcoal font-medium">Loading...</p>
            </div>
        </>
    );
}
