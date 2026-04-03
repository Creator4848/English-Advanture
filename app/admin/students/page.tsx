"use client";

import { useState } from "react";
import { Search, Download, Users, Filter } from "lucide-react";

const STUDENTS = [
    { id: "S001", name: "Ali Valiyev", email: "ali.valiyev@gmail.com", progress: 86, level: 12, status: "active", lastLogin: "Bugun, 14:30" },
    { id: "S002", name: "Zarina Alimova", email: "zarina@example.com", progress: 74, level: 11, status: "active", lastLogin: "Kecha, 18:45" },
    { id: "S003", name: "Jasur Qodirov", email: "jasur.q@mail.ru", progress: 61, level: 9, status: "active", lastLogin: "2 kun oldin" },
    { id: "S004", name: "Madina To'rayeva", email: "madina.t@gmail.com", progress: 45, level: 9, status: "inactive", lastLogin: "10 kun oldin" },
    { id: "S005", name: "Timur Karimov", email: "timur.karimov@email.com", progress: 12, level: 2, status: "new", lastLogin: "Hozir onlayn" },
    { id: "S006", name: "Dilnoza Yusupova", email: "dilnoza.y@gmail.com", progress: 93, level: 14, status: "active", lastLogin: "30 daqiqa oldin" },
    { id: "S007", name: "Bobur Rashidov", email: "bobur.r@yahoo.com", progress: 38, level: 6, status: "inactive", lastLogin: "Hafta oldin" },
];

export default function AdminStudentsPage() {
    const [activeTab, setActiveTab] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const filtered = STUDENTS.filter((s) => {
        const matchTab = activeTab === "all" ? true
            : activeTab === "active" ? (s.status === "active" || s.status === "new")
                : s.status === activeTab;
        const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchTab && matchSearch;
    });

    const tabs = [
        { key: "all", label: `Barchasi (${STUDENTS.length})` },
        { key: "active", label: `Faol (${STUDENTS.filter(s => s.status === "active" || s.status === "new").length})` },
        { key: "inactive", label: `Nofaol (${STUDENTS.filter(s => s.status === "inactive").length})` },
    ];

    return (
        <div className="p-6 lg:p-10 max-w-[1400px] mx-auto pb-24">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">O'quvchilar Ro'yxati</h1>
                    <p className="text-gray-400 font-medium">Ro'yxatdan o'tgan o'quvchilar, ularning email va progress ma'lumotlari</p>
                </div>
                <div className="flex gap-3">
                    <button className="adm-btn-ghost">
                        Eksport (CSV) <Download className="w-4 h-4" />
                    </button>
                    <button className="adm-btn-yellow">
                        O'quvchi qo'shish <Users className="w-4 h-4" />
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
                                                {student.name.charAt(0)}
                                                {student.lastLogin === "Hozir onlayn" && (
                                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#1A1D2E] rounded-full" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-[#FFC107] transition-colors text-sm">{student.name}</div>
                                                <div className="text-[10px] text-gray-500 font-medium">Level {student.level}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-gray-300 font-medium text-sm">{student.email}</span>
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
                                        {student.status === "new" && <span className="adm-badge adm-badge-blue">Yangi</span>}
                                    </td>
                                    <td>
                                        <span className={`text-sm font-medium ${student.lastLogin === "Hozir onlayn" ? "text-green-400" : "text-gray-400"}`}>
                                            {student.lastLogin}
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
