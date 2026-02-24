"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Edit, Trash2, Check, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ExcelExportButton } from "../../_components/ExcelExportButton";
import SharedSearchBar from "@/app/components/ui/SharedSearchBar";
import SharedFilterDropdown from "@/app/components/ui/SharedFilterDropdown";
import SharedPagination from "@/app/components/ui/SharedPagination";

type ProductRow = {
    id: string;
    name: string;
    product_type: string;
    category_id: string | null;
    base_price: number;
    is_available: boolean | null;
    image_url: string | null;
};

interface ProductsInteractiveTableProps {
    products: ProductRow[];
}

export function ProductsInteractiveTable({ products }: ProductsInteractiveTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const getCategoryStyles = (categoryId: string | null) => {
        const cat = categoryId?.toLowerCase() || '';
        if (cat.includes('cake')) return 'bg-pink-50 text-pink-600 border-pink-100';
        if (cat.includes('cookie')) return 'bg-orange-50 text-orange-600 border-orange-100';
        if (cat.includes('cupcake')) return 'bg-purple-50 text-purple-600 border-purple-100';
        if (cat.includes('pastry') || cat.includes('pastries')) return 'bg-teal-50 text-teal-600 border-teal-100';
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
    };

    // Filter logic
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const searchLower = searchQuery.toLowerCase();
            const sku = `${product.product_type?.slice(0, 2).toUpperCase() || 'XX'}-${product.id.slice(0, 6).toUpperCase()}`;

            const matchesSearch =
                product.name.toLowerCase().includes(searchLower) ||
                sku.toLowerCase().includes(searchLower) ||
                product.id.toLowerCase().includes(searchLower);

            const matchesCategory = categoryFilter === "All" || product.category_id === categoryFilter;

            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, categoryFilter]);

    // Unique Categories for dropdown
    const uniqueCategories = useMemo(() => {
        const cats = new Set(products.map(p => p.category_id).filter(Boolean));
        return Array.from(cats) as string[];
    }, [products]);

    // Export Data mapping
    const exportData = useMemo(() => {
        return filteredProducts.map(p => ({
            ID: p.id,
            SKU: `${p.product_type?.slice(0, 2).toUpperCase() || 'XX'}-${p.id.slice(0, 6).toUpperCase()}`,
            Name: p.name,
            Category: p.category_id || 'Uncategorized',
            BasePrice: p.base_price,
            Available: p.is_available ?? false
        }));
    }, [filteredProducts]);

    // Pagination slice
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = useMemo(() => {
        return filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredProducts, currentPage, itemsPerPage]);

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, categoryFilter]);

    // Selection logic
    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedProducts.length && paginatedProducts.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedProducts.map(p => p.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    return (
        <>
            {/* Filter and Action Bar Container */}
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                {/* Search Bar */}
                <SharedSearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    placeholder="Search by product name, SKU..."
                    className="w-full"
                />

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <SharedFilterDropdown
                        options={[
                            { label: "All Categories", value: "All" },
                            ...uniqueCategories.map(cat => ({
                                label: cat.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase()),
                                value: cat
                            }))
                        ]}
                        activeValue={categoryFilter}
                        onFilterChange={setCategoryFilter}
                    />
                    <ExcelExportButton
                        data={exportData}
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
                        className="flex items-center justify-center gap-2 px-6 py-2 bg-sai-pink rounded-xl text-sm font-semibold text-white hover:bg-[#e67fa0] transition-colors shadow-sm h-[42px] whitespace-nowrap"
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
                                    <div
                                        onClick={toggleSelectAll}
                                        className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer mx-auto transition-colors ${selectedIds.size === paginatedProducts.length && paginatedProducts.length > 0 ? 'bg-sai-pink border-sai-pink text-white' : 'border-neutral-300 bg-white hover:border-sai-pink'}`}
                                    >
                                        {selectedIds.size === paginatedProducts.length && paginatedProducts.length > 0 && <Check className="w-3 h-3" />}
                                    </div>
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
                            {paginatedProducts.map((product) => {
                                const isSelected = selectedIds.has(product.id);
                                return (
                                    <tr
                                        key={product.id}
                                        className={`border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors group ${isSelected ? 'bg-pink-50/30' : ''}`}
                                        onClick={() => toggleSelect(product.id)}
                                    >
                                        <td className="py-4 px-6 text-center">
                                            <div
                                                className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer mx-auto transition-colors ${isSelected ? 'bg-sai-pink border-sai-pink text-white' : 'border-neutral-300 bg-white group-hover:border-sai-pink'}`}
                                            >
                                                {isSelected && <Check className="w-3 h-3" />}
                                            </div>
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
                                                    <Link href={`/admin/products/${product.id}/edit`} className="block" onClick={(e) => e.stopPropagation()}>
                                                        <p className="font-serif font-bold text-sai-charcoal text-base group-hover:text-sai-pink transition-colors">{product.name}</p>
                                                    </Link>
                                                    <p className="text-xs font-medium text-neutral-400 mt-0.5">
                                                        SKU: {product.product_type?.slice(0, 2).toUpperCase() || 'XX'}-{product.id.slice(0, 6).toUpperCase()}
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
                                        <td className="py-4 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
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
                                );
                            })}
                            {(!paginatedProducts || paginatedProducts.length === 0) && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground bg-white">
                                        No products found. Add your first product to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="border-t border-neutral-100 p-4 pb-6 flex flex-col items-center justify-center gap-4 text-sm text-sai-gray bg-white rounded-b-2xl">
                    <span className="font-medium"><b>{filteredProducts.length}</b> product(s) found</span>
                    <div className="-mt-6">
                        <SharedPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
