import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Filter, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Order, OrderItem } from '@/types';
import dynamic from 'next/dynamic';
import RateOrderModal from '@/app/components/RateOrderModal';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/hooks/useCart';


interface OrderHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    orders: Order[];
}

const TABS = [
    { id: 'all', label: 'All' },
    { id: 'to_pay', label: 'To Pay', status: 'pending_payment' },
    { id: 'preparing', label: 'Preparing', status: ['paid', 'processing'] },
    { id: 'ready', label: 'Ready to Pickup', status: 'shipped' },
    { id: 'completed', label: 'Completed', status: ['delivered', 'completed'] },
    { id: 'cancelled', label: 'Cancelled', status: 'cancelled' },
];

export default function OrderHistoryModal({ isOpen, onClose, orders }: OrderHistoryModalProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [sortOption, setSortOption] = useState('newest');
    const ITEMS_PER_PAGE = 5;

    // Reset page when filters change
    if (activeTab !== 'all' || searchQuery || sortOption !== 'newest') {
        // This causes infinite loop if we set state directly in render. 
        // Better to use useEffect for resets or just slice based on current filtered list length.
        // Actually, let's use useEffect to reset page.
    }

    const filteredOrders = orders.filter(order => {

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


        const searchMatch =
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.order_items?.some((item) => {
                const pName = item.products?.name || (item as any).product_name || '';
                return pName.toLowerCase().includes(searchQuery.toLowerCase());
            });

        return statusMatch && searchMatch;
    }).sort((a, b) => {

        switch (sortOption) {
            case 'oldest':
                return new Date(a.updated_at || a.created_at).getTime() - new Date(b.updated_at || b.created_at).getTime();
            case 'price_high':
                return b.total_amount - a.total_amount;
            case 'price_low':
                return a.total_amount - b.total_amount;
            case 'newest':
            default:
                return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
        }
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    // Reset page when filters change
    const [prevFilterKey, setPrevFilterKey] = useState(`${activeTab}-${searchQuery}-${sortOption}`);
    if (prevFilterKey !== `${activeTab}-${searchQuery}-${sortOption}`) {
        setPage(1);
        setPrevFilterKey(`${activeTab}-${searchQuery}-${sortOption}`);
    }

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 h-screen w-screen bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.98, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.98, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-50 w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
                        >
                            <div className="bg-white px-8 py-6 flex items-center justify-between border-b border-gray-100">
                                <div>
                                    <h2 className="text-2xl font-serif font-bold text-sai-charcoal">Order History</h2>
                                    <p className="text-sm text-gray-500 mt-1">Track your past purchases</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="bg-white border-b border-gray-100 px-6 overflow-x-auto no-scrollbar">
                                <div className="flex w-max min-w-full gap-8">
                                    {TABS.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`
                                                relative py-4 text-sm font-medium transition-colors whitespace-nowrap
                                                ${activeTab === tab.id ? 'text-sai-pink' : 'text-gray-500 hover:text-gray-700'}
                                            `}
                                        >
                                            {tab.label}
                                            {activeTab === tab.id && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-sai-pink rounded-full"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 pb-2">
                                <div className="flex gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by Order ID or Product Name"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sai-pink/20 focus:border-sai-pink transition-all placeholder:text-gray-400 text-sai-charcoal"
                                        />
                                    </div>
                                    <div className="relative">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-sai-charcoal hover:border-sai-pink/50 focus:outline-none focus:ring-2 focus:ring-sai-pink/20 transition-all">
                                                    <Filter className="w-4 h-4 text-gray-500" />
                                                    <span className="font-medium">
                                                        {sortOption === 'newest' && 'Latest First'}
                                                        {sortOption === 'oldest' && 'Oldest First'}
                                                        {sortOption === 'price_high' && 'Price: High to Low'}
                                                        {sortOption === 'price_low' && 'Price: Low to High'}
                                                    </span>
                                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-100 rounded-xl shadow-lg p-1 z-[9999]">
                                                <DropdownMenuItem onClick={() => setSortOption('newest')} className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-sai-pink focus:bg-gray-50 focus:text-sai-pink">
                                                    Latest First
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setSortOption('oldest')} className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-sai-pink focus:bg-gray-50 focus:text-sai-pink">
                                                    Oldest First
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setSortOption('price_high')} className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-sai-pink focus:bg-gray-50 focus:text-sai-pink">
                                                    Price: High to Low
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setSortOption('price_low')} className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-sai-pink focus:bg-gray-50 focus:text-sai-pink">
                                                    Price: Low to High
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-4">
                                {paginatedOrders.length > 0 ? (
                                    paginatedOrders.map(order => (
                                        <HistoryOrderCard key={order.id} order={order} router={router} onOpenRate={() => { onClose(); window.dispatchEvent(new CustomEvent('open-rate', { detail: order })); }} />
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                            <Filter className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="font-medium">No orders found</p>
                                    </div>
                                )}
                            </div>

                            {/* Rate Order Modal - mounted here so each order can open it */}
                            {/* Modal will be controlled from HistoryOrderCard via custom event */}


                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="bg-white border-t border-gray-100 p-4 flex justify-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setPage(p => Math.max(1, p - 1)); }}
                                        disabled={page === 1}
                                        className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50 text-sm"
                                    >
                                        Prev
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            onClick={(e) => { e.stopPropagation(); setPage(p); }}
                                            className={`px-3 py-1 rounded border min-w-[2rem] text-sm ${page === p ? 'bg-sai-pink text-white border-sai-pink' : 'hover:bg-gray-50'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setPage(p => Math.min(totalPages, p + 1)); }}
                                        disabled={page === totalPages}
                                        className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50 text-sm"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}

                        </motion.div>
                    </motion.div>
                </>
            )
            }
        </AnimatePresence >
    );
}

function HistoryOrderCard({ order, router, onOpenRate }: { order: Order, router: AppRouterInstance, onOpenRate?: () => void }) {
    const { addItems } = useCart();
    const [isBuyingAgain, setIsBuyingAgain] = useState(false);
    const [isRated, setIsRated] = useState(false);

    const supabase = createClient();

    const checkRated = async () => {
        try {
            const productIds = (order.order_items || []).map((it: any) => {
                // Try multiple ways to extract product_id (matching RateOrderModal logic)
                let productId: string | null = null;
                if (Array.isArray(it.products) && it.products[0]?.id) {
                    productId = it.products[0].id;
                } else if (it.products?.id) {
                    productId = it.products.id;
                } else if (it.product_id) {
                    productId = it.product_id;
                } else if (it.productId) {
                    productId = it.productId;
                }
                return productId;
            }).filter((id): id is string => id !== null);

            if (productIds.length === 0) {
                setIsRated(false);
                return;
            }

            const { data, error } = await supabase
                .from('reviews')
                .select('product_id')
                .in('product_id', productIds)
                .eq('order_id', order.id);

            if (error) {
                console.error('Failed to fetch reviews for order:', error);
                setIsRated(false);
                return;
            }

            const reviewedProductIds = (data || []).map((r: any) => r.product_id);

            const allReviewed = productIds.length > 0 && productIds.every(pid => reviewedProductIds.includes(pid));
            setIsRated(allReviewed);
        } catch (e) {
            console.error(e);
            setIsRated(false);
        }
    };

    // check rated status on mount and when reviews update
    useEffect(() => {
        checkRated();
        const handler = () => {
            console.log('reviews-updated event received, rechecking rated status...');
            checkRated();
        };
        window.addEventListener('reviews-updated', handler as EventListener);
        return () => window.removeEventListener('reviews-updated', handler as EventListener);
    }, [order.id, supabase]);
    

    // set status and label color

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending_payment': return { text: 'To Pay', color: 'text-orange-600 bg-orange-50 border-orange-100' };
            case 'paid': return { text: 'Preparing', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
            case 'processing': return { text: 'Preparing', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
            case 'shipped': return { text: 'Ready to Pickup', color: 'text-blue-600 bg-blue-50 border-blue-100' };
            case 'delivered': return { text: 'Completed', color: 'text-green-600 bg-green-50 border-green-100' };
            case 'cancelled': return { text: 'Cancelled', color: 'text-gray-500 bg-gray-100 border-gray-200' };
            case 'refunded': return { text: 'Refunded', color: 'text-red-600 bg-red-50 border-red-100' };
            default: return { text: status.replace('_', ' '), color: 'text-gray-600 bg-gray-50 border-gray-200' };
        }
    };

    const statusConfig = getStatusLabel(order.status);

    // get image url   
    const getImageUrl = (item: any) => {
        // check joined product data
        const p = item.products;

        const product = Array.isArray(p) ? p[0] : p;

        if (product) {
            if (product.image_url) return product.image_url;
            if (product.gallery_images && product.gallery_images.length > 0) return product.gallery_images[0];
        }

        // metadata fallback
        if (item.metadata?.image_url) return item.metadata.image_url;
        if (item.metadata?.image) return item.metadata.image;

        return null;
    };

    const getItemName = (item: any) => {
        const p = Array.isArray(item.products) ? item.products[0] : item.products;
        return p?.name || item.product_name || 'Unknown Item';
    };

    const handleContactSeller = () => {
        const message = `Hey i wanted to enquire about my purchase with the order id : Order #${order.id.slice(0, 8).toUpperCase()}`;
        const encodedMessage = encodeURIComponent(message);
        // Replace with actual phone number
        const phoneNumber = '60123456789';
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    };

    const handleBuyAgain = async () => {
        setIsBuyingAgain(true);
        try {
            const itemsToAdd: any[] = [];

            order.order_items?.forEach(item => {
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
                router.push('/cart'); // Or open drawer
                // For this app, maybe just open drawer? But user asked for redirect to cart
                // If /cart page exists, push there. If not, open drawer.
                // Assuming drawer is main cart view, we might just open it.
                // But user specifically said "redirect to my cart", so let's push to /cart if it exists,
                // or just open the drawer if that's how the app works.
                // Given previous context, there is a useCart drawer.
                // Let's try opening drawer AND pushing to a cart page if it exists.
                // Actually, the user prompts "shud redirect to my cart".
                // I'll stick to router.push('/cart') as requested.
            }
        } catch (error) {
            console.error("Failed to buy again:", error);
        } finally {
            setIsBuyingAgain(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
            {/* Header: Shop/Status */}
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between text-sm bg-white">
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-sai-charcoal">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color} uppercase tracking-wide`}>
                    {statusConfig.text}
                </div>
            </div>

            {/* Items List */}
            <div className="divide-y divide-gray-50">
                {order.order_items?.map((item, idx) => (
                    <OrderItemRow key={idx} item={item} getImageUrl={getImageUrl} getItemName={getItemName} />
                ))}
            </div>

            {/* Footer: Total & Actions */}
            <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Order Total</span>
                    <span className="text-lg font-bold text-sai-pink">RM {order.total_amount?.toFixed(2)}</span>
                </div>

                {/* Actions Row */}
                <div className="flex gap-3">
                    {order.status === 'pending_payment' && (
                        <button
                            onClick={() => router.push(`/checkout?orderId=${order.id}`)}
                            className="px-5 py-2.5 bg-white border border-sai-pink text-sai-pink text-sm font-medium rounded-xl hover:bg-pink-50 transition-colors shadow-sm"
                        >
                            Pay Now
                        </button>
                    )}
                    {['delivered', 'completed'].includes(order.status) && (
                        <>
                            {!isRated ? (
                                <button onClick={() => { if (onOpenRate) onOpenRate(); }} className="px-5 py-2.5 bg-white border border-sai-pink text-sai-pink text-sm font-medium rounded-xl hover:bg-pink-50 transition-colors shadow-sm">
                                    Rate Order
                                </button>
                            ) : (
                                <button disabled className="px-5 py-2.5 bg-white border border-gray-200 text-gray-400 text-sm font-medium rounded-xl shadow-sm cursor-not-allowed">Rated</button>
                            )}
                        </>
                    )}

                    <button
                        onClick={handleContactSeller}
                        className="px-5 py-2.5 bg-white border border-gray-200 text-sai-charcoal text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                    >
                        Contact Seller
                    </button>

                    {['completed', 'cancelled'].includes(order.status) && (
                        <button
                            onClick={handleBuyAgain}
                            disabled={isBuyingAgain}
                            className="px-5 py-2.5 bg-white border border-gray-200 text-sai-charcoal text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isBuyingAgain ? 'Adding...' : 'Buy Again'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function OrderItemRow({ item, getImageUrl, getItemName }: { item: any, getImageUrl: (item: any) => string | null, getItemName: (item: any) => string }) {
    const [showDetails, setShowDetails] = useState(false);

    const metadata = item.metadata || {};

    // primary fields - show outside
    const primaryKeys = ['base_flavour', 'frosting', 'flavour', 'base', 'cake_flavour'];
    // secondary fields - show in dropdown
    const secondaryKeys = ['dietary', 'dietary_options', 'design_notes', 'notes', 'message', 'special_instructions'];

    const primaryEntries = Object.entries(metadata).filter(([key, val]) =>
        primaryKeys.some(pk => key.toLowerCase().includes(pk.toLowerCase())) && val && String(val).trim() !== ''
    );

    const secondaryEntries = Object.entries(metadata).filter(([key]) =>
        secondaryKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))
    );

    // anything else that's not primary or secondary
    const otherEntries = Object.entries(metadata).filter(([key]) =>
        !primaryKeys.some(pk => key.toLowerCase().includes(pk.toLowerCase())) &&
        !secondaryKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))
    );

    const hasSecondaryDetails = secondaryEntries.length > 0;

    return (
        <div className="p-6 hover:bg-gray-50/30 transition-colors">
            <div className="flex gap-6">
                {/* Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0 relative">
                    {getImageUrl(item) ? (
                        <img src={getImageUrl(item)!} alt="Product" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-50">
                            No Img
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-base font-medium text-sai-charcoal line-clamp-2">
                        {getItemName(item)}
                    </h4>

                    {/* Primary metadata - always visible */}
                    {(primaryEntries.length > 0 || otherEntries.length > 0) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {primaryEntries.map(([key, val]) => (
                                <span key={key} className="text-xs px-2 py-1 bg-pink-50 text-pink-700 rounded-md border border-pink-100">
                                    {String(val)}
                                </span>
                            ))}
                            {otherEntries.map(([key, val]) => (
                                <span key={key} className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-md border border-gray-100">
                                    {String(val)}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-500">x{item.quantity}</span>

                        {/* View Details toggle - always show */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowDetails(!showDetails);
                            }}
                            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                        >
                            <ChevronDown className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                            {showDetails ? 'Hide' : 'View Details'}
                        </button>
                    </div>
                </div>

                {/* Price */}
                <div className="text-right flex flex-col justify-center">
                    <div className="text-sm font-medium text-sai-charcoal">
                        RM {(item.price_at_purchase || 0).toFixed(2)}
                        <span className="text-xs text-gray-400 font-normal">/ pc</span>
                    </div>
                </div>
            </div>

            {/* Collapsible Details */}
            <AnimatePresence>
                {showDetails && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 ml-26 pl-6 border-l-2 border-gray-100 space-y-2">
                            {Object.keys(metadata).length > 0 ? (
                                Object.entries(metadata).map(([key, val]) => (
                                    <TruncatedDetail key={key} label={key} value={String(val) || '-'} />
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic">No additional details</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function TruncatedDetail({ label, value }: { label: string; value: string }) {
    const [expanded, setExpanded] = useState(false);
    const isLong = value.length > 80;

    return (
        <div className="text-sm">
            <span className="text-gray-400 capitalize">{label.replace(/_/g, ' ')}: </span>
            <span className="text-gray-600 break-words">
                {isLong && !expanded ? (
                    <>
                        {value.slice(0, 80)}...
                        <button
                            onClick={() => setExpanded(true)}
                            className="text-sai-pink hover:underline ml-1"
                        >
                            more
                        </button>
                    </>
                ) : (
                    <>
                        {value}
                        {isLong && (
                            <button
                                onClick={() => setExpanded(false)}
                                className="text-sai-pink hover:underline ml-1"
                            >
                                less
                            </button>
                        )}
                    </>
                )}
            </span>
        </div>
    );
}