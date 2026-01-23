import { UserProfile } from '@/lib/services/authService';

interface ProfileHeaderProps {
    user: any;
    profile: UserProfile | null;
}

export default function ProfileHeader({ user, profile }: ProfileHeaderProps) {
    const firstName = user?.user_metadata?.first_name || profile?.first_name || user?.email?.split('@')[0] || 'Guest';

    return (
        <div className="max-w-7xl mx-auto px-6 pb-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h1 className="text-5xl font-bold text-sai-charcoal mb-2">
                        Hey, {firstName}!
                    </h1>
                    <p className="text-xl text-sai-charcoal/80">
                        Here's your bakery dashboard.
                    </p>

                    <p className="mt-4 text-sai-charcoal/70 max-w-2xl">
                        Your account is active and all systems are running smoothly. Check out your order history and account stats below.
                    </p>

                    <div className="flex gap-3 mt-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 border border-pink-200 rounded-full">
                            <span className="text-sm font-medium text-sai-charcoal">Active</span>
                            <span className="text-sm font-semibold text-sai-pink">1</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full">
                            <span className="text-sm font-medium text-sai-charcoal">Verified</span>
                            <span className="text-sm font-semibold text-sai-charcoal">✓</span>
                        </div>
                    </div>
                </div>

                {/* Decorative illustration placeholder */}
                <div className="hidden lg:block w-80 h-56 bg-contain bg-right bg-no-repeat" style={{ backgroundImage: "url('/cupcake-illustration.png')" }}></div>
            </div>
        </div>
    );
}