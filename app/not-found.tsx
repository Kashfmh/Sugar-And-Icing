export default function NotFound() {
    return (
        <main className="min-h-screen bg-sai-white flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                <h1 className="text-8xl font-serif font-bold text-sai-pink mb-4">404</h1>
                <h2 className="text-3xl font-serif text-sai-charcoal mb-4">Page Not Found</h2>
                <p className="text-lg text-sai-charcoal/70 mb-8">
                    Oops! The sweet treat you're looking for seems to have been eaten already.
                </p>
                <a
                    href="/"
                    className="inline-flex items-center gap-2 bg-sai-pink hover:bg-sai-pink/90 text-white font-bold px-8 py-3 rounded-lg shadow-medium transition-all"
                >
                    Back to Home
                </a>
            </div>
        </main>
    );
}
