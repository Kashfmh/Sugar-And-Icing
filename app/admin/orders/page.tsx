import { createClient } from "@/lib/supabase/server";
import { OrdersInteractiveTable } from "./_components/OrdersInteractiveTable";

export default async function AdminOrdersPage() {
    const supabase = await createClient();

    // @ts-ignore - delivery_type, delivery_date exist in DB but not in generated types
    const { data: rawOrders, error: ordersError } = await (supabase
        .from("orders") as any)
        .select("id, status, total_amount, created_at, user_id, delivery_type, delivery_date, order_items(quantity)")
        .order("created_at", { ascending: false });

    if (ordersError) {
        console.error("[Admin Orders] Failed to fetch orders:", ordersError.message);
    }

    // Fetch profiles separately to avoid FK join issues
    const userIds = [...new Set((rawOrders || []).map((o: any) => o.user_id).filter(Boolean))];
    const { data: profilesData } = userIds.length > 0
        ? await (supabase
            .from("profiles") as any)
            .select("id, first_name, last_name, email, username, avatar_url")
            .in("id", userIds)
        : { data: [] };

    const profilesMap = Object.fromEntries((profilesData || []).map((p: any) => [p.id, p]));

    const orders = (rawOrders || []).map((order: any) => {
        const itemsCount = (order.order_items || []).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        return {
            ...order,
            profiles: profilesMap[order.user_id] || null,
            item_count: itemsCount,
        };
    });

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

            <OrdersInteractiveTable orders={orders || []} />
        </div>
    );
}
