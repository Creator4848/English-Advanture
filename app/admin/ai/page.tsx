"use client";

import { useState } from "react";
import { Bot, Save, Mic, MessageSquare, Volume2, Settings2, Sliders } from "lucide-react";

export default function AdminAIPage() {
    const [prompt, setPrompt] = useState("Sen Alex ismli quvnoq, samimiy va bolalarni yaxshi ko'radigan ingliz tili o'qituvchisisan. Sen 7-10 yoshli O'zbekistonlik bolalar bilan gaplashyapsan. Faqat juda oddiy, A1 darajadagi inglizcha so'zlar va qisqa gaplardan foydalan. Ba'zan tushuntirish uchun o'zbek tilidan ham foydalanish mumkin, lekin asosan inglizcha savollar berib ularni gapirtir. Hech qachon murakkab grammatika yoki uzun matnlar ishlatma. Har doim ularni maqtashni va ruhlantirishni unutma!");

    return (
        <div className="p-6 lg:p-10 max-w-[1400px] mx-auto pb-24">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">AI Suhbatdoshi</h1>
                    <p className="text-gray-400 font-medium">Alex botining sozlamalari va promptni boshqarish</p>
                </div>
                <button className="adm-btn-yellow">
                    Saqlash <Save className="w-4 h-4 text-[#111111]" />
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">

                {/* Left Col: Prompt & Core Settings */}
                <div className="lg:col-span-2 space-y-8">

                    <div className="adm-card p-6 md:p-8">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                            <Bot className="w-6 h-6 text-[#FFC107]" /> Tizimli Prompt (System Instructions)
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Asosiy Prompt</label>
                                <textarea
                                    className="adm-input min-h-[160px] resize-none leading-relaxed text-sm"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 font-medium mt-2">Bu promptingiz Groq (Llama-3/GPT-4o-mini) modeliga yuboriladi va botning butun fe'l-atvorini belgilaydi.</p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-[#ffffff0a]">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">LLM Model</label>
                                    <select className="adm-input bg-[#151826]">
                                        <option>Groq - LLaMA-3 70B (Tezkor)</option>
                                        <option>Groq - Mixtral 8x7B</option>
                                        <option>OpenAI - GPT-4o-mini</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Harorat (Temperature)</label>
                                    <div className="flex items-center gap-4 h-10">
                                        <input type="range" min="0" max="1" step="0.1" defaultValue="0.7" className="flex-1 accent-[#FFC107]" />
                                        <span className="text-white font-bold bg-[#151826] px-3 py-1 rounded-md border border-[#ffffff10]">0.7</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="adm-card p-6 md:p-8">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                            <Mic className="w-6 h-6 text-[#FFC107]" /> Ovoz va Nutq Sozlamalari (TTS / STT)
                        </h3>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Ovoz (Text-to-Speech)</label>
                                <select className="adm-input bg-[#151826]">
                                    <option>EleventhLabs - Adam (Bolalar uchun, Quvnoq)</option>
                                    <option>EleventhLabs - Rachel (Sokin)</option>
                                    <option>OpenAI - Alloy</option>
                                    <option>OpenAI - Nova</option>
                                </select>
                                <button className="text-[#FFC107] text-xs font-bold flex items-center gap-1 mt-2 hover:underline">
                                    <Volume2 className="w-3.5 h-3.5" /> Ovozni tinglash
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Tanib olish (Speech-to-Text)</label>
                                <select className="adm-input bg-[#151826]">
                                    <option>OpenAI - Whisper (Tavsiya etiladi)</option>
                                    <option>Groq - Whisper</option>
                                </select>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Col: Stats & Quick Actions */}
                <div className="space-y-8">

                    <div className="adm-card p-6">
                        <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                            <Sliders className="w-5 h-5 text-[#FFC107]" /> AI Statistikasi
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-[#21253A]">
                                <span className="text-gray-400 text-sm font-bold font-medium">Jami suhbatlar</span>
                                <span className="text-white font-black text-lg">1,204</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-[#21253A]">
                                <span className="text-gray-400 text-sm font-bold font-medium">Ovozli xabarlar</span>
                                <span className="text-white font-black text-lg">14,500</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-[#21253A]">
                                <span className="text-gray-400 text-sm font-bold font-medium">O'rtacha davomiylik</span>
                                <span className="text-[#FFC107] font-black text-lg">4 daq</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-[#21253A]">
                                <span className="text-gray-400 text-sm font-bold font-medium">Tokenlar xarajati ~$</span>
                                <span className="text-red-400 font-black text-lg">$12.40</span>
                            </div>
                        </div>
                    </div>

                    <div className="adm-card p-6">
                        <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-[#FFC107]" /> So'nggi Suhbatlar logi
                        </h3>

                        <div className="space-y-3">
                            {[
                                { name: "Ali", msg: "Hello Alex, I like apples", time: "10 daq. oldin", rating: 5 },
                                { name: "Zarina", msg: "What is your name?", time: "25 daq. oldin", rating: 4 },
                                { name: "Jasur", msg: "I have a dog", time: "1 soat oldin", rating: 5 },
                            ].map((log, i) => (
                                <div key={i} className="p-3 rounded-xl bg-[#151826] border border-[#ffffff0a]">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-bold text-white">{log.name}</span>
                                        <span className="text-[10px] text-gray-500 font-bold">{log.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 italic">"{log.msg}"</p>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-4 py-2 rounded-lg bg-[#ffffff0a] text-xs font-bold text-white hover:bg-[#ffffff15] transition-colors">
                            Barcha loglarni ko'rish
                        </button>
                    </div>

                </div>

            </div>

        </div>
    );
}
