'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface InboxTriggerProps {
    userId?: string;
    className?: string;
}

export default function InboxTrigger({ userId, className = '' }: InboxTriggerProps) {
    const supabase = createClient();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!userId) {
            setUnreadCount(0);
            return;
        }

        const fetchUnread = async () => {
            const { count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('read', false);
            setUnreadCount(count || 0);
        };

        fetchUnread();

        // listen for notification updates
        const handleNotificationUpdate = () => fetchUnread();
        window.addEventListener('notifications-updated', handleNotificationUpdate);

        return () => {
            window.removeEventListener('notifications-updated', handleNotificationUpdate);
        };
    }, [userId]);

    return (
        <Link href="/inbox" className={`relative group p-1 ${className}`} aria-label="Open inbox">
            <Bell className="w-5 h-5 text-sai-charcoal group-hover:text-sai-pink transition-colors" strokeWidth={2} />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-sai-pink text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-in zoom-in duration-200 shadow-sm border border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </Link>
    );
}
