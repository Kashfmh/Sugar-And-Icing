import { useState } from 'react';
import { Package, Clock, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderCardProps {
    order: any;
}

export default function OrderCard({ order }: OrderCardProps) {
    const [expanded, setExpanded] = useState(false);
    const isPaid = order.status === 'paid' || order.status === 'succeeded' || order.status === 'shipped' || order.status === 'delivered';

    const getImageUrl = (item: any) => {
        const p = Array.isArray(item.products) ? item.products[0] : item.products;
        if (p?.image_url) return p.image_url;
        if (p?.gallery_images?.length > 0) return p.gallery_images[0];
        return item.metadata?.image_url || null;
    };

    const getItemName = (item: any) => {
        const p = Array.isArray(item.products) ? item.products[0] : item.products;
        return p?.name || item.product_name || 'Unknown Item';
    };

    return (
        <div className="border border-gray-100 rounded-2xl p-4 md:p-6 mb-4 hover:border-pink-100 transition-colors group bg-white">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-serif font-bold text-sai-charcoal">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {order.status.replace('_', ' ')}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-sai-pink">RM {Number(order.total_amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{order.items_count || order.order_items?.length || 1} items</p>
                </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex-1 py-2 text-xs font-medium text-sai-charcoal bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                >
                    {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {expanded ? 'Hide Details' : 'View Details'}
                </button>
                {isPaid && (
                    <button className="flex-1 py-2 text-xs font-medium text-pink-600 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
                        Track Order
                    </button>
                )}
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 space-y-3">
                            {order.order_items?.map((item: any) => (
                                <div key={item.id} className="flex gap-3 text-sm">
                                    {/* Image */}
                                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-100">
                                        {getImageUrl(item) ? (
                                            <img src={getImageUrl(item)} className="w-full h-full object-cover" alt="item" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-sai-charcoal truncate pr-2">{getItemName(item)}</p>
                                                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                            </div>
                                            <span className="text-sai-charcoal/80 font-medium whitespace-nowrap">
                                                RM {item.price_at_purchase?.toFixed(2)}
                                            </span>
                                        </div>
                                        {item.metadata && Object.keys(item.metadata).length > 0 && (
                                            <p className="text-xs text-gray-400 italic mt-1 truncate">
                                                {Object.values(item.metadata).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}