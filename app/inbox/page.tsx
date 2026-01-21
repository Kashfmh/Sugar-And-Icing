'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import NotificationInbox from '@/app/components/NotificationInbox';
import AuthSync from '@/app/components/AuthSync';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export default function InboxPage() {
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
        return (
            <div className="min-h-screen pt-32 px-4">
                <div className="max-w-md mx-auto text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-sai-charcoal">Please Log In</h1>
                    <p className="text-gray-600">You need to be logged in to view your notifications.</p>
                    <Link
                        href="/login?next=/inbox"
                        className="inline-block px-8 py-3 bg-sai-charcoal text-white rounded-xl font-medium hover:bg-sai-charcoal/90 transition-colors"
                    >
                        Log In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-24 px-4 bg-sai-cream">
            <AuthSync />
            <div className="max-w-2xl mx-auto">
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
