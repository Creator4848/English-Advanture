"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Search, ChevronRight, Clock, Star, Play, Lock, ArrowRight } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

/* ── Mock data ─────────────────────────────────────────────────────── */
const MOCK_VIDEOS = [
    { id: 1, youtube_id: "k2LjrJB1qUw", title: "Colors in English 🎨", topic: "Colors", difficulty: 1, duration_seconds: 180 },
    { id: 2, youtube_id: "o5bvhHSvVWE", title: "ABC Song for Kids 🔤", topic: "Alphabet", difficulty: 1, duration_seconds: 120 },
    { id: 3, youtube_id: "eY8IoVTOVFE", title: "Farm Animals 🐾", topic: "Animals", difficulty: 1, duration_seconds: 240 },
    { id: 4, youtube_id: "hq3yfQnllfQ", title: "Numbers 1-20 🔢", topic: "Numbers", difficulty: 1, duration_seconds: 200 },
    { id: 5, youtube_id: "tVlcKp3bWH8", title: "My Family 👨‍👩‍👧", topic: "Family", difficulty: 2, duration_seconds: 300 },
    { id: 6, youtube_id: "VZZ0od_wiJ8", title: "Fruits & Vegetables 🍎", topic: "Food", difficulty: 2, duration_seconds: 270 },
    { id: 7, youtube_id: "gq8Smgi57ks", title: "Weather & Seasons ☀️", topic: "Weather", difficulty: 2, duration_seconds: 220 },
    { id: 8, youtube_id: "6-2IJVf4gPM", title: "Body Parts 💪", topic: "Body Parts", difficulty: 1, duration_seconds: 190 },
];

const TOPICS = [
    "All", "My Family", "English Alphabet for Kids", "ABC Song for Kids",
    "Learning Colors In English", "Learning Shapes in English",
    "Days of the Week", "Greetings and First Meeting",
    "Me, You, and They", "My Body and Face",
    "Yummy Food and Drinks", "Fruits and Vegetables",
    "My School Objects", "Animals", "Transport",
    "Beautiful Nature", "Clothes"
];

// ── 3-level config ─────────────────────────────────────────────────────────
const LEVEL_CONFIG: Record<string, { name: string; emoji: string; color: string; bg: string; border: string; diff: number }> = {
    beginner: { name: "Boshlang'ich", emoji: "🌱", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300", diff: 1 },
    intermediate: { name: "O'rta", emoji: "📘", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-300", diff: 2 },
    advanced: { name: "Yuqori", emoji: "🏆", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300", diff: 3 },
};

const DIFF_LABEL: Record<number, { name: string; color: string; emoji: string }> = {
    1: { name: "Boshlang'ich", color: "bg-emerald-100 text-emerald-700", emoji: "🌱" },
    2: { name: "O'rta", color: "bg-blue-100 text-blue-700", emoji: "📘" },
    3: { name: "Yuqori", color: "bg-amber-100 text-amber-700", emoji: "🏆" },
};

function fmtDuration(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

interface Video {
    id: number; youtube_id: string; title: string;
    topic: string; difficulty: number; duration_seconds: number; thumbnail_url?: string;
}

/* ── Inner component (uses useSearchParams — must be in Suspense) ── */
function LessonsInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const defaultTopic = searchParams.get("topic") || "All";

    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [topic, setTopic] = useState(defaultTopic);
    const [placementLevel, setPlacementLevel] = useState<string | null>(null);
    const [placementDone, setPlacementDone] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);

    // Auth + placement status
    useEffect(() => {
        const token = localStorage.getItem("user_token");
        if (!token) { router.push("/login"); return; }
        const raw = localStorage.getItem("user_info");
        const info = raw ? JSON.parse(raw) : {};
        const uid = info.user?.id || info.user_id || info.id;
        if (!uid) { router.push("/login"); return; }
        setUserId(uid);

        // Load placement status
        (async () => {
            try {
                const res = await fetch(`${API}/placement/status/${uid}`);
                if (res.ok) {
                    const status = await res.json();
                    if (status.placement_completed && status.placement_level) {
                        setPlacementDone(true);
                        setPlacementLevel(status.placement_level);
                    }
                }
            } catch { /* silent */ }
        })();
    }, [router]);

    // Fetch videos – filter by placement level when available
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const params = new URLSearchParams();
                if (topic !== "All") params.set("topic", topic);
                // API filters by difficulty matching placement level
                if (placementDone && placementLevel) {
                    const diff = LEVEL_CONFIG[placementLevel]?.diff;
                    if (diff) params.set("difficulty", String(diff));
                }
                const res = await fetch(`${API}/videos?${params}`, { cache: "no-store" });
                if (res.ok) {
                    const data = await res.json();
                    if (data.length) {
                        setVideos(data);
                    } else {
                        // fallback: try without difficulty filter
                        const r2 = await fetch(`${API}/videos${topic !== "All" ? `?topic=${topic}` : ""}`, { cache: "no-store" });
                        const d2 = r2.ok ? await r2.json() : MOCK_VIDEOS;
                        // client-side filter by placement diff if possible
                        const diff = placementDone && placementLevel ? LEVEL_CONFIG[placementLevel]?.diff : null;
                        setVideos(diff ? d2.filter((v: Video) => v.difficulty === diff) : (d2.length ? d2 : MOCK_VIDEOS));
                    }
                } else {
                    setVideos(MOCK_VIDEOS);
                }
            } catch {
                setVideos(MOCK_VIDEOS);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, [topic, placementDone, placementLevel]);

    const filtered = videos.filter((v) =>
        v.title.toLowerCase().includes(query.toLowerCase()) &&
        (topic === "All" || v.topic === topic)
    );

    const lvlCfg = placementLevel ? LEVEL_CONFIG[placementLevel] : null;
    const nextLevels: Record<string, string> = { beginner: "intermediate", intermediate: "advanced" };
    const nextLevel = placementLevel ? nextLevels[placementLevel] : null;
    const nextLvlCfg = nextLevel ? LEVEL_CONFIG[nextLevel] : null;

    return (
        <>
            <Header />
            {/* Hero */}
            <div className="bg-[#111111] py-14 px-6 lg:px-20">
                <div className="max-w-7xl mx-auto">
                    <div className="badge mb-5 bg-[#FFB800]/20 text-[#FFB800]">
                        <BookOpen className="w-3.5 h-3.5" /> Video darslar
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
                        Ingliz tili <span className="text-[#FFB800]">darslari</span>
                    </h1>
                    <p className="text-gray-400 font-medium text-lg max-w-xl">
                        Har bir mavzu bo'yicha video darslarni tomosha qiling va testlarni bajaring.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-20 py-10">

                {/* Placement level banner */}
                {!placementDone && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-5 rounded-2xl bg-[#FFF3CC] border-2 border-[#FFB800] flex flex-col sm:flex-row items-start sm:items-center gap-4"
                    >
                        <div className="text-4xl">🎯</div>
                        <div className="flex-1">
                            <h3 className="font-black text-[#111111] text-base mb-1">Darajangizni aniqlab olaylik!</h3>
                            <p className="text-sm text-gray-600 font-medium">15 ta qisqa savol orqali ingliz tili darajangizni bilib, siz uchun mos darslar ko'rsatamiz.</p>
                        </div>
                        <Link href="/placement-test" className="btn-yellow shrink-0 text-sm">
                            Testni boshlash <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                )}

                {placementDone && lvlCfg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-8 p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${lvlCfg.bg} ${lvlCfg.border}`}
                    >
                        <div className="text-4xl">{lvlCfg.emoji}</div>
                        <div className="flex-1">
                            <h3 className={`font-black text-base mb-1 ${lvlCfg.color}`}>
                                {lvlCfg.name} daraja darslarini ko'ryapsiz
                            </h3>
                            <p className="text-sm text-gray-500 font-medium">
                                Faqat sizning darajangizga mos darslar ko'rsatilmoqda.
                                {nextLvlCfg && ` Keyingi daraja: ${nextLvlCfg.emoji} ${nextLvlCfg.name}`}
                            </p>
                        </div>
                        <div className="flex gap-2 shrink-0 flex-wrap">
                            {nextLevel && (
                                <Link href="/placement-test" className={`text-xs font-black px-4 py-2 rounded-xl border-2 ${lvlCfg.border} ${lvlCfg.color} ${lvlCfg.bg} hover:opacity-80 transition-opacity flex items-center gap-1`}>
                                    Keyingi daraja testi <ArrowRight className="w-3 h-3" />
                                </Link>
                            )}
                            <button
                                onClick={() => { setPlacementDone(false); setPlacementLevel(null); }}
                                className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Barchani ko'rish
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Search */}
                <div className="mb-8">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            id="lessons-search"
                            type="text"
                            placeholder="Dars nomini qidiring..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl font-medium text-sm focus:outline-none focus:border-[#FFB800] transition-colors"
                        />
                    </div>
                </div>

                {/* Topic tabs */}
                <div className="flex flex-wrap gap-2 mb-10">
                    {TOPICS.map((t) => (
                        <button
                            key={t}
                            id={`topic-${t.toLowerCase()}`}
                            onClick={() => setTopic(t)}
                            className={`px-4 py-2 rounded-full text-sm font-black transition-all ${topic === t
                                ? "bg-[#FFB800] text-[#111111] shadow-md"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="card animate-pulse">
                                <div className="h-44 bg-gray-100 rounded-t-2xl" />
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filtered.map((v, i) => {
                            const diffInfo = DIFF_LABEL[v.difficulty] || DIFF_LABEL[1];
                            return (
                                <motion.div
                                    key={v.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Link href={`/lessons/${v.id}`} id={`lesson-card-${v.id}`}>
                                        <div className="card overflow-hidden group cursor-pointer">
                                            <div className="relative h-44 bg-[#FFF3CC] overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={v.thumbnail_url || `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`}
                                                    alt={v.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`;
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="w-12 h-12 rounded-full bg-[#FFB800] flex items-center justify-center shadow-lg">
                                                        <Play className="w-6 h-6 text-white ml-0.5" />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded">
                                                    <Clock className="inline w-3 h-3 mr-0.5" />
                                                    {fmtDuration(v.duration_seconds || 0)}
                                                </div>
                                                {/* Level badge on card */}
                                                <div className={`absolute top-2 left-2 text-xs font-black px-2 py-0.5 rounded-full ${diffInfo.color}`}>
                                                    {diffInfo.emoji} {diffInfo.name}
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs text-gray-400 font-medium">{v.topic}</span>
                                                </div>
                                                <h3 className="font-black text-[#111111] text-sm leading-tight mb-3">{v.title}</h3>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3.5 h-3.5 fill-[#FFB800] text-[#FFB800]" />
                                                        <span className="text-xs text-gray-400 font-medium">+50 XP</span>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#FFB800] transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="text-xl font-black text-[#111111] mb-2">Dars topilmadi</h3>
                        <p className="text-gray-400 font-medium mb-4">Boshqa mavzuni yoki kalit so'zni sinab ko'ring.</p>
                        {placementDone && (
                            <button onClick={() => { setPlacementDone(false); setPlacementLevel(null); }} className="btn-outline text-sm">
                                Barcha darslarni ko'rish
                            </button>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

/* ── Page export ─────────────────────────────────────────────────── */
export default function LessonsPage() {
    return (
        <main className="min-h-screen bg-white" id="lessons-page">
            <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="text-5xl animate-bounce">📚</div></div>}>
                <LessonsInner />
            </Suspense>
        </main>
    );
}
