import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, Filter, Bell, ChevronDown } from "lucide-react";
import Image from "next/image";
import { ExcelExportButton } from "../_components/ExcelExportButton";

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

            {/* Filter and Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Filter by product name, SKU..."
                            className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sai-pink/20"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-sai-charcoal hover:bg-neutral-50 transition-colors bg-white whitespace-nowrap">
                        All Categories
                        <ChevronDown className="h-4 w-4 text-neutral-400" />
                    </button>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <ExcelExportButton
                        data={products?.map(p => ({
                            ID: p.id,
                            SKU: `${p.product_type?.slice(0, 2).toUpperCase() || 'XX'}-${p.id.slice(0, 6).toUpperCase()}`,
                            Name: p.name,
                            Category: p.category_id || 'Uncategorized',
                            BasePrice: p.base_price,
                            Available: p.is_available
                        })) || []}
                        columns={[
                            { header: "Product ID", key: "ID", width: 36, type: "text" },
                            { header: "SKU", key: "SKU", width: 15, type: "text" },
                            { header: "Product Name", key: "Name", width: 30, type: "text" },
                            { header: "Category", key: "Category", width: 20, type: "text" },
                            { header: "Base Price", key: "BasePrice", width: 15, type: "currency" },
                            { header: "Available", key: "Available", width: 15, type: "boolean" }
                        ]}
                        filename="Products_Inventory"
                        sheetName="Products"
                    />
                    <Link
                        href="/admin/products/new"
                        className="flex items-center justify-center gap-2 px-6 py-2 bg-sai-pink rounded-lg text-sm font-semibold text-white hover:bg-[#e67fa0] transition-colors shadow-sm w-full sm:w-auto"
                    >
                        <Plus className="h-4 w-4" />
                        Add New Product
                    </Link>
                </div>
            </div>

            {/* Products Table */}
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-100">
                                <th className="py-5 px-6 w-12 text-center text-[11px] font-bold text-sai-gray uppercase tracking-widest">
                                    <input type="checkbox" className="rounded border-neutral-300 text-sai-pink focus:ring-sai-pink" />
                                </th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Product Info</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Category</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Base Price</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Premium Price</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Status</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products?.map((product) => (
                                <tr key={product.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors">
                                    <td className="py-4 px-6 text-center">
                                        <input type="checkbox" className="rounded border-neutral-300 text-sai-pink focus:ring-sai-pink" />
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-4">
                                            {product.image_url ? (
                                                <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0">
                                                    <Image
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-14 w-14 rounded-xl bg-neutral-100 border border-neutral-200 flex-shrink-0 flex items-center justify-center text-neutral-400 text-xs text-center p-1">
                                                    No Img
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-serif font-bold text-sai-charcoal text-base">{product.name}</p>
                                                <p className="text-xs font-medium text-neutral-400 mt-0.5">
                                                    SKU: {product.product_type.slice(0, 2).toUpperCase()}-{product.id.slice(0, 6).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold capitalize border ${getCategoryStyles(product.category_id)}`}>
                                            {product.category_id?.replace("-", " ") || "No Category"}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 font-medium text-neutral-600 whitespace-nowrap">
                                        {formatCurrency(product.base_price)}
                                    </td>
                                    <td className="py-4 px-6 font-bold text-sai-charcoal whitespace-nowrap">
                                        {product.category_id?.includes('cake')
                                            ? formatCurrency(Math.floor(product.base_price * 1.5)) // Placeholder premium calculation
                                            : "-"}
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-9 h-5 rounded-full flex items-center p-1 transition-colors ${product.is_available ? 'bg-sai-pink' : 'bg-neutral-200'}`}>
                                                <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform ${product.is_available ? 'translate-x-full' : 'translate-x-0'}`}></div>
                                            </div>
                                            <span className={`text-xs font-semibold ${product.is_available ? 'text-sai-charcoal' : 'text-neutral-400'}`}>
                                                {product.is_available ? "In Stock" : "Unavailable"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link
                                                href={`/admin/products/${product.id}/edit`}
                                                className="p-2 text-neutral-400 hover:text-sai-charcoal transition-colors hover:bg-neutral-100 rounded-lg"
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                            <button
                                                className="p-2 text-neutral-400 hover:text-red-600 transition-colors hover:bg-red-50 rounded-lg"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!products || products.length === 0) && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                        No products found. Add your first product to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="border-t border-neutral-100 p-4 flex items-center justify-between text-sm text-sai-gray">
                    <span>Showing <b>1</b> to <b>{products?.length || 0}</b> of <b>{products?.length || 0}</b> results</span>
                    <div className="flex gap-1">
                        <button className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50" disabled>&lt;</button>
                        <button className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50" disabled>&gt;</button>
                    </div>
                </div>
            </div>

            <div className="text-center text-xs font-medium text-neutral-400 pb-8">
                © {new Date().getFullYear()} Sugar and Icing. All rights reserved.
            </div>
        </div>
    );
}
