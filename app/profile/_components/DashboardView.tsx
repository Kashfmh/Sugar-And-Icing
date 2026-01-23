import { UserProfile, SpecialOccasion } from '@/lib/services/authService';

interface DashboardViewProps {
    user: any;
    profile: UserProfile | null;
    occasions: SpecialOccasion[];
    recentlyViewed: any[];
    router: any;
    setActiveTab: (tab: any) => void;
}

export default function DashboardView({ user, profile, occasions, recentlyViewed, router, setActiveTab }: DashboardViewProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Member Card */}
                <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-200 shadow-sm relative overflow-hidden group">
                    <div className="flex items-start justify-between mb-6">
                        <h3 className="text-lg font-semibold text-sai-charcoal">Order History</h3>
                        <span className="px-3 py-1 bg-white/80 backdrop-blur-sm text-xs font-medium text-sai-charcoal rounded-full border border-pink-200">
                            Active
                        </span>
                    </div>
                    <div className="mb-6">
                        <div className="text-5xl font-bold text-sai-charcoal mb-2">0</div>
                        <div className="text-sm text-sai-charcoal/60">total orders</div>
                    </div>
                    {/* Placeholder chart */}
                    <div className="h-32 mb-6 relative">
                        <div className="absolute bottom-0 left-0 right-0 flex items-end gap-1">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="flex-1 bg-sai-pink/30 rounded-t" style={{ height: `${Math.random() * 100}%` }}></div>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-pink-200 cursor-pointer hover:bg-white/80 transition-colors">
                        <span className="text-sm text-sai-charcoal/70">⟳ View all orders</span>
                    </div>
                </div>

                {/* Account Stats Card */}
                <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between mb-6">
                            <h3 className="text-lg font-semibold text-sai-charcoal">Account Stats</h3>
                            <span className="px-3 py-1 bg-gray-100 text-xs font-medium text-sai-charcoal rounded-full">Overview</span>
                        </div>
                        <div className="mb-6">
                            <div className="text-5xl font-bold text-sai-pink mb-2">
                                {new Date(user?.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </div>
                            <div className="text-sm text-sai-charcoal/60">member since</div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                <span className="text-sm text-sai-charcoal/60">Email Verified</span>
                                <span className="font-semibold text-sai-pink">✓</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                <span className="text-sm text-sai-charcoal/60">Phone</span>
                                <span className={`font-semibold ${profile?.phone ? 'text-sai-charcoal' : 'text-gray-400 italic'}`}>
                                    {profile?.phone || 'Not set'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-6 py-3 bg-sai-charcoal text-white rounded-xl font-medium hover:bg-sai-charcoal/90 transition-colors flex items-center justify-center gap-2">
                        View Profile
                    </button>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between mb-6">
                            <h3 className="text-lg font-semibold text-sai-charcoal">Quick Actions</h3>
                            <span className="px-3 py-1 bg-gray-100 text-xs font-medium text-sai-charcoal rounded-full">Shortcuts</span>
                        </div>
                        <div className="mb-6">
                            <div className="text-5xl font-bold text-sai-pink mb-2">⚡</div>
                            <div className="text-sm text-sai-charcoal/60">get started quickly</div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <button onClick={() => router.push('/custom-cakes')} className="w-full p-4 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors text-left border border-pink-100">
                            <div className="font-medium text-sai-charcoal">Order Custom Cake 🎂</div>
                        </button>
                        <button onClick={() => router.push('/other-treats')} className="w-full p-4 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors text-left border border-pink-100">
                            <div className="font-medium text-sai-charcoal">Browse Treats 🧁</div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Engagement Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* The Cake Calendar Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 lg:p-8 border border-indigo-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold text-sai-charcoal">The Cake Calendar 📅</h3>
                            {/* Logic for next occasion badge */}
                            {(() => {
                                const upcoming = occasions
                                    .filter(o => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const occDate = new Date(o.date);
                                        occDate.setFullYear(today.getFullYear());
                                        if (occDate < today) occDate.setFullYear(today.getFullYear() + 1);
                                        return true;
                                    })
                                    .sort((a, b) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const dateA = new Date(a.date);
                                        dateA.setFullYear(today.getFullYear());
                                        if (dateA < today) dateA.setFullYear(today.getFullYear() + 1);

                                        const dateB = new Date(b.date);
                                        dateB.setFullYear(today.getFullYear());
                                        if (dateB < today) dateB.setFullYear(today.getFullYear() + 1);

                                        return dateA.getTime() - dateB.getTime();
                                    })[0];

                                if (upcoming) {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const dateA = new Date(upcoming.date);
                                    dateA.setFullYear(today.getFullYear());
                                    if (dateA < today) dateA.setFullYear(today.getFullYear() + 1);
                                    const diffTime = Math.abs(dateA.getTime() - today.getTime());
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    return <span className="px-3 py-1 bg-white/80 text-xs font-bold text-indigo-600 rounded-full border border-indigo-200">In {diffDays} Days!</span>;
                                }
                                return <span className="px-3 py-1 bg-white/80 text-xs font-medium text-gray-500 rounded-full border border-gray-200">No events</span>;
                            })()}
                        </div>

                        {(() => {
                            const upcoming = occasions
                                .filter(o => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const occDate = new Date(o.date);
                                    occDate.setFullYear(today.getFullYear());
                                    if (occDate < today) occDate.setFullYear(today.getFullYear() + 1);
                                    return true;
                                })
                                .sort((a, b) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const dateA = new Date(a.date);
                                    dateA.setFullYear(today.getFullYear());
                                    if (dateA < today) dateA.setFullYear(today.getFullYear() + 1);

                                    const dateB = new Date(b.date);
                                    dateB.setFullYear(today.getFullYear());
                                    if (dateB < today) dateB.setFullYear(today.getFullYear() + 1);

                                    return dateA.getTime() - dateB.getTime();
                                })[0];

                            if (upcoming) {
                                return (
                                    <>
                                        <p className="text-2xl font-bold text-sai-charcoal mb-1">
                                            {upcoming.name}&apos;s {upcoming.type}
                                        </p>
                                        <p className="text-sm text-sai-charcoal/60 mb-6">
                                            Don&apos;t forget to order something sweet!
                                        </p>
                                        <button onClick={() => router.push('/products')} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                                            Order a Cake Now
                                        </button>
                                    </>
                                )
                            } else {
                                return (
                                    <>
                                        <p className="text-xl font-bold text-sai-charcoal mb-1">
                                            No upcoming occasions
                                        </p>
                                        <p className="text-sm text-sai-charcoal/60 mb-6">
                                            Add birthdays & anniversaries to get reminders!
                                        </p>
                                        <button onClick={() => setActiveTab('edit-profile')} className="w-full py-3 bg-white text-indigo-600 border border-indigo-200 rounded-xl font-medium hover:bg-indigo-50 transition-colors">
                                            Add an Occasion
                                        </button>
                                    </>
                                )
                            }
                        })()}
                    </div>
                </div>

                {/* Your Sweet Preferences Card */}
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl p-6 lg:p-8 border border-orange-100">
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-sai-charcoal">Sweet Preferences 🍬</h3>
                        <button onClick={() => setActiveTab('edit-profile')} className="text-xs font-medium text-orange-600 hover:text-orange-700 underline">
                            Edit
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dietary</p>
                            <div className="flex flex-wrap gap-2">
                                {profile?.dietary_restrictions && profile.dietary_restrictions.length > 0 ? (
                                    profile.dietary_restrictions.map((tag: string) => (
                                        <span key={tag} className="px-2 py-1 bg-white border border-orange-200 rounded-md text-xs font-medium text-orange-800">
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-400 italic">None set</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Favorite Flavors</p>
                            <p className="text-sm text-sai-charcoal leading-relaxed">
                                {profile?.favorite_flavors && profile.favorite_flavors.length > 0
                                    ? profile.favorite_flavors.join(', ')
                                    : <span className="text-gray-400 italic">No favorites yet... (we recommend Dark Chocolate!)</span>
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* History */}
                <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-sai-charcoal mb-4">Recently Viewed</h3>
                    {recentlyViewed.length > 0 ? (
                        <div className="space-y-4">
                            {recentlyViewed.slice(0, 3).map((item) => (
                                <div key={item.id} className="flex gap-3 items-center group cursor-pointer" onClick={() => router.push(`/products/${item.slug || item.id}`)}>
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Img</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-sai-charcoal truncate group-hover:text-sai-pink transition-colors">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-sai-charcoal/60">
                                            RM {item.price}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-400 text-sm">
                            No existing history
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}