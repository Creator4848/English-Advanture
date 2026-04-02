"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, X, Star, Activity } from "lucide-react";
import Link from "next/link";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const USER_ID = 1;

const TOPICS = [
    { id: "animals", label: "Animals 🐾", desc: "Talk about your favorite animals" },
    { id: "colors", label: "Colors 🎨", desc: "Describe things by their color" },
    { id: "family", label: "Family 👨‍👩‍👧", desc: "Talk about your family" },
    { id: "food", label: "Food 🍎", desc: "Foods you like or dislike" },
    { id: "numbers", label: "Numbers 🔢", desc: "Count and describe" },
    { id: "weather", label: "Weather ☀️", desc: "Describe the weather" },
    { id: "school", label: "School 🏫", desc: "School activities" },
    { id: "free", label: "Free Talk 💬", desc: "Talk about anything!" },
];

type Message = {
    role: "user" | "assistant";
    content: string;
    scores?: { fluency: number; grammar: number; vocab: number };
    transcript?: string;
};

/* ── Score Badge ─────────────────────────────────────────────── */
function ScorePill({ label, value }: { label: string; value: number }) {
    const color = value >= 8 ? "bg-green-100 text-green-700" : value >= 6 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
    return (
        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${color}`}>
            {label} {value}/10
        </span>
    );
}

/* ── Chat bubble ─────────────────────────────────────────────── */
function Bubble({ msg }: { msg: Message }) {
    const isAI = msg.role === "assistant";
    return (
        <motion.div
            className={`flex ${isAI ? "justify-start" : "justify-end"} mb-4`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {isAI && (
                <div className="w-9 h-9 rounded-full bg-[#FFB800] flex items-center justify-center text-lg mr-3 flex-shrink-0 shadow">
                    🤖
                </div>
            )}
            <div className={`max-w-xs md:max-w-md rounded-2xl px-4 py-3 ${isAI ? "bg-gray-100 text-[#111111] rounded-tl-sm" : "bg-[#111111] text-white rounded-tr-sm"
                }`}>
                {msg.transcript && (
                    <p className="text-xs text-gray-400 font-medium mb-1 italic">🎤 {msg.transcript}</p>
                )}
                <p className="font-medium text-sm leading-relaxed">{msg.content}</p>
                {msg.scores && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        <ScorePill label="Fluency" value={msg.scores.fluency} />
                        <ScorePill label="Grammar" value={msg.scores.grammar} />
                        <ScorePill label="Vocab" value={msg.scores.vocab} />
                    </div>
                )}
            </div>
        </motion.div>
    );
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function SpeakingClubPage() {
    const [phase, setPhase] = useState<"select" | "chat">("select");
    const [topic, setTopic] = useState(TOPICS[0]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");
    const [recording, setRecording] = useState(false);
    const [connected, setConnected] = useState(false);
    const [wsStatus, setWsStatus] = useState("Ulanmoqda...");

    const wsRef = useRef<WebSocket | null>(null);
    const mediaRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const startSession = useCallback(() => {
        setPhase("chat");
        setMessages([]);

        const url = `${WS_URL}/ws/speaking?user_id=${USER_ID}&topic_id=${topic.id}`;
        try {
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => { setConnected(true); setWsStatus("Ulangan ✅"); };
            ws.onclose = () => { setConnected(false); setWsStatus("Uzildi"); };
            ws.onerror = () => { setWsStatus("Ulanishda xatolik – matn rejimida ishlaydi"); setConnected(false); };

            ws.onmessage = (ev) => {
                const data = JSON.parse(ev.data);
                if (data.type === "greeting") {
                    setMessages([{ role: "assistant", content: data.text }]);
                } else if (data.type === "reply") {
                    setMessages((prev) => [
                        ...prev,
                        {
                            role: "user",
                            content: data.user_transcript,
                            transcript: data.user_transcript,
                        },
                        {
                            role: "assistant",
                            content: data.ai_text,
                            scores: data.scores,
                        },
                    ]);
                }
            };
        } catch {
            // HTTP mode fallback
            setWsStatus("HTTP rejimida ✨");
            setMessages([{
                role: "assistant",
                content: `Hi! I'm Alex 🌟 Today we're going to talk about ${topic.label}! Are you ready? Let's go! 🚀`,
            }]);
        }
    }, [topic]);

    const endSession = () => {
        wsRef.current?.send(JSON.stringify({ type: "end_session" }));
        wsRef.current?.close();
        setPhase("select");
        setConnected(false);
    };

    const sendText = async () => {
        if (!text.trim()) return;

        const userMsg: Message = { role: "user", content: text };
        setMessages((prev) => [...prev, userMsg]);
        const currentText = text;
        setText("");

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ text: currentText }));
        } else {
            // HTTP fallback for Vercel
            setWsStatus("HTTP rejimida ✨");
            try {
                const res = await fetch(`${API_URL}/speaking/chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: USER_ID,
                        topic_id: topic.id,
                        text: currentText,
                        history: messages.slice(-10).map(m => ({
                            role: m.role === "assistant" ? "assistant" : "user",
                            content: m.content
                        }))
                    })
                });
                const data = await res.json();
                if (data.ai_text) {
                    setMessages((prev) => [
                        ...prev,
                        {
                            role: "assistant",
                            content: data.ai_text,
                            scores: data.scores,
                        },
                    ]);
                } else {
                    throw new Error("No response");
                }
            } catch (err) {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: "Kechirasiz, serverda muammo yuz berdi. Iltimos, keyinroq urinib ko'ring." },
                ]);
            }
        }
    };

    const toggleRecording = async () => {
        if (recording) {
            mediaRef.current?.stop();
            setRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
                chunksRef.current = [];
                mr.ondataavailable = (e) => chunksRef.current.push(e.data);
                mr.onstop = async () => {
                    const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
                    if (wsRef.current?.readyState === WebSocket.OPEN) {
                        wsRef.current.send(audioBlob);
                    } else {
                        setWsStatus("Ovozli HTTP xabari... 🎙️");
                        try {
                            const formData = new FormData();
                            formData.append("file", audioBlob, "voice.webm");
                            const historyJson = JSON.stringify(messages.slice(-10).map(m => ({
                                role: m.role === "assistant" ? "assistant" : "user",
                                content: m.content
                            })));
                            const res = await fetch(`${API_URL}/speaking/voice?user_id=${USER_ID}&topic_id=${topic.id}&history=${encodeURIComponent(historyJson)}`, {
                                method: "POST",
                                body: formData
                            });
                            const data = await res.json();
                            if (data.ai_text) {
                                setMessages((prev) => [
                                    ...prev,
                                    { role: "user", content: `🎙️ ${data.user_transcript}`, transcript: data.user_transcript },
                                    { role: "assistant", content: data.ai_text, scores: data.scores },
                                ]);
                                setWsStatus("HTTP rejimida ✨");
                            }
                        } catch (err) {
                            setMessages((prev) => [...prev, { role: "assistant", content: "Ovozli xabarni yuborishda xatolik yuz berdi." }]);
                        }
                    }
                    stream.getTracks().forEach((t) => t.stop());
                };
                mr.start();
                mediaRef.current = mr;
                setRecording(true);
            } catch {
                alert("Mikrofon ruxsati berilmadi. Matn rejimidan foydalaning.");
            }
        }
    };

    /* ── Topic Selection ───────────────────────────────────────── */
    if (phase === "select") {
        return (
            <main className="min-h-screen bg-white px-6 lg:px-20 py-14" id="speaking-club-page">
                <div className="max-w-4xl mx-auto">
                    <div className="badge mb-5">🎙️ AI Speaking Club</div>
                    <h1 className="text-4xl md:text-6xl font-black text-[#111111] mb-3">
                        Alex bilan <span className="text-[#FFB800]">Gaplash</span>
                    </h1>
                    <p className="text-gray-400 font-medium text-lg mb-12 max-w-xl">
                        Mavzu tanlang va AI qahramon Alex bilan inglizcha suhbatlashishni boshlang.
                    </p>

                    <h2 className="text-xl font-black text-[#111111] mb-5">Mavzu tanlang:</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        {TOPICS.map((t) => (
                            <button
                                key={t.id}
                                id={`topic-${t.id}`}
                                onClick={() => setTopic(t)}
                                className={`card p-5 text-left transition-all ${topic.id === t.id
                                    ? "border-[#FFB800] bg-[#FFF3CC] shadow-md"
                                    : "hover:border-[#FFB800]"
                                    }`}
                            >
                                <div className="text-3xl mb-2">{t.label.split(" ")[1] || "💬"}</div>
                                <div className="font-black text-[#111111] text-sm">{t.label}</div>
                                <div className="text-xs text-gray-400 font-medium mt-0.5">{t.desc}</div>
                            </button>
                        ))}
                    </div>

                    <button
                        id="start-speaking-btn"
                        onClick={startSession}
                        className="btn-yellow text-lg px-10 py-4"
                    >
                        Boshlash 🚀
                    </button>
                </div>
            </main>
        );
    }

    /* ── Chat UI ───────────────────────────────────────────────── */
    return (
        <main className="h-screen flex flex-col bg-white" id="speaking-chat-page">

            {/* Header */}
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFB800] flex items-center justify-center text-xl shadow">
                        🤖
                    </div>
                    <div>
                        <div className="font-black text-[#111111] text-sm">Alex — AI Tutor</div>
                        <div className="text-xs text-gray-400 font-medium">{topic.label} · {wsStatus}</div>
                    </div>
                </div>
                <button
                    id="end-session-btn"
                    onClick={endSession}
                    className="btn-outline text-sm px-4 py-2 flex items-center gap-1"
                >
                    <X className="w-4 h-4" /> Tugatish
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl w-full mx-auto">
                {messages.map((m, i) => <Bubble key={i} msg={m} />)}
                <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="border-t border-gray-100 px-6 py-4 bg-white">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    {/* Voice button */}
                    <button
                        id="mic-btn"
                        onClick={toggleRecording}
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${recording
                            ? "bg-red-500 text-white shadow-lg animate-pulse"
                            : "bg-[#FFB800] text-white shadow"
                            }`}
                    >
                        {recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <input
                        id="chat-input"
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendText()}
                        placeholder="Yoki matn yozing..."
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#FFB800] transition-colors"
                    />

                    <button
                        id="send-btn"
                        onClick={sendText}
                        disabled={!text.trim()}
                        className="w-12 h-12 rounded-full bg-[#111111] text-white flex items-center justify-center disabled:opacity-30 transition-all hover:bg-gray-800"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                {recording && (
                    <p className="text-center text-xs text-red-500 font-bold mt-2 animate-pulse">
                        🔴 Yozib olinmoqda... Tugatish uchun qayta bosing.
                    </p>
                )}
            </div>
        </main>
    );
}
