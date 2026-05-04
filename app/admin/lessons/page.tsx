"use client";

import { useEffect, useState } from "react";
import {
    Plus, Search, Video, Eye, Edit, Trash2, X,
    Link as LinkIcon, Loader2, BookOpen, Star, Clock, DollarSign, Hash
} from "lucide-react";

interface Lesson {
    id: number;
    youtube_id: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    duration_seconds?: number;
    difficulty: number;
    topic: string;
    order_index: number;
}

const CATEGORIES = [
    "My Family",
    "English Alphabet for Kids",
    "ABC Song for Kids",
    "Learning Colors In English",
    "Learning Shapes in English",
    "Days of the Week",
    "Greetings and First Meeting",
    "Me, You, and They",
    "My Body and Face",
    "Yummy Food and Drinks",
    "Fruits and Vegetables",
    "My School Objects",
    "Animals",
    "Transport",
    "Beautiful Nature",
    "Clothes"
];

const DEFAULT_FORM = {
    emoji: "📚",
    title: "",
    category: "Umumiy",
    difficulty: 1,
    levelColor: "#FFC107",
    gradient: "from-yellow-400 to-orange-500",
    youtube_url: "",
    hours: 1,
    lessonsCount: 10,
    rating: 4.5,
    price: 0,
    description: "",
    order_index: 10,
};

export default function AdminLessonsPage() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ ...DEFAULT_FORM });
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    const fetchLessons = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await fetch("/api/videos");
            if (!res.ok) {
                const text = await res.text();
                if (text.includes("<!DOCTYPE html>")) {
                    throw new Error(`Server HTML qaytardi (${res.status}). Vercel/FastAPI xatosi.`);
                }
                throw new Error(`Server xatosi (${res.status}): ${text.substring(0, 150)}`);
            }
            const data = await res.json();
            setLessons(data);
        } catch (err: any) {
            console.error("Failed to fetch lessons:", err);
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLessons(); }, []);

    const extractYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url;
    };

    const openAddModal = () => {
        setEditingLesson(null);
        setFormData({ ...DEFAULT_FORM });
        setIsModalOpen(true);
    };

    const openEditModal = (l: Lesson) => {
        setEditingLesson(l);
        setFormData({
            emoji: "📚",
            title: l.title,
            category: l.topic || "Umumiy",
            difficulty: l.difficulty || 1,
            levelColor: "#FFC107",
            gradient: "from-yellow-400 to-orange-500",
            youtube_url: `https://www.youtube.com/watch?v=${l.youtube_id}`,
            hours: 1,
            lessonsCount: 10,
            rating: 4.5,
            price: 0,
            description: l.description || "",
            order_index: l.order_index || 10,
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const yid = extractYoutubeId(formData.youtube_url);
        const payload = {
            youtube_id: yid,
            title: formData.title,
            description: formData.description,
            topic: formData.category,
            difficulty: Number(formData.difficulty),
            thumbnail_url: `https://img.youtube.com/vi/${yid}/maxresdefault.jpg`,
            duration_seconds: Math.round(formData.hours * 3600),
            order_index: Number(formData.order_index),
        };

        try {
            const method = editingLesson ? "PUT" : "POST";
            const url = editingLesson ? `/api/videos/${editingLesson.id}` : "/api/videos";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setSaveError(null);
                fetchLessons();
            } else {
                const ct = res.headers.get("content-type");
                if (ct?.includes("application/json")) {
                    const d = await res.json();
                    setSaveError(d.detail || "Saqlash bo'lmadi");
                } else {
                    const txt = await res.text();
                    const clean = txt.includes("<!DOCTYPE") ? "Server xatosi (500). Backend ishlamayapti." : txt.substring(0, 150);
                    setSaveError(clean);
                }
            }
        } catch (err: any) {
            setSaveError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
        try {
            const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
            if (res.ok) fetchLessons();
            else setErrorMsg("O'chirishda xatolik!");
        } catch {
            setErrorMsg("O'chirishda server bilan bog'lanib bo'lmadi!");
        }
    };

    const filteredLessons = lessons.filter(l =>
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.topic.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const DIFF_LEVELS: Record<number, { label: string; cls: string }> = {
        1: { label: "🌱 Boshlang'ich", cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
        2: { label: "📘 O'rta", cls: "text-blue-400   bg-blue-400/10   border-blue-400/20" },
        3: { label: "🏆 Yuqori", cls: "text-amber-400  bg-amber-400/10  border-amber-400/20" },
    };
    const diffLabel = (d: number) => DIFF_LEVELS[d]?.label || `Daraja ${d}`;
    const diffClass = (d: number) => DIFF_LEVELS[d]?.cls || "text-gray-400 bg-gray-400/10 border-gray-400/20";

    return (
        <div className="p-6 lg:p-10 max-w-[1400px] mx-auto pb-24">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">Darslar Boshqaruvi</h1>
                    <p className="text-gray-400 font-medium">Barcha video darslar va kurslar</p>
                </div>
                <button onClick={openAddModal} className="adm-btn-yellow">
                    Yangi dars qo'shish <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Inline error banner */}
            {errorMsg && (
                <div className="mb-6 px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-medium text-sm flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                        <p className="font-bold text-red-300 mb-0.5">Server xatosi</p>
                        <p className="text-xs opacity-80">{errorMsg}</p>
                        <button
                            onClick={() => fetchLessons()}
                            className="mt-2 text-xs font-bold text-red-300 hover:text-white underline"
                        >Qayta urinish →</button>
                    </div>
                </div>
            )}

            {/* Table Card */}
            <div className="adm-card overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-[#ffffff0a] flex flex-col md:flex-row items-center justify-between gap-4 bg-[#1A1D2E]">
                    <span className="px-4 py-2 rounded-lg text-sm font-bold bg-[#FFC107]/10 text-[#FFC107]">
                        Jami: {lessons.length} ta dars
                    </span>
                    <div className="relative w-full md:w-64 max-w-sm mx-auto md:mx-0 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-[#FFC107] opacity-60 group-focus-within:opacity-100 transition-opacity" />
                        </div>
                        <input
                            type="text"
                            placeholder="Dars qidirish..."
                            className="block w-full bg-[#1A1D2E] border border-[#ffffff10] rounded-xl py-2 pl-10 pr-3 text-sm text-center text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 text-gray-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#FFC107]" />
                            <p>Darslar yuklanmoqda...</p>
                        </div>
                    ) : filteredLessons.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-gray-500 border border-dashed border-[#ffffff0a] m-4 rounded-xl">
                            <Video className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-bold">Darslar topilmadi</p>
                            <p className="text-sm mt-1">Hozircha hech qanday dars qo'shilmagan.</p>
                        </div>
                    ) : (
                        <table className="adm-table min-w-[800px]">
                            <thead>
                                <tr className="bg-[#151826]">
                                    <th className="w-12">#</th>
                                    <th>Dars nomi</th>
                                    <th>Kategoriya</th>
                                    <th>Daraja</th>
                                    <th className="text-right">Harakatlar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLessons.map((lesson, idx) => (
                                    <tr key={lesson.id} className="group cursor-pointer">
                                        <td className="text-gray-500 font-bold">{lesson.order_index || idx + 1}</td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-10 rounded-lg bg-[#21253A] flex items-center justify-center relative overflow-hidden flex-shrink-0">
                                                    {lesson.thumbnail_url ? (
                                                        <img
                                                            src={lesson.thumbnail_url}
                                                            className="w-full h-full object-cover"
                                                            alt="thumb"
                                                            onError={(e) => {
                                                                if (!e.currentTarget.src.includes('hqdefault')) {
                                                                    e.currentTarget.src = `https://img.youtube.com/vi/${lesson.youtube_id}/hqdefault.jpg`;
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <Video className="w-4 h-4 text-[#FFC107]" />
                                                    )}
                                                </div>
                                                <span className="font-bold text-white group-hover:text-[#FFC107] transition-colors">{lesson.title}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="px-2.5 py-1 rounded-md bg-[#ffffff0a] text-xs font-bold text-gray-300 border border-[#ffffff10]">
                                                {lesson.topic}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${diffClass(lesson.difficulty)}`}>
                                                {diffLabel(lesson.difficulty)}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a
                                                    href={`https://youtube.com/watch?v=${lesson.youtube_id}`}
                                                    target="_blank"
                                                    className="p-2 rounded-lg bg-[#21253A] hover:bg-blue-500 hover:text-white text-gray-400 transition-colors"
                                                    title="Ko'rish"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => openEditModal(lesson)}
                                                    className="p-2 rounded-lg bg-[#21253A] hover:bg-[#FFC107] hover:text-[#111111] text-gray-400 transition-colors"
                                                    title="Tahrirlash"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(lesson.id)}
                                                    className="p-2 rounded-lg bg-[#21253A] hover:bg-red-500 hover:text-white text-gray-400 transition-colors"
                                                    title="O'chirish"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ── MODAL ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-[#1A1D2E] w-full max-w-2xl rounded-2xl border border-[#ffffff10] shadow-2xl flex flex-col max-h-[92vh]">

                        {/* Modal Header */}
                        <div className="p-6 border-b border-[#ffffff0a] flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#FFC107]/15 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-[#FFC107]" />
                                </div>
                                <h2 className="text-xl font-black text-white">
                                    {editingLesson ? "Darsni Tahrirlash" : "Yangi Dars Qo'shish"}
                                </h2>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body — scrollable */}
                        <form onSubmit={handleSave} className="overflow-y-auto flex-1">
                            <div className="p-6 space-y-5">

                                {/* Row 1: Emoji + Title */}
                                <div className="flex gap-3">
                                    <div className="w-28 flex-shrink-0">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                                            Emoji 🎨
                                        </label>
                                        <input
                                            type="text"
                                            className="adm-input text-center text-2xl"
                                            placeholder="📚"
                                            value={formData.emoji}
                                            onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                                            Sarlavha *
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            className="adm-input"
                                            placeholder="Masalan: Colors in English"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Kategoriya + Tartib + Daraja */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                                            Kategoriya
                                        </label>
                                        <select
                                            className="adm-input"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                                            Tartib raqami
                                        </label>
                                        <input
                                            type="number"
                                            className="adm-input"
                                            value={formData.order_index}
                                            onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                                            Daraja
                                        </label>
                                        <select
                                            className="adm-input"
                                            value={formData.difficulty}
                                            onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                                        >
                                            <option value={1}>🌱 1 – Boshlang'ich</option>
                                            <option value={2}>📘 2 – O'rta</option>
                                            <option value={3}>🏆 3 – Yuqori</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Row 3: Daraja rangi + Fon gradienti */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                                            Daraja rangi
                                        </label>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="color"
                                                className="w-10 h-10 rounded-lg border border-[#ffffff10] bg-transparent cursor-pointer flex-shrink-0 p-0.5"
                                                value={formData.levelColor}
                                                onChange={(e) => setFormData({ ...formData, levelColor: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                className="adm-input font-mono text-sm"
                                                value={formData.levelColor}
                                                onChange={(e) => setFormData({ ...formData, levelColor: e.target.value })}
                                                placeholder="#FFC107"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                                            Fon gradienti
                                        </label>
                                        <input
                                            type="text"
                                            className="adm-input font-mono text-sm"
                                            placeholder="from-yellow-400 to-orange-500"
                                            value={formData.gradient}
                                            onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Row 4: YouTube URL */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                                        YouTube Video Linki *
                                    </label>
                                    <div className="relative">
                                        <LinkIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            required
                                            type="text"
                                            className="adm-input pl-9"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            value={formData.youtube_url}
                                            onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Row 5: Soatlar + Darslar soni + Reyting + Narx */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Soatlar
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            step={0.5}
                                            className="adm-input"
                                            placeholder="1"
                                            value={formData.hours}
                                            onChange={(e) => setFormData({ ...formData, hours: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <Hash className="w-3 h-3" /> Darslar
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            className="adm-input"
                                            placeholder="10"
                                            value={formData.lessonsCount}
                                            onChange={(e) => setFormData({ ...formData, lessonsCount: parseInt(e.target.value) || 1 })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <Star className="w-3 h-3" /> Reyting
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={5}
                                            step={0.1}
                                            className="adm-input"
                                            placeholder="4.5"
                                            value={formData.rating}
                                            onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" /> Narx (so'm)
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            step={1000}
                                            className="adm-input"
                                            placeholder="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                {/* Row 6: Tavsif */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                                        Tavsif
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="adm-input min-h-[100px] resize-none"
                                        placeholder="Dars haqida qisqacha ma'lumot kiriting..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 pt-0 flex-shrink-0">
                                {saveError && (
                                    <div className="mb-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium flex items-center gap-2">
                                        ⚠️ {saveError}
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setIsModalOpen(false); setSaveError(null); }}
                                        className="flex-1 px-6 py-3 rounded-xl font-black text-gray-400 bg-white/5 hover:bg-white/10 transition-all"
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-6 py-3 rounded-xl font-black text-[#111111] bg-[#FFC107] hover:bg-[#FFD54F] shadow-lg shadow-[#FFC107]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {saving ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>Saqlash ✓</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
