import { ReactNode } from "react";
import { AdminShell } from "./_components/AdminShell";

export const metadata = {
    title: "Admin Portal - Sugar & Icing",
    description: "Manage orders, products, and customers.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <AdminShell>
            {children}
        </AdminShell>
    );
}
