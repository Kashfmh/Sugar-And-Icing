"use client";

import { useTransition, useState } from "react";
import { updateOrderStatus } from "../_actions";
import { Loader2, ChevronDown } from "lucide-react";

type OrderStatus = "paid" | "preparing" | "ready_to_pickup" | "completed" | "cancelled" | "refunded";

const ALL_STATUSES: { value: OrderStatus; label: string }[] = [
    { value: "paid", label: "Paid" },
    { value: "preparing", label: "Preparing" },
    { value: "ready_to_pickup", label: "Ready to Pickup" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
];

// Statuses the admin can transition TO from a given current status.
// Once paid, we never allow going back to pre-payment states.
// Terminal statuses (completed, cancelled, refunded) stay locked.
const ALLOWED_TRANSITIONS: Record<string, OrderStatus[]> = {
    // Before payment (set by system, admin can only cancel)
    pending: ["cancelled"],
    pending_payment: ["cancelled"],
    // Post-payment: admin can move the order through the fulfillment flow
    paid: ["paid", "preparing", "ready_to_pickup", "completed", "cancelled", "refunded"],
    preparing: ["preparing", "ready_to_pickup", "completed", "cancelled", "refunded"],
    ready_to_pickup: ["ready_to_pickup", "completed", "cancelled", "refunded"],
    completed: ["completed"], // terminal
    cancelled: ["cancelled"], // terminal
    refunded: ["refunded"],  // terminal
};

const getStatusAccent = (status: string): string => {
    switch (status) {
        case "paid": return "#22c55e";
        case "preparing": return "#3b82f6";
        case "ready_to_pickup": return "#f59e0b";
        case "completed": return "#16a34a";
        case "cancelled": return "#9ca3af";
        case "refunded": return "#f87171";
        default: return "#d1d5db";
    }
};

export function StatusSelect({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState(currentStatus);
    const accent = getStatusAccent(status);

    // Determine which statuses are selectable from the current one
    const allowed = ALLOWED_TRANSITIONS[status] ?? ALL_STATUSES.map(s => s.value);
    const options = ALL_STATUSES.filter(s => allowed.includes(s.value));

    // If the current status is a legacy value (e.g. "pending_payment"), show it as-is but locked
    const isLegacyStatus = !ALL_STATUSES.find(s => s.value === status);
    const isTerminal = ["completed", "cancelled", "refunded"].includes(status);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        startTransition(() => {
            updateOrderStatus(orderId, newStatus);
        });
    };

    return (
        <div className="flex items-center gap-2">
            <div className="relative inline-flex items-center">
                <select
                    value={status}
                    onChange={handleChange}
                    disabled={isPending || isLegacyStatus || (isTerminal && options.length <= 1)}
                    style={{ borderColor: accent }}
                    className="
                        appearance-none cursor-pointer
                        pl-4 pr-9 py-2
                        bg-white rounded-xl border-2
                        text-sm font-semibold text-sai-charcoal
                        shadow-sm transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-offset-1
                        disabled:cursor-not-allowed disabled:opacity-60
                    "
                >
                    {/* Show current status if it's a legacy value not in our list */}
                    {isLegacyStatus && (
                        <option value={status}>{status.replace(/_/g, " ")}</option>
                    )}
                    {options.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                    {isPending
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />
                        : <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                    }
                </div>
            </div>
            {isTerminal && (
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Final</span>
            )}
        </div>
    );
}
