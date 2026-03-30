"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Users, Gamepad2, Award, TrendingUp, BookOpen,
    ArrowUpRight, Video, Target, Sparkles, MoreVertical
} from "lucide-react";

export default function AdminDashboardPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <div className="p-6 lg:p-10 max-w-[1400px] mx-auto pb-24">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">Boshqaruv Paneli</h1>
                    <p className="text-gray-400 font-medium">Platforma faoliyati va o'quvchilar statistikasi</p>
                </div>
                <div className="flex gap-3">
                    <button className="adm-btn-ghost">
                        Hisobot (PDF) <ArrowUpRight className="w-4 h-4 text-[#FFC107]" />
                    </button>
                    <button className="adm-btn-yellow">
                        Yangi dars yuklash <Video className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { icon: Users, label: "Jami o'quvchilar", val: "1,248", sub: "+124 shu oyda", c: "text-blue-400", bg: "bg-blue-400/10" },
                    { icon: Sparkles, label: "Hozir onlayn", val: "42", sub: "Faol o'quvchilar", c: "text-[#FFC107]", bg: "bg-[#FFC107]/10" },
                    { icon: Target, label: "O'rtacha o'zlashtirish", val: "86%", sub: "Barcha testlar boyicha", c: "text-green-400", bg: "bg-green-400/10" },
                    { icon: TrendingUp, label: "Platformaga kirishlar", val: "8.4k", sub: "+12% o'sish", c: "text-purple-400", bg: "bg-purple-400/10" },
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        className="adm-card p-6 relative overflow-hidden group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${s.bg} blur-2xl group-hover:blur-xl transition-all opacity-50`} />
                        <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                            <s.icon className={`w-6 h-6 ${s.c}`} />
                        </div>
                        <div className="text-3xl font-black text-white mb-1">{s.val}</div>
                        <div className="text-sm font-semibold text-gray-400">{s.label}</div>
                        <div className="text-xs font-semibold text-gray-500 mt-3 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> {s.sub}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left col: Charts */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Activity Chart */}
                    <div className="adm-card p-6 md:p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-white">Haftalik faollik</h3>
                                <p className="text-xs text-gray-400">Dars ko'rish va test ishlash statistikasi</p>
                            </div>
                            <select className="bg-[#21253A] border border-[#ffffff10] rounded-lg px-3 py-1.5 text-sm text-white font-medium outline-none">
                                <option>Shu hafta</option>
                                <option>O'tgan hafta</option>
                                <option>Shu oy</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-2 md:gap-4 h-[200px]">
                            {[30, 45, 60, 40, 80, 65, 90].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                    <div className="w-full adm-chart-bar rounded-t-lg group relative">
                                        <div
                                            className="adm-chart-bar-fill rounded-t-lg"
                                            style={{ height: mounted ? `${h}%` : "0%" }}
                                        />
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#FFC107] text-[#111111] text-xs font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                            {h * 12}
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase">
                                        {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'][i]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top content */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="adm-card p-6">
                            <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                                <Award className="w-5 h-5 text-[#FFC107]" /> Eng faol o'quvchilar
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { n: "Ali Valiyev", l: 12, xp: 14500 },
                                    { n: "Zarina Alimova", l: 11, xp: 12400 },
                                    { n: "Jasur Qodirov", l: 9, xp: 9800 },
                                    { n: "Madina T.", l: 9, xp: 9100 },
                                ].map((s, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-[#FFC107] text-[#111111] font-black flex items-center justify-center text-sm flex-shrink-0">
                                            {s.n.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{s.n}</p>
                                            <p className="text-xs text-gray-400">Level {s.l}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[#FFC107] font-black text-sm">{s.xp}</span>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold">XP</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="adm-card p-6">
                            <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-[#FFC107]" /> Mashhur darslar
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { n: "Colors in English", v: 450, r: 4.9 },
                                    { n: "Animals Sound", v: 380, r: 4.8 },
                                    { n: "My Family", v: 310, r: 4.9 },
                                    { n: "Numbers 1-10", v: 290, r: 4.7 },
                                ].map((l, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-12 h-8 rounded bg-[#21253A] flex items-center justify-center flex-shrink-0">
                                            <Video className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{l.n}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Users className="w-3 h-3" /> {l.v}
                                                </span>
                                                <span className="text-xs text-[#FFC107] flex items-center gap-0.5">
                                                    ⭐ {l.r}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right col: Activities */}
                <div>
                    <div className="adm-card p-6 h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">So'nggi harakatlar</h3>
                            <button className="text-gray-400 hover:text-white"><MoreVertical className="w-5 h-5" /></button>
                        </div>

                        <div className="relative pl-6 space-y-8 border-l-2 border-[#21253A] ml-2">
                            {[
                                { time: "2 daqiqa oldin", icon: "⭐", text: "Akmal 'Super Star' nishonini oldi", type: "badge" },
                                { time: "15 daqiqa oldin", icon: "✅", text: "Lola 'Colors' testini 100% ga bajardi", type: "test" },
                                { time: "1 soat oldin", icon: "🎬", text: "Jasur 5-mavzu videosini ko'rib tugatdi", type: "video" },
                                { time: "2 soat oldin", icon: "🎙️", text: "Zarina AI bilan 10 daqiqa gaplashdi", type: "ai" },
                                { time: "3 soat oldin", icon: "👋", text: "Yangi o'quvchi ro'yxatdan o'tdi (Timur)", type: "user" },
                                { time: "Kecha, 18:30", icon: "✅", text: "Davron barcha hafta vazifalarini tugatdi", type: "test" },
                            ].map((act, i) => (
                                <div key={i} className="relative">
                                    {/* Timeline dot */}
                                    <div className="absolute -left-[35px] top-1 w-8 h-8 rounded-full bg-[#1A1D2E] border-2 border-[#21253A] flex items-center justify-center text-xs z-10 shadow-[0_0_0_4px_#1A1D2E]">
                                        {act.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white mb-1.5 leading-snug">{act.text}</p>
                                        <p className="text-xs font-semibold text-gray-500">{act.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-8 py-2.5 rounded-xl border border-[#ffffff10] text-sm font-bold text-gray-400 hover:text-white hover:bg-[#ffffff05] transition-all">
                            Barchasini ko'rish
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
}
