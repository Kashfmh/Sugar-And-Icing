'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import NotificationInbox from '@/app/components/NotificationInbox';
import AuthSync from '@/app/components/AuthSync';
import InboxLoginRequired from './_components/InboxLoginRequired';

export default function InboxPage() {
    const supabase = createClient();
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserId(user.id);
        }
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-24 px-4 flex justify-center">
                <div className="w-8 h-8 border-2 border-sai-pink border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!userId) {
        return <InboxLoginRequired />;
    }

    return (
        <div className="min-h-screen bg-sai-cream flex flex-col items-center justify-center px-4 py-24">
            <AuthSync />
            <div className="w-full max-w-2xl">
                <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-gray-200">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-sai-charcoal font-serif">Inbox</h1>
                        <p className="text-gray-500">Order updates and messages</p>
                    </div>
                    <NotificationInbox userId={userId} />
                </div>
            </div>
        </div>
    );
}