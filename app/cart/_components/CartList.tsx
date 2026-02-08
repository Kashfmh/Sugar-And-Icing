import { useCart } from '@/hooks/useCart';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import ConfirmationModal from '@/app/components/ConfirmationModal';

export default function CartList() {
    const { items, updateQuantity, removeItem } = useCart();
    const [itemToRemove, setItemToRemove] = useState<string | null>(null);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100">
                {items.map((item) => (
                    <li key={item.id} className="p-6 flex flex-col sm:flex-row gap-6">
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                            {item.image_url ? (
                                <Image
                                    src={item.image_url}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-xs text-gray-400">No Img</div>
                            )}
                        </div>

                        <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        <Link href={`/products/${item.name.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-sai-pink transition-colors">
                                            {item.name}
                                        </Link>
                                    </h3>
                                    {item.description && (
                                        <p className="mt-1 text-sm text-gray-500 line-clamp-1">{item.description}</p>
                                    )}

                                    {item.metadata && (
                                        <div className="mt-2 space-y-1 max-w-md">
                                            {Object.entries(item.metadata).map(([key, value]) => {
                                                if (!value || (Array.isArray(value) && value.length === 0)) return null;

                                                const displayValue = Array.isArray(value) ? value.join(', ') : String(value);

                                                return (
                                                    <TruncatableValue key={key} label={key} value={displayValue} />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <p className="text-lg font-bold text-sai-pink font-serif whitespace-nowrap ml-4">
                                    RM {(item.price * item.quantity).toFixed(2)}
                                </p>
                            </div>

                            <div className="mt-auto pt-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 bg-gray-50 rounded-lg border border-gray-200 p-1">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-600 transition-all disabled:opacity-50"
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-10 text-center font-medium text-gray-900">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-600 transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        RM {item.price.toFixed(2)} each
                                    </div>
                                </div>

                                <button
                                    onClick={() => setItemToRemove(item.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium pr-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Remove</span>
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <ConfirmationModal
                isOpen={!!itemToRemove}
                onClose={() => setItemToRemove(null)}
                onConfirm={() => {
                    if (itemToRemove) removeItem(itemToRemove);
                }}
                title="Remove Item?"
                description="Are you sure you want to remove this delicious treat from your cart?"
                confirmLabel="Remove"
                variant="danger"
            />
        </div >
    );
}

function TruncatableValue({ label, value }: { label: string; value: string }) {
    const [expanded, setExpanded] = useState(false);
    const isLong = value.length > 50;

    return (
        <div className="text-xs text-gray-500">
            <span className="capitalize font-medium text-gray-700">{label}: </span>
            <span className="break-all">
                {isLong && !expanded ? (
                    <>
                        {value.slice(0, 50)}...
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
