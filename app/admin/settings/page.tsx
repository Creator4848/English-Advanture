"use client";

import { Save, User, Bell, Shield, Database, LayoutTemplate } from "lucide-react";

export default function AdminSettingsPage() {
    return (
        <div className="p-6 lg:p-10 max-w-[1400px] mx-auto pb-24">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">Sozlamalar</h1>
                    <p className="text-gray-400 font-medium">Platforma va admin akkaunti sozlamalari</p>
                </div>
                <button className="adm-btn-yellow">
                    O'zgarishlarni Saqlash <Save className="w-4 h-4 text-[#111111]" />
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">

                {/* Sidebar Nav */}
                <div className="w-full lg:w-64 space-y-1">
                    {[
                        { id: "profile", label: "Profil Sozlamalari", icon: User, active: true },
                        { id: "platform", label: "Platforma", icon: LayoutTemplate, active: false },
                        { id: "notifications", label: "Xabarnomalar", icon: Bell, active: false },
                        { id: "security", label: "Xavfsizlik", icon: Shield, active: false },
                        { id: "database", label: "Ma'lumotlar Bazasi", icon: Database, active: false },
                    ].map((item) => (
                        <button
                            key={item.id}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${item.active
                                ? "bg-[#FFC107] text-[#111111] shadow-lg shadow-[#FFC107]/20"
                                : "text-gray-400 hover:bg-[#ffffff0a] hover:text-white"
                                }`}
                        >
                            <item.icon className="w-4 h-4" /> {item.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-8">

                    <div className="adm-card p-6 md:p-8">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                            <User className="w-5 h-5 text-[#FFC107]" /> Profil Ma'lumotlari
                        </h3>

                        <div className="flex flex-col sm:flex-row gap-8 mb-8">
                            <div className="w-24 h-24 rounded-2xl bg-[#21253A] border border-[#ffffff10] flex items-center justify-center text-3xl flex-shrink-0 cursor-pointer hover:border-[#FFC107] transition-colors relative group">
                                👨‍💼
                                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs font-bold text-white">Yangi rasm</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Ism Familya</label>
                                        <input type="text" defaultValue="Admin User" className="adm-input" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Username</label>
                                        <input type="text" defaultValue="admin_ea" className="adm-input" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Email</label>
                                    <input type="email" defaultValue="admin@englishadventure.uz" className="adm-input" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="adm-card p-6 md:p-8">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                            <Shield className="w-5 h-5 text-[#FFC107]" /> Xavfsizlik va Parol
                        </h3>

                        <div className="space-y-4 max-w-lg">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Joriy parol</label>
                                <input type="password" placeholder="••••••••" className="adm-input" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Yangi parol</label>
                                <input type="password" placeholder="••••••••" className="adm-input" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Yangi parolni tasdiqlang</label>
                                <input type="password" placeholder="••••••••" className="adm-input" />
                            </div>
                            <div className="pt-2">
                                <button className="px-6 py-2 rounded-lg bg-[#ffffff0a] text-sm font-bold text-white hover:bg-[#ffffff15] transition-colors">
                                    Parolni yangilash
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* System Settings */}
                    <div className="adm-card p-6 md:p-8">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                            <Database className="w-5 h-5 text-[#FFC107]" /> Tizim Sozlamalari
                        </h3>

                        <div className="space-y-5">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Platforma nomi</label>
                                    <input type="text" defaultValue="English Adventure" className="adm-input" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Asosiy til</label>
                                    <select className="adm-input">
                                        <option value="uz">🇺🇿 O'zbek tili</option>
                                        <option value="ru">🇷🇺 Rus tili</option>
                                        <option value="en">🇬🇧 Ingliz tili</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-[#ffffff0a] space-y-4">
                                <p className="text-sm font-black text-gray-400 uppercase tracking-wider">Bildirishnomalar</p>
                                {[
                                    { label: "Yangi o'quvchi qo'shilganda xabardor qil", defaultChecked: true },
                                    { label: "Server xatolarida ogohlantirish", defaultChecked: true },
                                    { label: "Haftalik statistika hisobotini yuborish", defaultChecked: false },
                                ].map((item, i) => (
                                    <label key={i} className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{item.label}</span>
                                        <div className="relative">
                                            <input type="checkbox" defaultChecked={item.defaultChecked} className="sr-only peer" />
                                            <div className="w-10 h-5 bg-[#21253A] peer-checked:bg-[#FFC107] rounded-full transition-colors border border-[#ffffff10]" />
                                            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow" />
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}
