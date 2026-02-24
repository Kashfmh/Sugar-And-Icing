"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Cake, ShoppingBag, Users, BarChart3, Settings, ClipboardList, Package, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const topNavItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Cake },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Inventory", href: "/admin/inventory", icon: Package },
];

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col w-full h-full bg-white pt-8">
            <div className="flex items-center justify-between mb-10 px-5">
                <div className="flex items-center gap-2.5">
                    <div className="flex-shrink-0">
                        <img
                            src="/images/logo/icon-pink.svg"
                            alt="Sugar And Icing"
                            className="h-10 w-10 object-contain"
                        />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className="font-serif font-bold text-[17px] tracking-tight leading-tight text-sai-charcoal">Sugar And Icing</h2>
                        <p className="text-[10px] font-bold tracking-widest text-sai-gray uppercase">Admin Panel</p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1.5 text-sai-gray hover:bg-neutral-50 rounded-lg transition-colors ml-2"
                        aria-label="Close Sidebar"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                )}
            </div>

            <nav className="flex-1 space-y-1">
                {topNavItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-6 py-3 text-[14px] font-semibold transition-all duration-200 border-l-4",
                                isActive
                                    ? "bg-sai-pink/10 text-sai-pink border-sai-pink"
                                    : "border-transparent text-sai-gray hover:bg-neutral-50 hover:text-sai-charcoal"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-sai-pink" : "text-sai-gray")} strokeWidth={isActive ? 2.5 : 2} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto">
                <div className="space-y-1 mb-4">
                    <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 px-6 py-3 text-[14px] font-semibold text-sai-gray hover:bg-neutral-50 hover:text-sai-charcoal transition-all border-l-4 border-transparent"
                    >
                        <Settings className="h-5 w-5 text-sai-gray" />
                        Settings
                    </Link>
                </div>

                <div className="border-t p-4">
                    <div className="flex items-center justify-between p-2 rounded-xl border border-neutral-100 bg-white shadow-sm cursor-pointer hover:bg-neutral-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-sai-pink/20 flex items-center justify-center overflow-hidden">
                                {/* Placeholder for Admin Avatar */}
                                <span className="text-sai-pink font-bold text-sm">SA</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-sai-charcoal leading-none mb-1">Admin User</span>
                                <span className="text-[11px] text-sai-gray leading-none">admin@sugarandicing.com</span>
                            </div>
                        </div>
                        <LogOut className="h-4 w-4 text-sai-gray" />
                    </div>
                </div>
            </div>
        </div>
    );
}
