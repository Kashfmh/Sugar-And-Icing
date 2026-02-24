import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";
import { OrdersInteractiveTable } from "./_components/OrdersInteractiveTable";

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

            <OrdersInteractiveTable orders={orders || []} />
        </div>
    );
}
