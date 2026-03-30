import type { Metadata } from "next";
import Sidebar from "@/components/admin/Sidebar";
import "@/app/admin/admin.css";

export const metadata: Metadata = {
    title: "Admin Panel – English Adventure",
    description: "English Adventure platformasini boshqarish paneli",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="admin-wrapper">
            <Sidebar />
            <div className="admin-main">
                {children}
            </div>
        </div>
    );
}
