import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format } from "date-fns";
import { Search, Filter, CloudDownload, ChevronRight } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { ExcelExportButton } from "../_components/ExcelExportButton";

export const metadata = {
    title: "Customers Management - Admin",
};

export default async function AdminCustomersPage() {
    const supabase = await createClient();

    const { data: customers } = await supabase
        .from("profiles")
        .select(`
            id,
            first_name,
            last_name,
            email,
            phone,
            avatar_url,
            created_at,
            orders:orders(count)
        `)
        .order("created_at", { ascending: false });

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
                    <h1 className="text-3xl font-serif font-bold text-sai-charcoal">Customers Management</h1>
                    <div className="flex items-center gap-2 mt-1 text-sm font-medium text-sai-gray">
                        <span>Dashboard</span>
                        <span className="text-neutral-300">›</span>
                        <span className="text-sai-charcoal">Customers</span>
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
                        placeholder="Search by customer name, email..."
                        className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sai-pink/20"
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <button className="flex-1 lg:flex-none flex items-center justify-between gap-3 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-sai-charcoal hover:bg-neutral-50 transition-colors bg-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-neutral-400" />
                            <span>Status: Active</span>
                        </div>
                        <span className="text-neutral-400 text-xs">▼</span>
                    </button>

                    <ExcelExportButton
                        data={customers?.map((customer) => {
                            const firstName = customer?.first_name || "";
                            const lastName = customer?.last_name || "";
                            const orderAggregate = customer.orders as unknown as Array<{ count: number }>;
                            return {
                                ID: customer.id,
                                Name: `${firstName} ${lastName}`.trim() || customer.email || "Unknown",
                                Email: customer.email || "",
                                Phone: customer.phone || "--",
                                Joined_Date: customer.created_at || null,
                                Total_Orders: orderAggregate?.[0]?.count || 0
                            };
                        }) || []}
                        columns={[
                            { header: "Customer ID", key: "ID", width: 36, type: "text" },
                            { header: "Name", key: "Name", width: 30, type: "text" },
                            { header: "Email", key: "Email", width: 30, type: "text" },
                            { header: "Phone", key: "Phone", width: 20, type: "text" },
                            { header: "Joined Date", key: "Joined_Date", width: 15, type: "date" },
                            { header: "Total Orders", key: "Total_Orders", width: 15, type: "number" }
                        ]}
                        filename="Customers_Export"
                        sheetName="Customers"
                    />
                </div>
            </div>

            {/* Customers Table */}
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden mt-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-100">
                                <th className="py-5 px-6 w-12 text-center text-[11px] font-bold text-sai-gray uppercase tracking-widest">
                                    <input type="checkbox" className="rounded border-neutral-300 text-sai-pink focus:ring-sai-pink" />
                                </th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Customer Info</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Phone</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Joined Date</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap text-center">Total Orders</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap text-center">Status</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers?.map((customer, index) => {
                                const firstName = customer?.first_name || "";
                                const lastName = customer?.last_name || "";
                                const email = customer?.email || "";
                                const customerName = firstName || lastName
                                    ? `${firstName} ${lastName}`.trim()
                                    : email || "Unknown Customer";

                                const initials = getInitials(firstName, lastName, email);
                                const colorClass = avatarColors[index % avatarColors.length];

                                // Real Orders count from Supabase relation
                                const orderAggregate = customer.orders as unknown as Array<{ count: number }>;
                                const realOrdersCount = orderAggregate?.[0]?.count || 0;
                                const isActive = realOrdersCount > 0;

                                return (
                                    <tr key={customer.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors group">
                                        <td className="py-4 px-6 text-center">
                                            <input type="checkbox" className="rounded border-neutral-300 text-sai-pink focus:ring-sai-pink" />
                                        </td>
                                        <td className="py-4 px-6">
                                            <Link href={`/admin/customers/${customer.id}`} className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${customer?.avatar_url ? 'bg-transparent' : colorClass}`}>
                                                    {customer?.avatar_url ? (
                                                        <img src={customer.avatar_url} alt={customerName} className="w-full h-full object-cover rounded-full" />
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
                                            <p className="text-[13px] font-medium text-sai-charcoal">
                                                {customer.phone || "--"}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <p className="text-[13px] font-medium text-sai-charcoal">
                                                {customer.created_at ? format(new Date(customer.created_at), "MMM do, yyyy") : "--"}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-center">
                                            <span className="inline-block px-3 py-1 bg-neutral-100 rounded-lg text-sm font-bold text-sai-charcoal">
                                                {realOrdersCount}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${isActive ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-neutral-100 text-neutral-500 border border-neutral-200'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-neutral-400'}`}></div>
                                                {isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-right">
                                            <Link
                                                href={`/admin/customers/${customer.id}`}
                                                className="inline-flex items-center justify-center p-2 text-neutral-400 hover:text-sai-pink transition-colors hover:bg-pink-50 rounded-lg"
                                                title="View Profile"
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                            {(!customers || customers.length === 0) && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground bg-white">
                                        No customers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="border-t border-neutral-100 p-4 flex items-center justify-between text-sm text-sai-gray">
                    <span>Showing <b>1</b> to <b>{customers?.length || 0}</b> of <b>{customers?.length || 0}</b> results</span>
                    <div className="flex gap-2">
                        <button className="w-8 h-8 flex items-center justify-center border border-neutral-200 bg-white rounded-lg hover:bg-neutral-50 text-sai-gray disabled:opacity-50" disabled>&lt;</button>
                        <button className="w-8 h-8 flex items-center justify-center bg-sai-pink text-white rounded-lg font-bold shadow-sm">1</button>
                        <button className="w-8 h-8 flex items-center justify-center border border-neutral-200 bg-white rounded-lg hover:bg-neutral-50 text-sai-gray">&gt;</button>
                    </div>
                </div>
            </div>

            <div className="text-center text-xs font-medium text-neutral-400 pb-8">
                © {new Date().getFullYear()} Sugar and Icing. All rights reserved.
            </div>
        </div>
    );
}
