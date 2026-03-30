"use client";

import { useState } from "react";
import { Plus, Search, Video, Eye, Edit, Trash2, CheckCircle, BarChart2 } from "lucide-react";

export default function AdminLessonsPage() {
    const [activeTab, setActiveTab] = useState("all");

    const LESSONS = [
        { id: 1, title: "Colors in English", topic: "Colors", views: 1240, duration: "4:30", status: "published", rating: 4.9 },
        { id: 2, title: "Animals Sound", topic: "Animals", views: 890, duration: "5:15", status: "published", rating: 4.8 },
        { id: 3, title: "My Family", topic: "Family", views: 750, duration: "3:45", status: "published", rating: 4.9 },
        { id: 4, title: "Numbers 1-10", topic: "Numbers", views: 2450, duration: "6:20", status: "published", rating: 4.7 },
        { id: 5, title: "Body Parts", topic: "Body", views: 0, duration: "4:10", status: "draft", rating: 0 },
    ];

    return (
        <div className="p-6 lg:p-10 max-w-[1400px] mx-auto pb-24">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">Darslar Boshqaruvi</h1>
                    <p className="text-gray-400 font-medium">Barcha video darslar, mavzular va statistika</p>
                </div>
                <button className="adm-btn-yellow">
                    Yangi Dars Qo'shish <Plus className="w-4 h-4 text-[#111111]" />
                </button>
            </div>

            <div className="adm-card overflow-hidden">

                {/* Toolbar */}
                <div className="p-4 border-b border-[#ffffff0a] flex flex-col md:flex-row items-center justify-between gap-4 bg-[#1A1D2E]">
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'all' ? 'bg-[#FFC107] text-[#111111]' : 'text-gray-400 hover:text-white bg-white/5'}`}
                        >
                            Barcha Darslar (24)
                        </button>
                        <button
                            onClick={() => setActiveTab('published')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'published' ? 'bg-[#FFC107] text-[#111111]' : 'text-gray-400 hover:text-white bg-white/5'}`}
                        >
                            Nashr etilgan (21)
                        </button>
                        <button
                            onClick={() => setActiveTab('draft')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'draft' ? 'bg-[#FFC107] text-[#111111]' : 'text-gray-400 hover:text-white bg-white/5'}`}
                        >
                            Qoralamalar (3)
                        </button>
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Dars qidirish..."
                            className="adm-input pl-9"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="adm-table min-w-[800px]">
                        <thead>
                            <tr className="bg-[#151826]">
                                <th className="w-12">#</th>
                                <th>Dars nomi</th>
                                <th>Mavzu</th>
                                <th>Statistika</th>
                                <th>Holat</th>
                                <th className="text-right">Harakatlar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {LESSONS.filter(l => activeTab === 'all' ? true : l.status === activeTab).map((lesson) => (
                                <tr key={lesson.id} className="group cursor-pointer">
                                    <td className="text-gray-500 font-bold">{lesson.id}</td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-10 rounded-lg bg-[#21253A] flex items-center justify-center relative overflow-hidden flex-shrink-0">
                                                <Video className="w-4 h-4 text-[#FFC107]" />
                                                <div className="absolute right-1 bottom-1 px-1 rounded bg-[#111111]/80 text-[10px] font-black">{lesson.duration}</div>
                                            </div>
                                            <span className="font-bold text-white group-hover:text-[#FFC107] transition-colors">{lesson.title}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="px-2.5 py-1 rounded-md bg-[#ffffff0a] text-xs font-bold text-gray-300 border border-[#ffffff10]">
                                            {lesson.topic}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                <Eye className="w-3.5 h-3.5" /> {lesson.views} ko'rish
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-[#FFC107]">
                                                ⭐ {lesson.rating || '-'}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {lesson.status === 'published' ? (
                                            <span className="adm-badge adm-badge-green"><CheckCircle className="w-3 h-3" /> Nashr etilgan</span>
                                        ) : (
                                            <span className="adm-badge adm-badge-yellow"><Edit className="w-3 h-3" /> Qoralama</span>
                                        )}
                                    </td>
                                    <td className="text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 rounded-lg bg-[#21253A] hover:bg-[#FFC107] hover:text-[#111111] text-gray-400 transition-colors" title="Statistika">
                                                <BarChart2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-lg bg-[#21253A] hover:bg-blue-500 hover:text-white text-gray-400 transition-colors" title="Tahrirlash">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-lg bg-[#21253A] hover:bg-red-500 hover:text-white text-gray-400 transition-colors" title="O'chirish">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination placeholder */}
                <div className="p-4 border-t border-[#ffffff0a] flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">Jami 24 ta darsdan 1-5 ko'rsatilmoqda</span>
                    <div className="flex gap-1">
                        <button className="w-8 h-8 rounded-lg border border-[#ffffff10] text-gray-400 flex items-center justify-center hover:bg-white/5 disabled:opacity-50" disabled>{"<"}</button>
                        <button className="w-8 h-8 rounded-lg bg-[#FFC107] text-[#111111] font-black flex items-center justify-center">1</button>
                        <button className="w-8 h-8 rounded-lg border border-[#ffffff10] text-gray-400 flex items-center justify-center hover:bg-white/5">2</button>
                        <button className="w-8 h-8 rounded-lg border border-[#ffffff10] text-gray-400 flex items-center justify-center hover:bg-white/5">3</button>
                        <button className="w-8 h-8 rounded-lg border border-[#ffffff10] text-gray-400 flex items-center justify-center hover:bg-white/5">{">"}</button>
                    </div>
                </div>

            </div>

        </div>
    );
}
