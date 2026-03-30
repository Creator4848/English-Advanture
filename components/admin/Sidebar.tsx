"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, BookOpen, GamepadIcon, Users, Bot,
    Trophy, Settings, LogOut, ChevronRight, Zap
} from "lucide-react";

const NAV_ITEMS = [
    {
        label: "Boshqaruv paneli",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        label: "Darslar boshqaruvi",
        href: "/admin/lessons",
        icon: BookOpen,
        children: [
            { label: "Video darslar", href: "/admin/lessons" },
            { label: "Mavzu qo'shish", href: "/admin/lessons/new" },
        ],
    },
    {
        label: "Testlar va O'yinlar",
        href: "/admin/tests",
        icon: GamepadIcon,
        children: [
            { label: "Savollar banki", href: "/admin/tests" },
            { label: "O'yin tahrirlovchisi", href: "/admin/tests/editor" },
        ],
    },
    {
        label: "O'quvchilar",
        href: "/admin/students",
        icon: Users,
        children: [
            { label: "Guruhlar", href: "/admin/students" },
            { label: "Progress kuzatish", href: "/admin/students/progress" },
        ],
    },
    {
        label: "AI Suhbatdoshi",
        href: "/admin/ai",
        icon: Bot,
        children: [
            { label: "AI bot sozlamalari", href: "/admin/ai" },
            { label: "Suhbatlar tarixi", href: "/admin/ai/history" },
        ],
    },
    {
        label: "Yutuqlar va Reyting",
        href: "/admin/achievements",
        icon: Trophy,
        children: [
            { label: "Nishonlar (Badges)", href: "/admin/achievements" },
            { label: "Leaderboard", href: "/admin/achievements/leaderboard" },
        ],
    },
    {
        label: "Sozlamalar",
        href: "/admin/settings",
        icon: Settings,
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="admin-sidebar">
            {/* Logo */}
            <div className="admin-sidebar-logo">
                <div className="admin-logo-icon">
                    <BookOpen className="w-5 h-5 text-[#111111]" />
                </div>
                <div>
                    <span className="text-white font-black text-base tracking-tight">
                        English <span className="text-[#FFC107]">Adventure</span>
                    </span>
                    <p className="text-[10px] text-gray-500 font-medium">Admin Panel</p>
                </div>
            </div>

            {/* Admin badge */}
            <div className="mx-4 mb-4 px-3 py-2 rounded-xl bg-[#FFC107]/10 border border-[#FFC107]/20 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FFC107] flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3.5 h-3.5 text-[#111111]" />
                </div>
                <div>
                    <p className="text-xs font-black text-white">Administrator</p>
                    <p className="text-[10px] text-gray-500">Super Admin</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3">
                {NAV_ITEMS.map((item) => {
                    const isActive =
                        item.href === "/admin"
                            ? pathname === "/admin"
                            : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <div key={item.href} className="mb-1">
                            <Link
                                href={item.href}
                                className={`admin-nav-item ${isActive ? "active" : ""}`}
                            >
                                <Icon
                                    className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#111111]" : "text-[#FFC107]"}`}
                                />
                                <span className="flex-1 text-sm font-bold">{item.label}</span>
                                {item.children && (
                                    <ChevronRight
                                        className={`w-3.5 h-3.5 transition-transform ${isActive ? "rotate-90 text-[#111111]" : "text-gray-600"}`}
                                    />
                                )}
                            </Link>

                            {/* Sub-items */}
                            {item.children && isActive && (
                                <div className="mt-1 ml-4 pl-3 border-l border-[#FFC107]/30 space-y-0.5">
                                    {item.children.map((child) => (
                                        <Link
                                            key={child.href}
                                            href={child.href}
                                            className={`block px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${pathname === child.href
                                                    ? "text-[#FFC107] bg-[#FFC107]/10"
                                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                                }`}
                                        >
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="p-4 border-t border-white/5 mt-auto">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold"
                >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Chiqish</span>
                </Link>
            </div>
        </aside>
    );
}
