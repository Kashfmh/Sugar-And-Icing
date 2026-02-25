"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ChevronRight, Check, ArrowUpDown, Truck, ShoppingBag, Filter, Edit, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AlertModal from "@/app/components/AlertModal";
import { formatCurrency } from "@/lib/utils";
import { ExcelExportButton } from "../../_components/ExcelExportButton";
import SharedSearchBar from "@/app/components/ui/SharedSearchBar";
import SharedFilterDropdown from "@/app/components/ui/SharedFilterDropdown";
import SharedPagination from "@/app/components/ui/SharedPagination";
import SharedTableCheckbox from "@/app/components/ui/SharedTableCheckbox";

type OrderRow = {
    id: string;
    status: string;
    total_amount: number;
    created_at: string;
    delivery_type?: string;
    delivery_date?: string;
    profiles: any;
    item_count?: number;
};

interface OrdersInteractiveTableProps {
    orders: OrderRow[];
}

const STATUS_OPTIONS = [
    { label: "All Statuses", value: "All" },
    { label: "Pending Payment", value: "pending_payment" },
    { label: "Paid", value: "paid" },
    { label: "Preparing", value: "preparing" },
    { label: "Ready to Pickup", value: "ready_to_pickup" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Refunded", value: "refunded" },
    { label: "Pending", value: "pending" },
    { label: "Processing", value: "processing" },
    { label: "Delivered", value: "delivered" },
];

const DELIVERY_OPTIONS = [
    { label: "All Types", value: "All" },
    { label: "Pickup", value: "pickup" },
    { label: "Delivery", value: "delivery" },
];

const SORT_OPTIONS = [
    { label: "Newest First", value: "created_at_desc" },
    { label: "Delivery Date (Soonest)", value: "delivery_date_asc" },
    { label: "Total: High to Low", value: "total_desc" },
];

const avatarColors = [
    "bg-pink-100 text-pink-600",
    "bg-purple-100 text-purple-600",
    "bg-blue-100 text-blue-600",
    "bg-green-100 text-green-600",
    "bg-orange-100 text-orange-600",
];

function getInitials(firstName: string, lastName: string, email: string) {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName.slice(0, 2).toUpperCase();
    if (email) return email.slice(0, 2).toUpperCase();
    return "??";
}

function getStatusStyle(status: string) {
    switch (status.toLowerCase()) {
        case "pending": return "bg-orange-50 text-orange-600 border border-orange-200";
        case "pending_payment": return "bg-yellow-50 text-yellow-700 border border-yellow-200";
        case "paid": return "bg-green-50 text-green-600 border border-green-200";
        case "preparing": return "bg-blue-50 text-blue-600 border border-blue-200";
        case "ready_to_pickup": return "bg-amber-50 text-amber-700 border border-amber-200";
        case "completed": return "bg-emerald-50 text-emerald-600 border border-emerald-200";
        case "cancelled": return "bg-neutral-100 text-neutral-500 border border-neutral-200";
        case "refunded": return "bg-red-50 text-red-500 border border-red-200";
        case "processing": return "bg-blue-50 text-blue-600 border border-blue-200";
        case "delivered": return "bg-green-50 text-green-600 border border-green-200";
        default: return "bg-neutral-50 text-neutral-600 border border-neutral-200";
    }
}

function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
        pending: "Pending",
        pending_payment: "Payment Pending",
        paid: "Paid",
        preparing: "Preparing",
        ready_to_pickup: "Ready to Pickup",
        completed: "Completed",
        cancelled: "Cancelled",
        refunded: "Refunded",
        processing: "Processing",
        delivered: "Delivered",
        shipped: "Shipped",
    };
    return labels[status.toLowerCase()] ?? status.replace(/_/g, " ");
}

export function OrdersInteractiveTable({ orders }: OrdersInteractiveTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [deliveryFilter, setDeliveryFilter] = useState("All");
    const [sortOption, setSortOption] = useState("created_at_desc");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const itemsPerPage = 10;
    const router = useRouter();
    const supabase = createClient();

    const handleDeleteConfirm = async () => {
        if (!deleteOrderId) return;
        setIsDeleting(true);
        // Clean up connected order items first if cascade delete isn't set
        await supabase.from("order_items").delete().eq("order_id", deleteOrderId);
        const { error } = await supabase.from("orders").delete().eq("id", deleteOrderId);
        setIsDeleting(false);
        setDeleteOrderId(null);
        if (error) {
            alert("Failed to delete order: " + error.message);
        } else {
            router.refresh();
        }
    };

    // Filter + Search + Sort
    const filteredOrders = useMemo(() => {
        let result = orders.filter((order) => {
            const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
            const firstName = (profile?.first_name || "").toLowerCase();
            const lastName = (profile?.last_name || "").toLowerCase();
            const email = (profile?.email || "").toLowerCase();
            const username = (profile?.username || "").toLowerCase();
            const q = searchQuery.toLowerCase().trim();

            const matchesSearch =
                !q ||
                order.id.toLowerCase().includes(q) ||
                firstName.includes(q) ||
                lastName.includes(q) ||
                `${firstName} ${lastName}`.includes(q) ||
                email.includes(q) ||
                username.includes(q);

            const matchesStatus = statusFilter === "All" || order.status === statusFilter;

            const deliveryType = (order.delivery_type || "").toLowerCase();
            const matchesDelivery =
                deliveryFilter === "All" ||
                (deliveryFilter === "pickup" && (deliveryType === "pickup" || deliveryType === "self_pickup")) ||
                (deliveryFilter === "delivery" && deliveryType === "delivery");

            return matchesSearch && matchesStatus && matchesDelivery;
        });

        // Sort
        result = [...result].sort((a, b) => {
            if (sortOption === "created_at_desc") {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            if (sortOption === "delivery_date_asc") {
                const aDate = a.delivery_date ? new Date(a.delivery_date).getTime() : Infinity;
                const bDate = b.delivery_date ? new Date(b.delivery_date).getTime() : Infinity;
                return aDate - bDate;
            }
            if (sortOption === "total_desc") {
                return (b.total_amount || 0) - (a.total_amount || 0);
            }
            return 0;
        });

        return result;
    }, [orders, searchQuery, statusFilter, deliveryFilter, sortOption]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = useMemo(
        () => filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
        [filteredOrders, currentPage]
    );

    useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, deliveryFilter, sortOption]);

    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedOrders.length && paginatedOrders.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedOrders.map((o) => o.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id); else next.add(id);
        setSelectedIds(next);
    };

    const exportData = useMemo(() => {
        return filteredOrders.map((order) => {
            const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
            const customerName = profile
                ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.email
                : "Guest";
            return {
                OrderID: order.id,
                Customer: customerName,
                Created: order.created_at,
                DeliveryType: order.delivery_type || "",
                DeliveryDate: order.delivery_date || "",
                Items: order.item_count || 0,
                TotalAmount: order.total_amount,
                Status: order.status,
            };
        });
    }, [filteredOrders]);

    return (
        <>
            {/* Filter / Search Bar */}
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-4 flex flex-col gap-3">
                <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                    <div className="flex-1">
                        <SharedSearchBar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            placeholder="Search by order ID, name, email, username…"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status filter */}
                        <SharedFilterDropdown
                            options={STATUS_OPTIONS}
                            activeValue={statusFilter}
                            onFilterChange={setStatusFilter}
                            triggerLabel={STATUS_OPTIONS.find(o => o.value === statusFilter)?.label || "Status"}
                            triggerIcon={<Filter className="w-4 h-4 text-gray-500" />}
                        />
                        {/* Delivery type filter */}
                        <SharedFilterDropdown
                            options={DELIVERY_OPTIONS}
                            activeValue={deliveryFilter}
                            onFilterChange={setDeliveryFilter}
                            triggerLabel={DELIVERY_OPTIONS.find(o => o.value === deliveryFilter)?.label || "Delivery Type"}
                            triggerIcon={<Truck className="w-4 h-4 text-gray-500" />}
                        />
                        {/* Sort */}
                        <SharedFilterDropdown
                            options={SORT_OPTIONS}
                            activeValue={sortOption}
                            onFilterChange={setSortOption}
                            triggerLabel={SORT_OPTIONS.find(o => o.value === sortOption)?.label || "Sort"}
                            triggerIcon={<ArrowUpDown className="w-4 h-4 text-gray-500" />}
                        />
                        <ExcelExportButton
                            data={exportData}
                            columns={[
                                { header: "Order ID", key: "OrderID", width: 36, type: "text" },
                                { header: "Customer", key: "Customer", width: 28, type: "text" },
                                { header: "Created", key: "Created", width: 20, type: "date" },
                                { header: "Delivery Type", key: "DeliveryType", width: 16, type: "text" },
                                { header: "Delivery Date", key: "DeliveryDate", width: 20, type: "date" },
                                { header: "Items", key: "Items", width: 10, type: "number" },
                                { header: "Total", key: "TotalAmount", width: 15, type: "currency" },
                                { header: "Status", key: "Status", width: 18, type: "text" },
                            ]}
                            filename="Orders_Export"
                            sheetName="Orders"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden mt-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-100">
                                <th className="py-5 px-6 w-12 text-center">
                                    <div
                                        onClick={toggleSelectAll}
                                        className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer mx-auto transition-colors ${selectedIds.size === paginatedOrders.length && paginatedOrders.length > 0
                                            ? "bg-sai-pink border-sai-pink text-white"
                                            : "border-neutral-300 bg-white hover:border-sai-pink"
                                            }`}
                                    >
                                        {selectedIds.size === paginatedOrders.length && paginatedOrders.length > 0 && <Check className="w-3 h-3" />}
                                    </div>
                                </th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Order ID</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Customer</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Placed On</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Type</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap">Delivery Date</th>
                                <th className="py-5 px-6 text-[11px] font-bold text-sai-gray uppercase tracking-widest whitespace-nowrap text-center">Items</th>
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
                                const customerName = firstName || lastName ? `${firstName} ${lastName}`.trim() : email || "Guest";
                                const initials = getInitials(firstName, lastName, email);
                                const colorClass = avatarColors[index % avatarColors.length];
                                const isSelected = selectedIds.has(order.id);
                                const deliveryType = (order.delivery_type || "").toLowerCase();
                                const isPickup = deliveryType === "pickup" || deliveryType === "self_pickup";

                                return (
                                    <tr
                                        key={order.id}
                                        className={`border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors group cursor-pointer ${isSelected ? "bg-pink-50/30" : ""}`}
                                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                                    >
                                        {/* Checkbox */}
                                        <td className="py-6 px-6 text-center">
                                            <SharedTableCheckbox
                                                checked={isSelected}
                                                onClick={() => toggleSelect(order.id)}
                                            />
                                        </td>

                                        {/* Order ID */}
                                        <td className="py-6 px-6 whitespace-nowrap font-mono text-xs text-sai-charcoal font-bold">
                                            #{order.id.split("-")[0].toUpperCase()}
                                        </td>

                                        {/* Customer */}
                                        <td className="py-6 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 border overflow-hidden ${profile?.avatar_url ? "bg-transparent border-transparent" : `${colorClass} border-transparent`}`}>
                                                    {profile?.avatar_url ? (
                                                        <img src={profile.avatar_url} alt={customerName} className="w-full h-full object-cover rounded-full" />
                                                    ) : initials}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-bold text-sm text-sai-charcoal line-clamp-1 group-hover:text-sai-pink transition-colors">{customerName}</p>
                                                        {username && (
                                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-pink-50 text-sai-pink rounded-md border border-pink-100/50 whitespace-nowrap flex-shrink-0">
                                                                @{username}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-sai-gray line-clamp-1">{email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Placed On: DD/MM/YYYY HH:MM AM/PM */}
                                        <td className="py-6 px-6 whitespace-nowrap text-xs text-sai-gray">
                                            <div>{format(new Date(order.created_at), "dd/MM/yyyy")}</div>
                                            <div className="text-[10px] text-neutral-400">{format(new Date(order.created_at), "hh:mm a")}</div>
                                        </td>

                                        {/* Delivery Type */}
                                        <td className="py-6 px-6 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${isPickup ? "bg-purple-50 text-purple-600 border border-purple-100" : "bg-blue-50 text-blue-600 border border-blue-100"}`}>
                                                {isPickup
                                                    ? <><ShoppingBag className="h-3 w-3" /> Pickup</>
                                                    : <><Truck className="h-3 w-3" /> Delivery</>
                                                }
                                            </span>
                                        </td>

                                        {/* Delivery Date */}
                                        <td className="py-6 px-6 whitespace-nowrap text-xs text-sai-gray">
                                            {order.delivery_date ? (
                                                <>
                                                    <div>{format(new Date(order.delivery_date), "dd/MM/yyyy")}</div>
                                                    <div className="text-[10px] text-neutral-400">{format(new Date(order.delivery_date), "hh:mm a")}</div>
                                                </>
                                            ) : (
                                                <span className="text-neutral-300 italic text-[10px]">—</span>
                                            )}
                                        </td>

                                        {/* Items */}
                                        <td className="py-6 px-6 whitespace-nowrap text-sm text-sai-gray text-center font-bold">
                                            {order.item_count || 0}
                                        </td>

                                        {/* Total */}
                                        <td className="py-6 px-6 whitespace-nowrap font-bold text-sai-charcoal">
                                            {formatCurrency(order.total_amount || 0)}
                                        </td>

                                        {/* Status */}
                                        <td className="py-6 px-6 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${getStatusStyle(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-6 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="p-2 text-neutral-400 hover:text-sai-charcoal transition-colors hover:bg-neutral-100 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteOrderId(order.id)}
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

                            {paginatedOrders.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="px-6 py-16 text-center text-neutral-400 bg-white">
                                        <div className="text-4xl mb-3">📭</div>
                                        <p className="font-semibold text-sai-charcoal">No orders found</p>
                                        <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
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

            <AlertModal
                isOpen={!!deleteOrderId}
                onClose={() => setDeleteOrderId(null)}
                title="Delete Order"
                message="Are you sure you want to delete this order? This action cannot be undone and will permanently remove all associated order items."
                type="delete"
                confirmText={isDeleting ? "Deleting..." : "Delete"}
                onConfirm={handleDeleteConfirm}
            />
        </>
    );
}
