"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header";
import { ArrowRight, CheckCircle, RefreshCw, BarChart2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

interface Option {
    id: string;
    text: string;
}

interface Question {
    id: string;
    question: string;
    options: Option[];
    level: string;
}

interface PlacementResult {
    level: string;
    level_name: string;
    score_pct: number;
    description: string;
}

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    A0: { bg: "bg-gray-100",   text: "text-gray-700",   border: "border-gray-300" },
    A1: { bg: "bg-green-100",  text: "text-green-700",  border: "border-green-400" },
    A2: { bg: "bg-teal-100",   text: "text-teal-700",   border: "border-teal-400" },
    B1: { bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-400" },
    B2: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-400" },
    C1: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-400" },
    C2: { bg: "bg-yellow-100", text: "text-[#E6A500]",  border: "border-[#FFB800]" },
};

const LEVEL_EMOJI: Record<string, string> = {
    A0: "🌱", A1: "📗", A2: "📘", B1: "📙", B2: "📕", C1: "🎓", C2: "🏆",
};

export default function PlacementTestPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<number | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [current, setCurrent] = useState(0);
    const [result, setResult] = useState<PlacementResult | null>(null);
    const [alreadyDone, setAlreadyDone] = useState(false);
    const [existingLevel, setExistingLevel] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("user_token");
        if (!token) { router.push("/login"); return; }

        const raw = localStorage.getItem("user_info");
        const info = raw ? JSON.parse(raw) : {};
        const uid: number = info.user?.id || info.user_id || info.id || 1;
        setUserId(uid);

        (async () => {
            try {
                const [statusRes, qRes] = await Promise.all([
                    fetch(`${API}/placement/status/${uid}`),
                    fetch(`${API}/placement/questions`),
                ]);
                const status = await statusRes.json();
                const qs: Question[] = await qRes.json();
                setQuestions(qs);
                if (status.placement_completed) {
                    setAlreadyDone(true);
                    setExistingLevel(status.placement_level);
                }
            } catch {
                // fallback: continue with empty questions — handled in UI
            } finally {
                setLoading(false);
            }
        })();
    }, [router]);

    const select = (qId: string, optId: string) => {
        setAnswers(prev => ({ ...prev, [qId]: optId }));
    };

    const next = () => {
        if (current < questions.length - 1) setCurrent(c => c + 1);
    };
    const prev = () => {
        if (current > 0) setCurrent(c => c - 1);
    };

    const submit = async () => {
        if (!userId) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/placement/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, answers }),
            });
            if (res.ok) setResult(await res.json());
        } catch {
            // show generic error
        } finally {
            setSubmitting(false);
        }
    };

    const retake = async () => {
        if (!userId) return;
        await fetch(`${API}/placement/reset/${userId}`, { method: "POST" });
        setAlreadyDone(false);
        setExistingLevel(null);
        setResult(null);
        setAnswers({});
        setCurrent(0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-5xl animate-bounce">📝</div>
            </div>
        );
    }

    const answered = Object.keys(answers).length;
    const total    = questions.length;
    const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

    // ── Already done & no new result ──────────────────────────────────────
    if (alreadyDone && !result) {
        const colors = existingLevel ? LEVEL_COLORS[existingLevel] : LEVEL_COLORS.A0;
        const info   = LEVEL_INFO[existingLevel || "A0"];
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center px-6 py-16">
                    <motion.div
                        className="card p-10 max-w-md w-full text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="text-6xl mb-4">{LEVEL_EMOJI[existingLevel || "A0"]}</div>
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-black mb-4 ${colors.bg} ${colors.text} border ${colors.border}`}>
                            {existingLevel}
                        </div>
                        <h2 className="text-2xl font-black text-[#111111] mb-2">
                            {info?.name}
                        </h2>
                        <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
                            {info?.description}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/dashboard" className="btn-yellow">
                                Dashboard <ArrowRight className="w-4 h-4" />
                            </Link>
                            <button onClick={retake} className="btn-outline flex items-center gap-2 justify-center">
                                <RefreshCw className="w-4 h-4" /> Qayta topshirish
                            </button>
                        </div>
                    </motion.div>
                </div>
            </main>
        );
    }

    // ── Result screen ──────────────────────────────────────────────────────
    if (result) {
        const colors = LEVEL_COLORS[result.level] || LEVEL_COLORS.A0;
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center px-6 py-16">
                    <motion.div
                        className="card p-10 max-w-lg w-full text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    >
                        {/* Confetti-like emoji */}
                        <div className="text-7xl mb-4 animate-bounce">{LEVEL_EMOJI[result.level]}</div>
                        <div className="text-[#FFB800] font-black text-sm mb-1">Natija tayyor!</div>
                        <h1 className="text-4xl font-black text-[#111111] mb-2">
                            {result.level} – {result.level_name}
                        </h1>
                        <p className="text-gray-500 font-medium text-sm mb-6 leading-relaxed max-w-sm mx-auto">
                            {result.description}
                        </p>

                        {/* Score bar */}
                        <div className="mb-6">
                            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                <span>Ball</span>
                                <span>{result.score_pct}%</span>
                            </div>
                            <div className="progress-track">
                                <motion.div
                                    className="progress-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${result.score_pct}%` }}
                                    transition={{ duration: 1, delay: 0.3 }}
                                />
                            </div>
                        </div>

                        {/* Level scale */}
                        <div className="flex justify-between gap-1 mb-8">
                            {Object.entries(LEVEL_COLORS).map(([lvl, c]) => (
                                <div
                                    key={lvl}
                                    className={`flex-1 rounded-full py-1 text-xs font-black text-center transition-all ${
                                        lvl === result.level
                                            ? `${c.bg} ${c.text} border ${c.border} scale-110`
                                            : "bg-gray-100 text-gray-400"
                                    }`}
                                >
                                    {lvl}
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/lessons" className="btn-yellow">
                                Darslarni boshlash <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link href="/dashboard" className="btn-outline flex items-center gap-2 justify-center">
                                <BarChart2 className="w-4 h-4" /> Dashboard
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </main>
        );
    }

    // ── Test screen ────────────────────────────────────────────────────────
    const q = questions[current];
    const isLast = current === questions.length - 1;
    const allAnswered = answered === total;

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            {/* Top progress */}
            <div className="bg-white border-b border-gray-100 px-6 lg:px-20 py-4">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between text-sm font-bold text-gray-500 mb-2">
                        <span>Savol {current + 1} / {total}</span>
                        <span>{answered} ta javob berildi</span>
                    </div>
                    <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-start justify-center px-6 py-10">
                <div className="w-full max-w-2xl">

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={q?.id}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.25 }}
                            className="card p-8 mb-6"
                        >
                            {/* Level badge */}
                            <div className="flex items-center gap-2 mb-5">
                                <span className={`badge ${LEVEL_COLORS[q?.level]?.bg || "bg-gray-100"} ${LEVEL_COLORS[q?.level]?.text || "text-gray-600"}`}>
                                    {q?.level}
                                </span>
                                {answers[q?.id] && (
                                    <span className="text-green-500 flex items-center gap-1 text-xs font-bold">
                                        <CheckCircle className="w-3.5 h-3.5" /> Javob berildi
                                    </span>
                                )}
                            </div>

                            <h2 className="text-xl font-black text-[#111111] mb-6 leading-snug">
                                {q?.question}
                            </h2>

                            <div className="grid grid-cols-1 gap-3">
                                {q?.options.map(opt => {
                                    const selected = answers[q.id] === opt.id;
                                    return (
                                        <motion.button
                                            key={opt.id}
                                            onClick={() => select(q.id, opt.id)}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            className={`w-full text-left px-5 py-4 rounded-xl border-2 font-bold text-sm transition-all ${
                                                selected
                                                    ? "border-[#FFB800] bg-[#FFF3CC] text-[#111111]"
                                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                            }`}
                                        >
                                            <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-black mr-3 ${
                                                selected ? "bg-[#FFB800] text-white" : "bg-gray-100 text-gray-500"
                                            }`}>
                                                {opt.id.toUpperCase()}
                                            </span>
                                            {opt.text}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={prev}
                            disabled={current === 0}
                            className="btn-outline px-6 py-3 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            ← Oldingi
                        </button>

                        {/* Quick nav dots */}
                        <div className="hidden sm:flex items-center gap-1.5 flex-wrap justify-center max-w-xs">
                            {questions.map((qItem, i) => (
                                <button
                                    key={qItem.id}
                                    onClick={() => setCurrent(i)}
                                    className={`w-6 h-6 rounded-full text-xs font-bold transition-all ${
                                        i === current
                                            ? "bg-[#FFB800] text-white scale-110"
                                            : answers[qItem.id]
                                                ? "bg-green-400 text-white"
                                                : "bg-gray-200 text-gray-500"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        {isLast ? (
                            <button
                                onClick={submit}
                                disabled={!allAnswered || submitting}
                                className="btn-yellow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {submitting ? "Tekshirilmoqda..." : "Natijani ko'rish"}
                                {!submitting && <ArrowRight className="w-4 h-4" />}
                            </button>
                        ) : (
                            <button onClick={next} className="btn-yellow">
                                Keyingi <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {isLast && !allAnswered && (
                        <p className="text-center text-sm text-red-400 font-medium mt-4">
                            Testni yakunlash uchun barcha {total} ta savolga javob bering. ({total - answered} ta qoldi)
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}

// Level info (client-side copy for already-done screen)
const LEVEL_INFO: Record<string, { name: string; description: string }> = {
    A0: { name: "Starters",          description: "Siz endi o'rganishni boshlayapsiz!" },
    A1: { name: "Elementary",         description: "Sizda asosiy tushunchalar bor." },
    A2: { name: "Pre-Intermediate",   description: "Siz oddiy mavzularda muloqot qila olasiz." },
    B1: { name: "Intermediate",       description: "Mustaqil suhbatdosh – Kundalik mavzularda bemalol gaplasha olasiz." },
    B2: { name: "Upper-Intermediate", description: "Ishonchli muloqot – Murakkab matnlarni tushuna olasiz va ravon muloqot qila olasiz." },
    C1: { name: "Advanced",           description: "Ilg'or daraja – Tildan akademik va professional maqsadlarda moslashuvchan foydalana olasiz." },
    C2: { name: "Proficiency",        description: "Mukammal/Ekspert – Deyarli hamma narsani oson tushunasiz. Ona tili darajasida, juda aniq va ravon so'zlaysiz." },
};
