"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, User, Star } from "lucide-react";

interface Teacher {
    id: number;
    full_name: string;
    role: string;
    experience?: string;
    rating: number;
    image_url?: string;
    avatar_color?: string;
}

// Data is now fetched from the API


export default function Teachers() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const res = await fetch("/api/teachers");
                if (!res.ok) throw new Error("Yuklashda xatolik");
                const data = await res.json();
                setTeachers(data);
            } catch (err) {
                console.error("Teachers fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeachers();
    }, []);

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
        }
    };

    if (loading) return null;
    if (teachers.length === 0) return null;

    return (
        <section className="py-20 px-6 max-w-7xl mx-auto overflow-hidden">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black text-[#111111] mb-3">
                    Bizning <span className="text-[#FFB800]">O'qituvchilar</span>
                </h2>
                <p className="text-gray-400 font-medium max-w-xl mx-auto">
                    Malakali mutaxassislar yordamida ingliz tilini oson va qiziqarli o'rganing.
                </p>
            </div>

            <div className="relative">
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 px-4"
                >
                    {teachers.map((teacher) => (
                        <div
                            key={teacher.id}
                            className="flex-none w-[280px] bg-[#FAFAF8] rounded-[40px] p-8 flex flex-col items-center text-center snap-center hover:shadow-xl hover:-translate-y-1 transition-all border border-transparent hover:border-gray-100"
                        >
                            <div
                                className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg mb-6 text-4xl overflow-hidden relative"
                                style={{ background: teacher.avatar_color || 'linear-gradient(135deg, #FFB800, #FFD700)' }}
                            >
                                {teacher.image_url ? (
                                    <Image
                                        src={teacher.image_url}
                                        alt={teacher.full_name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <User className="w-10 h-10 text-white/50" />
                                )}
                            </div>

                            <div className="text-[10px] font-black text-[#FFB800] mb-2 uppercase tracking-[0.2em]">
                                {teacher.role}
                            </div>

                            <h3 className="text-xl font-black text-[#111111] mb-3 leading-tight">
                                {teacher.full_name}
                            </h3>

                            <p className="text-sm font-bold text-gray-400 mb-6 bg-white px-4 py-1.5 rounded-full border border-gray-100">
                                {teacher.experience || 'O\'qituvchi'}
                            </p>

                            <div className="mt-auto flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < Math.floor(teacher.rating) ? 'text-[#FFB800] fill-[#FFB800]' : 'text-gray-200'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Buttons */}
                {teachers.length > 3 && (
                    <div className="flex justify-center gap-4 mt-8">
                        <button
                            onClick={scrollLeft}
                            className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-gray-100 text-gray-400 hover:border-[#FFB800] hover:text-[#FFB800] hover:bg-[#FFF3CC] transition-all active:scale-90"
                            aria-label="Oldingi o'qituvchilar"
                        >
                            <ChevronLeft className="w-7 h-7" />
                        </button>
                        <button
                            onClick={scrollRight}
                            className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-[#FFB800] text-[#FFB800] hover:bg-[#FFB800] hover:text-white transition-all shadow-lg active:scale-90"
                            aria-label="Keyingi o'qituvchilar"
                        >
                            <ChevronRight className="w-7 h-7" />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
