"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, CheckCircle, XCircle, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

// Fallback mock if no quiz exists in DB yet
const MOCK_QUIZ = {
    id: 0,          // 0 signals mock (won't submit to real API)
    video_id: 1,
    title: "Colors Quiz 🎨",
    quiz_type: "image_choice",
    questions: [
        { id: 1, question: "What color is this? 🍎", question_image_url: null, options: [{ id: "a", text: "Red", emoji: "🔴" }, { id: "b", text: "Blue", emoji: "🔵" }, { id: "c", text: "Green", emoji: "🟢" }, { id: "d", text: "Yellow", emoji: "🟡" }], correct_ans: "a", points: 10, order_index: 1 },
        { id: 2, question: "What color is the sky? ☁️", question_image_url: null, options: [{ id: "a", text: "Red", emoji: "🔴" }, { id: "b", text: "Blue", emoji: "🔵" }, { id: "c", text: "Green", emoji: "🟢" }, { id: "d", text: "Yellow", emoji: "🟡" }], correct_ans: "b", points: 10, order_index: 2 },
        { id: 3, question: "What color is grass? 🌿", question_image_url: null, options: [{ id: "a", text: "Red", emoji: "🔴" }, { id: "b", text: "Blue", emoji: "🔵" }, { id: "c", text: "Green", emoji: "🟢" }, { id: "d", text: "Yellow", emoji: "🟡" }], correct_ans: "c", points: 10, order_index: 3 },
        { id: 4, question: "What color is a banana? 🍌", question_image_url: null, options: [{ id: "a", text: "Orange", emoji: "🟠" }, { id: "b", text: "Blue", emoji: "🔵" }, { id: "c", text: "Purple", emoji: "🟣" }, { id: "d", text: "Yellow", emoji: "🟡" }], correct_ans: "d", points: 10, order_index: 4 },
    ],
};

type Question = {
    id: number;
    question: string;
    question_image_url: string | null;
    options: { id: string; text: string; emoji?: string }[];
    correct_ans: string;
    points: number;
    order_index: number;
};

type QuizData = { id: number; video_id: number; title: string; quiz_type: string; questions: Question[] };

/* ── Result Screen ──────────────────────────────────────────────────── */
function ResultScreen({ score, passed, xp, correct, total, onRetry, lessonId }: {
    score: number; passed: boolean; xp: number;
    correct: number; total: number;
    onRetry: () => void; lessonId: string;
}) {
    return (
        <motion.div
            className="flex flex-col items-center text-center py-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="text-7xl mb-6">{passed ? "🏆" : "💪"}</div>
            <h2 className="text-4xl font-black text-[#111111] mb-2">
                {passed ? "Ajoyib!" : "Davom eting!"}
            </h2>
            <p className="text-gray-400 font-medium mb-8">{correct} / {total} to'g'ri javob</p>

            <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center mb-8 font-black text-3xl border-8 ${passed ? "border-[#FFB800] bg-[#FFF3CC] text-[#111111]" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                {score}%
            </div>

            {xp > 0 && (
                <div className="badge mb-8 text-base px-6 py-2">
                    <Star className="w-4 h-4 fill-[#FFB800]" /> +{xp} XP qo'shildi!
                </div>
            )}

            <div className="flex gap-4">
                <button id="retry-quiz-btn" onClick={onRetry} className="btn-outline flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Qaytadan
                </button>
                <Link href={`/lessons/${lessonId}`} className="btn-yellow">
                    Darsga qaytish
                </Link>
            </div>
        </motion.div>
    );
}

/* ── Main Quiz Page ─────────────────────────────────────────────────── */
export default function QuizPage() {
    const params = useParams();
    const router = useRouter();
    const lessonId = params?.lessonId as string;

    const [userId, setUserId] = useState<number>(0);
    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [loadingQuiz, setLoadingQuiz] = useState(true);
    const [quizError, setQuizError] = useState<string | null>(null);

    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [selected, setSelected] = useState<string | null>(null);
    const [revealed, setRevealed] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    // Auth + fetch quiz
    useEffect(() => {
        const token = localStorage.getItem("user_token");
        if (!token) { router.push("/login"); return; }
        const raw = localStorage.getItem("user_info");
        const info = raw ? JSON.parse(raw) : {};
        const uid = info.user?.id || info.user_id || info.id;
        if (!uid) { router.push("/login"); return; }
        setUserId(uid);

        (async () => {
            try {
                const res = await fetch(`${API}/quiz/${lessonId}`);
                if (res.ok) {
                    const data: QuizData = await res.json();
                    // Sort questions by order_index
                    data.questions.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
                    setQuiz(data);
                } else if (res.status === 404) {
                    // No quiz for this lesson yet — use mock
                    setQuiz(MOCK_QUIZ as QuizData);
                } else {
                    setQuizError(`Testni yuklashda xatolik (${res.status})`);
                }
            } catch {
                setQuizError("Server bilan bog'lanib bo'lmadi");
            } finally {
                setLoadingQuiz(false);
            }
        })();
    }, [lessonId, router]);

    if (loadingQuiz) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-5xl animate-bounce">📝</div>
            </div>
        );
    }

    if (quizError) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center flex-col gap-4 px-6">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <p className="font-bold text-gray-700 text-center">{quizError}</p>
                <Link href={`/lessons/${lessonId}`} className="btn-outline">Darsga qaytish</Link>
            </div>
        );
    }

    const q_data = quiz!;
    const questions = q_data.questions;
    const total = questions.length;
    const q: Question = questions[current];

    const handleSelect = (optId: string) => {
        if (revealed) return;
        setSelected(optId);
        setRevealed(true);
        setAnswers(prev => ({ ...prev, [String(q.id)]: optId }));
    };

    const handleNext = async () => {
        if (current < total - 1) {
            setCurrent(c => c + 1);
            setSelected(null);
            setRevealed(false);
            return;
        }

        // Last question — submit
        setSubmitting(true);
        const allAnswers = { ...answers, [String(q.id)]: selected || "" };

        // Local score calculation (for immediate feedback)
        const correctCount = questions.filter(qq => allAnswers[String(qq.id)] === qq.correct_ans).length;
        const score = Math.round((correctCount / total) * 100);
        const passed = score >= 70;

        try {
            if (q_data.id > 0 && userId > 0) {
                // Real quiz: submit to /api/quiz/{quiz_id}/submit → creates QuizResult
                const res = await fetch(`${API}/quiz/${q_data.id}/submit`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: userId, answers: allAnswers }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setResult({
                        score: data.score,
                        passed: data.passed,
                        correct: data.correct,
                        total: data.total,
                        xp_earned: data.xp_earned,
                    });
                    return;
                }
                // If submit fails, fall through to local result
            }
            // Mock quiz or API failure — at least update XP
            if (userId > 0) {
                const xp = correctCount * 15 + (passed ? 50 : 0);
                await fetch(`${API}/progress/quiz`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: userId, xp_earned: xp, coins_earned: correctCount * 2 }),
                }).catch(() => { });
                setResult({ score, passed, correct: correctCount, total, xp_earned: xp });
            } else {
                setResult({ score, passed, correct: correctCount, total, xp_earned: 0 });
            }
        } catch {
            setResult({ score, passed, correct: correctCount, total, xp_earned: 0 });
        } finally {
            setSubmitting(false);
        }
    };

    const handleRetry = () => {
        setCurrent(0);
        setAnswers({});
        setSelected(null);
        setRevealed(false);
        setResult(null);
    };

    if (result) {
        return (
            <main className="min-h-screen bg-white px-6 max-w-2xl mx-auto" id="quiz-result-page">
                <div className="pt-6 pb-2">
                    <Link href={`/lessons/${lessonId}`} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#111111] w-fit">
                        <ArrowLeft className="w-4 h-4" /> Darsga qaytish
                    </Link>
                </div>
                <ResultScreen
                    score={result.score} passed={result.passed} xp={result.xp_earned}
                    correct={result.correct} total={result.total}
                    onRetry={handleRetry} lessonId={lessonId}
                />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white" id="quiz-page">

            {/* Top bar */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 z-10">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link href={`/lessons/${lessonId}`} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#111111]">
                        <ArrowLeft className="w-4 h-4" /> Chiqish
                    </Link>
                    <div className="font-black text-[#111111]">{current + 1} / {total}</div>
                </div>
                <div className="max-w-2xl mx-auto mt-3 progress-track">
                    <div className="progress-fill" style={{ width: `${((current + (revealed ? 1 : 0)) / total) * 100}%` }} />
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.25 }}
                    >
                        {/* Quiz title */}
                        {current === 0 && q_data.title && (
                            <div className="text-xs font-black text-[#FFB800] uppercase tracking-widest mb-1">
                                {q_data.title}
                            </div>
                        )}
                        <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                            Savol {current + 1}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-[#111111] mb-10">
                            {q.question}
                        </h2>

                        {/* Question image */}
                        {q.question_image_url && (
                            <img src={q.question_image_url} alt="question" className="rounded-xl mb-6 max-h-48 mx-auto" />
                        )}

                        {/* Options */}
                        <div className="grid grid-cols-2 gap-4 mb-10">
                            {q.options.map(opt => {
                                const isSelected = selected === opt.id;
                                const isCorrect  = q.correct_ans === opt.id;
                                let cls = "card p-5 flex flex-col items-center gap-2 cursor-pointer transition-all ";
                                if (!revealed) {
                                    cls += isSelected ? "border-[#FFB800] bg-[#FFF3CC]" : "hover:border-[#FFB800] hover:bg-[#FFF3CC]";
                                } else {
                                    if (isCorrect)      cls += "border-green-400 bg-green-50";
                                    else if (isSelected) cls += "border-red-400 bg-red-50";
                                    else                 cls += "opacity-50";
                                }
                                return (
                                    <button
                                        id={`option-${opt.id}`}
                                        key={opt.id}
                                        className={cls}
                                        onClick={() => handleSelect(opt.id)}
                                        disabled={revealed}
                                    >
                                        {opt.emoji && <span className="text-4xl">{opt.emoji}</span>}
                                        <span className="font-black text-[#111111] text-sm">{opt.text}</span>
                                        {revealed && isCorrect  && <CheckCircle className="w-4 h-4 text-green-500" />}
                                        {revealed && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500" />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Feedback */}
                        {revealed && (
                            <motion.div
                                className={`rounded-xl p-4 mb-6 ${selected === q.correct_ans ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <p className="font-black text-sm text-[#111111]">
                                    {selected === q.correct_ans
                                        ? "To'g'ri! Ajoyib!"
                                        : `Noto'g'ri. To'g'ri javob: ${q.options.find(o => o.id === q.correct_ans)?.text}`}
                                </p>
                            </motion.div>
                        )}

                        {/* Next button */}
                        {revealed && (
                            <motion.button
                                id="next-question-btn"
                                className="btn-yellow w-full justify-center text-base"
                                onClick={handleNext}
                                disabled={submitting}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {submitting
                                    ? "Natijalar hisoblanmoqda..."
                                    : current < total - 1
                                        ? "Keyingi Savol →"
                                        : "Natijalarni Ko'rish 🏆"}
                            </motion.button>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    );
}
