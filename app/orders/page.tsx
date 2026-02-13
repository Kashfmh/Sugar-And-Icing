'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Search, Filter, ChevronDown, Loader2, X, ChevronRight, RefreshCw, Star, MessageCircle, DollarSign, Calendar, Package, ArrowLeft } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useCart } from '@/hooks/useCart';
import { createClient } from '@/lib/supabase/client';
import AuthSync from '@/app/components/AuthSync';
import LoginRequired from './_components/LoginRequired';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Order } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

// Constants
const TABS = [
    { id: 'all', label: 'All' },
    { id: 'to_pay', label: 'To Pay', status: 'pending_payment' },
    { id: 'paid', label: 'Paid', status: 'paid' },
    { id: 'preparing', label: 'Preparing', status: 'processing' },
    { id: 'ready', label: 'Ready to Pickup', status: 'shipped' },
    { id: 'completed', label: 'Completed', status: ['delivered', 'completed'] },
    { id: 'cancelled', label: 'Cancelled', status: 'cancelled' },
];

const ITEMS_PER_PAGE = 5;

export default function OrdersPage() {
    const { user, orders, isLoadingData, isCheckingAuth, isLoadingOrders } = useProfile();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('newest');
    const [page, setPage] = useState(1);

    // Redirect on desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                router.replace('/profile?tab=dashboard&open=orders');
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [router]);

    // Derived State: Filtering & Sorting
    const filteredOrders = useMemo(() => {
        if (!orders) return [];

        let result = orders.filter(order => {
            // Filter by Tab (Status)
            let statusMatch = true;
            if (activeTab !== 'all') {
                const currentTab = TABS.find(t => t.id === activeTab);
                if (currentTab?.status) {
                    if (Array.isArray(currentTab.status)) {
                        statusMatch = currentTab.status.includes(order.status);
                    } else {
                        statusMatch = order.status === currentTab.status;
                    }
                } else {
                    statusMatch = false;
                }
            }

            // Filter by Search
            const searchLower = searchQuery.toLowerCase();
            const searchMatch =
                order.id.toLowerCase().includes(searchLower) ||
                order.order_items?.some((item: any) => {
                    const pName = item.products?.name || item.product_name || '';
                    return pName.toLowerCase().includes(searchLower);
                });

            return statusMatch && searchMatch;
        });

        // Sorting
        return result.sort((a, b) => {
            switch (sortOption) {
                case 'oldest':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'price_high':
                    return (b.total_amount || 0) - (a.total_amount || 0);
                case 'price_low':
                    return (a.total_amount || 0) - (b.total_amount || 0);
                case 'newest':
                default:
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });
    }, [orders, activeTab, searchQuery, sortOption]);

    // Derived State: Pagination
    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = useMemo(() => {
        return filteredOrders.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    }, [filteredOrders, page]);

    // Reset pagination on filter change
    useEffect(() => {
        setPage(1);
    }, [activeTab, searchQuery, sortOption]);


    if (isCheckingAuth || (isLoadingData && !user) || (isLoadingOrders && orders.length === 0)) {
        return (
            <div className="min-h-screen bg-sai-cream pb-36 lg:pt-24 px-4 pt-4 space-y-4">
                {/* Mobile Header Skeleton */}
                <div className="w-full h-12 bg-gray-200 animate-pulse rounded-lg lg:hidden mb-4" />

                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-md" />
                    <div className="flex gap-3">
                        <div className="flex-1 h-10 bg-gray-200 animate-pulse rounded-xl" />
                        <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-xl" />
                    </div>
                    <div className="flex gap-2 overflow-x-hidden">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-24 h-9 bg-gray-200 animate-pulse rounded-full" />
                        ))}
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <MobileOrderSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginRequired />;
    }

    return (
        <div className="min-h-screen bg-sai-cream pb-36 lg:pt-24">
            <AuthSync />

            {/* Mobile Header */}
            <div className="sticky top-0 z-10 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 lg:hidden flex items-center gap-2 mb-4">
                <Link href="/profile" className="inline-flex items-center gap-2 text-sai-charcoal hover:text-sai-pink transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back</span>
                </Link>
            </div>

            <div className="max-w-2xl mx-auto space-y-6 px-4">

                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <h1 className="text-2xl font-serif font-bold text-sai-charcoal">Order History</h1>

                    {/* Search & Sort Row */}
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 w-full bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sai-pink/20 focus:border-sai-pink transition-all placeholder:text-gray-400"
                            />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center justify-center p-2 bg-white border border-gray-200 rounded-xl hover:border-sai-pink/50 focus:outline-none focus:ring-2 focus:ring-sai-pink/20 transition-all min-w-[42px]">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-100 rounded-xl shadow-lg p-1 z-50">
                                <DropdownMenuItem onClick={() => setSortOption('newest')} className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-sai-pink">Latest First</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortOption('oldest')} className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-sai-pink">Oldest First</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortOption('price_high')} className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-sai-pink">Price: High to Low</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortOption('price_low')} className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-sai-pink">Price: Low to High</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Filter Tabs - Horizontal Scroll */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    px-4 py-2 rounded-full border transition-all whitespace-nowrap text-sm font-medium
                                    ${activeTab === tab.id
                                        ? 'bg-sai-pink text-white border-sai-pink shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}
                                `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {paginatedOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-200 text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <ShoppingBag className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                            <p className="text-gray-500 mt-1 max-w-xs mx-auto">Try adjusting your filters or search to find what you're looking for.</p>
                            <button
                                onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
                                className="mt-6 px-4 py-2 text-sai-pink font-medium hover:underline"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        paginatedOrders.map((order) => (
                            <MobileOrderCard key={order.id} order={order} />
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center flex-wrap gap-2 mt-8">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 rounded border bg-white disabled:opacity-50 hover:bg-gray-50 text-sm font-medium text-gray-600"
                        >
                            Prev
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`px-3 py-1 rounded border min-w-[2rem] text-sm font-medium transition-colors ${page === p ? 'bg-sai-pink text-white border-sai-pink' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1 rounded border bg-white disabled:opacity-50 hover:bg-gray-50 text-sm font-medium text-gray-600"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function MobileOrderCard({ order }: { order: Order }) {
    const router = useRouter();
    const { addItems } = useCart();
    const [expanded, setExpanded] = useState(false);
    const [isBuyingAgain, setIsBuyingAgain] = useState(false);
    const supabase = createClient();
    const [isRated, setIsRated] = useState(false);

    // Status Config
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending_payment': return { text: 'To Pay', color: 'text-orange-600 bg-orange-50 border-orange-100', icon: DollarSign };
            case 'paid': return { text: 'Paid', color: 'text-indigo-600 bg-indigo-50 border-indigo-100', icon: CheckIcon };
            case 'processing': return { text: 'Preparing', color: 'text-indigo-600 bg-indigo-50 border-indigo-100', icon: Package };
            case 'shipped': return { text: 'Ready', color: 'text-blue-600 bg-blue-50 border-blue-100', icon: ShoppingBag };
            case 'delivered': return { text: 'Completed', color: 'text-green-600 bg-green-50 border-green-100', icon: Star };
            case 'completed': return { text: 'Completed', color: 'text-green-600 bg-green-50 border-green-100', icon: Star };
            case 'cancelled': return { text: 'Cancelled', color: 'text-gray-500 bg-gray-100 border-gray-200', icon: X };
            case 'refunded': return { text: 'Refunded', color: 'text-red-600 bg-red-50 border-red-100', icon: RefreshCw };
            default: return { text: status.replace('_', ' '), color: 'text-gray-600 bg-gray-50 border-gray-200', icon: ShoppingBag };
        }
    };

    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;

    // Check Rated Status
    useEffect(() => {
        const checkRated = async () => {
            if (!['delivered', 'completed'].includes(order.status)) return;

            try {
                const productIds = (order.order_items || []).map((it: any) => {
                    let productId: string | null = null;
                    if (Array.isArray(it.products) && it.products[0]?.id) productId = it.products[0].id;
                    else if (it.products?.id) productId = it.products.id;
                    else if (it.product_id) productId = it.product_id;
                    else if (it.productId) productId = it.productId;
                    return productId;
                }).filter((id): id is string => id !== null);

                if (productIds.length === 0) { setIsRated(false); return; }

                const { data, error } = await supabase
                    .from('reviews')
                    .select('product_id')
                    .in('product_id', productIds)
                    .eq('order_id', order.id);

                if (error) throw error;

                const reviewedProductIds = (data || []).map((r: any) => r.product_id);
                // Simple logic: if ANY items are reviewed, verify if ALL distinct items are reviewed
                const distinctProductIds = Array.from(new Set(productIds));
                const allReviewed = distinctProductIds.length > 0 && distinctProductIds.every(pid => reviewedProductIds.includes(pid));
                setIsRated(allReviewed);
            } catch (e) {
                console.error(e);
                setIsRated(false);
            }
        };

        checkRated();
        const handler = () => checkRated();
        window.addEventListener('reviews-updated', handler);
        return () => window.removeEventListener('reviews-updated', handler);
    }, [order.id, order.status, order.order_items, supabase]);

    // Helpers
    const getImageUrl = (item: any) => {
        const p = item.products;
        const product = Array.isArray(p) ? p[0] : p;
        if (product) {
            if (product.image_url) return product.image_url;
            if (product.gallery_images && product.gallery_images.length > 0) return product.gallery_images[0];
        }
        if (item.metadata?.image_url) return item.metadata.image_url;
        if (item.metadata?.image) return item.metadata.image;
        return null;
    };

    const getItemName = (item: any) => {
        const p = Array.isArray(item.products) ? item.products[0] : item.products;
        return p?.name || item.product_name || 'Unknown Item';
    };


    // Handlers
    const handlePayNow = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/checkout?orderId=${order.id}`);
    };

    const handleRateOrder = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Mobile specific navigation
        if (window.innerWidth < 1024) {
            router.push(`/rate-order/${order.id}`);
        } else {
            window.dispatchEvent(new CustomEvent('open-rate', { detail: order }));
        }
    };

    const handleContactSeller = (e: React.MouseEvent) => {
        e.stopPropagation();
        const message = `Hi! I have a question about my order #${order.id.slice(0, 8).toUpperCase()}`;
        const phoneNumber = '60123456789'; // Replace with actual
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleBuyAgain = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsBuyingAgain(true);
        try {
            const itemsToAdd: any[] = [];
            order.order_items?.forEach((item: any) => {
                const product = Array.isArray(item.products) ? item.products[0] : item.products;
                if (!product) return;
                const metadataStr = JSON.stringify(item.metadata || {});
                const uniqueId = `${product.id}-${btoa(metadataStr).slice(0, 8)}`;
                itemsToAdd.push({
                    id: uniqueId,
                    productId: product.id,
                    name: product.name,
                    price: Number(item.price_at_purchase),
                    image_url: product.image_url,
                    quantity: item.quantity,
                    description: product.description,
                    category: product.product_type,
                    metadata: item.metadata || {}
                });
            });

            if (itemsToAdd.length > 0) {
                await addItems(itemsToAdd);
                router.push('/cart');
            }
        } catch (error) {
            console.error("Failed to buy again:", error);
        } finally {
            setIsBuyingAgain(false);
        }
    };

    return (
        <div
            className={`
                bg-white rounded-2xl border transition-all duration-300 overflow-hidden
                ${expanded ? 'shadow-md border-sai-pink/30 ring-1 ring-sai-pink/10' : 'shadow-sm border-gray-100 hover:shadow-md'}
            `}
        >
            {/* Clickable Header Area */}
            <div
                onClick={() => setExpanded(!expanded)}
                className="p-5 flex gap-4 items-start cursor-pointer group select-none"
            >
                {/* Icon Circle */}
                <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                    ${expanded ? 'bg-sai-pink text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-sai-pink/10 group-hover:text-sai-pink'}
                `}>
                    <ShoppingBag className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-sai-charcoal truncate pr-2">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                        </h4>
                        <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                            {statusConfig.text}
                        </span>

                        <div className="text-right">
                            {!expanded && (
                                <span className="text-sm font-bold text-sai-charcoal">
                                    RM {(order.total_amount || 0).toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Expand Hint */}
                    <div className="flex items-center gap-1 mt-3 text-xs font-medium text-gray-400 group-hover:text-sai-pink transition-colors">
                        <span>{expanded ? 'Hide Details' : 'View Details'}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
                    </div>
                </div>
            </div>

            {/* Expandable Body */}
            <div className={`
                transition-all duration-300 ease-in-out border-t border-dashed
                ${expanded ? 'max-h-[800px] opacity-100 border-gray-100 bg-gray-50/30' : 'max-h-0 opacity-0 border-transparent'}
            `}>
                <div className="p-5 pt-4 pl-[1rem] sm:pl-[5rem]"> {/* Adjusted padding for mobile */}

                    {/* Items List with details */}
                    <div className="space-y-4 mb-6">
                        {order.order_items?.map((item: any, idx: number) => (
                            <MobileOrderItemRow key={idx} item={item} getImageUrl={getImageUrl} getItemName={getItemName} />
                        ))}
                    </div>

                    {/* Total Section */}
                    <div className="flex justify-between items-center py-3 border-t border-gray-200 mb-4 font-medium text-sai-charcoal">
                        <span>Total Amount</span>
                        <span className="text-lg text-sai-pink font-bold">RM {(order.total_amount || 0).toFixed(2)}</span>
                    </div>

                    {/* Action Buttons Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {order.status === 'pending_payment' && (
                            <button
                                onClick={handlePayNow}
                                className="col-span-2 py-2.5 bg-sai-pink text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-pink-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <DollarSign className="w-4 h-4" />
                                Pay Now
                            </button>
                        )}

                        {['delivered', 'completed'].includes(order.status) && (
                            <button
                                onClick={handleRateOrder}
                                disabled={isRated}
                                className={`col-span-1 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2
                                    ${isRated
                                        ? 'bg-gray-100 text-gray-400 border-transparent cursor-not-allowed'
                                        : 'bg-white text-sai-pink border-sai-pink hover:bg-pink-50'}
                                `}
                            >
                                {isRated ? 'Rated' : (
                                    <>
                                        <Star className="w-4 h-4" />
                                        Rate
                                    </>
                                )}
                            </button>
                        )}

                        <button
                            onClick={handleContactSeller}
                            className={`py-2.5 bg-white border border-gray-200 text-sai-charcoal rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2
                                ${['delivered', 'completed', 'pending_payment'].includes(order.status) ? 'col-span-1' : 'col-span-2'}
                            `}
                        >
                            <MessageCircle className="w-4 h-4" />
                            Contact
                        </button>

                        {['completed', 'cancelled'].includes(order.status) && (
                            <button
                                onClick={handleBuyAgain}
                                disabled={isBuyingAgain}
                                className="col-span-2 py-2.5 bg-white border border-gray-200 text-sai-charcoal rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isBuyingAgain ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4" />
                                        Buy Again
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MobileOrderItemRow({ item, getImageUrl, getItemName }: { item: any, getImageUrl: (item: any) => string | null, getItemName: (item: any) => string }) {
    const [showDetails, setShowDetails] = useState(false);
    const metadata = item.metadata || {};

    // Keys logic from desktop
    const primaryKeys = ['base_flavour', 'frosting', 'flavour', 'base', 'cake_flavour'];
    const secondaryKeys = ['dietary', 'dietary_options', 'design_notes', 'notes', 'message', 'special_instructions'];

    const primaryEntries = Object.entries(metadata).filter(([key, val]) =>
        primaryKeys.some(pk => key.toLowerCase().includes(pk.toLowerCase())) && val && String(val).trim() !== ''
    );
    const secondaryEntries = Object.entries(metadata).filter(([key]) =>
        secondaryKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))
    );
    const otherEntries = Object.entries(metadata).filter(([key]) =>
        !primaryKeys.some(pk => key.toLowerCase().includes(pk.toLowerCase())) &&
        !secondaryKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))
    );

    return (
        <div className="flex gap-4 items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
            {/* Image - Smaller on mobile */}
            <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0">
                {getImageUrl(item) ? (
                    <img src={getImageUrl(item)!} alt="Product" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 bg-gray-50">
                        No Img
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium text-sai-charcoal line-clamp-2 pr-2">
                        {getItemName(item)}
                    </h4>
                    <span className="text-sm font-semibold text-sai-charcoal whitespace-nowrap">
                        RM {(Number(item.price_at_purchase) || 0).toFixed(2)}
                    </span>
                </div>

                <div className="text-xs text-gray-500 mt-1">x{item.quantity}</div>

                {/* Primary metadata tags */}
                {(primaryEntries.length > 0) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {primaryEntries.map(([key, val]) => (
                            <span key={key} className="text-[10px] px-1.5 py-0.5 bg-pink-50 text-pink-700 rounded border border-pink-100">
                                {String(val)}
                            </span>
                        ))}
                    </div>
                )}

                {/* Secondary/Other metadata toggle */}
                {(secondaryEntries.length > 0 || otherEntries.length > 0) && (
                    <div className="mt-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}
                            className="text-xs text-gray-400 hover:text-sai-pink flex items-center gap-1"
                        >
                            {showDetails ? 'Hide details' : 'View details'}
                            <ChevronDown className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showDetails && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-2 space-y-1">
                                        {[...secondaryEntries, ...otherEntries].map(([key, val]) => (
                                            <div key={key} className="text-xs">
                                                <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}: </span>
                                                <span className="text-gray-600">{String(val)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}

// Fallback icon
function CheckIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    )
}
function MobileOrderSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-gray-100 rounded-full animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                        <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
                        <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="flex justify-between mt-2">
                        <div className="h-6 w-24 bg-gray-100 rounded-full animate-pulse" />
                        <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-20 bg-gray-100 rounded animate-pulse mt-2" />
                </div>
            </div>
        </div>
    );
}
