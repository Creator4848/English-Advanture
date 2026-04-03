"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Mic, Star, Trophy, Zap, ArrowRight } from "lucide-react";
import Header from "@/components/Header";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";
const USER_ID = 1;

const MOCK_DASHBOARD = {
    user_id: 1,
    username: "Ali",
    full_name: "Ali Valiyev",
    level: 3,
    xp: 2450,
    coins: 180,
    videos_completed: 8,
    quizzes_passed: 5,
    speaking_minutes: 12,
    badges: [
        { code: "first_video", name: "Birinchi Dars 🎬", icon_url: "" },
        { code: "quiz_hero", name: "Test Qahramoni 🏆", icon_url: "" },
        { code: "speaker", name: "Suhbatchi 🎙️", icon_url: "" },
    ],
};

const XP_PER_LEVEL = 1000;

const RECENT_ACTIVITIES = [
    { icon: "🎬", text: "Colors in English darsini ko'rdingiz", xp: "+50 XP", time: "1 soat oldin" },
    { icon: "📝", text: "Colors Quiz-ni bajardingiz (90%)", xp: "+135 XP", time: "1 soat oldin" },
    { icon: "🎙️", text: "Alex bilan 5 daqiqa inglizcha gaplashdingiz", xp: "+50 XP", time: "Kecha" },
];

export default function DashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API}/progress/${USER_ID}`);
                if (res.ok) setData(await res.json());
                else setData(MOCK_DASHBOARD);
            } catch {
                setData(MOCK_DASHBOARD);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-5xl animate-bounce">⚡</div>
            </div>
        );
    }

    const d = data || MOCK_DASHBOARD;
    const levelXP = d.xp % XP_PER_LEVEL;
    const levelPct = Math.round((levelXP / XP_PER_LEVEL) * 100);
    const nextLevelXP = XP_PER_LEVEL - levelXP;

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col" id="dashboard-page">
            <Header />

            {/* Header */}
            <div className="bg-[#111111] px-6 lg:px-20 py-12">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">

                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-2xl bg-[#FFB800] flex items-center justify-center text-4xl shadow-lg flex-shrink-0">
                        👦
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="badge bg-[#FFB800]/20 text-[#FFB800] mb-3">Level {d.level}</div>
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
                            {d.full_name || d.username}
                        </h1>
                        <div className="flex flex-wrap gap-6 justify-center md:justify-start mt-4">
                            {[
                                { v: `${d.xp} XP`, l: "Umumiy tajriba", icon: <Zap className="w-4 h-4 text-[#FFB800]" /> },
                                { v: d.coins, l: "Coin", icon: <Star className="w-4 h-4 text-[#FFB800]" /> },
                                { v: d.badges.length, l: "Badge", icon: <Trophy className="w-4 h-4 text-[#FFB800]" /> },
                            ].map((s) => (
                                <div key={s.l} className="text-center md:text-left">
                                    <div className="flex items-center gap-1 text-white font-black text-2xl">
                                        {s.icon} {s.v}
                                    </div>
                                    <div className="text-gray-400 text-xs font-medium">{s.l}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Level progress */}
                    <div className="text-center md:text-right">
                        <div className="text-white font-black text-sm mb-2">
                            Keyingi levelga {nextLevelXP} XP qoldi
                        </div>
                        <div className="w-48 progress-track">
                            <div className="progress-fill" style={{ width: `${levelPct}%` }} />
                        </div>
                        <div className="text-gray-400 text-xs font-medium mt-1">{levelXP} / {XP_PER_LEVEL} XP</div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 lg:px-20 py-10">

                {/* Stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    {[
                        {
                            icon: <BookOpen className="w-6 h-6 text-[#FFB800]" />,
                            label: "Ko'rilgan Darslar",
                            value: d.videos_completed,
                            link: "/lessons",
                        },
                        {
                            icon: <CheckCircle className="w-6 h-6 text-[#FFB800]" />,
                            label: "O'tilgan Testlar",
                            value: d.quizzes_passed,
                            link: "/lessons",
                        },
                        {
                            icon: <Mic className="w-6 h-6 text-[#FFB800]" />,
                            label: "Speaking Daqiqalar",
                            value: d.speaking_minutes,
                            link: "/speaking-club",
                        },
                    ].map((s) => (
                        <Link href={s.link} key={s.label}>
                            <motion.div
                                className="card p-6 flex items-center gap-4 hover:border-[#FFB800] cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-[#FFF3CC] flex items-center justify-center flex-shrink-0">
                                    {s.icon}
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-[#111111]">{s.value}</div>
                                    <div className="text-xs text-gray-400 font-bold">{s.label}</div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-8">

                    {/* Badges */}
                    <div className="card p-6 bg-white">
                        <h2 className="font-black text-[#111111] text-xl mb-5 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-[#FFB800]" /> Mening Yutuqlarim
                        </h2>
                        {d.badges.length ? (
                            <div className="flex flex-wrap gap-3">
                                {d.badges.map((b: any) => (
                                    <motion.div
                                        key={b.code}
                                        className="card px-4 py-3 flex items-center gap-2 bg-[#FFF3CC] border-[#FFB800]"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <span className="text-2xl">{b.name.split(" ").pop()}</span>
                                        <span className="text-xs font-black text-[#111111]">
                                            {b.name.split(" ").slice(0, -1).join(" ")}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="font-medium text-sm">Yutuqlar hali yo'q. Darslarni boshlang!</p>
                            </div>
                        )}
                    </div>

                    {/* Recent activity */}
                    <div className="card p-6 bg-white">
                        <h2 className="font-black text-[#111111] text-xl mb-5 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-[#FFB800]" /> So'nggi Faollik
                        </h2>
                        <div className="space-y-4">
                            {RECENT_ACTIVITIES.map((a, i) => (
                                <motion.div
                                    key={i}
                                    className="flex items-start gap-3"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                                        {a.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-[#111111]">{a.text}</p>
                                        <p className="text-xs text-gray-400 font-medium mt-0.5">{a.time}</p>
                                    </div>
                                    <span className="badge text-xs">{a.xp}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA banner */}
                <motion.div
                    className="mt-8 bg-[#111111] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div>
                        <div className="text-[#FFB800] font-black text-sm mb-1">Davom eting! 🚀</div>
                        <h3 className="text-white font-black text-2xl">Keyingi darsni boshlang</h3>
                        <p className="text-gray-400 text-sm font-medium mt-1">
                            Har kunlik mashqlar bilan ingliz tilingizni rivojlantiring.
                        </p>
                    </div>
                    <Link href="/lessons" id="continue-learning-btn" className="btn-yellow flex-shrink-0">
                        Davom Etish <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>

            </div>
        </main>
    );
}
