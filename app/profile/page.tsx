'use client';

import { useProfile } from '@/hooks/useProfile';
import ProfileSkeleton from '@/app/components/ProfileSkeleton';
import ProfileHeader from './_components/ProfileHeader';
import ProfileTabs from './_components/ProfileTabs';
import DashboardView from './_components/DashboardView';
import EditProfileView from './_components/EditProfileView';
import SettingsView from './_components/SettingsView';

export default function ProfilePage() {
    const {
        isCheckingAuth,
        isLoadingData,
        user,
        profile,
        isUpdating,
        activeTab,
        addresses,
        occasions,
        recentlyViewed,
        status,
        formData,
        setActiveTab,
        setFormData,
        setProfile,
        handleUpdateProfile,
        handleReset,
        handleSignOut,
        initializeProfile,
        router
    } = useProfile();

    if (isCheckingAuth || isLoadingData) {
        return <ProfileSkeleton />;
    }

    if (!user) {
        return <ProfileSkeleton />;
    }

    return (
        <div className="min-h-screen bg-sai-white pt-24">
            {/* Hero Section */}
            <ProfileHeader user={user} profile={profile} />

            {/* Tabs */}
            <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === 'dashboard' && (
                    <DashboardView
                        user={user}
                        profile={profile}
                        occasions={occasions}
                        recentlyViewed={recentlyViewed}
                        router={router}
                        setActiveTab={setActiveTab}
                    />
                )}

                {activeTab === 'edit-profile' && (
                    <EditProfileView
                        user={user}
                        profile={profile}
                        formData={formData}
                        setFormData={setFormData}
                        setProfile={setProfile}
                        isUpdating={isUpdating}
                        status={status}
                        handleUpdateProfile={handleUpdateProfile}
                        handleReset={handleReset}
                        addresses={addresses}
                        occasions={occasions}
                        initializeProfile={initializeProfile}
                    />
                )}

                {activeTab === 'settings' && (
                    <SettingsView handleSignOut={handleSignOut} />
                )}
            </div>
        </div>
    );
}