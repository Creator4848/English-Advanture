import type { Metadata } from "next";
import AdminAuthWrapper from "@/components/admin/AdminAuthWrapper";
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
    return <AdminAuthWrapper>{children}</AdminAuthWrapper>;
}
