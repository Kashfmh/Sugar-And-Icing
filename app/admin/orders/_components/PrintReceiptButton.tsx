"use client";

import { Printer } from "lucide-react";

export function PrintReceiptButton() {
    return (
        <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-xl text-sm font-semibold text-sai-charcoal hover:bg-neutral-50 transition-colors shadow-sm bg-white no-print"
        >
            <Printer className="h-4 w-4" /> Print
        </button>
    );
}
