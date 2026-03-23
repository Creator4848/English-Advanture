"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Play, CheckCircle, Clock, Star, BookOpen } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

const MOCK_VIDEO = {
    id: 1,
    youtube_id: "k2LjrJB1qUw",
    title: "Colors in English 🎨",
    description: "Learn the most important colors in English through a fun animated song. Perfect for beginners!",
    topic: "Colors",
    difficulty: 1,
    duration_seconds: 180,
};

export default function LessonDetailPage() {
    const params = useParams();
    const id = params?.id as string;

    const [video, setVideo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [hasQuiz, setHasQuiz] = useState(true);

    // Simulated user id — in production, read from auth context / cookie
    const USER_ID = 1;

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API}/videos/${id}`);
                if (res.ok) setVideo(await res.json());
                else setVideo(MOCK_VIDEO);
            } catch {
                setVideo(MOCK_VIDEO);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    // Save progress every 15 sec (simulated via a timer)
    useEffect(() => {
        if (!video) return;
        const iv = setInterval(async () => {
            const pct = Math.min(progress + 5, 100);
            setProgress(pct);
            if (pct >= 85 && !completed) setCompleted(true);
            try {
                await fetch(`${API}/videos/${id}/progress`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: USER_ID, watch_pct: pct, last_position: 0 }),
                });
            } catch { }
        }, 15_000);
        return () => clearInterval(iv);
    }, [video, progress, completed, id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-4xl animate-bounce">📚</div>
            </div>
        );
    }

    const v = video || MOCK_VIDEO;

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
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <span className="badge">{v.topic}</span>
                        <span className="badge bg-gray-100 text-gray-500">
                            <Clock className="w-3 h-3" />
                            {Math.floor((v.duration_seconds || 0) / 60)} daqiqa
                        </span>
                        {completed && (
                            <span className="badge bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3" /> Bajarildi
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-[#111111] mb-3">{v.title}</h1>
                    {v.description && (
                        <p className="text-gray-400 font-medium max-w-2xl">{v.description}</p>
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
                        src={`https://www.youtube.com/embed/${v.youtube_id}?autoplay=0&rel=0&modestbranding=1`}
                        title={v.title}
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
                </div>

                {/* Action cards */}
                <div className="grid md:grid-cols-3 gap-5">

                    {/* Quiz CTA */}
                    {hasQuiz && (
                        <Link href={`/quiz/${id}`} id="start-quiz-btn">
                            <motion.div
                                className="card p-6 border-[#FFB800] bg-[#FFF3CC] hover:shadow-yellow cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="text-3xl mb-3">📝</div>
                                <h3 className="font-black text-[#111111] text-lg mb-1">Testni Boshlash</h3>
                                <p className="text-sm text-gray-500 font-medium">Bilimingizni tekshiring va XP yig'ing.</p>
                                <div className="mt-3 flex items-center gap-1 text-[#FFB800] text-xs font-black">
                                    <Star className="w-3.5 h-3.5 fill-[#FFB800]" /> +100 XP
                                </div>
                            </motion.div>
                        </Link>
                    )}

                    {/* Speaking Club */}
                    <Link href="/speaking-club">
                        <motion.div
                            className="card p-6 cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="text-3xl mb-3">🎙️</div>
                            <h3 className="font-black text-[#111111] text-lg mb-1">AI bilan Gaplash</h3>
                            <p className="text-sm text-gray-500 font-medium">Bu mavzu bo'yicha AI bilan mashq qiling.</p>
                            <div className="mt-3 text-xs font-black text-gray-400">Speaking Club →</div>
                        </motion.div>
                    </Link>

                    {/* Next lesson */}
                    <Link href="/lessons">
                        <motion.div
                            className="card p-6 cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="text-3xl mb-3">➡️</div>
                            <h3 className="font-black text-[#111111] text-lg mb-1">Keyingi Dars</h3>
                            <p className="text-sm text-gray-500 font-medium">Boshqa darslarni ham ko'ring.</p>
                            <div className="mt-3 text-xs font-black text-gray-400">Darslar →</div>
                        </motion.div>
                    </Link>
                </div>

            </div>
        </main>
    );
}
