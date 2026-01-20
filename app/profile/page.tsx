'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AddressManager from '@/app/components/AddressManager';
import OccasionsManager from '@/app/components/OccasionsManager';
import LoadingScreen from '@/app/components/LoadingScreen';
import ProfileSkeleton from '@/app/components/ProfileSkeleton';
import ToggleSwitch from '@/components/ui/toggle-switch';
import {
    validateSession,
    loadAllUserData,
    updateUserProfile,
    signOut,
    UserProfile,
    Address,
    SpecialOccasion,
} from '@/lib/services/authService';

type Tab = 'dashboard' | 'edit-profile' | 'settings';

interface FormData {
    first_name: string;
    last_name: string;
    phone: string;
    dob: string;
    preferred_contact_method: string;
    favorite_flavors: string[];
    dietary_restrictions: string[];
    notification_preferences: {
        order_updates: boolean;
        marketing: boolean;
        reminders: boolean;
    };
}

export default function ProfilePage() {
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Checking if logged in
    const [isLoadingData, setIsLoadingData] = useState(false); // Loading user data
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [occasions, setOccasions] = useState<SpecialOccasion[]>([]);
    const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

    const [formData, setFormData] = useState<FormData>({
        first_name: '',
        last_name: '',
        phone: '',
        dob: '',
        preferred_contact_method: 'whatsapp',
        favorite_flavors: [],
        dietary_restrictions: [],
        notification_preferences: {
            order_updates: true,
            marketing: false,
            reminders: true
        }
    });

    useEffect(() => {
        initializeProfile();
        loadRecentlyViewed();
    }, []);

    useEffect(() => {
        if (profile) {
            populateFormData(profile);
        }
    }, [profile]);

    async function initializeProfile() {
        try {
            // Step 1: Check authentication (show spinner)
            setIsCheckingAuth(true);
            const session = await validateSession();

            if (!session) {
                // Not logged in - redirect to login
                router.push('/login');
                return;
            }

            // Step 2: User is logged in - now load data (show skeleton)
            setIsCheckingAuth(false);
            setIsLoadingData(true);
            setUser(session.user);

            const [profileData, addressesData, occasionsData] = await loadAllUserData(session.user.id);

            setProfile(profileData);
            setAddresses(addressesData);
            setOccasions(occasionsData);
        } catch (error: any) {
            console.error('Profile initialization failed:', error);
            alert(`Failed to load profile: ${error.message || 'Please try again or contact support.'}`);
        } finally {
            setIsCheckingAuth(false);
            setIsLoadingData(false);
        }
    }

    function loadRecentlyViewed() {
        try {
            const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            setRecentlyViewed(viewed);
        } catch (error) {
            console.error('Recently viewed load error:', error);
        }
    }

    function populateFormData(profileData: UserProfile) {
        setFormData({
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            phone: profileData.phone || '',
            dob: profileData.dob || '',
            preferred_contact_method: profileData.preferred_contact_method || 'whatsapp',
            favorite_flavors: profileData.favorite_flavors || [],
            dietary_restrictions: profileData.dietary_restrictions || [],
            notification_preferences: profileData.notification_preferences || {
                order_updates: true,
                marketing: false,
                reminders: true
            }
        });
    }

    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault();
        setIsUpdating(true);

        try {
            await updateUserProfile(user.id, formData);

            const [updatedProfile, updatedAddresses, updatedOccasions] = await loadAllUserData(user.id);

            setProfile(updatedProfile);
            setAddresses(updatedAddresses);
            setOccasions(updatedOccasions);

            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Profile update failed:', error);
            alert('Failed to update profile.');
        } finally {
            setIsUpdating(false);
        }
    }

    async function handleSignOut() {
        try {
            await signOut();
            router.push('/login');
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    }

    // Show spinner while checking if user is logged in
    if (isCheckingAuth) {
        return <LoadingScreen />;
    }

    // Show skeleton while loading user data (user is logged in)
    if (isLoadingData) {
        return <ProfileSkeleton />;
    }

    // If no user after auth check, shouldn't reach here (redirected to login)
    if (!user) {
        return <LoadingScreen />;
    }

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
                    <div className="hidden lg:block w-80 h-56 bg-contain bg-right bg-no-repeat" style={{ backgroundImage: "url('/cupcake-illustration.png')" }}></div>
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
                    <div className="space-y-6">
                        {/* Top Row: History, Stats, Quick Actions */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Order History Card */}
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
                            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col justify-between">
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
                            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col justify-between">
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
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100 relative overflow-hidden">
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
                            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl p-8 border border-orange-100">
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
                            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
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
                    </div >

                )
                }

                {activeTab === 'edit-profile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Personal Details Section */}
                        <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-200 lg:col-span-2">
                            <h2 className="text-2xl font-bold text-sai-charcoal mb-6">Personal Details</h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                        <input
                                            type="text"
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sai-pink focus:ring-2 focus:ring-sai-pink/20 transition-all outline-none"
                                            placeholder="Enter first name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sai-pink focus:ring-2 focus:ring-sai-pink/20 transition-all outline-none"
                                            placeholder="Enter last name"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sai-pink focus:ring-2 focus:ring-sai-pink/20 transition-all outline-none"
                                            placeholder="+60 12-345 6789"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={formData.dob}
                                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sai-pink focus:ring-2 focus:ring-sai-pink/20 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact Method</label>
                                    <div className="flex gap-4">
                                        {['whatsapp', 'email', 'phone'].map((method) => (
                                            <label key={method} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="contact_method"
                                                    value={method}
                                                    checked={formData.preferred_contact_method === method}
                                                    onChange={(e) => setFormData({ ...formData, preferred_contact_method: e.target.value })}
                                                    className="text-sai-pink focus:ring-sai-pink"
                                                />
                                                <span className="capitalize text-gray-700">{method}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="w-full md:w-auto px-8 py-3 bg-sai-charcoal text-white rounded-xl font-medium hover:bg-sai-charcoal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isUpdating ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Personal Details'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Address Book Section */}
                        <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-200 flex flex-col">
                            <AddressManager addresses={addresses} onUpdate={initializeProfile} userId={user?.id} />
                        </div>

                        {/* Special Occasions Section */}
                        <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-200 flex flex-col">
                            <OccasionsManager occasions={occasions} onUpdate={initializeProfile} userId={user?.id} />
                        </div>

                        {/* Preferences Section */}
                        <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-200 lg:col-span-2">
                            <h2 className="text-2xl font-bold text-sai-charcoal mb-6">Sweet Preferences</h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Favorite Flavors</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['Chocolate', 'Vanilla', 'Red Velvet', 'Matcha', 'Salted Caramel', 'Fruity', 'Coffee', 'Cheese'].map((flavor) => (
                                            <label key={flavor} className={`px-4 py-2 rounded-full border cursor-pointer transition-all ${formData.favorite_flavors.includes(flavor)
                                                ? 'bg-sai-pink text-white border-sai-pink'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-sai-pink/50'
                                                }`}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={formData.favorite_flavors.includes(flavor)}
                                                    onChange={(e) => {
                                                        const newFlavors = e.target.checked
                                                            ? [...formData.favorite_flavors, flavor]
                                                            : formData.favorite_flavors.filter(f => f !== flavor);
                                                        setFormData({ ...formData, favorite_flavors: newFlavors });
                                                    }}
                                                />
                                                {flavor}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Dietary Restrictions</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['Nut-Free', 'Gluten-Free', 'Egg-Free', 'Vegan', 'Halal', 'Less Sugar'].map((diet) => (
                                            <label key={diet} className={`px-4 py-2 rounded-full border cursor-pointer transition-all ${formData.dietary_restrictions.includes(diet)
                                                ? 'bg-orange-500 text-white border-orange-500'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-500/50'
                                                }`}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={formData.dietary_restrictions.includes(diet)}
                                                    onChange={(e) => {
                                                        const newDiet = e.target.checked
                                                            ? [...formData.dietary_restrictions, diet]
                                                            : formData.dietary_restrictions.filter(d => d !== diet);
                                                        setFormData({ ...formData, dietary_restrictions: newDiet });
                                                    }}
                                                />
                                                {diet}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="w-full md:w-auto px-8 py-3 bg-sai-charcoal text-white rounded-xl font-medium hover:bg-sai-charcoal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isUpdating ? 'Saving...' : 'Save Preferences'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
                }
                {activeTab === 'settings' && (
                    <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-200">
                        <h2 className="text-2xl font-bold text-sai-charcoal mb-6">Settings</h2>

                        <div className="space-y-8">
                            {/* Notifications Section */}
                            <div className="p-6 bg-pink-50/50 rounded-2xl border border-pink-100">
                                <h3 className="font-semibold text-sai-charcoal mb-4">Notification Preferences</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-700">Order Updates</p>
                                            <p className="text-sm text-gray-500">Get notified when your order status changes.</p>
                                        </div>
                                        <ToggleSwitch
                                            checked={formData.notification_preferences.order_updates}
                                            onChange={(checked) => {
                                                const newPrefs = { ...formData.notification_preferences, order_updates: checked };
                                                setFormData({ ...formData, notification_preferences: newPrefs });
                                            }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-700">Special Occasion Reminders</p>
                                            <p className="text-sm text-gray-500">Get reminders 1 week before your saved dates.</p>
                                        </div>
                                        <ToggleSwitch
                                            checked={formData.notification_preferences.reminders}
                                            onChange={(checked) => {
                                                const newPrefs = { ...formData.notification_preferences, reminders: checked };
                                                setFormData({ ...formData, notification_preferences: newPrefs });
                                            }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-700">Marketing & Promos</p>
                                            <p className="text-sm text-gray-500">Receive exclusive offers and new flavor alerts.</p>
                                        </div>
                                        <ToggleSwitch
                                            checked={formData.notification_preferences.marketing}
                                            onChange={(checked) => {
                                                const newPrefs = { ...formData.notification_preferences, marketing: checked };
                                                setFormData({ ...formData, notification_preferences: newPrefs });
                                            }}
                                        />
                                    </div>

                                    <button
                                        onClick={handleUpdateProfile} // Reuse the update function
                                        className="mt-4 px-4 py-2 bg-sai-charcoal text-white rounded-lg text-sm font-medium hover:bg-sai-charcoal/90"
                                    >
                                        Save Preferences
                                    </button>
                                </div>
                            </div>

                            {/* Account Security Section */}
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                                <h3 className="font-semibold text-sai-charcoal mb-4">Account Security</h3>
                                <div className="space-y-4">
                                    <button className="w-full md:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                        Change Password
                                    </button>
                                    <div className="pt-4 border-t border-gray-200">
                                        <button className="text-sm text-red-600 font-medium hover:underline">
                                            Delete Account
                                        </button>
                                        <p className="text-xs text-gray-500 mt-1">Permanently delete your account and all data.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </div >
    );
}
