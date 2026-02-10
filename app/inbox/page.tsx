'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import NotificationInbox from '@/app/components/NotificationInbox';
import AuthSync from '@/app/components/AuthSync';
import InboxLoginRequired from './_components/InboxLoginRequired';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';


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
            <div className="min-h-screen pt-32 px-4 flex justify-center">
                <div className="w-8 h-8 border-2 border-sai-pink border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!userId) {
        return <InboxLoginRequired />;
    }

    return (
        <div className="min-h-screen bg-sai-cream flex flex-col items-center justify-start pb-36 lg:pt-28">
            {/* Mobile Header */}
            <div className="sticky top-0 z-10 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 md:hidden flex items-center gap-2">
                <Link href="/profile" className="inline-flex items-center gap-2 text-sai-charcoal">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back</span>
                </Link>
            </div>

            <AuthSync />
            <div className="w-full max-w-6xl px-4 pt-4 md:pt-0">
                <div className="mb-8 hidden md:block">
                    <h1 className="text-3xl font-bold text-sai-charcoal font-serif">Inbox</h1>
                    <p className="text-gray-500 mt-2">Stay updated with your latest orders and announcements</p>
                </div>

                {/* Mobile Title (Optional, since we have Back button, maybe just Inbox text in header? User said 'like product page', product page has just Back button) */}
                {/* But maybe we want the 'Inbox' title visible on mobile too? */}
                {/* The previous code had title. */}
                <div className="mb-6 md:hidden">
                    <h1 className="text-2xl font-bold text-sai-charcoal font-serif">Inbox</h1>
                </div>

                <div className="bg-transparent">
                    <NotificationInbox userId={userId} />
                </div>
            </div>
        </div>
    );
}