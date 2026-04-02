"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TEACHERS = [
    {
        id: 1,
        language: "Nemis tili",
        flag: "🇩🇪",
        title: "Nemis tili",
        instructor: "Feruza Uralova",
        role: "O`qituvchi",
        avatar: "https://i.pravatar.cc/150?u=feruza",
    },
    {
        id: 2,
        language: "Nemis tili",
        flag: "🇩🇪",
        title: "Nemis tilidan intensiv darslar",
        instructor: "Dilfuza Latipova",
        role: "O`qituvchi",
        avatar: "https://i.pravatar.cc/150?u=dilfuza",
    },
    {
        id: 3,
        language: "Fransuz tili",
        flag: "🇫🇷",
        title: "Fransuz tili",
        instructor: "Gulfiya Rahimova",
        role: "O`qituvchi",
        avatar: "https://i.pravatar.cc/150?u=gulfiya",
    },
    {
        id: 4,
        language: "Xitoy tili",
        flag: "🇨🇳",
        title: "Xitoy tili",
        instructor: "Nigina Rasulova",
        role: "O`qituvchi",
        avatar: "https://i.pravatar.cc/150?u=nigina",
    },
    {
        id: 5,
        language: "Italyan tili",
        flag: "🇮🇹",
        title: "Italyan tili",
        instructor: "Bahora Ergashova",
        role: "O`qituvchi",
        avatar: "https://i.pravatar.cc/150?u=bahora",
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
            <div className="relative">
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8"
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
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md mb-3">
                                    <Image
                                        src={teacher.avatar}
                                        alt={teacher.instructor}
                                        width={48}
                                        height={48}
                                        className="object-cover w-full h-full"
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
                <div className="flex justify-center gap-4 mt-4">
                    <button
                        onClick={scrollLeft}
                        className="w-12 h-12 rounded-xl flex items-center justify-center border-2 border-gray-100 text-gray-400 hover:border-[#FFB800] hover:text-[#FFB800] hover:bg-[#FFF3CC] transition-all"
                        aria-label="Previous teachers"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={scrollRight}
                        className="w-12 h-12 rounded-xl flex items-center justify-center border-2 border-[#FFB800] text-[#FFB800] hover:bg-[#FFB800] hover:text-white transition-all shadow-sm"
                        aria-label="Next teachers"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </section>
    );
}
