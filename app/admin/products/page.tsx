import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Search, Bell } from "lucide-react";
import { ProductsInteractiveTable } from "./_components/ProductsInteractiveTable";

export default async function AdminProductsPage() {
    const supabase = await createClient();

    const { data: products } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

    // Helper to get category badge colors
    const getCategoryStyles = (categoryId: string | null) => {
        const cat = categoryId?.toLowerCase() || '';
        if (cat.includes('cake')) return 'bg-pink-50 text-pink-600 border-pink-100';
        if (cat.includes('cookie')) return 'bg-orange-50 text-orange-600 border-orange-100';
        if (cat.includes('cupcake')) return 'bg-purple-50 text-purple-600 border-purple-100';
        if (cat.includes('pastry') || cat.includes('pastries')) return 'bg-teal-50 text-teal-600 border-teal-100';
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Top Header Row (Breadcrumbs & Global Search concept) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-sai-charcoal">Products Management</h1>
                    <div className="flex items-center gap-2 mt-1 text-sm font-medium text-sai-gray">
                        <span>Dashboard</span>
                        <span className="text-neutral-300">›</span>
                        <span className="text-sai-pink">Products</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Global search..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sai-pink/20"
                        />
                    </div>
                    <button className="relative p-2 text-neutral-400 hover:text-neutral-600 transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-sai-pink rounded-full border-2 border-neutral-50"></span>
                    </button>
                </div>
            </div>

            <ProductsInteractiveTable products={products || []} />

            <div className="text-center text-xs font-medium text-neutral-400 pb-8">
                © {new Date().getFullYear()} Sugar and Icing. All rights reserved.
            </div>
        </div>
    );
}
