'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getCurrentUser, signOut, getUserProfile } from '@/lib/auth';
import type { AuthUser, UserProfile } from '@/lib/auth';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { User, Mail, LogOut, ArrowLeft, Phone } from 'lucide-react';

interface UserData {
    id: string;
    email: string;
    created_at: string;
}

interface ProfileData {
    first_name: string;
    phone: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        try {
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                router.push('/login');
                return;
            }
            setUser(currentUser);

            // Fetch profile data
            const userProfile = await getUserProfile(currentUser.id);
            if (userProfile) {
                setProfile({
                    first_name: userProfile.first_name,
                    phone: userProfile.phone,
                });
            }
        } catch (error) {
            console.error('Error checking user:', error);
            router.push('/auth');
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        try {
            await signOut();
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-sai-white flex items-center justify-center">
                <div className="text-sai-charcoal">Loading...</div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-sai-white flex items-center justify-center">
                <div className="text-sai-charcoal">Redirecting...</div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-sai-white">
            {/* Brand Logo - Top Left */}
            {/* Mobile Header - Consistent with other pages */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-sai-charcoal"
                    >
                        <ChevronLeft size={24} />
                        <span className="font-semibold text-lg">Profile</span>
                    </button>
                    <Image
                        src="/images/logo/full-logo-pink.png"
                        alt="Sugar And Icing"
                        width={50}
                        height={50}
                        className="object-contain"
                    />
                </div>
            </header>

            {/* Profile Content */}
            <div className="pt-16 md:pt-24 pb-24 md:pb-12 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Profile Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sai-pink to-sai-pink-dark flex items-center justify-center">
                                <span className="text-3xl font-bold text-white">
                                    {profile?.first_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-sai-charcoal mb-1">
                                    {profile?.first_name || 'Welcome'}
                                </h1>
                                <p className="text-gray-500">Member since {new Date(user.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="space-y-4">
                            <div className="border-t pt-4">
                                <p className="text-sm text-gray-500 mb-1">Email</p>
                                <p className="font-medium text-sai-charcoal">{user.email}</p>
                            </div>
                            {profile?.phone && (
                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                                    <p className="font-medium text-sai-charcoal">{profile.phone}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h2 className="text-lg font-bold text-sai-charcoal mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                                <span className="font-medium text-sai-charcoal">Order History</span>
                                <span className="block text-sm text-gray-500 mt-1">Coming soon</span>
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                                <span className="font-medium text-sai-charcoal">Saved Addresses</span>
                                <span className="block text-sm text-gray-500 mt-1">Coming soon</span>
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                                <span className="font-medium text-sai-charcoal">Favorite Cakes</span>
                                <span className="block text-sm text-gray-500 mt-1">Coming soon</span>
                            </button>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full bg-sai-pink hover:bg-sai-pink-dark text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-sm"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </main>
    );
}
