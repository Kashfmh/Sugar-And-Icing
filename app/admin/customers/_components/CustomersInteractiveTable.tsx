"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Search, Filter, ChevronRight, Check } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { ExcelExportButton } from '../../_components/ExcelExportButton';
import SharedSearchBar from '@/app/components/ui/SharedSearchBar';
import SharedFilterDropdown from '@/app/components/ui/SharedFilterDropdown';
import SharedPagination from '@/app/components/ui/SharedPagination';

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
}

export function CustomersInteractiveTable({ customers, orderCounts }: CustomersInteractiveTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"All" | "Returning" | "New">("All");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const avatarColors = [
        'bg-pink-100 text-pink-600',
        'bg-purple-100 text-purple-600',
        'bg-teal-100 text-teal-600',
        'bg-orange-100 text-orange-600',
        'bg-indigo-100 text-indigo-600'
    ];

    // Filter logic
    const filteredCustomers = useMemo(() => {
        return customers.filter(customer => {
            const firstName = customer.first_name || "";
            const lastName = customer.last_name || "";
            const email = customer.email || "";
            const username = customer.username || "";
            const fullName = `${firstName} ${lastName}`.toLowerCase();
            const searchLower = searchQuery.toLowerCase();

            const matchesSearch = fullName.includes(searchLower) || email.toLowerCase().includes(searchLower) || username.toLowerCase().includes(searchLower);

            const orderCount = orderCounts[customer.id] || 0;
            const isReturning = orderCount > 0;

            let matchesFilter = true;
            if (statusFilter === "Returning") matchesFilter = isReturning;
            if (statusFilter === "New") matchesFilter = !isReturning;

            return matchesSearch && matchesFilter;
        });
    }, [customers, searchQuery, statusFilter, orderCounts]);

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

    // Export Data formatting
    const exportData = useMemo(() => {
        return filteredCustomers.map((customer) => {
            const firstName = customer.first_name || "";
            const lastName = customer.last_name || "";
            const totalOrders = orderCounts[customer.id] || 0;
            return {
                ID: customer.id,
                Username: customer.username || "Not Set",
                Name: `${firstName} ${lastName}`.trim() || customer.email || "Unknown",
                Email: customer.email || "",
                Phone: customer.phone || "--",
                Joined_Date: customer.created_at || null,
                Total_Orders: totalOrders
            };
        });
    }, [filteredCustomers, orderCounts]);

    // Apply pagination
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const paginatedCustomers = useMemo(() => {
        return filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredCustomers, currentPage, itemsPerPage]);

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    return (
        <>
            {/* Filter and Action Bar Container */}
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                {/* Search Bar */}
                <SharedSearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    placeholder="Search by name, username, or email..."
                    className="w-full lg:max-w-md"
                />

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <SharedFilterDropdown
                        options={[
                            { label: "Status: All", value: "All" },
                            { label: "Status: Returning (Has Orders)", value: "Returning" },
                            { label: "Status: New (No Orders)", value: "New" }
                        ]}
                        activeValue={statusFilter}
                        onFilterChange={(val) => setStatusFilter(val as any)}
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
                                    <div
                                        onClick={toggleSelectAll}
                                        className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors mx-auto ${allSelected ? 'bg-sai-pink border-sai-pink' : 'border-neutral-300 bg-white'}`}
                                    >
                                        {allSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                    </div>
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
                                            <div
                                                onClick={() => toggleSelectOne(customer.id)}
                                                className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors mx-auto ${isSelected ? 'bg-sai-pink border-sai-pink' : 'border-neutral-300 bg-white'}`}
                                            >
                                                {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                            </div>
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
                                        <td className="py-4 px-6 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${isReturning ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${isReturning ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                                {isReturning ? "Returning" : "New"}
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
        </>
    );
}
