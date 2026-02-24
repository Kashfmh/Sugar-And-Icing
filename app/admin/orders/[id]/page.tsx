import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { StatusSelect } from "../_components/StatusSelect";
import Link from "next/link";
import { ArrowLeft, User, Package, Calendar, MapPin, Mail, Phone, Clock, Truck, CheckCircle2 } from 'lucide-react';
import ObfuscatedEmail from '@/app/components/ObfuscatedEmail';

export const metadata = {
    title: "Order Details - Admin",
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: order, error } = await supabase
        .from("orders")
        .select(`
      *,
      profiles:user_id (
        id,
        first_name,
        last_name,
        email,
        phone
      ),
      order_items (
        id,
        quantity,
        price_at_purchase,
        products (
          name,
          image_url
        )
      )
    `)
        .eq("id", id)
        .single();

    if (error || !order) {
        notFound();
    }

    const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
    const customerName = profile
        ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.email
        : "Unknown Customer";

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders" className="p-2 border border-neutral-200 bg-white hover:bg-neutral-50 rounded-lg transition-colors shadow-sm">
                        <ArrowLeft className="h-5 w-5 text-neutral-600" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-serif font-bold text-sai-charcoal">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide capitalize ${order.status === 'completed' || order.status === 'paid' ? 'bg-green-50 text-green-600 border border-green-200' :
                                order.status === 'pending' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                                    'bg-neutral-100 text-neutral-600 border border-neutral-200'
                                }`}>
                                {order.status.replace("_", " ")}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-sai-gray">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(order.created_at), "MMM do, yyyy 'at' h:mm a")}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:block">
                        <StatusSelect orderId={order.id} currentStatus={order.status} />
                    </div>
                    <button className="px-4 py-2 border border-neutral-200 bg-white hover:bg-neutral-50 rounded-lg text-sm font-medium text-sai-charcoal transition-colors shadow-sm">
                        Print Invoice
                    </button>
                    <button className="px-4 py-2 bg-sai-pink text-white hover:bg-[#e67fa0] rounded-lg text-sm font-semibold transition-colors shadow-sm">
                        Fulfill Order
                    </button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Main Details (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
                            <h2 className="text-lg font-bold text-sai-charcoal flex items-center gap-2">
                                <Package className="h-5 w-5 text-sai-pink" />
                                Order Items
                            </h2>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-left">
                                <thead className="bg-neutral-50 border-b border-neutral-100 hidden sm:table-header-group">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-bold text-sai-gray uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-xs font-bold text-sai-gray uppercase tracking-wider text-center">Qty</th>
                                        <th className="px-6 py-3 text-xs font-bold text-sai-gray uppercase tracking-wider text-right">Price</th>
                                        <th className="px-6 py-3 text-xs font-bold text-sai-gray uppercase tracking-wider text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {order.order_items?.map((item: any) => {
                                        const product = Array.isArray(item.products) ? item.products[0] : item.products;
                                        return (
                                            <tr key={item.id} className="block sm:table-row w-full p-4 sm:p-0">
                                                <td className="px-6 py-4 flex items-center sm:table-cell w-full sm:w-auto">
                                                    <div className="flex items-center gap-4 w-full">
                                                        {product?.image_url ? (
                                                            <div className="h-16 w-16 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0 relative">
                                                                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="h-16 w-16 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center flex-shrink-0 text-xs text-neutral-400">
                                                                No Img
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <p className="font-bold text-sai-charcoal">{product?.name || "Unknown Product"}</p>
                                                            <p className="text-sm text-sai-gray mt-0.5">SKU: PRD-{item.id.slice(0, 6).toUpperCase()}</p>
                                                            {/* Mobile only Qty/Price */}
                                                            <div className="sm:hidden mt-2 flex justify-between text-sm">
                                                                <span>Qty: {item.quantity}</span>
                                                                <span className="font-bold">{formatCurrency(item.price_at_purchase * item.quantity)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden sm:table-cell px-6 py-4 text-center">
                                                    <span className="inline-block px-3 py-1 bg-neutral-100 rounded-lg text-sm font-bold text-sai-charcoal">{item.quantity}</span>
                                                </td>
                                                <td className="hidden sm:table-cell px-6 py-4 text-right text-sm text-sai-gray font-medium">
                                                    {formatCurrency(item.price_at_purchase)}
                                                </td>
                                                <td className="hidden sm:table-cell px-6 py-4 text-right font-bold text-sai-charcoal">
                                                    {formatCurrency(item.price_at_purchase * item.quantity)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Special Instructions (Mockup feature) */}
                        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-sai-charcoal uppercase tracking-wider mb-3">Special Instructions</h3>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 italic relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400 rounded-l-xl"></div>
                                    "Please write 'Happy Birthday Sarah' on the cake and ensure no nuts are used. Thank you!"
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
                            <h3 className="text-sm font-bold text-sai-charcoal uppercase tracking-wider mb-4">Payment Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-sai-gray">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(order.total_amount)}</span>
                                </div>
                                <div className="flex justify-between text-sai-gray">
                                    <span>Shipping</span>
                                    <span>{formatCurrency(0)}</span>
                                </div>
                                <div className="flex justify-between text-sai-gray">
                                    <span>Tax (0%)</span>
                                    <span>{formatCurrency(0)}</span>
                                </div>
                                <div className="pt-3 border-t border-neutral-200 mt-2">
                                    <div className="flex justify-between items-center text-lg font-bold text-sai-charcoal">
                                        <span>Total</span>
                                        <span>{formatCurrency(order.total_amount)}</span>
                                    </div>
                                    <div className="text-right text-xs text-green-600 font-medium mt-1">
                                        Paid via Stripe
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Customer & Delivery (1/3 width) */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-sai-charcoal uppercase tracking-wider">Customer</h2>
                            <Link href={`/admin/customers/${profile?.id}`} className="text-xs font-bold text-sai-pink hover:text-[#e67fa0]">
                                View Profile
                            </Link>
                        </div>
                        <div className="p-6">
                            {profile ? (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                                        {profile.first_name?.[0]}{profile.last_name?.[0] || profile.email?.[0]}
                                    </div>
                                    <div className="space-y-3 flex-1 overflow-hidden">
                                        <div>
                                            <p className="font-bold text-base text-sai-charcoal truncate">{customerName}</p>
                                            <p className="text-xs text-sai-gray">Customer since 2023</p>
                                        </div>
                                        <div className="space-y-2 pt-2 border-t border-neutral-100">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="w-4 h-4 text-neutral-400" />
                                                <ObfuscatedEmail email={profile.email} className="text-sai-charcoal hover:text-sai-pink truncate block" />
                                            </div>
                                            {profile.phone && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="w-4 h-4 text-neutral-400" />
                                                    <a href={`tel:${profile.phone}`} className="text-sai-charcoal hover:text-sai-pink">
                                                        {profile.phone}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-sai-gray">Guest checkout or deleted user.</p>
                            )}
                        </div>
                    </div>

                    {/* Delivery Details */}
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
                            <h2 className="text-sm font-bold text-sai-charcoal uppercase tracking-wider flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-sai-pink" />
                                Delivery Details
                            </h2>
                        </div>
                        <div className="p-6 space-y-4 text-sm text-sai-charcoal">
                            {order.delivery_date && (
                                <div>
                                    <p className="text-xs font-bold text-sai-gray uppercase mb-1">Scheduled For</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-neutral-400" />
                                        {format(new Date(order.delivery_date), "EEEE, MMMM do yyyy")}
                                    </p>
                                </div>
                            )}

                            {order.delivery_slot && (
                                <div>
                                    <p className="text-xs font-bold text-sai-gray uppercase mb-1">Time Slot</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-neutral-400" />
                                        {order.delivery_slot}
                                    </p>
                                </div>
                            )}

                            <div className="pt-2 border-t border-neutral-100">
                                <p className="text-xs font-bold text-sai-gray uppercase mb-1">Shipping Address</p>
                                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                                    <p className="font-medium mb-1">{customerName}</p>
                                    <p className="text-sai-gray">
                                        123 Bakery Lane<br />
                                        Suite 400<br />
                                        Austin, TX 78701
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Only Status (Hidden on desktop) */}
                    <div className="sm:hidden bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
                        <h2 className="text-sm font-bold text-sai-charcoal uppercase tracking-wider mb-4">Update Status</h2>
                        <StatusSelect orderId={order.id} currentStatus={order.status} />
                    </div>
                </div>
            </div>
        </div>
    );
}
