import { createClient } from "@/lib/supabase/server";
import { formatCurrency, getInitials } from "@/lib/utils";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { ChevronRight, Printer, MapPin, Calendar, Clock, CreditCard, ShoppingBag, Package, ExternalLink, ArrowLeft } from "lucide-react";
import { StatusSelect } from "../_components/StatusSelect";
import { PrintReceiptButton } from "../_components/PrintReceiptButton";

export const metadata = {
    title: "Order Receipt - Admin",
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch order details
    const { data: rawOrder, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

    if (orderError || !rawOrder) {
        notFound();
    }

    const order = rawOrder as any;

    // Fetch customer profile
    const { data: rawProfile } = order.user_id
        ? await supabase
            .from("profiles")
            .select("*")
            .eq("id", order.user_id)
            .single()
        : { data: null };

    const profile = rawProfile as any;

    // Fetch order items with product images
    const { data: items } = await supabase
        .from("order_items")
        .select(`
            *,
            products (
                image_url,
                gallery_images
            )
        `)
        .eq("order_id", id);

    const firstName = profile?.first_name || order.delivery_address_snapshot?.first_name || "";
    const lastName = profile?.last_name || order.delivery_address_snapshot?.last_name || "";
    const email = profile?.email || order.delivery_address_snapshot?.email || "";

    const customerName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : email || "Unknown Customer";
    const initials = getInitials(firstName, lastName, email);
    const shortId = order.id.split("-")[0].toUpperCase();

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-orange-50 text-orange-600 border border-orange-200';
            case 'pending_payment': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
            case 'processing': return 'bg-blue-50 text-blue-600 border border-blue-200';
            case 'shipped':
            case 'completed':
            case 'delivered':
            case 'paid': return 'bg-green-50 text-green-600 border border-green-200';
            case 'cancelled':
            case 'refunded': return 'bg-neutral-100 text-neutral-600 border border-neutral-200';
            default: return 'bg-neutral-50 text-neutral-600 border border-neutral-200';
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'Pending',
            pending_payment: 'Payment Pending',
            processing: 'Processing',
            paid: 'Paid',
            shipped: 'Shipped',
            delivered: 'Delivered',
            completed: 'Completed',
            cancelled: 'Cancelled',
            refunded: 'Refunded',
        };
        return labels[status.toLowerCase()] ?? status.charAt(0).toUpperCase() + status.slice(1);
    };

    // Parse delivery address from snapshot
    const address = order.delivery_address_snapshot as any;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">

            {/* Page Header */}
            <div className="border-b border-neutral-200 pb-6">
                <h1 className="text-3xl font-serif font-bold text-sai-charcoal tracking-tight">Orders Management</h1>
                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-sai-gray">
                        <Link href="/admin" className="hover:text-sai-charcoal transition-colors">Home</Link>
                        <span className="text-neutral-300">›</span>
                        <Link href="/admin/orders" className="hover:text-sai-charcoal transition-colors">Orders</Link>
                        <span className="text-neutral-300">›</span>
                        <span className="text-sai-pink px-1">Order #{shortId}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusSelect orderId={order.id} currentStatus={order.status} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Side: Receipt Detail */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden relative">
                        {/* Receipt Top Section */}
                        <div className="p-8 border-b border-neutral-100 bg-neutral-50/30">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-sai-pink/10 p-2 rounded-xl">
                                            <ShoppingBag className="h-6 w-6 text-sai-pink" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-serif font-bold text-sai-charcoal">Order Receipt</h2>
                                            <p className="text-sm text-sai-gray mt-0.5 font-mono">ID: {order.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4">
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border ${getStatusStyle(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                        <span className="text-xs text-sai-gray font-medium flex items-center gap-1.5 ml-2">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}
                                        </span>
                                    </div>
                                </div>
                                <PrintReceiptButton />
                            </div>

                            {/* Customer Profile Section */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 bg-white border border-neutral-100 rounded-2xl shadow-sm mb-2">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full border-2 border-neutral-50 flex items-center justify-center bg-pink-50 text-sai-pink text-xl font-bold overflow-hidden">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt={customerName} className="h-full w-full object-cover" />
                                        ) : (
                                            initials
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sai-charcoal flex items-center gap-2">
                                            {customerName}
                                            {profile?.username && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-pink-50 text-sai-pink rounded border border-pink-100/50">
                                                    @{profile.username}
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-sm text-sai-gray mt-0.5">{email}</p>
                                        {profile && (
                                            <Link href={`/admin/customers/${profile.id}`} className="text-xs text-sai-pink font-semibold mt-1 inline-flex items-center gap-1 hover:underline">
                                                View Admin Profile <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-start sm:items-end gap-1">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Total Charged</span>
                                    <span className="text-xl font-bold text-sai-charcoal">{formatCurrency(order.total_amount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Items Table */}
                        <div className="p-8">
                            <h3 className="text-lg font-serif font-bold text-sai-charcoal mb-4 flex items-center gap-2">
                                <Package className="h-5 w-5 text-sai-pink" /> Order Items
                            </h3>
                            <div className="border border-neutral-100 rounded-2xl overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-neutral-50 text-[10px] font-bold uppercase tracking-widest text-sai-gray border-b border-neutral-100">
                                        <tr>
                                            <th className="py-4 px-6">Product</th>
                                            <th className="py-4 px-6 text-center">Qty</th>
                                            <th className="py-4 px-6 text-right">Price</th>
                                            <th className="py-4 px-6 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {items && items.length > 0 ? items.map((item: any) => (
                                            <tr key={item.id} className="text-sm group hover:bg-neutral-50/30 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-lg bg-neutral-100 flex-shrink-0 overflow-hidden border border-neutral-100">
                                                            {(item.products?.image_url || item.products?.gallery_images?.[0]) ? (
                                                                <img
                                                                    src={item.products.image_url || item.products.gallery_images[0]}
                                                                    alt={item.product_name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-neutral-300">
                                                                    <ShoppingBag className="h-5 w-5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sai-charcoal">{item.product_name}</p>
                                                            {item.metadata?.selectedVariation && (
                                                                <p className="text-[11px] text-sai-gray mt-0.5">{item.metadata.selectedVariation}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className="px-2 py-0.5 bg-neutral-100 rounded-md text-xs font-bold text-sai-charcoal">x{item.quantity}</span>
                                                </td>
                                                <td className="py-4 px-6 text-right text-sai-gray">
                                                    {formatCurrency(item.price_at_purchase)}
                                                </td>
                                                <td className="py-4 px-6 text-right font-bold text-sai-charcoal">
                                                    {formatCurrency(item.price_at_purchase * item.quantity)}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="py-12 text-center text-neutral-400 italic">No items found for this order.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot className="bg-neutral-50/30 border-t border-neutral-100">
                                        <tr>
                                            <td colSpan={3} className="py-4 px-6 text-right font-bold text-sai-gray uppercase tracking-widest text-[10px]">Grand Total</td>
                                            <td className="py-4 px-6 text-right text-xl font-bold text-sai-pink">{formatCurrency(order.total_amount)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Bottom Receipt Edge Visual */}
                        <div className="h-4 bg-white relative">
                            <div className="absolute inset-0 flex">
                                {Array.from({ length: 40 }).map((_, i) => (
                                    <div key={i} className="flex-1 h-3 bg-neutral-50 rotate-45 transform translate-y-1.5 translate-x-1 border border-neutral-100"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Information Cards */}
                <div className="w-full lg:w-80 space-y-6">
                    {/* Fulfillment Details Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
                        <div className="p-6 border-b border-neutral-50 bg-neutral-50/50">
                            <h3 className="font-bold text-sai-charcoal flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-sai-pink" /> Fulfillment Detail
                            </h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-2">Service Type</span>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-sai-pink/10 text-sai-pink rounded-lg text-xs font-bold capitalize">
                                        {order.delivery_type || "Standard Service"}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-2">Schedule</span>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-sm text-sai-gray">
                                        <Calendar className="h-4 w-4 text-neutral-300" />
                                        <span className="font-medium">{order.delivery_date ? format(new Date(order.delivery_date), "EEEE, MMM do") : "Not Scheduled"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-sai-gray">
                                        <Clock className="h-4 w-4 text-neutral-300" />
                                        <span className="font-medium">{order.delivery_slot || "No Slot Selected"}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-2">Payment Method</span>
                                <div className="flex items-center gap-3 text-sm text-sai-gray">
                                    <div className="h-8 w-12 rounded border border-neutral-100 bg-neutral-50 flex items-center justify-center text-[10px] font-bold uppercase text-neutral-400">
                                        {order.payment_method === 'stripe' ? 'Online' : 'Manual'}
                                    </div>
                                    <span className="font-medium capitalize">{order.payment_method || "Manual Payment"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
                        <div className="p-6 border-b border-neutral-50 bg-neutral-50/50">
                            <h3 className="font-bold text-sai-charcoal flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-sai-pink" /> Shipping Address
                            </h3>
                        </div>
                        <div className="p-6">
                            {address ? (
                                <div className="space-y-3">
                                    <div className="pb-3 border-b border-neutral-50">
                                        <p className="text-sm font-bold text-sai-charcoal">{address.first_name} {address.last_name}</p>
                                        <p className="text-xs text-sai-gray mt-1">{address.phone || "No phone provided"}</p>
                                    </div>
                                    <div className="text-sm text-sai-gray leading-relaxed font-medium">
                                        {address.address_line1}<br />
                                        {address.address_line2 && <>{address.address_line2}<br /></>}
                                        {address.city}, {address.state} {address.postcode}
                                    </div>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address.address_line1} ${address.city} ${address.state} ${address.postcode}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs text-sai-pink font-bold hover:underline pt-2"
                                    >
                                        View on Map <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="bg-neutral-50 h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <ShoppingBag className="h-5 w-5 text-neutral-300" />
                                    </div>
                                    <p className="text-[11px] text-neutral-400 italic">Self Pickup - No delivery address on file.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    /* PREVENT OVERLAP: Hide absolutely every piece of the admin shell */
                    nav, 
                    aside, 
                    footer, 
                    header, 
                    button,
                    .no-print,
                    .border-b.border-neutral-200,
                    /* Target the sidebar wrappers in AdminShell */
                    div.transition-all.duration-300.ease-in-out.shrink-0,
                    div.absolute.top-0.left-0.h-full.w-\\[260px\\],
                    button.absolute.top-6.left-6,
                    /* Target any element that looks like a sidebar */
                    [class*="sidebar"],
                    [class*="Sidebar"],
                    [class*="AdminShell"] button {
                        display: none !important;
                        width: 0 !important;
                        height: 0 !important;
                        opacity: 0 !important;
                        pointer-events: none !important;
                    }

                    /* ROOT LEVEL RESET */
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        height: auto !important;
                        width: 100% !important;
                        overflow: visible !important;
                        background: white !important;
                        position: static !important;
                    }

                    /* SHELL RESET: Force the flex wrapper to be a simple block */
                    div.flex.h-screen.bg-neutral-50 {
                        display: block !important;
                        position: static !important;
                        height: auto !important;
                        width: 100% !important;
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }

                    /* MAIN CONTENT RESET: Kill padding and offsets */
                    main {
                        display: block !important;
                        position: static !important;
                        width: 100% !important;
                        height: auto !important;
                        margin: 0 !important;
                        padding: 10mm !important; /* Proper physical page margin */
                        overflow: visible !important;
                    }

                    /* Kill the "pl-16" or "w-full" overrides from AdminShell */
                    main > div {
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }

                    /* RECEIPT CONTAINER: Force visibility and width */
                    .max-w-\\[1000px\\] {
                        max-width: 100% !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    /* TABLE FORCING: Ensure every column is visible */
                    table {
                        width: 100% !important;
                        table-layout: auto !important;
                        border-collapse: collapse !important;
                    }
                    
                    th, td {
                        visibility: visible !important;
                        opacity: 1 !important;
                        display: table-cell !important;
                        padding: 8px !important;
                        border-bottom: 1px solid #eee !important;
                        text-align: left !important;
                    }

                    /* Explicitly force the center and right alignments back for Qty/Price */
                    th.text-center, td.text-center { text-align: center !important; }
                    th.text-right, td.text-right { text-align: right !important; }

                    /* TEXT & BORDER: High contrast for paper */
                    * {
                        color: black !important;
                        background: transparent !important;
                        box-shadow: none !important;
                        text-shadow: none !important;
                        border-radius: 0 !important;
                    }

                    .border, .border-neutral-100, .border-neutral-200 {
                        border: 1px solid #ddd !important;
                    }

                    /* IMAGES: Keep them meaningful but small */
                    img {
                        display: block !important;
                        max-width: 50px !important;
                        max-height: 50px !important;
                        object-fit: contain !important;
                    }

                    /* Split layout: Force stacked for better width utilization */
                    .flex-col.lg\\:flex-row {
                        display: block !important;
                        width: 100% !important;
                    }

                    .flex-1 { width: 100% !important; }
                    .w-full.lg\\:w-80 { 
                        width: 100% !important; 
                        margin-top: 30px !important; 
                        display: block !important;
                    }
                }
            `}} />
        </div>
    );
}
