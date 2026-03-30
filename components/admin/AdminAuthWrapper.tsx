"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import "@/app/admin/admin.css";

export default function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const auth = sessionStorage.getItem("admin_auth");
        if (auth === "true") {
            setIsAuthenticated(true);
        }
    }, [pathname]);

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    if (!isClient) return <div className="min-h-screen bg-[#0F1117]" />;

    if (!isAuthenticated && pathname !== "/admin/login") {
        if (typeof window !== "undefined") {
            window.location.href = "/admin/login";
            return <div className="min-h-screen bg-[#0F1117]" />;
        }
    }

    return (
        <div className="admin-wrapper">
            <Sidebar />
            <div className="admin-main">
                {children}
            </div>
        </div>
    );
}
