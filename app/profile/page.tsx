"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import RateOrderModal from '@/app/components/RateOrderModal';
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
        orders,
        totalOrders,
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

    // Hooks that must run on every render (do not place after conditional returns)
    const searchParams = useSearchParams();
    const openRateId = searchParams?.get('openRate');
    const [openRateOrder, setOpenRateOrder] = useState<any | null>(null);

    useEffect(() => {
        if (openRateId && orders && orders.length > 0) {
            const found = orders.find(o => o.id === openRateId);
            if (found) setOpenRateOrder(found);
        }
    }, [openRateId, orders]);

    // Listen for global requests to open rate modal (from other components)
    useEffect(() => {
        const handler = (e: any) => {
            const od = e?.detail;
            if (od) setOpenRateOrder(od);
        };

        window.addEventListener('open-rate', handler as EventListener);
        return () => window.removeEventListener('open-rate', handler as EventListener);
    }, []);

    if (isCheckingAuth || isLoadingData) {
        return <ProfileSkeleton />;
    }

    if (!user) {
        return <ProfileSkeleton />;
    }

    return (
        <div className="min-h-screen bg-sai-white pb-24 pt-6 lg:pt-28 lg:pb-10">
            <ProfileHeader user={user} profile={profile} orders={orders} />

            <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === 'dashboard' && (
                    <DashboardView
                        user={user}
                        profile={profile}
                        occasions={occasions}
                        recentlyViewed={recentlyViewed}
                        orders={orders}
                        totalOrders={totalOrders}
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

            {openRateOrder && (
                <RateOrderModal isOpen={true} onClose={() => setOpenRateOrder(null)} order={openRateOrder} userId={user?.id} />
            )}
        </div>
    );
}