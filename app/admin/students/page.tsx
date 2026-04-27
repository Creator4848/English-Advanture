"use client";

import { useState, useEffect } from "react";
import { Search, Download, Users, Filter } from "lucide-react";

export default function AdminStudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetch("/api/users")
            .then(res => res.json())
            .then(data => {
                setStudents(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Users fetch error:", err);
                setLoading(false);
            });
    }, []);

    const filtered = students.filter((s) => {
        const matchTab = activeTab === "all" ? true
            : activeTab === "active" ? s.status === "active"
                : s.status === activeTab;
        const matchSearch = (s.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.email || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchTab && matchSearch;
    });

    const tabs = [
        { key: "all", label: `Barchasi (${students.length})` },
        { key: "active", label: `Faol (${students.filter(s => s.status === "active").length})` },
        { key: "inactive", label: `Nofaol (${students.filter(s => s.status === "inactive").length})` },
    ];

    const handleExportCSV = () => {
        const headers = ["Ismi", "Email", "XP", "Level", "Progress", "Holat", "So'nggi kirish"];
        const rows = filtered.map(s => [
            s.full_name || s.username,
            s.email || "",
            s.xp,
            s.level,
            `${s.progress}%`,
            s.status,
            s.last_login
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `students_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-10 text-white font-bold text-center">Yuklanmoqda...</div>;

    return (
        <div className="p-6 lg:p-10 max-w-[1400px] mx-auto pb-24">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">O'quvchilar ro'yxati</h1>
                    <p className="text-gray-400 font-medium">Ro'yxatdan o'tgan o'quvchilar, ularning email va progress ma'lumotlari</p>
                </div>
                <div className="flex gap-3">
                    <button className="adm-btn-ghost" onClick={handleExportCSV}>
                        Eksport (CSV) <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="adm-card overflow-hidden">

                {/* Toolbar */}
                <div className="p-4 border-b border-[#ffffff0a] flex flex-col md:flex-row items-center justify-between gap-4 bg-[#1A1D2E]">
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab.key
                                    ? "bg-[#FFC107] text-[#111111]"
                                    : "text-gray-400 hover:text-white bg-white/5"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Ism yoki email..."
                                className="adm-input pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="p-2 rounded-lg border border-[#ffffff10] text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="adm-table min-w-[750px]">
                        <thead>
                            <tr className="bg-[#151826]">
                                <th>Ismi</th>
                                <th>Email</th>
                                <th>Progress</th>
                                <th>Holat</th>
                                <th>So'nggi kirish</th>
                                <th className="text-right">Profil</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((student) => (
                                <tr key={student.id} className="group cursor-pointer">
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[#FFC107]/15 text-[#FFC107] font-black text-sm flex items-center justify-center relative flex-shrink-0">
                                                {student.full_name?.charAt(0) || student.username.charAt(0)}
                                                {student.last_login === "Bugun" && (
                                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#1A1D2E] rounded-full" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-[#FFC107] transition-colors text-sm">{student.full_name || student.username}</div>
                                                <div className="text-[10px] text-gray-500 font-medium">Level {student.level}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-gray-300 font-medium text-sm">{student.email || student.username}</span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-3 min-w-[130px]">
                                            <div className="flex-1 adm-progress-track">
                                                <div
                                                    className="adm-progress-fill"
                                                    style={{ width: `${student.progress}%` }}
                                                />
                                            </div>
                                            <span className={`text-xs font-black w-8 text-right ${student.progress >= 80 ? "text-green-400" : student.progress >= 50 ? "text-[#FFC107]" : "text-gray-400"}`}>
                                                {student.progress}%
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        {student.status === "active" && <span className="adm-badge adm-badge-green">Faol</span>}
                                        {student.status === "inactive" && <span className="adm-badge adm-badge-red">Nofaol</span>}
                                    </td>
                                    <td>
                                        <span className={`text-sm font-medium ${student.last_login === "Bugun" ? "text-green-400" : "text-gray-400"}`}>
                                            {student.last_login}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <button className="text-sm font-bold text-[#FFC107] hover:text-white transition-colors">
                                            Ko'rish →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-[#ffffff0a] flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">{filtered.length} ta o'quvchi ko'rsatilmoqda</span>
                    <div className="flex gap-1">
                        <button className="w-8 h-8 rounded-lg border border-[#ffffff10] text-gray-400 flex items-center justify-center hover:bg-white/5 disabled:opacity-40" disabled>{"<"}</button>
                        <button className="w-8 h-8 rounded-lg bg-[#FFC107] text-[#111111] font-black flex items-center justify-center">1</button>
                        <button className="w-8 h-8 rounded-lg border border-[#ffffff10] text-gray-400 flex items-center justify-center hover:bg-white/5">{">"}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
