import { createClient } from "@/lib/supabase/server";
import { formatCurrency, getInitials } from "@/lib/utils";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { ChevronRight, Edit2, Mail, Search, Filter, User, ShoppingBag, AlertCircle } from "lucide-react";

export const metadata = {
    title: "Customer Details - Admin",
};

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: customer, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !customer) {
        notFound();
    }

    const { data: ordersData } = await supabase
        .from("orders")
        .select(`
      id,
      status,
      total_amount,
      created_at
    `)
        .eq("user_id", id)
        .order("created_at", { ascending: false });

    // Fetch primary address
    const { data: primaryAddress } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", id)
        .order("is_default", { ascending: false })
        .limit(1)
        .single();

    const fullName = `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "Unknown Customer";

    // Use username if available
    const customerData = customer as any;
    const displayUsername = customerData.username ? `@${customerData.username}` : fullName;

    const orders = ordersData || [];

    // Real Data Calculations
    const totalOrders = orders.length;
    const lifetimeValue = orders
        .filter(o => ['completed', 'delivered', 'paid'].includes(o.status))
        .reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? (lifetimeValue / totalOrders) : 0;

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 pb-12">

            {/* Page Header matching Customers Management */}
            <div className="border-b border-neutral-200 pb-6">
                <h1 className="text-3xl font-serif font-bold text-sai-charcoal">Customers Management</h1>
                <div className="flex items-center gap-2 mt-1 text-sm font-medium text-sai-gray">
                    <Link href="/admin" className="hover:text-sai-charcoal transition-colors">Dashboard</Link>
                    <span className="text-neutral-300">›</span>
                    <Link href="/admin/customers" className="hover:text-sai-charcoal transition-colors">Customers</Link>
                    <span className="text-neutral-300">›</span>
                    <span className="text-sai-pink px-1">{displayUsername}</span>
                </div>
            </div>

            {/* Main Header Card with solid pink banner */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden relative mt-2">
                <div className="h-24 bg-sai-pink w-full border-b border-sai-pink/20"></div>

                <div className="px-8 pb-8 pt-4 relative">
                    {/* Avatar Overlap */}
                    <div className="absolute -top-12 left-8">
                        <div className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-sm flex items-center justify-center relative">
                            {customer.avatar_url ? (
                                <img src={customer.avatar_url} alt={fullName} className="h-full w-full object-cover rounded-full" />
                            ) : (
                                <div className="h-full w-full rounded-full flex items-center justify-center text-3xl font-serif text-sai-pink bg-pink-50">
                                    {getInitials(fullName)}
                                </div>
                            )}
                            {/* Active Status Badge Mock */}
                            <div className="absolute bottom-1 right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                    </div>

                    <div className="ml-32 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 h-12">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-sai-charcoal tracking-tight">{fullName}</h1>
                            <div className="text-sm text-neutral-500 mt-1 flex items-center gap-3">
                                <span className="flex items-center gap-1.5 border border-neutral-200 bg-neutral-50 px-2 py-0.5 rounded-md">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Joined</span>
                                    {customer.created_at ? format(new Date(customer.created_at), "MMM yyyy") : "Unknown"}
                                </span>
                                {primaryAddress?.city && (
                                    <span className="flex items-center gap-1.5 border border-neutral-200 bg-neutral-50 px-2 py-0.5 rounded-md">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Location</span>
                                        {primaryAddress.city}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                            <a href={`mailto:${customer.email}`} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-sai-pink text-white text-sm font-semibold rounded-lg hover:bg-sai-pink/90 transition-colors shadow-sm">
                                <Mail className="h-4 w-4" /> Email Customer
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-neutral-200/60 rounded-2xl p-6 border border-neutral-200 flex flex-col justify-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1">Lifetime Value</span>
                    <span className="text-2xl font-bold text-sai-charcoal">{formatCurrency(lifetimeValue)}</span>
                </div>
                <div className="bg-neutral-200/60 rounded-2xl p-6 border border-neutral-200 flex flex-col justify-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1">Total Orders</span>
                    <span className="text-2xl font-bold text-sai-charcoal">{totalOrders}</span>
                </div>
                <div className="bg-neutral-200/60 rounded-2xl p-6 border border-neutral-200 flex flex-col justify-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1">Avg Order Value</span>
                    <span className="text-2xl font-bold text-sai-charcoal">{formatCurrency(avgOrderValue)}</span>
                </div>
            </div>

            {/* Split Layout: Contact Details & Restrictions */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Contact & Shipping (Left, 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-serif font-bold text-sai-charcoal tracking-tight flex items-center gap-2 border-b border-neutral-100 pb-3">
                        <User className="h-5 w-5 text-sai-pink" /> Contact & Shipping
                    </h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1 block">Email Address</span>
                            <span className="text-sai-charcoal whitespace-nowrap overflow-hidden text-ellipsis block">{customer.email || "No email on record"}</span>
                        </div>
                        <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                            <span className="text-sai-charcoal">{customer.phone || <span className="text-neutral-400 italic">No phone number set</span>}</span>
                        </div>
                    </div>

                    <div className="bg-neutral-50 rounded-xl border border-neutral-100 p-5 relative">
                        {primaryAddress?.label && (
                            <div className="absolute top-4 right-4 bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase">
                                {primaryAddress.label}
                            </div>
                        )}
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-2 block">Primary Shipping Address</span>
                        <div className="text-sai-charcoal leading-relaxed">
                            {primaryAddress ? (
                                <>
                                    {primaryAddress.address_line1} {primaryAddress.address_line2 || ""}<br />
                                    {primaryAddress.city}, {primaryAddress.state} {primaryAddress.postcode}
                                </>
                            ) : (
                                <span className="text-neutral-400 italic">No shipping address on file.</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Dietary Restrictions (Right, 1/3) */}
                <div className="space-y-6">
                    <h2 className="text-xl font-serif font-bold text-sai-charcoal tracking-tight flex items-center gap-2 border-b border-neutral-100 pb-3">
                        <AlertCircle className="h-5 w-5 text-sai-pink" /> Dietary Restrictions
                    </h2>

                    <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
                        <p className="text-sm text-neutral-500 mb-5 leading-relaxed">
                            Customer has specified the following dietary requirements for all orders.
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {customer.dietary_restrictions && customer.dietary_restrictions.length > 0 ? (
                                customer.dietary_restrictions.map((restriction: string, idx: number) => (
                                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-neutral-600 border border-neutral-200 rounded-full text-xs font-bold whitespace-nowrap capitalize">
                                        {restriction}
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-neutral-400 italic block py-2">No dietary restrictions set.</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Order History Table */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-4 mt-12">
                    <h2 className="text-xl font-serif font-bold text-sai-charcoal tracking-tight">Order History</h2>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                className="pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-sai-pink/20 focus:border-sai-pink transition-all shadow-sm"
                            />
                        </div>
                        <button className="p-2 border border-neutral-200 rounded-lg text-neutral-500 hover:bg-neutral-50 bg-white shadow-sm transition-colors">
                            <Filter className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                    {orders.length === 0 ? (
                        <div className="p-12 text-center text-neutral-500 flex flex-col items-center justify-center">
                            <div className="bg-neutral-50 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                                <ShoppingBag className="h-6 w-6 text-neutral-400" />
                            </div>
                            <h3 className="font-semibold text-sai-charcoal mb-1">No Orders Found</h3>
                            <p className="text-sm">This customer hasn't placed any orders yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-neutral-50/80 text-neutral-500 text-[11px] uppercase font-bold tracking-wider border-b border-neutral-200">
                                    <tr>
                                        <th className="py-4 px-6 font-semibold">Order ID</th>
                                        <th className="py-4 px-6 font-semibold">Date</th>
                                        <th className="py-4 px-6 font-semibold">Status</th>
                                        <th className="py-4 px-6 font-semibold">Total</th>
                                        <th className="py-4 px-6 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {orders.map((order: any) => (
                                        <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors group">
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span className="font-medium text-sai-charcoal bg-neutral-100 px-2.5 py-1 rounded-md text-xs font-mono">
                                                    #{order.id.slice(0, 8)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-neutral-600 whitespace-nowrap">
                                                {format(new Date(order.created_at), "MMM d, yyyy")}
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'delivered' || order.status === 'completed' || order.status === 'paid'
                                                    ? 'bg-[#d1f4e0] text-[#147a46]'
                                                    : order.status === 'pending' || order.status === 'processing'
                                                        ? 'bg-[#fff0c2] text-[#916a00]'
                                                        : order.status === 'cancelled' || order.status === 'refunded'
                                                            ? 'bg-neutral-200 text-neutral-600'
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {order.status.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 font-bold text-sai-charcoal whitespace-nowrap">
                                                {formatCurrency(order.total_amount)}
                                            </td>
                                            <td className="py-4 px-6 text-right whitespace-nowrap">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="inline-flex items-center justify-center py-1.5 px-3 rounded-lg text-xs font-semibold text-sai-pink bg-pink-50 hover:bg-sai-pink hover:text-white transition-colors"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

