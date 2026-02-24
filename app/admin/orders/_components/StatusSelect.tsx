"use client";

import { useTransition, useState } from "react";
import { updateOrderStatus } from "../_actions";
import { Loader2 } from "lucide-react";

const ORDER_STATUSES = [
    "pending",
    "pending_payment",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "completed",
    "cancelled",
    "refunded",
];

export function StatusSelect({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState(currentStatus);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        startTransition(() => {
            updateOrderStatus(orderId, newStatus);
        });
    };

    return (
        <div className="flex items-center gap-2">
            <select
                value={status}
                onChange={handleChange}
                disabled={isPending}
                className="flex h-10 w-48 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 capitalize"
            >
                {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                        {s.replace("_", " ")}
                    </option>
                ))}
            </select>
            {isPending && <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />}
        </div>
    );
}
