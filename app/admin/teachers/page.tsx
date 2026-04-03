"use client";

import { useEffect, useState } from "react";
import {
    Plus, Search, User, Eye, Edit, Trash2, X,
    Upload, Loader2, Star, Palette, AlignLeft, Award
} from "lucide-react";
import Image from "next/image";

interface Teacher {
    id: number;
    full_name: string;
    role: string;
    experience?: string;
    rating: number;
    image_url?: string;
    avatar_color?: string;
    bio?: string;
    created_at: string;
}

const DEFAULT_FORM = {
    full_name: "",
    role: "O'qituvchi",
    experience: "",
    rating: 5,
    image_url: "",
    avatar_color: "linear-gradient(135deg, #FFB800, #FFD700)",
    bio: "",
};

export default function AdminTeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ ...DEFAULT_FORM });
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/teachers");
            if (!res.ok) throw new Error("O'qituvchilarni yuklashda xatolik");
            const data = await res.json();
            setTeachers(data);
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, image_url: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/teachers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Saqlashda xatolik yuz berdi");

            await fetchTeachers();
            setIsModalOpen(false);
            setFormData({ ...DEFAULT_FORM });
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Haqiqatan ham ushbu o'qituvchini o'chirmoqchimisiz?")) return;

        try {
            const res = await fetch(`/api/teachers/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("O'chirishda xatolik");
            setTeachers(prev => prev.filter(t => t.id !== id));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const filteredTeachers = teachers.filter(t =>
        t.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <User className="w-8 h-8 text-[#FFC107]" />
                        O'qituvchilar <span className="text-[#FFC107]">Boshqaruvi</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Platformadagi barcha o'qituvchilar ro'yxati</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ ...DEFAULT_FORM });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-[#FFC107] hover:bg-[#FFB800] text-[#111111] font-black px-6 py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 text-sm"
                >
                    <Plus className="w-5 h-5" />
                    Yangi o'qituvchi qo'shish
                </button>
            </div>

            {/* Stats/Search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#1A1A1A] p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#FFC107]/10 flex items-center justify-center">
                            <User className="w-6 h-6 text-[#FFC107]" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Jami o'qituvchilar</p>
                            <p className="text-2xl font-black text-white">{teachers.length} ta</p>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Ism yoki lavozim orqali qidirish..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1A1A1A] border-2 border-white/5 rounded-3xl py-4 pl-14 pr-6 text-white font-bold placeholder:text-gray-600 focus:border-[#FFC107] transition-all outline-none"
                    />
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-[#FFC107] animate-spin mb-4" />
                    <p className="text-gray-500 font-bold">Yuklanmoqda...</p>
                </div>
            ) : filteredTeachers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeachers.map((teacher) => (
                        <div key={teacher.id} className="bg-[#1A1A1A] rounded-3xl border border-white/5 overflow-hidden group hover:border-[#FFC107]/30 transition-all">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#FFC107]/20 relative bg-gray-800">
                                        {teacher.image_url ? (
                                            <Image src={teacher.image_url} alt={teacher.full_name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                <User className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDelete(teacher.id)}
                                            className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-white mb-1">{teacher.full_name}</h3>
                                <p className="text-[#FFC107] font-bold text-sm mb-4">{teacher.role}</p>

                                <div className="space-y-3 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Award className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-400">Tajriba:</span>
                                        <span className="text-white font-bold">{teacher.experience || "Ma'lumot yo'q"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Star className="w-4 h-4 text-[#FFC107]" />
                                        <span className="text-gray-400">Reyting:</span>
                                        <span className="text-white font-bold">{teacher.rating} / 5</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[#1A1A1A] rounded-3xl border border-dashed border-white/10 p-20 text-center">
                    <User className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">Hech qanday o'qituvchi topilmadi</p>
                </div>
            )}

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                            <h2 className="text-2xl font-black text-[#111111]">Yangi <span className="text-[#FFB800]">O'qituvchi</span></h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <form className="space-y-6" id="add-teacher-form" onSubmit={handleSave}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-black text-gray-700 mb-2">Ism-familiya</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.full_name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#FFB800] rounded-2xl font-bold text-[#111111] outline-none transition-all placeholder:text-gray-400"
                                            placeholder="Masalan: Feruza Uralova"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-gray-700 mb-2">Lavozim</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.role}
                                            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#FFB800] rounded-2xl font-bold text-[#111111] outline-none transition-all"
                                            placeholder="O'qituvchi"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-gray-700 mb-2">Tajriba</label>
                                        <input
                                            type="text"
                                            value={formData.experience}
                                            onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#FFB800] rounded-2xl font-bold text-[#111111] outline-none transition-all"
                                            placeholder="7 yillik staj"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-gray-700 mb-2">Reyting</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="5"
                                            value={formData.rating}
                                            onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#FFB800] rounded-2xl font-bold text-[#111111] outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-gray-700 mb-2">Avatar rangi</label>
                                        <input
                                            type="text"
                                            value={formData.avatar_color}
                                            onChange={(e) => setFormData(prev => ({ ...prev, avatar_color: e.target.value }))}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#FFB800] rounded-2xl font-bold text-[#111111] outline-none transition-all"
                                            placeholder="CSS gradient yoki rang"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-black text-gray-700 mb-2">Rasm yuklash</label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="border-2 border-dashed border-gray-200 group-hover:border-[#FFB800] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all bg-gray-50/50">
                                                {formData.image_url ? (
                                                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-md">
                                                        <Image src={formData.image_url} alt="Preview" fill className="object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Edit className="w-5 h-5 text-white" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                                            <Upload className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-500">Rasmni yuklang yoki bosing</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-black text-gray-700 mb-2">Bio / Qisqacha ma'lumot</label>
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                            rows={3}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#FFB800] rounded-2xl font-bold text-[#111111] outline-none transition-all placeholder:text-gray-400"
                                            placeholder="O'qituvchi haqida qo'shimcha..."
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex flex-shrink-0">
                            <button
                                type="submit"
                                form="add-teacher-form"
                                disabled={saving}
                                className="w-full py-4 bg-[#FFB800] hover:bg-[#FFC107] text-[#111111] font-black rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Saqlash va qo'shish"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
