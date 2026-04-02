"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TEACHERS = [
    {
        id: 1,
        language: "Ingliz tili",
        flag: "🇬🇧",
        title: "Boshlang'ich Ingliz tili",
        instructor: "Feruza Uralova",
        role: "O'qituvchi",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Feruza",
    },
    {
        id: 2,
        language: "Ingliz tili",
        flag: "🇬🇧",
        title: "Ingliz tilidan intensiv darslar",
        instructor: "Dilfuza Latipova",
        role: "O'qituvchi",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dilfuza",
    },
    {
        id: 3,
        language: "Ingliz tili",
        flag: "🇬🇧",
        title: "Speaking Club Kids",
        instructor: "Gulfiya Rahimova",
        role: "O'qituvchi",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gulfiya",
    },
    {
        id: 4,
        language: "Ingliz tili",
        flag: "🇬🇧",
        title: "Grammatika asoslari",
        instructor: "Nigina Rasulova",
        role: "O'qituvchi",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nigina",
    },
    {
        id: 5,
        language: "Ingliz tili",
        flag: "🇬🇧",
        title: "Ingliz tili (Advanced)",
        instructor: "Bahora Ergashova",
        role: "O'qituvchi",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bahora",
    },
];

export default function Teachers() {
    const scrollRef = useRef<HTMLDivElement>(null);

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

    return (
        <section className="py-20 px-6 max-w-7xl mx-auto">
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
                    {TEACHERS.map((teacher) => (
                        <div
                            key={teacher.id}
                            className="flex-none w-[280px] bg-[#FAFAF8] rounded-3xl p-8 flex flex-col items-center text-center snap-center hover:shadow-lg transition-shadow border border-transparent hover:border-gray-100"
                        >
                            <div className="text-6xl mb-6 select-none bg-white w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm">
                                {teacher.flag}
                            </div>

                            <div className="text-sm font-bold text-[#FFB800] mb-2 uppercase tracking-wide">
                                {teacher.language}
                            </div>

                            <h3 className="text-xl font-black text-[#111111] mb-8 line-clamp-2 h-14">
                                {teacher.title}
                            </h3>

                            <div className="mt-auto flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md mb-3 bg-gray-100 relative">
                                    <Image
                                        src={teacher.avatar}
                                        alt={teacher.instructor}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div className="font-bold text-sm text-[#111111]">
                                    {teacher.instructor}
                                </div>
                                <div className="text-xs font-medium text-gray-400 mt-0.5">
                                    {teacher.role}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        onClick={scrollLeft}
                        className="w-12 h-12 rounded-xl flex items-center justify-center border-2 border-gray-100 text-gray-400 hover:border-[#FFB800] hover:text-[#FFB800] hover:bg-[#FFF3CC] transition-all"
                        aria-label="Oldingi o'qituvchilar"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={scrollRight}
                        className="w-12 h-12 rounded-xl flex items-center justify-center border-2 border-[#FFB800] text-[#FFB800] hover:bg-[#FFB800] hover:text-white transition-all shadow-sm"
                        aria-label="Keyingi o'qituvchilar"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </section>
    );
}
