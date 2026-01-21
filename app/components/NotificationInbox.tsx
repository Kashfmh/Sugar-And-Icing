'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Info, ShoppingBag, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'order' | 'system' | 'promo';
    read: boolean;
    created_at: string;
}

interface NotificationInboxProps {
    userId: string;
}

export default function NotificationInbox({ userId }: NotificationInboxProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, [userId]);

    async function fetchNotifications() {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }

    async function markAsRead(id: string) {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id);

            if (error) throw error;

            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }

    async function markAllAsRead() {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', userId)
                .eq('read', false);

            if (error) throw error;

            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return <ShoppingBag className="w-5 h-5 text-blue-500" />;
            case 'promo': return <Tag className="w-5 h-5 text-sai-pink" />;
            default: return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex gap-4 p-4 border rounded-xl">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                            <div className="h-4 bg-gray-200 rounded w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-sai-charcoal flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                    {notifications.some(n => !n.read) && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                </h3>
                {notifications.some(n => !n.read) && (
                    <button
                        onClick={markAllAsRead}
                        className="text-sm font-medium text-sai-pink hover:text-sai-pink/80 flex items-center gap-1"
                    >
                        <Check className="w-4 h-4" />
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Bell className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No notifications yet</p>
                        <p className="text-sm text-gray-400 mt-1">We'll let you know when we have updates for you.</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-xl border transition-all ${notification.read
                                ? 'bg-white border-gray-100'
                                : 'bg-blue-50/30 border-blue-100 shadow-sm'
                                }`}
                        >
                            <div className="flex gap-4 items-start">
                                <div className={`p-2.5 rounded-full flex-shrink-0 ${notification.read ? 'bg-gray-100' : 'bg-white shadow-sm'
                                    }`}>
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm font-medium truncate ${notification.read ? 'text-gray-700' : 'text-sai-charcoal'
                                            }`}>
                                            {notification.title}
                                        </h4>
                                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                            {new Date(notification.created_at).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${notification.read ? 'text-gray-500' : 'text-gray-600'
                                        }`}>
                                        {notification.message}
                                    </p>
                                    {!notification.read && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="mt-2 text-xs font-medium text-sai-pink hover:underline"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
