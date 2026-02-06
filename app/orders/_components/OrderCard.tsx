import { useState } from 'react';
import { Package, Clock, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderCardProps {
    order: any;
}

export default function OrderCard({ order }: OrderCardProps) {
    const [expanded, setExpanded] = useState(false);
    const isPaid = order.status === 'paid' || order.status === 'succeeded';

    return (
        <div className="border border-gray-100 rounded-2xl p-4 md:p-6 mb-4 hover:border-pink-100 transition-colors group bg-white">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-serif font-bold text-sai-charcoal">Order #{order.id.slice(-6)}</span>
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
                    <p className="text-xs text-gray-400">{order.items_count || 1} items</p>
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
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">
                                            {item.quantity}x
                                        </div>
                                        <div>
                                            <p className="font-medium text-sai-charcoal">{item.product_name}</p>
                                            {item.metadata && Object.keys(item.metadata).length > 0 && (
                                                <p className="text-xs text-gray-400 italic">
                                                    {Object.values(item.metadata).join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-sai-charcoal/80 font-medium">RM {item.price_at_purchase}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
