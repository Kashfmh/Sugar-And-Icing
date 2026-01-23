interface AuthSuccessProps {
    email: string;
    onClose: () => void;
}

export default function AuthSuccess({ email, onClose }: AuthSuccessProps) {
    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                {/* Success Icon */}
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-sai-charcoal mb-3">
                    Check Your Email! 📬
                </h2>

                {/* Message */}
                <p className="text-gray-600 mb-2">
                    We've sent a confirmation link to:
                </p>
                <p className="font-semibold text-sai-pink mb-6">
                    {email}
                </p>

                {/* Instructions */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                    <p className="text-sm text-gray-700 mb-2">
                        <span className="font-semibold">Next steps:</span>
                    </p>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                        <li>Open the email from Supabase Auth</li>
                        <li>Click the confirmation link</li>
                        <li>Return here and sign in</li>
                    </ol>
                </div>

                {/* Button */}
                <button
                    onClick={onClose}
                    className="w-full bg-sai-pink text-white py-3 rounded-lg font-semibold hover:bg-sai-pink/90 transition-colors"
                >
                    Got it, take me to Sign In
                </button>

                {/* Footer Note */}
                <p className="text-xs text-gray-500 mt-4">
                    Didn't receive the email? Check your spam folder
                </p>
            </div>
        </div>
    );
}
