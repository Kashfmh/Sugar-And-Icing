'use client';

import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { items, removeItem, updateQuantity, subtotal, totalItems, isLoading } = useCart();
    const router = useRouter();

    const handleCheckout = () => {
        router.push('/checkout');
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gray-50 py-8 md:pt-28 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse mb-8" />
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <ul className="divide-y divide-gray-100">
                                    {[1, 2, 3].map((i) => (
                                        <li key={i} className="p-6 flex flex-col sm:flex-row gap-6">
                                            {/* Image Skeleton */}
                                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />

                                            <div className="flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="w-full">
                                                        {/* Title Skeleton */}
                                                        <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
                                                        {/* Description Skeleton */}
                                                        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-3" />

                                                        {/* Metadata Skeletons */}
                                                        <div className="space-y-1">
                                                            <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse" />
                                                            <div className="h-3 w-1/4 bg-gray-200 rounded animate-pulse" />
                                                        </div>
                                                    </div>
                                                    {/* Price Skeleton */}
                                                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse ml-4" />
                                                </div>

                                                <div className="mt-auto pt-4 flex items-center justify-between">
                                                    {/* Quantity Controls Skeleton */}
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-24 h-8 bg-gray-200 rounded-lg animate-pulse" />
                                                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                                    </div>
                                                    {/* Remove Button Skeleton */}
                                                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        {/* Summary Skeleton */}
                        <div className="lg:col-span-4 mt-8 lg:mt-0">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 animate-pulse">
                                <div className="h-6 w-1/2 bg-gray-200 rounded" />
                                <div className="space-y-3">
                                    <div className="flex justify-between"><div className="h-4 w-1/3 bg-gray-200 rounded" /><div className="h-4 w-1/4 bg-gray-200 rounded" /></div>
                                    <div className="flex justify-between"><div className="h-4 w-1/3 bg-gray-200 rounded" /><div className="h-4 w-1/4 bg-gray-200 rounded" /></div>
                                    <div className="flex justify-between"><div className="h-4 w-1/3 bg-gray-200 rounded" /><div className="h-4 w-1/4 bg-gray-200 rounded" /></div>
                                </div>
                                <div className="h-px bg-gray-200 w-full" />
                                <div className="flex justify-between items-end"><div className="h-6 w-1/3 bg-gray-200 rounded" /><div className="h-8 w-1/3 bg-gray-200 rounded" /></div>
                                <div className="h-12 w-full bg-gray-200 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (items.length === 0) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                        <ShoppingBag className="w-10 h-10 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-serif font-bold text-sai-charcoal">Your cart is empty</h1>
                        <p className="text-gray-500">Looks like you haven't added any treats yet.</p>
                    </div>
                    <Button
                        asChild
                        className="mt-4 bg-sai-pink hover:bg-sai-pink/90 text-white rounded-full px-8"
                    >
                        <Link href="/">Browse Menu</Link>
                    </Button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 py-8 md:pt-28 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-serif font-bold text-sai-charcoal mb-8">
                    Your Cart ({totalItems()} items)
                </h1>

                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Cart Items List */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <ul className="divide-y divide-gray-100">
                                {items.map((item) => (
                                    <li key={item.id} className="p-6 flex flex-col sm:flex-row gap-6">
                                        {/* Image */}
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

                                        {/* Content */}
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

                                                    {/* Metadata / Customizations */}
                                                    {item.metadata && (
                                                        <div className="mt-2 space-y-1">
                                                            {Object.entries(item.metadata).map(([key, value]) => {
                                                                if (!value || (Array.isArray(value) && value.length === 0)) return null;
                                                                if (key === 'design_notes') return null; // Skip redundant notes if bulky
                                                                return (
                                                                    <div key={key} className="text-xs text-gray-500 flex items-start gap-1">
                                                                        <span className="capitalize font-medium text-gray-700">{key}:</span>
                                                                        <span>{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                                                                    </div>
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
                                                    onClick={() => removeItem(item.id)}
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
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4 mt-8 lg:mt-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">RM {subtotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-gray-400 text-sm italic">Calculated at checkout</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax</span>
                                    <span className="text-gray-400 text-sm italic">Included</span>
                                </div>

                                <Separator />

                                <div className="flex justify-between items-end">
                                    <span className="text-base font-bold text-gray-900">Estimated Total</span>
                                    <span className="text-2xl font-serif font-bold text-sai-pink">RM {subtotal().toFixed(2)}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleCheckout}
                                className="w-full mt-8 bg-sai-pink hover:bg-sai-pink/90 text-white rounded-xl py-6 text-lg shadow-lg shadow-pink-100 transition-all active:scale-[0.98]"
                            >
                                Checkout
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>

                            <p className="mt-4 text-xs text-center text-gray-400">
                                Secure checkout with DuitNow QR
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
