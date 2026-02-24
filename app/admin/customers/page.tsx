import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format } from "date-fns";
import { Search, Filter, CloudDownload, ChevronRight } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { ExcelExportButton } from "../_components/ExcelExportButton";
import { CustomersInteractiveTable } from "./_components/CustomersInteractiveTable";

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
            username,
            email,
            phone,
            avatar_url,
            created_at
        ` as any)
        .eq('role', 'customer')
        .order("created_at", { ascending: false });

    // Separate fetch to aggregate order counts + total spent (client-side aggregation, fine for < 1000 users)
    const { data: allOrders } = await supabase
        .from("orders")
        .select("user_id, total_amount, status");

    const orderCounts: Record<string, number> = {};
    const totalSpent: Record<string, number> = {};

    for (const order of (allOrders || [])) {
        if (!order.user_id) continue;
        orderCounts[order.user_id] = (orderCounts[order.user_id] || 0) + 1;
        // Only sum completed/delivered orders for the "Total Spent" VIP metric
        if (['paid', 'processing', 'shipped', 'delivered', 'completed'].includes(order.status)) {
            totalSpent[order.user_id] = (totalSpent[order.user_id] || 0) + (order.total_amount || 0);
        }
    }

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
                        <span className="text-sai-pink">Customers</span>
                    </div>
                </div>
            </div>

            <CustomersInteractiveTable customers={(customers || []) as any} orderCounts={orderCounts} totalSpent={totalSpent} />

            <div className="text-center text-xs font-medium text-neutral-400 pb-8">
                © {new Date().getFullYear()} Sugar and Icing. All rights reserved.
            </div>
        </div>
    );
}
