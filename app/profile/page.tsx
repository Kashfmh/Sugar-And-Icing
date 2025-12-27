'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut, getUserProfile } from '@/lib/auth';
import Image from 'next/image';
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
            <div className="absolute top-4 left-4 z-40 hidden md:block">
                <Image
                    src="/images/logo/full-logo-pink.png"
                    alt="Sugar And Icing"
                    width={80}
                    height={80}
                    className="object-contain"
                />
            </div>
            <div className="fixed top-4 right-4 z-50 block md:hidden">
                <Image
                    src="/images/logo/icon-pink.png"
                    alt="Sugar And Icing"
                    width={35}
                    height={35}
                    className="object-contain"
                />
            </div>

            {/* Mobile Header */}
            <header className="md:hidden sticky top-0 z-40 bg-sai-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-4">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-sai-charcoal">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="font-serif text-2xl text-sai-charcoal">
                        My Profile
                    </h1>
                </div>
            </header>

            {/* Profile Content */}
            <div className="max-w-2xl mx-auto px-6 pt-20 md:pt-28 pb-32 md:pb-16">
                <h1 className="hidden md:block font-serif text-4xl text-sai-charcoal mb-8">
                    My Profile
                </h1>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-t-4 mb-6" style={{ borderTopColor: 'var(--color-sai-pink)' }}>
                    {/* User Icon */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-sai-pink-light)' }}>
                            <User className="w-10 h-10" style={{ color: 'var(--color-sai-pink)' }} />
                        </div>
                        <div>
                            <h2 className="font-serif text-2xl text-sai-charcoal">
                                {profile?.first_name || 'User'}
                            </h2>
                            <p className="text-sm text-sai-gray">
                                Member since {new Date(user.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-sai-light-gray rounded-lg">
                            <Mail className="w-5 h-5 text-sai-gray flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-sai-gray mb-1">Email</p>
                                <p className="text-sm font-semibold text-sai-charcoal truncate">{user.email}</p>
                            </div>
                        </div>

                        {profile?.phone && (
                            <div className="flex items-center gap-3 p-4 bg-sai-light-gray rounded-lg">
                                <Phone className="w-5 h-5 text-sai-gray flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs text-sai-gray mb-1">Phone</p>
                                    <p className="text-sm font-semibold text-sai-charcoal">{profile.phone}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full py-3 rounded-full bg-white border-2 text-sai-charcoal font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    style={{ borderColor: 'var(--color-sai-pink)' }}
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>

                {/* Coming Soon Features */}
                <div className="mt-8 p-6 bg-sai-light-gray rounded-xl">
                    <h3 className="font-semibold text-sai-charcoal mb-3">Coming Soon</h3>
                    <ul className="space-y-2 text-sm text-sai-gray">
                        <li>• Edit profile details</li>
                        <li>• Order history</li>
                        <li>• Saved addresses</li>
                        <li>• Favorite cakes</li>
                        <li>• Track orders</li>
                    </ul>
                </div>
            </div>
        </main>
    );
}
