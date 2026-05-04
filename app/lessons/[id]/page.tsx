"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Clock, Star } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function LessonDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [userId, setUserId] = useState<number>(0);
    const [video, setVideo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [completed, setCompleted] = useState(false);
    const progressRef = useRef(progress);
    progressRef.current = progress;

    // Read real user ID from localStorage
    useEffect(() => {
        const token = localStorage.getItem("user_token");
        if (!token) { router.push("/login"); return; }
        const raw = localStorage.getItem("user_info");
        const info = raw ? JSON.parse(raw) : {};
        const uid = info.user?.id || info.user_id || info.id;
        if (!uid) { router.push("/login"); return; }
        setUserId(uid);
    }, [router]);

    // Fetch video
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API}/videos/${id}`);
                if (res.ok) setVideo(await res.json());
            } catch { }
            finally { setLoading(false); }
        })();
    }, [id]);

    // Simulate watch progress and save to API
    useEffect(() => {
        if (!video || !userId) return;

        // Load existing progress
        (async () => {
            try {
                const res = await fetch(`${API}/videos/${id}/progress?user_id=${userId}`);
                if (res.ok) {
                    const p = await res.json();
                    if (p.watch_pct) {
                        setProgress(p.watch_pct);
                        if (p.completed) setCompleted(true);
                    }
                }
            } catch { }
        })();

        const iv = setInterval(async () => {
            setProgress(prev => {
                const next = Math.min(prev + 5, 100);
                // Save progress
                fetch(`${API}/videos/${id}/progress`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: userId,
                        watch_pct: next,
                        last_position: Math.round(next * ((video?.duration_seconds || 180) / 100)),
                    }),
                }).catch(() => { });
                if (next >= 85) setCompleted(true);
                return next;
            });
        }, 15_000);

        return () => clearInterval(iv);
    }, [video, userId, id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-4xl animate-bounce">📚</div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center flex-col gap-4">
                <div className="text-4xl">😕</div>
                <p className="font-bold text-gray-500">Dars topilmadi</p>
                <Link href="/lessons" className="btn-yellow">Darslarga qaytish</Link>
            </div>
        );
    }

    const DIFF_LABELS: Record<number, string> = {
        1: "🌱 Boshlang'ich", 2: "📘 O'rta", 3: "🏆 Yuqori",
    };

    return (
        <main className="min-h-screen bg-white" id="lesson-detail-page">

            {/* Breadcrumb */}
            <div className="border-b border-gray-100 px-6 lg:px-20 py-4">
                <Link href="/lessons" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#111111] transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Darslarga qaytish
                </Link>
            </div>

            <div className="max-w-5xl mx-auto px-6 lg:px-10 py-10">

                {/* Title row */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                        {video.topic && <span className="badge">{video.topic}</span>}
                        {video.difficulty && (
                            <span className="badge bg-blue-100 text-blue-700">
                                {DIFF_LABELS[video.difficulty] || `Daraja ${video.difficulty}`}
                            </span>
                        )}
                        <span className="badge bg-gray-100 text-gray-500">
                            <Clock className="w-3 h-3" />
                            {Math.floor((video.duration_seconds || 0) / 60)} daqiqa
                        </span>
                        {completed && (
                            <span className="badge bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3" /> Bajarildi
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-[#111111] mb-3">{video.title}</h1>
                    {video.description && (
                        <p className="text-gray-400 font-medium max-w-2xl">{video.description}</p>
                    )}
                </motion.div>

                {/* YouTube player */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-2xl overflow-hidden shadow-xl mb-6"
                    style={{ aspectRatio: "16/9" }}
                >
                    <iframe
                        id="youtube-player"
                        src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=0&rel=0&modestbranding=1`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    />
                </motion.div>

                {/* Progress bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-xs font-bold text-gray-400 mb-1.5">
                        <span>Ko'rish progressi</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    {completed && (
                        <p className="text-green-600 text-xs font-bold mt-1">
                            Dars bajarildi! +20 XP qo'shildi
                        </p>
                    )}
                </div>

                {/* Action cards */}
                <div className="grid md:grid-cols-3 gap-5">
                    <Link href={`/quiz/${id}`} id="start-quiz-btn">
                        <motion.div
                            className="card p-6 border-[#FFB800] bg-[#FFF3CC] hover:shadow-yellow cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="text-3xl mb-3">📝</div>
                            <h3 className="font-black text-[#111111] text-lg mb-1">Testni boshlash</h3>
                            <p className="text-sm text-gray-500 font-medium">Bilimingizni tekshiring va XP yig'ing.</p>
                            <div className="mt-3 flex items-center gap-1 text-[#FFB800] text-xs font-black">
                                <Star className="w-3.5 h-3.5 fill-[#FFB800]" /> +100 XP
                            </div>
                        </motion.div>
                    </Link>

                    <Link href="/speaking-club">
                        <motion.div className="card p-6 cursor-pointer" whileHover={{ scale: 1.02 }}>
                            <div className="text-3xl mb-3">🎙️</div>
                            <h3 className="font-black text-[#111111] text-lg mb-1">AI bilan gaplash</h3>
                            <p className="text-sm text-gray-500 font-medium">Bu mavzu bo'yicha AI bilan mashq qiling.</p>
                            <div className="mt-3 text-xs font-black text-gray-400">Speaking Club →</div>
                        </motion.div>
                    </Link>

                    <Link href="/lessons">
                        <motion.div className="card p-6 cursor-pointer" whileHover={{ scale: 1.02 }}>
                            <div className="text-3xl mb-3">➡️</div>
                            <h3 className="font-black text-[#111111] text-lg mb-1">Keyingi dars</h3>
                            <p className="text-sm text-gray-500 font-medium">Boshqa darslarni ham ko'ring.</p>
                            <div className="mt-3 text-xs font-black text-gray-400">Darslar →</div>
                        </motion.div>
                    </Link>
                </div>
            </div>
        </main>
    );
}
