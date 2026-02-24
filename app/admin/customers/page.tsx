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

    // Separate fetch to aggregate order counts manually due to no explicit FK relation from profiles to orders
    const { data: allOrders } = await supabase
        .from("orders")
        .select("user_id");

    const orderCounts = (allOrders || []).reduce((acc: Record<string, number>, order) => {
        if (order.user_id) {
            acc[order.user_id] = (acc[order.user_id] || 0) + 1;
        }
        return acc;
    }, {});

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

            <CustomersInteractiveTable customers={(customers || []) as any} orderCounts={orderCounts} />

            <div className="text-center text-xs font-medium text-neutral-400 pb-8">
                © {new Date().getFullYear()} Sugar and Icing. All rights reserved.
            </div>
        </div>
    );
}
