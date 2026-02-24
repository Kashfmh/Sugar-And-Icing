"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronRight, Calendar, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ExcelExportButton } from "../../_components/ExcelExportButton";
import SharedSearchBar from "@/app/components/ui/SharedSearchBar";
import SharedFilterDropdown from "@/app/components/ui/SharedFilterDropdown";
import SharedPagination from "@/app/components/ui/SharedPagination";

type OrderRow = {
    id: string;
    status: string;
    total_amount: number;
    created_at: string;
    profiles: any;
};

interface OrdersInteractiveTableProps {
    orders: OrderRow[];
}

export function OrdersInteractiveTable({ orders }: OrdersInteractiveTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const avatarColors = [
        'bg-pink-100 text-pink-600',
        'bg-purple-100 text-purple-600',
        'bg-blue-100 text-blue-600',
        'bg-green-100 text-green-600',
        'bg-orange-100 text-orange-600',
    ];

    const getInitials = (firstName: string, lastName: string, email: string) => {
        if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
        if (firstName) return firstName.slice(0, 2).toUpperCase();
        if (email) return email.slice(0, 2).toUpperCase();
        return "??";
    };

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

    // Filter logic
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
            const firstName = profile?.first_name || "";
            const lastName = profile?.last_name || "";
            const email = profile?.email || "";
            const username = profile?.username || "";
            const customerName = `${firstName} ${lastName}`.toLowerCase();
            const searchLower = searchQuery.toLowerCase();

            const matchesSearch =
                order.id.toLowerCase().includes(searchLower) ||
                customerName.includes(searchLower) ||
                email.toLowerCase().includes(searchLower) ||
                username.toLowerCase().includes(searchLower);

            const matchesStatus = statusFilter === "All" || order.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, searchQuery, statusFilter]);

    // Export mapping
    const exportData = useMemo(() => {
        return filteredOrders.map(order => {
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
        });
    }, [filteredOrders]);

    // Pagination slice
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = useMemo(() => {
        return filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredOrders, currentPage, itemsPerPage]);

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    // Selection logic
    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedOrders.length && paginatedOrders.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedOrders.map(o => o.id)));
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
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                {/* Search Bar */}
                <SharedSearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    placeholder="Search by order ID, customer name, email..."
                    className="w-full lg:max-w-md"
                />

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Placeholder Date Filter */}
                    <button className="flex-1 lg:flex-none flex items-center justify-between gap-3 px-4 py-2 border border-neutral-200 rounded-xl text-sm font-medium text-sai-charcoal hover:bg-neutral-50 transition-colors bg-white whitespace-nowrap h-[42px]">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-neutral-400" />
                            <span>Oct 1 - Oct 31</span>
                        </div>
                    </button>

                    <SharedFilterDropdown
                        options={[
                            { label: "Status: All", value: "All" },
                            { label: "Status: Pending", value: "pending" },
                            { label: "Status: Processing", value: "processing" },
                            { label: "Status: Paid", value: "paid" },
                            { label: "Status: Shipped", value: "shipped" },
                            { label: "Status: Delivered", value: "delivered" },
                            { label: "Status: Completed", value: "completed" },
                            { label: "Status: Cancelled", value: "cancelled" },
                            { label: "Status: Refunded", value: "refunded" }
                        ]}
                        activeValue={statusFilter}
                        onFilterChange={setStatusFilter}
                    />

                    <ExcelExportButton
                        data={exportData}
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
                                    <div
                                        onClick={toggleSelectAll}
                                        className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer mx-auto transition-colors ${selectedIds.size === paginatedOrders.length && paginatedOrders.length > 0 ? 'bg-sai-pink border-sai-pink text-white' : 'border-neutral-300 bg-white hover:border-sai-pink'}`}
                                    >
                                        {selectedIds.size === paginatedOrders.length && paginatedOrders.length > 0 && <Check className="w-3 h-3" />}
                                    </div>
                                </th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Order ID</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Customer</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Date</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Items (Mock)</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Total</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap text-center">Status</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOrders.map((order, index) => {
                                const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
                                const firstName = profile?.first_name || "";
                                const lastName = profile?.last_name || "";
                                const email = profile?.email || "";
                                const username = profile?.username || "";
                                const customerName = firstName || lastName ? `${firstName} ${lastName}`.trim() : email || "Unknown";
                                const initials = getInitials(firstName, lastName, email);
                                const colorClass = avatarColors[index % avatarColors.length];
                                const isSelected = selectedIds.has(order.id);

                                return (
                                    <tr
                                        key={order.id}
                                        className={`border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors group ${isSelected ? 'bg-pink-50/30' : ''}`}
                                        onClick={() => toggleSelect(order.id)}
                                    >
                                        <td className="py-4 px-6 text-center">
                                            <div
                                                className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer mx-auto transition-colors ${isSelected ? 'bg-sai-pink border-sai-pink text-white' : 'border-neutral-300 bg-white group-hover:border-sai-pink'}`}
                                            >
                                                {isSelected && <Check className="w-3 h-3" />}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap font-medium text-sai-charcoal text-sm">
                                            #{order.id.split('-')[0].toUpperCase()}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${profile?.avatar_url ? 'bg-transparent' : colorClass}`}>
                                                    {profile?.avatar_url ? (
                                                        <img src={profile.avatar_url} alt={customerName} className="w-full h-full object-cover rounded-full" />
                                                    ) : (
                                                        initials
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-sai-charcoal line-clamp-1 group-hover:text-sai-pink transition-colors">{customerName}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs text-sai-gray line-clamp-1">{email}</p>
                                                        {username && (
                                                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-pink-50 text-sai-pink rounded border border-pink-100/50">
                                                                @{username}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-sm text-sai-gray">
                                            {format(new Date(order.created_at), "MMM d, yyyy")}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-sm text-sai-gray">
                                            {3 /* Placeholder until order items are implemented */} items
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap font-bold text-sai-charcoal">
                                            {formatCurrency(order.total_amount || 0)}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${getStatusStyle(order.status)}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="inline-flex items-center justify-center p-2 text-neutral-400 hover:text-sai-pink transition-colors hover:bg-pink-50 rounded-lg"
                                                title="View Details"
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}

                            {(!paginatedOrders || paginatedOrders.length === 0) && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground bg-white">
                                        No orders found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="border-t border-neutral-100 p-4 pb-6 flex flex-col items-center justify-center gap-4 text-sm text-sai-gray bg-white rounded-b-2xl">
                    <span className="font-medium"><b>{filteredOrders.length}</b> order(s) found</span>
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
