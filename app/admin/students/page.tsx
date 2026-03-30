"use client";

import { useState } from "react";
import { Search, Users, ShieldAlert, Award, Filter, Download } from "lucide-react";

export default function AdminStudentsPage() {
    const [activeTab, setActiveTab] = useState("all");

    const STUDENTS = [
        { id: "S001", name: "Ali Valiyev", phone: "+998 90 123 45 67", level: 12, xp: 14500, regDate: "12-Mar, 2026", status: "active", lastLogin: "Bugun, 14:30" },
        { id: "S002", name: "Zarina Alimova", phone: "+998 90 987 65 43", level: 11, xp: 12400, regDate: "15-Mar, 2026", status: "active", lastLogin: "Kecha, 18:45" },
        { id: "S003", name: "Jasur Qodirov", phone: "+998 99 111 22 33", level: 9, xp: 9800, regDate: "20-Mar, 2026", status: "active", lastLogin: "2 kun oldin" },
        { id: "S004", name: "Madina To'rayeva", phone: "+998 97 444 55 66", level: 9, xp: 9100, regDate: "05-Apr, 2026", status: "inactive", lastLogin: "10 kun oldin" },
        { id: "S005", name: "Timur Karimov", phone: "+998 93 777 88 99", level: 2, xp: 1200, regDate: "Bugun", status: "new", lastLogin: "Hozir onlayn" },
    ];

    return (
        <div className="p-6 lg:p-10 max-w-[1400px] mx-auto pb-24">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">O'quvchilar Ro'yxati</h1>
                    <p className="text-gray-400 font-medium">Barcha o'quvchilar, ularning progressi va faollik darajasi</p>
                </div>
                <div className="flex gap-3">
                    <button className="adm-btn-ghost">
                        Eksport (CSV) <Download className="w-4 h-4 text-white" />
                    </button>
                    <button className="adm-btn-yellow">
                        O'quvchi qo'shish <Users className="w-4 h-4 text-[#111111]" />
                    </button>
                </div>
            </div>

            <div className="adm-card overflow-hidden">

                {/* Toolbar */}
                <div className="p-4 border-b border-[#ffffff0a] flex flex-col md:flex-row items-center justify-between gap-4 bg-[#1A1D2E]">
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'all' ? 'bg-[#FFC107] text-[#111111]' : 'text-gray-400 hover:text-white bg-white/5'}`}
                        >
                            Barchasi (1,248)
                        </button>
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'active' ? 'bg-[#FFC107] text-[#111111]' : 'text-gray-400 hover:text-white bg-white/5'}`}
                        >
                            Faol o'quvchilar (890)
                        </button>
                        <button
                            onClick={() => setActiveTab('inactive')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'inactive' ? 'bg-[#FFC107] text-[#111111]' : 'text-gray-400 hover:text-white bg-white/5'}`}
                        >
                            Nofaol (358)
                        </button>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Ism yoki raqam..."
                                className="adm-input pl-9"
                            />
                        </div>
                        <button className="p-2 rounded-lg border border-[#ffffff10] text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="adm-table min-w-[1000px]">
                        <thead>
                            <tr className="bg-[#151826]">
                                <th>O'quvchi</th>
                                <th>Telefon raqam</th>
                                <th>Level / XP</th>
                                <th>Ro'yxatdan o'tgan</th>
                                <th>So'nggi kirish</th>
                                <th>Holat</th>
                                <th className="text-right">Profilga kirish</th>
                            </tr>
                        </thead>
                        <tbody>
                            {STUDENTS.filter(s => activeTab === 'all' ? true : s.status === activeTab || (activeTab === 'active' && s.status === 'new')).map((student) => (
                                <tr key={student.id} className="group cursor-pointer">
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#21253A] text-white font-black flex items-center justify-center relative flex-shrink-0">
                                                {student.name.charAt(0)}
                                                {student.lastLogin === 'Hozir onlayn' && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1A1D2E] rounded-full"></div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-[#FFC107] transition-colors">{student.name}</div>
                                                <div className="text-xs text-gray-500 font-medium">ID: {student.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-gray-300 font-medium">{student.phone}</span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="px-2 py-0.5 rounded bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20 font-black text-xs">
                                                Lvl {student.level}
                                            </div>
                                            <span className="text-sm font-bold text-gray-400">{student.xp.toLocaleString()} XP</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-gray-400 font-medium text-sm">{student.regDate}</span>
                                    </td>
                                    <td>
                                        <span className={`text-sm font-medium ${student.lastLogin === 'Hozir onlayn' ? 'text-green-400' : 'text-gray-400'}`}>
                                            {student.lastLogin}
                                        </span>
                                    </td>
                                    <td>
                                        {student.status === 'active' && <span className="adm-badge adm-badge-green">Faol</span>}
                                        {student.status === 'inactive' && <span className="adm-badge adm-badge-red">Nofaol</span>}
                                        {student.status === 'new' && <span className="adm-badge adm-badge-blue">Yangi</span>}
                                    </td>
                                    <td className="text-right">
                                        <button className="text-sm font-bold text-[#FFC107] hover:text-white transition-colors">
                                            Ko'rish &rarr;
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination placeholder */}
                <div className="p-4 border-t border-[#ffffff0a] flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">Jami 1,248 o'quvchidan 1-5 ko'rsatilmoqda</span>
                    <div className="flex gap-1">
                        <button className="w-8 h-8 rounded-lg border border-[#ffffff10] text-gray-400 flex items-center justify-center hover:bg-white/5 disabled:opacity-50" disabled>{"<"}</button>
                        <button className="w-8 h-8 rounded-lg bg-[#FFC107] text-[#111111] font-black flex items-center justify-center">1</button>
                        <button className="w-8 h-8 rounded-lg border border-[#ffffff10] text-gray-400 flex items-center justify-center hover:bg-white/5">2</button>
                        <button className="w-8 h-8 rounded-lg border border-[#ffffff10] text-gray-400 flex items-center justify-center hover:bg-white/5">3</button>
                        <span className="w-8 h-8 flex items-center justify-center text-gray-500">...</span>
                        <button className="w-8 h-8 rounded-lg border border-[#ffffff10] text-gray-400 flex items-center justify-center hover:bg-white/5">250</button>
                        <button className="w-8 h-8 rounded-lg border border-[#ffffff10] text-gray-400 flex items-center justify-center hover:bg-white/5">{">"}</button>
                    </div>
                </div>

            </div>

        </div>
    );
}
