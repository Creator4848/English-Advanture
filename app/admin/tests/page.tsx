"use client";

import { useState } from "react";
import { Plus, Search, FileQuestion, Image as ImageIcon, Video, CheckCircle, Edit, Trash2 } from "lucide-react";

export default function AdminTestsPage() {
    const [activeTab, setActiveTab] = useState("all");

    const QUESTIONS = [
        { id: "Q001", lesson: "Colors in English", type: "multiple_choice", text: "What color is the sun?", options: 4, status: "active" },
        { id: "Q002", lesson: "Animals Sound", type: "image_select", text: "Choose the picture of 'Dog'", options: 3, status: "active" },
        { id: "Q003", lesson: "My Family", type: "drag_drop", text: "Match the family members", options: 4, status: "draft" },
        { id: "Q004", lesson: "Numbers 1-10", type: "multiple_choice", text: "How many apples?", options: 4, status: "active" },
        { id: "Q005", lesson: "Colors in English", type: "voice", text: "Say 'Red' aloud", options: 1, status: "active" },
    ];

    return (
        <div className="p-6 lg:p-10 max-w-[1400px] mx-auto pb-24">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">Testlar va o'yinlar</h1>
                    <p className="text-gray-400 font-medium">Test savollari bankini boshqarish</p>
                </div>
                <button className="adm-btn-yellow">
                    Yangi savol qo'shish <Plus className="w-4 h-4 text-[#111111]" />
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
                            Barcha savollar (142)
                        </button>
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'active' ? 'bg-[#FFC107] text-[#111111]' : 'text-gray-400 hover:text-white bg-white/5'}`}
                        >
                            Faol (130)
                        </button>
                        <button
                            onClick={() => setActiveTab('draft')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'draft' ? 'bg-[#FFC107] text-[#111111]' : 'text-gray-400 hover:text-white bg-white/5'}`}
                        >
                            Qoralamalar (12)
                        </button>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <select className="bg-[#151826] border border-[#ffffff10] rounded-lg px-3 py-2 text-sm text-gray-400 font-medium outline-none">
                            <option>Barcha darslar</option>
                            <option>Colors in English</option>
                            <option>Animals Sound</option>
                        </select>
                        <div className="relative flex-1 md:w-64">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Savol qidirish..."
                                className="adm-input pl-9"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="adm-table min-w-[900px]">
                        <thead>
                            <tr className="bg-[#151826]">
                                <th className="w-16">ID</th>
                                <th>Savol matni & Dars</th>
                                <th>Turi</th>
                                <th>Variantlar</th>
                                <th>Holat</th>
                                <th className="text-right">Harakatlar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {QUESTIONS.filter(q => activeTab === 'all' ? true : q.status === activeTab).map((q) => (
                                <tr key={q.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="text-gray-500 font-bold text-xs">{q.id}</td>
                                    <td>
                                        <div>
                                            <div className="font-bold text-white mb-1 group-hover:text-[#FFC107] transition-colors">{q.text}</div>
                                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{q.lesson} darsi uchun</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            {q.type === 'multiple_choice' && <div className="p-1.5 rounded bg-blue-500/10 text-blue-400"><FileQuestion className="w-3.5 h-3.5" /></div>}
                                            {q.type === 'image_select' && <div className="p-1.5 rounded bg-[#FFC107]/10 text-[#FFC107]"><ImageIcon className="w-3.5 h-3.5" /></div>}
                                            {q.type === 'drag_drop' && <div className="p-1.5 rounded bg-purple-500/10 text-purple-400"><ImageIcon className="w-3.5 h-3.5" /></div>}
                                            {q.type === 'voice' && <div className="p-1.5 rounded bg-green-500/10 text-green-400"><ImageIcon className="w-3.5 h-3.5" /></div>}

                                            <span className="text-xs font-bold text-gray-400">
                                                {q.type === 'multiple_choice' && 'To\'g\'ri javobni top'}
                                                {q.type === 'image_select' && 'Rasmni tanla'}
                                                {q.type === 'drag_drop' && 'Drag & Drop'}
                                                {q.type === 'voice' && 'Ovozli javob'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-sm font-bold text-gray-300">{q.options} ta</span>
                                    </td>
                                    <td>
                                        {q.status === 'active' ? (
                                            <span className="adm-badge adm-badge-green"><CheckCircle className="w-3 h-3" /> Faol</span>
                                        ) : (
                                            <span className="adm-badge adm-badge-yellow"><Edit className="w-3 h-3" /> Qoralama</span>
                                        )}
                                    </td>
                                    <td className="text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 rounded-lg bg-[#21253A] hover:bg-blue-500 text-gray-400 hover:text-white transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-lg bg-[#21253A] hover:bg-red-500 text-gray-400 hover:text-white transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>

        </div>
    );
}
