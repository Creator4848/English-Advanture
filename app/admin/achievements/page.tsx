"use client";

import { useState } from "react";
import { Trophy, Plus, Star, Zap, Search, Settings } from "lucide-react";

export default function AdminAchievementsPage() {
    const [activeTab, setActiveTab] = useState("badges");

    const BADGES = [
        { id: 1, name: "Birinchi Dars", emoji: "🎬", desc: "Siz platformadagi birinchi videongizni ko'rib bo'ldingiz!", xp: 50, req: "1 ta video dars ko'rish", claimCount: 840 },
        { id: 2, name: "Test Qahramoni", emoji: "🏆", desc: "Birinchi marta testda 100% natija oldingiz!", xp: 100, req: "1 ta testni xatosiz ishlash", claimCount: 620 },
        { id: 3, name: "Suhbatchi", emoji: "🎙️", desc: "AI bot bilan ingliz tilida suhbatlashdingiz", xp: 50, req: "Kamida 5 daqiqalik suhbat", claimCount: 450 },
        { id: 4, name: "Super Star", emoji: "⭐", desc: "Bir hafta uzluksiz platformaga kirdingiz!", xp: 200, req: "7 kunlik uzluksiz seriya", claimCount: 120 },
        { id: 5, name: "So'z Ustasi", emoji: "📝", desc: "Testlarda 50 dan ortiq so'zni to'g'ri topdingiz", xp: 150, req: "50 ta yopiq savol", claimCount: 210 },
    ];

    const LEADERBOARD = [
        { rank: 1, name: "Ali Valiyev", level: 12, xp: 14500, badges: 8 },
        { rank: 2, name: "Zarina Alimova", level: 11, xp: 12400, badges: 7 },
        { rank: 3, name: "Jasur Qodirov", level: 9, xp: 9800, badges: 5 },
        { rank: 4, name: "Madina To'rayeva", level: 9, xp: 9100, badges: 5 },
        { rank: 5, name: "Davron B.", level: 8, xp: 8400, badges: 4 },
    ];

    return (
        <div className="p-6 lg:p-10 max-w-[1400px] mx-auto pb-24">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">Yutuqlar va Reyting</h1>
                    <p className="text-gray-400 font-medium">Nishonlar, darajalar va umumiy o'quvchilar ro'yxati</p>
                </div>
                {activeTab === 'badges' && (
                    <button className="adm-btn-yellow">
                        Yangi Nishon Qo'shish <Plus className="w-4 h-4 text-[#111111]" />
                    </button>
                )}
            </div>

            <div className="adm-card overflow-hidden">

                {/* Toolbar */}
                <div className="p-4 border-b border-[#ffffff0a] flex flex-col md:flex-row items-center gap-4 bg-[#1A1D2E]">
                    <div className="flex bg-[#21253A] p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('badges')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'badges' ? 'bg-[#151826] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Nishonlar (Badges)
                        </button>
                        <button
                            onClick={() => setActiveTab('leaderboard')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-[#151826] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Leaderboard
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">

                    {activeTab === 'badges' ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {BADGES.map((badge) => (
                                <div key={badge.id} className="relative p-6 rounded-2xl bg-[#21253A] border border-[#ffffff0a] hover:border-[#FFC107]/30 transition-colors group">
                                    <div className="absolute top-4 right-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Settings className="w-4 h-4 hover:text-white" />
                                    </div>

                                    <div className="w-16 h-16 rounded-2xl bg-[#1A1D2E] text-3xl flex items-center justify-center border border-[#ffffff10] shadow-[0_4px_12px_rgba(0,0,0,0.2)] mb-4">
                                        {badge.emoji}
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#FFC107] transition-colors">
                                        {badge.name}
                                    </h3>
                                    <p className="text-sm text-gray-400 font-medium mb-4 leading-relaxed line-clamp-2">
                                        {badge.desc}
                                    </p>

                                    <div className="space-y-3 p-3 bg-[#151826] rounded-xl border border-[#ffffff05]">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500 font-bold uppercase">Shart</span>
                                            <span className="text-white font-medium text-right ml-2">{badge.req}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs border-t border-[#ffffff10] pt-2">
                                            <span className="text-gray-500 font-bold uppercase">Mukofot</span>
                                            <span className="text-[#FFC107] font-black flex items-center gap-1"><Zap className="w-3 h-3" /> {badge.xp} XP</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs border-t border-[#ffffff10] pt-2">
                                            <span className="text-gray-500 font-bold uppercase">Olingan</span>
                                            <span className="text-blue-400 font-bold">{badge.claimCount} ta</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <div className="relative w-full md:w-64">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input type="text" placeholder="O'quvchini qidirish..." className="adm-input pl-9" />
                                </div>
                                <button className="adm-btn-ghost text-xs">O'tgan osni ko'rish</button>
                            </div>

                            <div className="space-y-3">
                                {LEADERBOARD.map((lb) => (
                                    <div key={lb.rank} className="flex items-center p-4 rounded-xl bg-[#21253A] border border-[#ffffff0a] hover:bg-[#ffffff10] transition-colors">
                                        <div className="w-10 text-center font-black text-xl text-gray-500">
                                            {lb.rank === 1 ? '🥇' : lb.rank === 2 ? '🥈' : lb.rank === 3 ? '🥉' : `#${lb.rank}`}
                                        </div>

                                        <div className="w-12 h-12 rounded-full bg-[#1A1D2E] text-white font-black flex items-center justify-center mx-4 flex-shrink-0 border-2 border-[#FFC107]/20">
                                            {lb.name.charAt(0)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-bold text-lg">{lb.name}</h4>
                                            <div className="flex gap-4 mt-1">
                                                <span className="text-xs text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-500/10">Level {lb.level}</span>
                                                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                    <Trophy className="w-3 h-3" /> {lb.badges} nishon
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right ml-4">
                                            <span className="text-2xl font-black text-[#FFC107] tracking-tight">{lb.xp.toLocaleString()}</span>
                                            <span className="text-xs font-bold text-gray-500 uppercase ml-1">XP</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
