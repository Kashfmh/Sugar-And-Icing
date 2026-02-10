'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, ShoppingBag, Tag, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ConfirmationModal from './ConfirmationModal';

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
    const supabase = createClient();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'order' | 'system' | 'promo'>('all');
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // confirmation modal state
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        variant: 'danger' | 'info';
        confirmLabel: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        description: '',
        variant: 'danger',
        confirmLabel: 'Confirm',
        onConfirm: () => { },
    });

    // Ref to debounce mark-as-read
    const markAsReadTimeout = useRef<NodeJS.Timeout>(null);

    useEffect(() => {
        // If we remount quickly (e.g. Strict Mode), cancel the pending mark-as-read
        if (markAsReadTimeout.current) {
            clearTimeout(markAsReadTimeout.current);
            markAsReadTimeout.current = null;
        }

        fetchNotifications();

        const handleUpdate = () => fetchNotifications();
        window.addEventListener('notifications-updated', handleUpdate);

        return () => {
            window.removeEventListener('notifications-updated', handleUpdate);

            // Schedule mark as read with a delay.
            // If the user navigates back or component remounts quickly, we'll cancel this.
            markAsReadTimeout.current = setTimeout(() => {
                markAllAsRead();
            }, 1000);
        };
    }, [userId]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery, filter]);

    async function fetchNotifications() {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications((data as unknown as Notification[]) || []);
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
        if (!userId) return;

        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', userId)
                .eq('read', false);

            if (error) throw error;

            // Dispatch event to update global indicators (e.g., Navbar bell icon)
            window.dispatchEvent(new Event('notifications-updated'));

        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }

    const handleDeleteNotification = (id: string) => {
        setConfirmation({
            isOpen: true,
            title: 'Delete Notification',
            description: 'Are you sure you want to delete this notification? This action cannot be undone.',
            variant: 'danger',
            confirmLabel: 'Delete',
            onConfirm: () => deleteNotification(id),
        });
    };

    // api call for single delete
    async function deleteNotification(id: string) {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setNotifications(notifications.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }

    // modal trigger for delete all
    const handleDeleteAll = () => {
        setConfirmation({
            isOpen: true,
            title: 'Clear All Notifications',
            description: 'Are you sure you want to delete ALL notifications? This action cannot be undone.',
            variant: 'danger',
            confirmLabel: 'Clear All',
            onConfirm: () => deleteAllNotifications(),
        });
    };

    // api call for delete all
    async function deleteAllNotifications() {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;

            setNotifications([]);
        } catch (error) {
            console.error('Error deleting all notifications:', error);
        }
    }

    // filter and search logic
    const filteredNotifications = notifications.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || n.type === filter;
        return matchesSearch && matchesFilter;
    });

    const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
    const paginatedNotifications = filteredNotifications.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-full md:w-64 bg-gray-200 rounded-lg animate-pulse" />
                </div>

                {/* Filter Skeleton */}
                <div className="flex gap-2 pb-2 overflow-hidden">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-9 w-20 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                    ))}
                    <div className="flex-1" />
                    <div className="hidden md:block h-5 w-24 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* List Skeleton */}
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="animate-pulse flex gap-5 p-5 border border-gray-100 rounded-2xl bg-white">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-3 py-1">
                                <div className="flex justify-between">
                                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                                    <div className="h-4 bg-gray-200 rounded w-16" />
                                </div>
                                <div className="h-4 bg-gray-200 rounded w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-sai-charcoal flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                    {notifications.some(n => !n.read) && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                </h3>

                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sai-pink/20 focus:border-sai-pink transition-all"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 text-sm overflow-x-auto pb-2 no-scrollbar">
                {['all', 'order', 'promo', 'system'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`
                            px-4 py-2 rounded-full border transition-all whitespace-nowrap capitalize
                            ${filter === f
                                ? 'bg-sai-pink text-white border-sai-pink'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                        `}
                    >
                        {f}
                    </button>
                ))}
                <div className="flex-1" />

                {/* Clear All Button */}
                {notifications.length > 0 && (
                    <button
                        onClick={handleDeleteAll}
                        className="text-sm font-medium text-gray-400 hover:text-red-500 flex items-center gap-1 whitespace-nowrap mr-2 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear All
                    </button>
                )}
            </div>

            <div className="space-y-4 min-h-[300px]">
                {paginatedNotifications.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Bell className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-lg text-gray-500 font-medium">No results found</p>
                        <p className="text-gray-400 mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    paginatedNotifications.map((notification) => (
                        <NotificationCard
                            key={notification.id}
                            notification={notification}
                            onMarkRead={() => markAsRead(notification.id)}
                            onDelete={() => handleDeleteNotification(notification.id)}
                        />
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
                    >
                        Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`px-3 py-1 rounded border min-w-[2rem] ${page === p ? 'bg-sai-pink text-white border-sai-pink' : 'hover:bg-gray-50'}`}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Global Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmation.onConfirm}
                title={confirmation.title}
                description={confirmation.description}
                variant={confirmation.variant}
                confirmLabel={confirmation.confirmLabel}
            />
        </div>
    );
}

function NotificationCard({ notification, onMarkRead, onDelete }: { notification: Notification, onMarkRead: () => void, onDelete: () => void }) {
    const [expanded, setExpanded] = useState(false);

    const orderIdMatch = notification.message.match(/Order #([A-Za-z0-9\-]+)/i) || notification.title.match(/Order #([A-Za-z0-9\-]+)/i);
    const orderId = orderIdMatch ? orderIdMatch[1] : null;

    const cleanTitle = notification.title.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return <ShoppingBag className="w-6 h-6 text-blue-500" />;
            case 'promo': return <Tag className="w-6 h-6 text-sai-pink" />;
            default: return <Info className="w-6 h-6 text-gray-500" />;
        }
    };

    const getFormattedDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
            // "10 Feb, 08:46 pm"
            return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ', ' +
                date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
        } else if (diffDays <= 7) {
            // "10 Feb"
            return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        } else {
            // "10/02/2026"
            return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
    };

    const formattedDate = getFormattedDate(notification.created_at);

    return (
        <div
            className={`
                rounded-2xl transition-all duration-300 border overflow-hidden
                ${notification.read ? 'bg-white border-gray-100 opacity-80 hover:opacity-100' : 'bg-white border-sai-pink/30 shadow-sm ring-1 ring-sai-pink/10'}
            `}
        >
            <div
                onClick={() => setExpanded(!expanded)}
                className="p-5 flex gap-5 items-start cursor-pointer group"
            >
                {/* Icon */}
                <div className={`p-3 rounded-full flex-shrink-0 transition-colors ${notification.read ? 'bg-gray-100' : 'bg-blue-50 group-hover:bg-blue-100'}`}>
                    {getIcon(notification.type)}
                </div>

                {/* Content Header */}
                <div className="flex-1 min-w-0 pt-1">
                    <div className="flex justify-between items-start">
                        <h4 className={`text-base font-semibold transition-colors ${notification.read ? 'text-gray-700' : 'text-sai-charcoal'}`}>
                            {cleanTitle}
                        </h4>

                        {/* Mobile Date Display (Top Right) */}
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-4 mt-1 md:hidden">
                            {formattedDate}
                        </span>
                    </div>

                    {/* Preview Message */}
                    <p className={`text-sm mt-1 line-clamp-1 ${notification.read ? 'text-gray-500' : 'text-gray-600'}`}>
                        {notification.message}
                    </p>

                    {/* Mobile View Details Trigger */}
                    <div className="flex md:hidden mt-2 items-center text-xs text-sai-pink font-medium">
                        <span>{expanded ? 'Hide Details' : 'View Details'}</span>
                        <svg className={`w-3 h-3 ml-1 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Desktop View Details Trigger Column */}
                <div className="hidden md:flex flex-col items-end gap-2 ml-4 min-w-[120px]">
                    {/* Desktop Date Display (Top Right within Column) */}
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formattedDate}
                    </span>

                    <button className="text-xs text-gray-400 group-hover:text-sai-pink flex items-center gap-1 transition-colors mt-auto">
                        {expanded ? 'Hide' : 'View Details'}
                        <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Accordion Body */}
            <div className={`
                transition-all duration-300 ease-in-out border-t border-dashed overflow-hidden
                ${expanded ? 'max-h-96 opacity-100 border-gray-100' : 'max-h-0 opacity-0 border-transparent'}
            `}>
                <div className="p-5 pt-4 bg-gray-50/50 pl-[5.5rem]">
                    <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
                        {notification.message}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-4 items-center justify-between">
                        <div className="flex gap-3">
                            {orderId && (
                                <a
                                    href="/profile"
                                    className="px-4 py-2 bg-white border border-gray-200 text-sai-charcoal text-sm font-medium rounded-lg hover:border-sai-pink hover:text-sai-pink transition-colors shadow-sm"
                                >
                                    View Order Details
                                </a>
                            )}
                        </div>

                        {/* Delete Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                            title="Delete Notification"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
