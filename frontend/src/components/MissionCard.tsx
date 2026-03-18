"use client";

import { motion } from "framer-motion";
import { Mic, CheckCircle, ChevronRight, X } from "lucide-react";
import { useState } from "react";

export default function MissionCard({ title, targetText, difficulty }: { title: string, targetText: string, difficulty: number }) {
    const [isRecording, setIsRecording] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [reward, setReward] = useState<{ xp: number, coins: number } | null>(null);

    const handleComplete = async () => {
        // Simulate API call to submit progress
        const response = { xp_gain: 95, coin_gain: 47 };
        setReward({ xp: response.xp_gain, coins: response.coin_gain });
        setFeedback("Ajoyib! Missiya muvaffaqiyatli yakunlandi.");
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-w-md w-full p-10 rounded-[3.5rem] bg-white/10 backdrop-blur-3xl border border-white/20 shadow-2xl flex flex-col items-center relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

            <div className="flex justify-between items-center w-full mb-10">
                <span className="bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                    Qiyinchilik {difficulty}
                </span>
                <div className="flex space-x-1.5">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < difficulty / 2 ? "bg-blue-400 shadow-[0_0_10px_#60a5fa]" : "bg-white/10"}`} />
                    ))}
                </div>
            </div>

            <h2 className="text-3xl font-black text-white mb-3 text-center font-display tracking-tight">{title}</h2>
            <p className="text-blue-200/60 text-[13px] mb-10 text-center font-medium italic">" {targetText} "</p>

            <div className="w-full h-40 flex items-center justify-center mb-10 relative">
                <motion.div
                    animate={isRecording ? { scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] } : { scale: 0.8, opacity: 0.1 }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute w-32 h-32 bg-blue-500 rounded-full blur-2xl"
                />
                <motion.div
                    animate={isRecording ? { scale: [1, 1.25, 1], opacity: [0.1, 0.2, 0.1] } : { scale: 0.8, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute w-44 h-44 border-2 border-blue-400/20 rounded-full"
                />

                <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${isRecording ? "bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] scale-110" : "bg-blue-600 shadow-[0_15px_30px_rgba(37,99,235,0.4)]"
                        } active:scale-95 group`}
                >
                    {isRecording ? (
                        <motion.div animate={{ scale: [1, 0.8, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                            <X className="text-white w-8 h-8" strokeWidth={3} />
                        </motion.div>
                    ) : (
                        <Mic className="text-white w-10 h-10 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                    )}
                </button>
            </div>

            {reward ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full grid grid-cols-2 gap-4 mb-8"
                >
                    <div className="bg-amber-400/10 p-5 rounded-3xl flex flex-col items-center border border-amber-400/20">
                        <span className="text-amber-400 font-black text-xl leading-none mb-1">+{reward.xp}</span>
                        <span className="text-[10px] text-amber-500/70 uppercase font-black tracking-widest">Tajriba</span>
                    </div>
                    <div className="bg-blue-400/10 p-5 rounded-3xl flex flex-col items-center border border-blue-400/20">
                        <span className="text-blue-400 font-black text-xl leading-none mb-1">+{reward.coins}</span>
                        <span className="text-[10px] text-blue-500/70 uppercase font-black tracking-widest">Coins</span>
                    </div>
                </motion.div>
            ) : feedback ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full p-5 bg-green-500/10 border border-green-500/20 rounded-3xl flex items-center mb-8"
                >
                    <CheckCircle className="text-green-400 w-6 h-6 mr-4 flex-shrink-0" strokeWidth={3} />
                    <span className="text-green-100 font-bold text-sm leading-snug">{feedback}</span>
                </motion.div>
            ) : null}

            <button
                onClick={handleComplete}
                className="w-full flex items-center justify-center space-x-3 py-5 bg-white text-slate-900 rounded-[2rem] font-black hover:bg-blue-50 transition-all shadow-xl active:scale-95 group"
            >
                <span className="uppercase tracking-widest text-[11px] font-black">{reward ? "Keyingi Sarguzasht" : "Natijani Tekshirish"}</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
            </button>
        </motion.div>
    );
}
