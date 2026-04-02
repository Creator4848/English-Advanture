"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Video, Eye, Edit, Trash2, CheckCircle, BarChart2, X, Link as LinkIcon, Loader2 } from "lucide-react";

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

export default function AdminLessonsPage() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        youtube_url: "",
        topic: "General",
        difficulty: 1,
        description: "",
    });

    const fetchLessons = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/videos");
            if (!res.ok) {
                const text = await res.text();
                // If the response is HTML, it's likely a Vercel/Next.js error page
                if (text.includes("<!DOCTYPE html>")) {
                    throw new Error(`Server JSON emas, HTML qaytardi (${res.status}). Bu odatda Vercel/FastAPI xatosi. Xabar: ${text.substring(0, 300)}...`);
                }
                throw new Error(`Server xatosi (${res.status}): ${text.substring(0, 150)}`);
            }
            const data = await res.json();
            setLessons(data);
        } catch (err: any) {
            console.error("Failed to fetch lessons:", err);
            // Show more detailed error info
            alert(`Darslarni yuklashda xatolik: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLessons();
    }, []);

    const extractYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const yid = extractYoutubeId(formData.youtube_url);
        const payload = {
            youtube_id: yid,
            title: formData.title,
            description: formData.description,
            topic: formData.topic,
            difficulty: Number(formData.difficulty),
            thumbnail_url: `https://img.youtube.com/vi/${yid}/maxresdefault.jpg`,
            duration_seconds: 300, // Default for now
        };

        try {
            const method = editingLesson ? "PUT" : "POST";
            const url = editingLesson ? `/api/videos/${editingLesson.id}` : "/api/videos";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingLesson(null);
                setFormData({ title: "", youtube_url: "", topic: "General", difficulty: 1, description: "" });
                fetchLessons();
            } else {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const responseData = await res.json();
                    alert(`Xatolik: ${responseData.detail || "Saqlash bo'lmadi"}`);
                } else {
                    const errorText = await res.text();
                    if (errorText.includes("<!DOCTYPE html>")) {
                        alert(`Server JSON emas, HTML qaytardi (${res.status}). Xabar: ${errorText.substring(0, 300)}...`);
                    } else {
                        alert(`Xatolik: ${errorText.substring(0, 200)}`);
                    }
                }
            }
        } catch (err: any) {
            console.error("Save error:", err);
            alert(`Xatolik: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
        try {
            const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
            if (res.ok) fetchLessons();
        } catch (err) {
            alert("O'chirishda xatolik!");
        }
    };

    const openEdit = (l: Lesson) => {
        setEditingLesson(l);
        setFormData({
            title: l.title,
            youtube_url: `https://www.youtube.com/watch?v=${l.youtube_id}`,
            topic: l.topic || "General",
            difficulty: l.difficulty || 1,
            description: l.description || "",
        });
        setIsModalOpen(true);
    };

    const filteredLessons = lessons.filter(l =>
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.topic.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-10 max-w-[1400px] mx-auto pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">Darslar Boshqaruvi</h1>
                    <p className="text-gray-400 font-medium">Barcha video darslar, mavzular va statistika</p>
                </div>
                <button
                    onClick={() => { setEditingLesson(null); setFormData({ title: "", youtube_url: "", topic: "General", difficulty: 1, description: "" }); setIsModalOpen(true); }}
                    className="adm-btn-yellow"
                >
                    Yangi Dars Qo'shish <Plus className="w-4 h-4 text-[#111111]" />
                </button>
            </div>

            <div className="adm-card overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-[#ffffff0a] flex flex-col md:flex-row items-center justify-between gap-4 bg-[#1A1D2E]">
                    <div className="flex gap-2 w-full md:w-auto">
                        <span className="px-4 py-2 rounded-lg text-sm font-bold bg-[#FFC107]/10 text-[#FFC107]">
                            Jami: {lessons.length} ta dars
                        </span>
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Dars qidirish..."
                            className="adm-input pl-9"
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
                            <p className="text-sm">Hozircha hech qanday dars qo'shilmagan.</p>
                        </div>
                    ) : (
                        <table className="adm-table min-w-[800px]">
                            <thead>
                                <tr className="bg-[#151826]">
                                    <th className="w-12">#</th>
                                    <th>Dars nomi</th>
                                    <th>Mavzu</th>
                                    <th>Qiyinchilik</th>
                                    <th className="text-right">Harakatlar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLessons.map((lesson, idx) => (
                                    <tr key={lesson.id} className="group cursor-pointer">
                                        <td className="text-gray-500 font-bold">{idx + 1}</td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-10 rounded-lg bg-[#21253A] flex items-center justify-center relative overflow-hidden flex-shrink-0">
                                                    {lesson.thumbnail_url ? (
                                                        <img src={lesson.thumbnail_url} className="w-full h-full object-cover" alt="thumb" />
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
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${lesson.difficulty === 1 ? 'text-green-400 bg-green-400/10' : lesson.difficulty === 2 ? 'text-yellow-400 bg-yellow-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                                {lesson.difficulty === 1 ? 'Beginner' : lesson.difficulty === 2 ? 'Elementary' : 'Intermediate'}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a href={`https://youtube.com/watch?v=${lesson.youtube_id}`} target="_blank" className="p-2 rounded-lg bg-[#21253A] hover:bg-blue-500 hover:text-white text-gray-400 transition-colors" title="Ko'rish">
                                                    <Eye className="w-4 h-4" />
                                                </a>
                                                <button onClick={() => openEdit(lesson)} className="p-2 rounded-lg bg-[#21253A] hover:bg-[#FFC107] hover:text-[#111111] text-gray-400 transition-colors" title="Tahrirlash">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(lesson.id)} className="p-2 rounded-lg bg-[#21253A] hover:bg-red-500 hover:text-white text-gray-400 transition-colors" title="O'chirish">
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1A1D2E] w-full max-w-lg rounded-2xl border border-[#ffffff10] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-[#ffffff0a] flex items-center justify-between">
                            <h2 className="text-xl font-black text-white">{editingLesson ? "Darsni Tahrirlash" : "Yangi Dars Qo'shish"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Dars Sarlavhasi</label>
                                <input
                                    required
                                    type="text"
                                    className="adm-input"
                                    placeholder="Masalan: Colors in English"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">YouTube Link yoki ID</label>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Mavzu</label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        placeholder="Masalan: Animals"
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Daraja</label>
                                    <select
                                        className="adm-input"
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                                    >
                                        <option value={1}>Beginner (1)</option>
                                        <option value={2}>Elementary (2)</option>
                                        <option value={3}>Intermediate (3)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Tavsif (Optional)</label>
                                <textarea
                                    className="adm-input min-h-[80px]"
                                    placeholder="Dars haqida qisqacha ma'lumot..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl font-black text-gray-400 bg-white/5 hover:bg-white/10 transition-all">Bekor qilish</button>
                                <button type="submit" disabled={saving} className="flex-1 px-6 py-3 rounded-xl font-black text-[#111111] bg-[#FFC107] hover:bg-[#FFD54F] shadow-lg shadow-[#FFC107]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Saqlash"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
