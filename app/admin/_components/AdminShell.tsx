"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-neutral-50 overflow-hidden relative">

            {/* Desktop Sidebar Spacer (Animates Width to push content) */}
            <div
                className={`transition-all duration-300 ease-in-out shrink-0 z-30 ${isSidebarOpen ? 'w-[260px]' : 'w-0'
                    }`}
            />

            {/* Actual Sidebar Panel (Absolute, Animates Transform for smooth sliding) */}
            <div
                className={`absolute top-0 left-0 h-full w-[260px] bg-white border-r shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-40 transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* Floating button when closed (Animates Fade/Slide) */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className={`absolute top-6 left-6 z-20 p-2.5 bg-white border border-neutral-200 shadow-sm rounded-xl text-sai-charcoal hover:bg-neutral-50 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-0 pointer-events-none -translate-x-8' : 'opacity-100 translate-x-0'
                    }`}
                aria-label="Open Sidebar"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto p-6 sm:p-8 w-full">
                {/* Dynamic padding pushes content gently away from floating button */}
                <div className={`transition-all duration-300 ease-in-out ${!isSidebarOpen ? 'pl-16 sm:pl-16' : ''}`}>
                    {children}
                </div>
            </main>
        </div>
    );
}
