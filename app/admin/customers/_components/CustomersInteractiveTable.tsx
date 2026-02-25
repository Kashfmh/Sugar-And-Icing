"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Search, Filter, Check, Edit, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AlertModal from "@/app/components/AlertModal";
import { getInitials } from "@/lib/utils";
import { ExcelExportButton } from '../../_components/ExcelExportButton';
import SharedSearchBar from '@/app/components/ui/SharedSearchBar';
import SharedFilterDropdown from '@/app/components/ui/SharedFilterDropdown';
import SharedPagination from '@/app/components/ui/SharedPagination';
import SharedTableCheckbox from '@/app/components/ui/SharedTableCheckbox';

type CustomerRow = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    username?: string | null;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
    created_at: string | null;
};

interface CustomersInteractiveTableProps {
    customers: CustomerRow[];
    orderCounts: Record<string, number>;
    totalSpent: Record<string, number>;
}

export function CustomersInteractiveTable({ customers, orderCounts, totalSpent }: CustomersInteractiveTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"newest" | "total_spent" | "order_count">("newest");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleDeleteConfirm = async () => {
        if (!deleteCustomerId) return;
        setIsDeleting(true);
        // Delete customer profile (cascade handles auth if configured, otherwise just profile)
        const { error } = await supabase.from("profiles").delete().eq("id", deleteCustomerId);
        setIsDeleting(false);
        setDeleteCustomerId(null);
        if (error) {
            alert("Failed to delete customer: " + error.message);
        } else {
            router.refresh();
        }
    };

    const avatarColors = [
        'bg-pink-100 text-pink-600',
        'bg-purple-100 text-purple-600',
        'bg-teal-100 text-teal-600',
        'bg-orange-100 text-orange-600',
        'bg-indigo-100 text-indigo-600'
    ];

    // Filter + sort logic
    const filteredCustomers = useMemo(() => {
        const searchLower = searchQuery.toLowerCase();

        const filtered = customers.filter(customer => {
            const firstName = customer.first_name || "";
            const lastName = customer.last_name || "";
            const email = customer.email || "";
            const username = customer.username || "";
            const phone = customer.phone || "";
            const fullName = `${firstName} ${lastName}`;

            return (
                fullName.toLowerCase().includes(searchLower) ||
                email.toLowerCase().includes(searchLower) ||
                username.toLowerCase().includes(searchLower) ||
                phone.toLowerCase().includes(searchLower)
            );
        });

        return filtered.sort((a, b) => {
            if (sortBy === "total_spent") {
                return (totalSpent[b.id] || 0) - (totalSpent[a.id] || 0);
            }
            if (sortBy === "order_count") {
                return (orderCounts[b.id] || 0) - (orderCounts[a.id] || 0);
            }
            // Default: newest first
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
    }, [customers, searchQuery, sortBy, orderCounts, totalSpent]);

    // Selection logic
    const allSelected = filteredCustomers.length > 0 && selectedIds.size === filteredCustomers.length;

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredCustomers.map(c => c.id)));
        }
    };

    const toggleSelectOne = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const exportData = useMemo(() => {
        return filteredCustomers.map((customer) => {
            const firstName = customer.first_name || "";
            const lastName = customer.last_name || "";
            const totalOrders = orderCounts[customer.id] || 0;
            const spent = totalSpent[customer.id] || 0;
            return {
                ID: customer.id,
                Username: customer.username || "Not Set",
                Name: `${firstName} ${lastName}`.trim() || customer.email || "Unknown",
                Email: customer.email || "",
                Phone: customer.phone || "--",
                Joined_Date: customer.created_at || null,
                Total_Orders: totalOrders,
                Total_Spent: spent
            };
        });
    }, [filteredCustomers, orderCounts, totalSpent]);

    // Apply pagination
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const paginatedCustomers = useMemo(() => {
        return filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredCustomers, currentPage, itemsPerPage]);

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, sortBy]);

    return (
        <>
            {/* Filter and Action Bar Container */}
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                {/* Search Bar */}
                <SharedSearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    placeholder="Search by name, username, or email..."
                    className="w-full"
                />

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <SharedFilterDropdown
                        options={[
                            { label: "Newest First", value: "newest" },
                            { label: "Total Spent: High to Low", value: "total_spent" },
                            { label: "Order Count: High to Low", value: "order_count" }
                        ]}
                        activeValue={sortBy}
                        onFilterChange={(val) => setSortBy(val as any)}
                        triggerLabel={
                            sortBy === "newest" ? "Newest First" :
                                sortBy === "total_spent" ? "Total Spent: High to Low" :
                                    "Order Count: High to Low"
                        }
                        triggerIcon={null}
                    />

                    <ExcelExportButton
                        data={exportData}
                        columns={[
                            { header: "Customer ID", key: "ID", width: 36, type: "text" },
                            { header: "Username", key: "Username", width: 20, type: "text" },
                            { header: "Name", key: "Name", width: 30, type: "text" },
                            { header: "Email", key: "Email", width: 30, type: "text" },
                            { header: "Phone", key: "Phone", width: 20, type: "text" },
                            { header: "Joined Date", key: "Joined_Date", width: 15, type: "date" },
                            { header: "Total Orders", key: "Total_Orders", width: 15, type: "number" },
                            { header: "Total Spent (RM)", key: "Total_Spent", width: 18, type: "currency" }
                        ]}
                        filename="Customers_Export"
                        sheetName="Customers"
                    />
                </div>
            </div>

            {/* Customers Table */}
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm mt-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-100">
                                <th className="py-5 px-6 w-12 text-center text-[11px] font-bold text-sai-gray uppercase tracking-widest">
                                    <SharedTableCheckbox
                                        checked={allSelected}
                                        onClick={toggleSelectAll}
                                    />
                                </th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Customer Info</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Phone</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Joined Date</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap text-center">Total Orders</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap text-right">Total Spent</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedCustomers.map((customer, index) => {
                                const firstName = customer?.first_name || "";
                                const lastName = customer?.last_name || "";
                                const email = customer?.email || "";
                                const username = customer?.username || "";

                                const customerName = firstName || lastName ? `${firstName} ${lastName}`.trim() : email || "Unknown Customer";

                                const initials = getInitials(firstName, lastName, email);
                                const colorClass = avatarColors[index % avatarColors.length];
                                const isSelected = selectedIds.has(customer.id);

                                // Real Orders count from aggregated fetch
                                const realOrdersCount = orderCounts[customer.id] || 0;
                                const isReturning = realOrdersCount > 0;

                                return (
                                    <tr key={customer.id} className={`border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors group ${isSelected ? 'bg-pink-50/30' : ''}`}>
                                        <td className="py-4 px-6 text-center">
                                            <SharedTableCheckbox
                                                checked={isSelected}
                                                onClick={() => toggleSelectOne(customer.id)}
                                            />
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
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <p
                                                            className="font-bold text-sm text-sai-charcoal group-hover:text-sai-pink transition-colors truncate"
                                                            title={customerName}
                                                        >
                                                            {customerName}
                                                        </p>
                                                        {username && (
                                                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-pink-50 text-sai-pink rounded-md lowercase tracking-wide border border-pink-100 whitespace-nowrap flex-shrink-0" title={`@${username}`}>
                                                                @{username}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-sai-gray truncate" title={email}>{email}</p>
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
                                        <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-bold">
                                            {(() => {
                                                const spent = totalSpent[customer.id] || 0;
                                                return spent > 0 ? `RM ${spent.toFixed(2)}` : '--';
                                            })()}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/admin/customers/${customer.id}`}
                                                    className="p-2 text-neutral-400 hover:text-sai-charcoal transition-colors hover:bg-neutral-100 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteCustomerId(customer.id)}
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
                            {(!filteredCustomers || filteredCustomers.length === 0) && (
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
                <div className="border-t border-neutral-100 p-4 pb-6 flex flex-col items-center justify-center gap-4 text-sm text-sai-gray bg-white rounded-b-2xl">
                    <span className="font-medium"><b>{filteredCustomers.length}</b> customer(s) found</span>
                    <div className="-mt-6">
                        <SharedPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div>

            <AlertModal
                isOpen={!!deleteCustomerId}
                onClose={() => setDeleteCustomerId(null)}
                title="Delete Customer"
                message="Are you sure you want to delete this customer? This action is destructive and cannot be undone."
                type="delete"
                confirmText={isDeleting ? "Deleting..." : "Delete"}
                onConfirm={handleDeleteConfirm}
            />
        </>
    );
}
