'use client';



import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Minus, Plus, Trash2, X } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetDescription,
    SheetClose,
} from '@/components/ui/sheet';
import Image from 'next/image';
import ConfirmationModal from '@/app/components/ConfirmationModal';

export default function CartDrawer() {
    const router = useRouter();
    const { items, isOpen, setIsOpen, removeItem, updateQuantity, subtotal, totalItems } = useCart();
    const [itemToRemove, setItemToRemove] = useState<string | null>(null);
    const [isGuest, setIsGuest] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (isOpen) {
            supabase.auth.getUser().then(({ data: { user } }) => {
                setIsGuest(!user);
            });
        }
    }, [isOpen]);

    const handleCheckout = () => {
        if (isGuest) return;
        setIsOpen(false);
        router.push('/checkout');
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="flex flex-col w-full sm:max-w-md bg-white">
                <SheetHeader className="space-y-2.5 pr-6">
                    <SheetTitle className="flex items-center gap-2 text-xl font-serif text-sai-charcoal">
                        <ShoppingBag className="w-5 h-5" />
                        Your Cart ({totalItems()})
                    </SheetTitle>
                    <SheetDescription className="text-gray-500">
                        Review your delicious selection before checking out.
                    </SheetDescription>
                </SheetHeader>

                <Separator className="my-4" />

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center p-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-medium text-lg text-gray-900">Your cart is empty</h3>
                            <p className="text-sm text-gray-500">Looks like you haven't added any treats yet.</p>
                        </div>
                        <Button
                            onClick={() => setIsOpen(false)}
                            variant="outline"
                            className="mt-4 border-sai-pink text-sai-pink hover:bg-sai-pink hover:text-white"
                        >
                            Browse Menu
                        </Button>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 -mx-6 px-6">
                            <div className="space-y-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100">
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

                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-semibold text-gray-900 truncate pr-4">{item.name}</h4>
                                                {item.description && (
                                                    <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                                                )}
                                                <p className="text-sm font-medium text-sai-pink">RM {item.price.toFixed(2)}</p>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-1 border border-gray-100">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-gray-600 transition-all text-xs"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-medium text-gray-700">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-gray-600 transition-all text-xs"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => setItemToRemove(item.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="space-y-4 pt-6 mt-auto">
                            <Separator />
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-base font-medium text-gray-900">
                                    <span>Subtotal</span>
                                    <span>RM {subtotal().toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-gray-500 text-center px-4">
                                    Tax and shipping calculated at checkout.
                                </p>
                            </div>
                            <Button
                                onClick={handleCheckout}
                                disabled={isGuest}
                                className={`w-full h-12 rounded-full text-base font-semibold shadow-lg transition-all ${isGuest
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none hover:bg-gray-300 pointer-events-none'
                                    : 'bg-sai-pink hover:bg-sai-pink/90 text-white shadow-pink-200'
                                    }`}
                            >
                                {isGuest ? 'Login to Checkout' : 'Checkout'}
                            </Button>
                            {isGuest && (
                                <p className="text-xs text-center text-gray-400 mt-2">
                                    Please <span className="font-medium text-sai-pink cursor-pointer hover:underline" onClick={() => router.push('/login?redirect=/checkout')}>sign in</span> to complete your purchase.
                                </p>
                            )}
                        </div>
                        <div className="h-40 md:hidden"></div>
                    </>
                )}
            </SheetContent>

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
        </Sheet >
    );
}
