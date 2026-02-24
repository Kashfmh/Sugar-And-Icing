import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";
import { Search, Calendar, Filter, CloudDownload, User } from "lucide-react";
import { ExcelExportButton } from "../_components/ExcelExportButton";

export default async function AdminOrdersPage() {
    const supabase = await createClient();

    const { data: orders } = await supabase
        .from("orders")
        .select(`
      id,
      status,
      total_amount,
      created_at,
      profiles:user_id (
        first_name,
        last_name,
        email,
        avatar_url
      )
    `)
        .order("created_at", { ascending: false });

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-orange-50 text-orange-600 border border-orange-200';
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

    // Helper to extract initials safely
    const getInitials = (firstName: string, lastName: string, email: string) => {
        if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
        if (firstName) return firstName.slice(0, 2).toUpperCase();
        if (email) return email.slice(0, 2).toUpperCase();
        return "??";
    };

    // Array of nice pastel background colors for text avatars
    const avatarColors = [
        'bg-pink-100 text-pink-600',
        'bg-purple-100 text-purple-600',
        'bg-teal-100 text-teal-600',
        'bg-orange-100 text-orange-600',
        'bg-indigo-100 text-indigo-600'
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-sai-charcoal">Orders Management</h1>
                    <div className="flex items-center gap-2 mt-1 text-sm font-medium text-sai-gray">
                        <span>Home</span>
                        <span className="text-neutral-300">›</span>
                        <span className="text-sai-pink">Orders</span>
                    </div>
                </div>
            </div>

            {/* Filter and Action Bar Container */}
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 w-full lg:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Customer Name"
                        className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sai-pink/20"
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <button className="flex-1 lg:flex-none flex items-center justify-between gap-3 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-sai-charcoal hover:bg-neutral-50 transition-colors bg-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-neutral-400" />
                            <span>Oct 1 - Oct 31</span>
                        </div>
                        <span className="text-neutral-400 text-xs">▼</span>
                    </button>

                    <button className="flex-1 lg:flex-none flex items-center justify-between gap-3 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-sai-charcoal hover:bg-neutral-50 transition-colors bg-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-neutral-400" />
                            <span>Status: All</span>
                        </div>
                        <span className="text-neutral-400 text-xs">▼</span>
                    </button>

                    <ExcelExportButton
                        data={orders?.map(order => {
                            const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
                            const customerName = profile
                                ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.email
                                : "Unknown";
                            return {
                                OrderID: order.id,
                                Customer: customerName,
                                Date: order.created_at,
                                TotalAmount: order.total_amount,
                                Status: order.status
                            };
                        }) || []}
                        columns={[
                            { header: "Order ID", key: "OrderID", width: 36, type: "text" },
                            { header: "Customer Name", key: "Customer", width: 30, type: "text" },
                            { header: "Date", key: "Date", width: 15, type: "date" },
                            { header: "Total Amount", key: "TotalAmount", width: 15, type: "currency" },
                            { header: "Status", key: "Status", width: 15, type: "text" }
                        ]}
                        filename="Orders_Export"
                        sheetName="Orders"
                    />
                </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden mt-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-100">
                                <th className="py-5 px-6 w-12 text-center text-[11px] font-bold text-sai-gray uppercase tracking-widest">
                                    <input type="checkbox" className="rounded border-neutral-300 text-sai-pink focus:ring-sai-pink" />
                                </th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Order ID</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Customer</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Date</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Items (Mock)</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Total</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders?.map((order, index) => {
                                const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
                                const firstName = profile?.first_name || "";
                                const lastName = profile?.last_name || "";
                                const email = profile?.email || "";
                                const customerName = firstName || lastName
                                    ? `${firstName} ${lastName}`.trim()
                                    : email || "Unknown Customer";

                                const initials = getInitials(firstName, lastName, email);
                                const colorClass = avatarColors[index % avatarColors.length];

                                return (
                                    <tr key={order.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors cursor-pointer group">
                                        <td className="py-4 px-6 text-center">
                                            <input type="checkbox" className="rounded border-neutral-300 text-sai-pink focus:ring-sai-pink" />
                                        </td>
                                        <td className="py-4 px-6">
                                            <Link href={`/admin/orders/${order.id}`} className="block">
                                                <span className="font-bold text-sm text-sai-charcoal whitespace-nowrap group-hover:text-sai-pink transition-colors">
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${profile?.avatar_url ? 'bg-transparent' : colorClass}`}>
                                                    {profile?.avatar_url ? (
                                                        <img src={profile.avatar_url} alt={customerName} className="w-full h-full object-cover rounded-full" />
                                                    ) : (
                                                        initials
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-sai-charcoal group-hover:text-sai-pink transition-colors">{customerName}</p>
                                                    <p className="text-xs text-sai-gray">{email}</p>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <Link href={`/admin/orders/${order.id}`} className="block">
                                                <p className="text-[13px] font-semibold text-sai-charcoal">
                                                    {format(new Date(order.created_at), "MMM dd,")}
                                                </p>
                                                <p className="text-[12px] text-sai-gray">
                                                    {format(new Date(order.created_at), "yyyy")}
                                                </p>
                                            </Link>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <Link href={`/admin/orders/${order.id}`} className="block text-[13px] font-medium text-sai-gray max-w-[200px] truncate">
                                                {/* Mock data to match screenshot since we don't fetch line items here yet */}
                                                Assorted Cupcakes, Cookies...
                                            </Link>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <Link href={`/admin/orders/${order.id}`} className="block font-serif font-bold text-sai-charcoal">
                                                {formatCurrency(order.total_amount)}
                                            </Link>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-center">
                                            <Link href={`/admin/orders/${order.id}`} className="block">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide capitalize ${getStatusStyle(order.status)}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${getStatusStyle(order.status).split(' ')[1].replace('text-', 'bg-')}`}></div>
                                                    {order.status.replace("_", " ")}
                                                </span>
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                            {(!orders || orders.length === 0) && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground bg-white">
                                        No orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="border-t border-neutral-100 p-4 flex items-center justify-between text-sm text-sai-gray">
                    <span>Showing <b>1</b> to <b>{orders?.length || 0}</b> of <b>128</b> results</span>
                    <div className="flex gap-2">
                        <button className="w-8 h-8 flex items-center justify-center border border-neutral-200 bg-white rounded-lg hover:bg-neutral-50 text-sai-gray disabled:opacity-50" disabled>&lt;</button>
                        <button className="w-8 h-8 flex items-center justify-center bg-sai-pink text-white rounded-lg font-bold shadow-sm">1</button>
                        <button className="w-8 h-8 flex items-center justify-center border border-neutral-200 bg-white rounded-lg hover:bg-neutral-50 text-sai-charcoal font-medium">2</button>
                        <button className="w-8 h-8 flex items-center justify-center border border-neutral-200 bg-white rounded-lg hover:bg-neutral-50 text-sai-charcoal font-medium">3</button>
                        <span className="w-8 h-8 flex items-center justify-center text-sai-gray font-medium">...</span>
                        <button className="w-8 h-8 flex items-center justify-center border border-neutral-200 bg-white rounded-lg hover:bg-neutral-50 text-sai-charcoal font-medium">12</button>
                        <button className="w-8 h-8 flex items-center justify-center border border-neutral-200 bg-white rounded-lg hover:bg-neutral-50 text-sai-gray">&gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
