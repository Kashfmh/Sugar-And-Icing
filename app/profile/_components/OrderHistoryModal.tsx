
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Filter, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OrderItem {
    id: string;
    product_name: string;
    quantity: number;
    price_at_purchase: number;
    metadata: Record<string, any>;
    products?: {
        image_url: string;
    } | { image_url: string }[];
}

// ... (Order interface remains same)

// ... (Component logic)



// ... (Inside HistoryOrderCard)

// Helper to get image URL safely


// ... (Rest of card)

interface Order {
    id: string;
    created_at: string;
    status: string;
    total_amount: number;
    order_items: OrderItem[];
}

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
    { id: 'completed', label: 'Completed', status: 'delivered' },
    { id: 'cancelled', label: 'Cancelled', status: 'cancelled' },
    // Removed 'Return Refund' as per user request
];

export default function OrderHistoryModal({ isOpen, onClose, orders }: OrderHistoryModalProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('newest');

    const filteredOrders = orders.filter(order => {
        // 1. Filter by Tab Status
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

        // 2. Search Filter
        const searchMatch =
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.order_items?.some((item) => item.product_name.toLowerCase().includes(searchQuery.toLowerCase()));

        return statusMatch && searchMatch;
    }).sort((a, b) => {
        // 3. Sorting
        switch (sortOption) {
            case 'oldest':
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            case 'price_high':
                return b.total_amount - a.total_amount;
            case 'price_low':
                return a.total_amount - b.total_amount;
            case 'newest':
            default:
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
    });

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                    >
                        {/* Modal Container */}
                        <motion.div
                            initial={{ scale: 0.98, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.98, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-50 w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
                        >
                            {/* Header */}
                            <div className="bg-white px-8 py-6 flex items-center justify-between border-b border-gray-100">
                                <div>
                                    <h2 className="text-2xl font-serif font-bold text-sai-charcoal">Order History</h2>
                                    <p className="text-sm text-gray-500 mt-1">Track your past purchases</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Tabs */}
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

                            {/* Search & Filter Toolbar */}
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

                            {/* Order List */}
                            <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-4">
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map(order => (
                                        <HistoryOrderCard key={order.id} order={order} router={router} />
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
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Sub-component for individual order card
function HistoryOrderCard({ order, router }: { order: Order, router: any }) {
    // Determine status label and color
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

    // Helper to get image URL safely
    const getImageUrl = (item: OrderItem) => {
        // 1. Try Joined Products (Object)
        if (item.products && !Array.isArray(item.products)) {
            if (item.products.image_url) return item.products.image_url;
        }

        // 2. Try Joined Products (Array)
        if (Array.isArray(item.products) && item.products.length > 0) {
            if (item.products[0].image_url) return item.products[0].image_url;
        }

        // 3. Try Metadata Fallback
        if (item.metadata?.image_url) return item.metadata.image_url;
        if (item.metadata?.image) return item.metadata.image;

        return null;
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
                    <div key={idx} className="p-6 flex gap-6 hover:bg-gray-50/30 transition-colors group cursor-pointer" onClick={() => router.push('/other-treats')}>
                        {/* Using router push just as placeholder, ideally goes to product page if slug available */}

                        {/* Image */}
                        {/* Image */}
                        <div className="w-20 h-20 bg-gray-100 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0 relative">
                            {getImageUrl(item) ? (
                                <img src={getImageUrl(item)!} alt={item.product_name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-50">
                                    No Img
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="text-base font-medium text-sai-charcoal line-clamp-2 group-hover:text-sai-pink transition-colors">
                                {item.product_name}
                            </h4>
                            {item.metadata && Object.keys(item.metadata).length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {Object.entries(item.metadata).map(([key, val]) => (
                                        <span key={key} className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-md border border-gray-100">
                                            {String(val)}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="text-sm text-gray-500 mt-1">x{item.quantity}</div>
                        </div>

                        {/* Price */}
                        <div className="text-right flex flex-col justify-center">
                            <div className="text-sm font-medium text-sai-charcoal">RM {item.price_at_purchase?.toFixed(2)}</div>
                        </div>
                    </div>
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
                    {order.status === 'delivered' && (
                        <button className="px-5 py-2.5 bg-sai-pink text-white text-sm font-medium rounded-xl shadow-lg shadow-pink-200 hover:bg-sai-pink/90 hover:shadow-xl hover:shadow-pink-200/50 transition-all">
                            Rate Order
                        </button>
                    )}

                    <button className="px-5 py-2.5 bg-white border border-gray-200 text-sai-charcoal text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm">
                        Contact Shop
                    </button>

                    <button
                        onClick={() => router.push('/other-treats')}
                        className="px-5 py-2.5 bg-white border border-gray-200 text-sai-charcoal text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                    >
                        Buy Again
                    </button>
                </div>
            </div>
        </div>
    );
}
