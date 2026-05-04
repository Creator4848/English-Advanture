"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header";
import { ArrowRight, RefreshCw, BarChart2, CheckCircle, Star } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Option { id: string; text: string; }
interface Question { id: string; question: string; options: Option[]; level: string; correct?: string; }
interface PlacementResult { level: string; level_name: string; score_pct: number; description: string; }

// ─── Level config ─────────────────────────────────────────────────────────────
const LEVEL_CONFIG: Record<string, { bg: string; border: string; text: string; emoji: string; name: string; gradient: string }> = {
    beginner: { bg: "bg-emerald-50", border: "border-emerald-400", text: "text-emerald-700", emoji: "🌱", name: "Boshlang'ich", gradient: "from-emerald-400 to-teal-500" },
    intermediate: { bg: "bg-blue-50", border: "border-blue-400", text: "text-blue-700", emoji: "📘", name: "O'rta", gradient: "from-blue-400 to-indigo-500" },
    advanced: { bg: "bg-amber-50", border: "border-amber-400", text: "text-amber-700", emoji: "🏆", name: "Yuqori", gradient: "from-amber-400 to-orange-500" },
};

const LEVEL_SECTION_LABELS: Record<string, string> = {
    beginner: "Boshlang'ich daraja savollari (1-5)",
    intermediate: "O'rta daraja savollari (6-10)",
    advanced: "Yuqori daraja savollari (11-15)",
};


// ─── Component ────────────────────────────────────────────────────────────────
export default function PlacementTestPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<number | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [current, setCurrent] = useState(0);
    const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
    const [feedbackState, setFeedbackState] = useState<"none" | "correct" | "wrong">("none");
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const [feedbackColor, setFeedbackColor] = useState("");
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [result, setResult] = useState<PlacementResult | null>(null);
    const [alreadyDone, setAlreadyDone] = useState(false);
    const [existingLevel, setExistingLevel] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // ── Auth + initial load ────────────────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem("user_token");
        if (!token) { router.push("/register"); return; }
        const raw = localStorage.getItem("user_info");
        const info = raw ? JSON.parse(raw) : {};
        const uid: number = info.user?.id || info.user_id || info.id;
        if (!uid) { router.push("/login"); return; }
        setUserId(uid);

        (async () => {
            try {
                const [statusRes, qRes] = await Promise.all([
                    fetch(`${API}/placement/status/${uid}`),
                    fetch(`${API}/placement/questions`),
                ]);
                if (statusRes.ok) {
                    const status = await statusRes.json();
                    if (status.placement_completed) {
                        setAlreadyDone(true);
                        setExistingLevel(status.placement_level);
                    }
                }
                if (qRes.ok) {
                    const qs: Question[] = await qRes.json();
                    setQuestions(qs);
                }
            } catch { /* silent */ } finally { setLoading(false); }
        })();
    }, [router]);

    // ── Pick answer ────────────────────────────────────────────────────────
    const pickAnswer = (q: Question, optId: string) => {
        if (feedbackState !== "none") return; // already answered this question

        setSelectedOpt(optId);
        const updatedAnswers = { ...answers, [q.id]: optId };
        setAnswers(updatedAnswers);

        const isCorrect = q.correct === optId;
        const isLast = current === questions.length - 1;

        if (isCorrect) {
            setFeedbackMsg("Ajoyib! Zo'r javob! 🎉");
            setFeedbackColor("text-emerald-600");
            setFeedbackState("correct");
        } else {
            setFeedbackMsg("Xato! Keyingilarini albatta to'g'ri bajarasiz 💪");
            setFeedbackColor("text-rose-600");
            setFeedbackState("wrong");
        }

        if (!isLast) {
            // Auto advance
            setTimeout(() => {
                setFeedbackState("none");
                setSelectedOpt(null);
                setCurrent(c => c + 1);
            }, 1200);
        }
    };

    const submitAll = async (finalAnswers: Record<string, string>) => {
        if (!userId) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/placement/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, answers: finalAnswers }),
            });
            if (res.ok) {
                const data: PlacementResult = await res.json();
                setResult(data);
            }
        } catch { /* silent */ } finally { setSubmitting(false); }
    };

    const retake = async () => {
        if (!userId) return;
        try { await fetch(`${API}/placement/reset/${userId}`, { method: "POST" }); } catch { /* ignore */ }
        setAlreadyDone(false); setExistingLevel(null); setResult(null);
        setAnswers({}); setCurrent(0); setSelectedOpt(null); setFeedbackState("none");
    };

    // ─── Loading ───────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                    <div className="text-6xl">📝</div>
                </motion.div>
            </div>
        );
    }

    // ─── Already done + no new result ─────────────────────────────────────
    if (alreadyDone && !result) {
        const lv = existingLevel || "beginner";
        const cfg = LEVEL_CONFIG[lv] || LEVEL_CONFIG.beginner;
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center px-6 py-16">
                    <motion.div className="card p-10 max-w-md w-full text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="text-7xl mb-5">{cfg.emoji}</div>
                        <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-black mb-4 ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                            {cfg.name} darajasi
                        </div>
                        <p className="text-gray-500 font-medium text-sm mb-8 leading-relaxed">
                            Siz allaqachon daraja testini topshirgansiz. Darslar sizning darajangizga qarab ko'rsatiladi.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/lessons" className="btn-yellow">Darslarni ko'rish <ArrowRight className="w-4 h-4" /></Link>
                            <button onClick={retake} className="btn-outline flex items-center gap-2 justify-center">
                                <RefreshCw className="w-4 h-4" /> Qayta topshirish
                            </button>
                        </div>
                    </motion.div>
                </div>
            </main>
        );
    }

    // ─── Final result screen ───────────────────────────────────────────────
    if (result) {
        const cfg = LEVEL_CONFIG[result.level] || LEVEL_CONFIG.beginner;
        const total = questions.length;
        const correct = Math.round((result.score_pct / 100) * total);
        const wrong = total - correct;

        return (
            <main className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-2xl">
                        {/* Level result hero */}
                        <motion.div
                            className="card p-8 mb-6 text-center"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        >
                            <div className="text-7xl mb-4">{cfg.emoji}</div>
                            <div className="text-[#FFB800] font-black text-sm mb-2">🎊 Natija tayyor!</div>
                            <h1 className="text-4xl font-black text-[#111111] mb-2">{cfg.name} Daraja</h1>
                            <p className="text-gray-500 font-medium text-sm mb-6 max-w-sm mx-auto leading-relaxed">{result.description}</p>

                            {/* Score bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                                    <span>Umumiy ball</span><span>{result.score_pct}%</span>
                                </div>
                                <div className="progress-track">
                                    <motion.div
                                        className="progress-fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${result.score_pct}%` }}
                                        transition={{ duration: 1.2, delay: 0.3 }}
                                    />
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-emerald-50 rounded-xl py-3 px-2">
                                    <div className="text-2xl font-black text-emerald-600">{correct}</div>
                                    <div className="text-xs font-bold text-emerald-500">To'g'ri ✅</div>
                                </div>
                                <div className="bg-rose-50 rounded-xl py-3 px-2">
                                    <div className="text-2xl font-black text-rose-500">{wrong}</div>
                                    <div className="text-xs font-bold text-rose-400">Xato ❌</div>
                                </div>
                                <div className="bg-gray-50 rounded-xl py-3 px-2">
                                    <div className="text-2xl font-black text-gray-700">{total}</div>
                                    <div className="text-xs font-bold text-gray-400">Jami 📝</div>
                                </div>
                            </div>

                            {/* Level scale */}
                            <div className="flex justify-center gap-2 mb-6">
                                {Object.entries(LEVEL_CONFIG).map(([lvl, c]) => (
                                    <div key={lvl}
                                        className={`flex-1 rounded-xl py-2 text-xs font-black text-center transition-all ${lvl === result.level
                                            ? `bg-gradient-to-br ${c.gradient} text-white scale-110 shadow-lg`
                                            : `${c.bg} ${c.text} opacity-50`
                                            }`}>
                                        {c.emoji}<div className="text-[10px] mt-0.5">{c.name}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link href="/lessons" className="btn-yellow">Darslarni boshlash <ArrowRight className="w-4 h-4" /></Link>
                                <Link href="/dashboard" className="btn-outline flex items-center gap-2 justify-center">
                                    <BarChart2 className="w-4 h-4" /> Dashboard
                                </Link>
                            </div>
                        </motion.div>

                        {/* Question breakdown summary */}
                        <motion.div className="card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <h3 className="font-black text-[#111111] text-lg mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-[#FFB800]" /> Batafsil natijalar
                            </h3>
                            <div className="space-y-2">
                                {questions.map((q, i) => {
                                    const userAns = answers[q.id];
                                    const qLevel = q.level;
                                    const qCfg = LEVEL_CONFIG[qLevel] || LEVEL_CONFIG.beginner;
                                    const answered = !!userAns;
                                    return (
                                        <div key={q.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${answered ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-400"}`}>
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-gray-700 truncate">{q.question}</div>
                                                <div className={`text-xs font-bold ${qCfg.text}`}>{qCfg.emoji} {qCfg.name}</div>
                                            </div>
                                            {answered ? (
                                                <div className="flex items-center gap-1 text-xs font-bold text-blue-500">
                                                    <CheckCircle className="w-4 h-4" /> Javob berildi
                                                </div>
                                            ) : (
                                                <div className="text-xs font-bold text-gray-400">Javob yo'q</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                <button onClick={retake} className="btn-outline text-sm flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4" /> Qayta topshirish
                                </button>
                                <div className="text-sm font-black text-gray-500">Jami: {Object.keys(answers).length}/{questions.length}</div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        );
    }

    // ─── No questions ──────────────────────────────────────────────────────
    if (questions.length === 0) {
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center px-6">
                    <div className="card p-10 max-w-md w-full text-center">
                        <div className="text-5xl mb-4">⚠️</div>
                        <h2 className="text-xl font-black text-[#111111] mb-2">Savollar yuklanmadi</h2>
                        <p className="text-gray-500 text-sm mb-6">Server bilan bog'lanishda muammo yuz berdi.</p>
                        <button onClick={() => window.location.reload()} className="btn-yellow">Qayta yuklash</button>
                    </div>
                </div>
            </main>
        );
    }

    // ─── Submitting screen ─────────────────────────────────────────────────
    if (submitting) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <div className="text-5xl">⏳</div>
                </motion.div>
                <p className="font-black text-gray-500">Natijalar hisoblanmoqda...</p>
            </div>
        );
    }

    // ─── Test screen ───────────────────────────────────────────────────────
    const q = questions[current];
    const questionLevel = q?.level || "beginner";
    const qCfg = LEVEL_CONFIG[questionLevel] || LEVEL_CONFIG.beginner;
    const progressPct = Math.round((current / questions.length) * 100);
    const isAnswered = feedbackState !== "none";
    const isLast = current === questions.length - 1;

    // Section label (show when entering a new level block)
    const prevLevel = current > 0 ? questions[current - 1].level : null;
    const showSectionLabel = current === 0 || (prevLevel && prevLevel !== questionLevel);
    const sectionLabel = LEVEL_SECTION_LABELS[questionLevel];

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            {/* Top progress bar */}
            <div className="bg-white border-b border-gray-100 px-6 py-4">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between text-sm font-bold text-gray-500 mb-2">
                        <span>Savol <span className="text-[#111111]">{current + 1}</span> / {questions.length}</span>
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${qCfg.bg} ${qCfg.text} border ${qCfg.border}`}>
                            {qCfg.emoji} {qCfg.name}
                        </span>
                    </div>
                    <div className="progress-track">
                        <motion.div
                            className="progress-fill"
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 0.4 }}
                        />
                    </div>
                    {/* Dot indicators */}
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {questions.map((qi, i) => (
                            <div key={qi.id}
                                className={`h-1.5 rounded-full transition-all ${i < current ? "bg-[#FFB800] flex-1" :
                                    i === current ? "bg-[#FFB800] flex-[2]" :
                                        "bg-gray-200 flex-1"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-start justify-center px-6 py-10">
                <div className="w-full max-w-2xl">

                    {/* Section label banner */}
                    <AnimatePresence>
                        {showSectionLabel && (
                            <motion.div
                                key={questionLevel}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl mb-4 text-sm font-black ${qCfg.bg} ${qCfg.text} border ${qCfg.border}`}
                            >
                                <span className="text-lg">{qCfg.emoji}</span>
                                {sectionLabel}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Question card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={q?.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="card p-8 mb-4"
                        >
                            <h2 className="text-xl font-black text-[#111111] mb-6 leading-snug">
                                {q?.question}
                            </h2>

                            {/* Options */}
                            <div className="grid grid-cols-1 gap-3">
                                {q?.options.map((opt, idx) => {
                                    const isSelected = selectedOpt === opt.id;
                                    const optLabel = ["A", "B", "C", "D"][idx];
                                    const isDisabled = isAnswered;

                                    let optStyle = "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50";
                                    let circleStyle = "bg-gray-100 text-gray-500";

                                    if (isSelected && feedbackState === "correct") {
                                        optStyle = "border-emerald-400 bg-emerald-50 text-emerald-800";
                                        circleStyle = "bg-emerald-400 text-white";
                                    } else if (isSelected && feedbackState === "wrong") {
                                        optStyle = "border-rose-400 bg-rose-50 text-rose-800";
                                        circleStyle = "bg-rose-400 text-white";
                                    } else if (isSelected) {
                                        optStyle = "border-[#FFB800] bg-[#FFF3CC] text-[#111111]";
                                        circleStyle = "bg-[#FFB800] text-white";
                                    } else if (feedbackState !== "none" && opt.id === q.correct) {
                                        // highlight correct answer if they got it wrong
                                        optStyle = "border-emerald-400 border-dashed bg-emerald-50 text-emerald-800 opacity-80";
                                        circleStyle = "bg-emerald-400 text-white";
                                    }

                                    return (
                                        <motion.button
                                            key={opt.id}
                                            onClick={() => pickAnswer(q, opt.id)}
                                            disabled={isDisabled}
                                            whileHover={isDisabled ? {} : { scale: 1.01 }}
                                            whileTap={isDisabled ? {} : { scale: 0.99 }}
                                            className={`w-full text-left px-5 py-4 rounded-xl border-2 font-bold text-sm transition-all disabled:cursor-default ${optStyle}`}
                                        >
                                            <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-black mr-3 ${circleStyle}`}>
                                                {optLabel}
                                            </span>
                                            {opt.text}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Feedback overlay banner */}
                    <AnimatePresence>
                        {feedbackState !== "none" && (
                            <motion.div
                                key="feedback"
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.25 }}
                                className={`rounded-2xl p-5 border-2 flex items-center gap-4 mb-4 shadow-lg ${feedbackState === "correct"
                                    ? "bg-blue-50 border-blue-300"
                                    : "bg-rose-50 border-rose-300"
                                    }`}
                            >
                                <div className="text-3xl">
                                    {feedbackState === "correct" ? "✅" : "❌"}
                                </div>
                                <div className="flex-1">
                                    <p className={`font-black text-base ${feedbackColor}`}>{feedbackMsg}</p>
                                    {!isLast && <p className="text-xs text-gray-400 font-medium mt-0.5">Keyingi savol tez orada...</p>}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Finish Test Button */}
                    <AnimatePresence>
                        {isAnswered && isLast && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-center mb-6"
                            >
                                <button
                                    onClick={() => submitAll(answers)}
                                    disabled={submitting}
                                    className="btn-yellow px-8 py-3 text-lg w-full max-w-sm"
                                >
                                    {submitting ? "Yakunlanmoqda..." : "Testni yakunlash"}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Question counter chips */}
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                        {questions.map((qi, i) => (
                            <div
                                key={qi.id}
                                className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center transition-all ${i === current
                                    ? "bg-[#FFB800] text-white scale-125 shadow"
                                    : answers[qi.id]
                                        ? "bg-emerald-400 text-white"
                                        : "bg-gray-200 text-gray-500"
                                    }`}
                            >
                                {answers[qi.id] ? "✓" : i + 1}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
