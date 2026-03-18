"use client";

import { motion } from "framer-motion";
import { Rocket, Star, Trophy, ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import MissionCard from "@/components/MissionCard";
import { useState } from "react";

export default function Dashboard() {
    const [activeMission, setActiveMission] = useState<any>(null);

    const missions = [
        { id: 1, title: "Birinchi Qadam", difficulty: 1, status: "completed", target: "Hello, I am an astronaut." },
        { id: 2, title: "Oy Safari", difficulty: 3, status: "available", target: "The moon is very beautiful." },
        { id: 3, title: "Mars Missiyasi", difficulty: 5, status: "locked", target: "Welcome to the red planet." },
    ];

    if (activeMission) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-blue-900)_0%,_transparent_70%)] opacity-50" />
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]"
                    />
                </div>

                <button
                    onClick={() => setActiveMission(null)}
                    className="absolute top-8 left-8 z-50 text-white/50 hover:text-white flex items-center space-x-2 font-black uppercase tracking-widest text-xs transition-colors"
                >
                    <ArrowRight className="rotate-180 w-4 h-4" />
                    <span>Orqaga</span>
                </button>

                <div className="relative z-10 w-full flex justify-center">
                    <MissionCard
                        title={activeMission.title}
                        targetText={activeMission.target}
                        difficulty={activeMission.difficulty}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafcfe] selection:bg-blue-100 italic selection:text-blue-900">
            {/* Premium Header */}
            <header className="px-8 py-6 flex justify-between items-center border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center space-x-3 group cursor-pointer">
                    <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-100 group-hover:rotate-12 transition-transform">
                        <Rocket className="text-white w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tighter font-display uppercase">Gravity Zero</h1>
                </div>

                <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-3 bg-amber-50 border border-amber-100 px-5 py-2 rounded-2xl">
                        <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center shadow-inner">
                            <Star className="text-white w-5 h-5 fill-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-black text-amber-600 leading-none mb-0.5">Tajriba</span>
                            <span className="font-black text-slate-800 leading-none">1,250 XP</span>
                        </div>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-400 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center text-white font-black"
                    >
                        A
                    </motion.div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight font-display">Salom, Kichik Astronavt! 👋</h2>
                    <p className="text-lg text-slate-500 font-medium font-sans">Bugun qaysi sayyorada sarguzasht boshlaymiz?</p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {missions.map((mission, idx) => (
                        <motion.div
                            key={mission.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={mission.status !== "locked" ? { y: -12, scale: 1.02 } : {}}
                            className={`relative p-10 rounded-[3rem] border-2 transition-all ${mission.status === "completed" ? "bg-white border-blue-100 shadow-xl shadow-blue-50/50" :
                                    mission.status === "available" ? "bg-white border-white shadow-2xl shadow-blue-100/30" :
                                        "bg-slate-50 border-transparent grayscale opacity-50"
                                }`}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${mission.status === "completed" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-100 text-slate-400"
                                    }`}>
                                    <Trophy className="w-7 h-7" />
                                </div>
                                {mission.status === "locked" && (
                                    <div className="bg-slate-200 p-2 rounded-lg">
                                        <Star className="w-4 h-4 text-slate-400" />
                                    </div>
                                )}
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 mb-3 font-display">{mission.title}</h3>
                            <p className="text-slate-500 text-[15px] mb-10 font-bold uppercase tracking-widest bg-slate-50 inline-block px-3 py-1 rounded-md">
                                DARAJA {mission.difficulty}
                            </p>

                            {mission.status !== "locked" ? (
                                <button
                                    onClick={() => setActiveMission(mission)}
                                    className="w-full py-5 bg-slate-910 text-white rounded-[1.5rem] font-black flex items-center justify-center space-x-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 hover:shadow-blue-200 border-b-4 border-slate-950 active:border-b-0 active:translate-y-1"
                                >
                                    <Play className="w-5 h-5 fill-white" />
                                    <span className="uppercase tracking-widest text-[10px]">{mission.status === "completed" ? "Qayta takrorlash" : "Missiyani boshlash"}</span>
                                </button>
                            ) : (
                                <div className="w-full py-5 bg-slate-200 text-slate-400 rounded-[1.5rem] font-black text-center cursor-not-allowed uppercase tracking-widest text-[10px]">
                                    Daraja Qulflangan
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
