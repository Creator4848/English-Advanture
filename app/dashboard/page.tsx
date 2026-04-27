"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Mic, Star, Trophy, Zap, ArrowRight, ClipboardList, RefreshCw } from "lucide-react";
import Header from "@/components/Header";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

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
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("user_token");
        if (!token) {
            router.push("/login");
            return;
        }

        const userInfoRaw = localStorage.getItem("user_info");
        const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : {};
        // The user object could be nested or flat depending on how api/index.py returns it
        const uId = userInfo.user?.id || userInfo.user_id || userInfo.id || 1;

        (async () => {
            try {
                const res = await fetch(`${API}/progress/${uId}`);
                if (res.ok) setData(await res.json());
                else setData(MOCK_DASHBOARD);
            } catch {
                setData(MOCK_DASHBOARD);
            } finally {
                setLoading(false);
            }
        })();
    }, [router]);

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

    const placementDone: boolean = d.placement_completed || false;
    const placementLevel: string | null = d.placement_level || null;

    const LEVEL_INFO: Record<string, { name: string; description: string }> = {
        A0: { name: "Starters",          description: "Siz endi o'rganishni boshlayapsiz!" },
        A1: { name: "Elementary",         description: "Sizda asosiy tushunchalar bor." },
        A2: { name: "Pre-Intermediate",   description: "Siz oddiy mavzularda muloqot qila olasiz." },
        B1: { name: "Intermediate",       description: "Mustaqil suhbatdosh – kundalik mavzularda bemalol gaplasha olasiz." },
        B2: { name: "Upper-Intermediate", description: "Ishonchli muloqot – murakkab matnlarni tushuna olasiz." },
        C1: { name: "Advanced",           description: "Ilg'or daraja – akademik va professional maqsadlarda moslashuvchan foydalanasiz." },
        C2: { name: "Proficiency",        description: "Mukammal/Ekspert – ona tili darajasida, juda aniq va ravon so'zlaysiz." },
    };

    const LEVEL_ORDER = ["A0","A1","A2","B1","B2","C1","C2"];
    const levelIdx = placementLevel ? LEVEL_ORDER.indexOf(placementLevel) : -1;
    const nextLevel = levelIdx >= 0 && levelIdx < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[levelIdx + 1] : null;
    const levelProgressPct = levelIdx >= 0 ? Math.round(((levelIdx + 1) / LEVEL_ORDER.length) * 100) : 0;

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

                {/* Placement Test Hero Card */}
                {!placementDone ? (
                    <motion.div
                        className="mb-8 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
                        style={{ background: "linear-gradient(135deg, #FFF3CC 0%, #FFE580 100%)", border: "2px solid #FFB800" }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-5">
                            <div className="text-5xl">📝</div>
                            <div>
                                <div className="text-[#E6A500] font-black text-xs mb-1 uppercase tracking-wider">Yangi funksiya</div>
                                <h3 className="text-[#111111] font-black text-xl mb-1">O'z darajangizni bilasizmi?</h3>
                                <p className="text-[#6B4500] text-sm font-medium">
                                    Hoziroq testdan o'ting va o'zingizga mos darslarni tanlang!
                                </p>
                            </div>
                        </div>
                        <Link href="/placement-test" className="btn-yellow flex-shrink-0" style={{ background: "#111111", color: "#FFB800" }}>
                            <ClipboardList className="w-4 h-4" /> Testni boshlash
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        className="mb-8 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6"
                        style={{ background: "#111111" }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="text-4xl flex-shrink-0">🎓</div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="text-[#FFB800] font-black text-xs mb-1 uppercase tracking-wider">Sizning darajangiz</div>
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <span className="text-white font-black text-2xl">{placementLevel}</span>
                                <span className="text-[#FFB800] font-black text-lg">{LEVEL_INFO[placementLevel || "A0"]?.name}</span>
                            </div>
                            <p className="text-gray-400 text-sm font-medium mb-3">{LEVEL_INFO[placementLevel || "A0"]?.description}</p>
                            <div className="max-w-xs">
                                <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                    <span>Daraja progressi</span>
                                    <span>{nextLevel ? `Keyingi: ${nextLevel}` : "Eng yuqori daraja!"}</span>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill" style={{ width: `${levelProgressPct}%` }} />
                                </div>
                            </div>
                        </div>
                        <Link href="/placement-test" className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-bold transition-colors flex-shrink-0">
                            <RefreshCw className="w-3.5 h-3.5" /> Qayta topshirish
                        </Link>
                    </motion.div>
                )}

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
