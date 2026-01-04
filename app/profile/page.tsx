'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

type Tab = 'dashboard' | 'edit-profile' | 'settings';

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push('/login');
                return;
            }

            setUser(session.user);

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            setProfile(profileData);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.push('/login');
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-sai-white pt-24">
                {/* Hero Skeleton */}
                <div className="max-w-7xl mx-auto px-6 pb-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-4">
                            <Skeleton className="h-14 w-64 md:w-96 rounded-lg" />
                            <Skeleton className="h-6 w-48 rounded-md" />
                            <Skeleton className="h-16 w-full max-w-2xl rounded-lg mt-4" />

                            <div className="flex gap-3 mt-4">
                                <Skeleton className="h-8 w-24 rounded-full" />
                                <Skeleton className="h-8 w-24 rounded-full" />
                            </div>
                        </div>
                        <div className="hidden lg:block">
                            <Skeleton className="w-80 h-56 rounded-2xl" />
                        </div>
                    </div>
                </div>

                {/* Tabs Skeleton */}
                <div className="max-w-7xl mx-auto px-6 border-b border-gray-200">
                    <div className="flex gap-8 pb-4">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                </div>

                {/* Content Grid Skeleton */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <div className="rounded-3xl p-8 border border-gray-100 bg-white">
                            <div className="flex justify-between mb-6">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                            <div className="mb-6 space-y-2">
                                <Skeleton className="h-12 w-16" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-32 w-full rounded-xl" />
                        </div>

                        {/* Card 2 */}
                        <div className="rounded-3xl p-8 border border-gray-100 bg-white">
                            <div className="flex justify-between mb-6">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                            <div className="mb-6 space-y-2">
                                <Skeleton className="h-12 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                            <Skeleton className="h-12 w-full mt-6 rounded-xl" />
                        </div>

                        {/* Card 3 */}
                        <div className="rounded-3xl p-8 border border-gray-100 bg-white">
                            <div className="flex justify-between mb-6">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                            <div className="mb-6 space-y-2">
                                <Skeleton className="h-12 w-16" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="space-y-3">
                                <Skeleton className="h-20 w-full rounded-xl" />
                                <Skeleton className="h-20 w-full rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Use first_name from user metadata (Supabase auth), then profile table, then email fallback
    const firstName = user?.user_metadata?.first_name || profile?.first_name || user?.email?.split('@')[0] || 'Guest';

    return (
        <div className="min-h-screen bg-sai-white pt-24">
            {/* Hero Section */}
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
                    <div className="hidden lg:block w-80 h-56 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl"></div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-6 border-b border-gray-200">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`pb-4 font-medium transition-colors relative ${activeTab === 'dashboard' ? 'text-sai-charcoal' : 'text-gray-500'
                            }`}
                    >
                        Dashboard
                        {activeTab === 'dashboard' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sai-charcoal"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('edit-profile')}
                        className={`pb-4 font-medium transition-colors relative ${activeTab === 'edit-profile' ? 'text-sai-charcoal' : 'text-gray-500'
                            }`}
                    >
                        Edit Profile
                        {activeTab === 'edit-profile' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sai-charcoal"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`pb-4 font-medium transition-colors relative ${activeTab === 'settings' ? 'text-sai-charcoal' : 'text-gray-500'
                            }`}
                    >
                        Settings
                        {activeTab === 'settings' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sai-charcoal"></div>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Order History Card - Large */}
                        <div className="bg-pink-50 rounded-3xl p-8 relative border border-pink-100">
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

                            {/* Placeholder for chart/visualization */}
                            <div className="h-32 mb-6 relative">
                                <div className="absolute bottom-0 left-0 right-0 flex items-end gap-1">
                                    {[...Array(20)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex-1 bg-sai-pink/30 rounded-t"
                                            style={{ height: `${Math.random() * 100}%` }}
                                        ></div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-pink-200">
                                <span className="text-sm text-sai-charcoal/70">⟳ View all orders</span>
                                <svg className="w-4 h-4 text-sai-charcoal/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Account Stats Card */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
                            <div className="flex items-start justify-between mb-6">
                                <h3 className="text-lg font-semibold text-sai-charcoal">Account Stats</h3>
                                <span className="px-3 py-1 bg-gray-100 text-xs font-medium text-sai-charcoal rounded-full">
                                    Overview
                                </span>
                            </div>

                            <div className="mb-6">
                                <div className="text-5xl font-bold text-sai-pink mb-2">
                                    {new Date(user?.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </div>
                                <div className="text-sm text-sai-charcoal/60">member since</div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-sm text-sai-charcoal/60">Email Verified</span>
                                    <span className="font-semibold text-sai-pink">✓</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-sm text-sai-charcoal/60">Phone</span>
                                    <span className="font-semibold text-sai-charcoal">{profile?.phone || 'Not set'}</span>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-sai-charcoal text-white rounded-xl font-medium hover:bg-sai-charcoal/90 transition-colors flex items-center justify-center gap-2">
                                View Profile
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>

                        {/* Quick Actions Card */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
                            <div className="flex items-start justify-between mb-6">
                                <h3 className="text-lg font-semibold text-sai-charcoal">Quick Actions</h3>
                                <span className="px-3 py-1 bg-gray-100 text-xs font-medium text-sai-charcoal rounded-full">
                                    Shortcuts
                                </span>
                            </div>

                            <div className="mb-6">
                                <div className="text-5xl font-bold text-sai-pink mb-2">⚡</div>
                                <div className="text-sm text-sai-charcoal/60">get started quickly</div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push('/custom-cakes')}
                                    className="w-full p-4 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors text-left border border-pink-100"
                                >
                                    <div className="font-medium text-sai-charcoal">Order Custom Cake 🎂</div>
                                    <div className="text-xs text-sai-charcoal/60 mt-1">Create your dream cake</div>
                                </button>
                                <button
                                    onClick={() => router.push('/other-treats')}
                                    className="w-full p-4 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors text-left border border-pink-100"
                                >
                                    <div className="font-medium text-sai-charcoal">Browse Treats 🧁</div>
                                    <div className="text-xs text-sai-charcoal/60 mt-1">Explore our collection</div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'edit-profile' && (
                    <div className="bg-white rounded-3xl shadow-sm p-8 max-w-3xl border border-gray-200">
                        <h2 className="text-2xl font-bold text-sai-charcoal mb-6">Edit Profile</h2>
                        <div className="text-gray-500 text-center py-12">
                            <p className="text-lg mb-2">👷 Under Construction</p>
                            <p>Profile editing coming soon!</p>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="bg-white rounded-3xl shadow-sm p-8 max-w-3xl border border-gray-200">
                        <h2 className="text-2xl font-bold text-sai-charcoal mb-6">Settings</h2>
                        <div className="text-gray-500 text-center py-12">
                            <p className="text-lg mb-2">⚙️ Under Construction</p>
                            <p>Settings panel coming soon!</p>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
