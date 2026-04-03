"use client";

import { useState } from "react";
import { User, Save, Lock, Camera } from "lucide-react";

export default function AdminSettingsPage() {
    const [profile, setProfile] = useState({
        name: "Admin User",
        username: "admin_ea",
        email: "admin@englishadventure.uz"
    });

    return (
        <div className="p-6 lg:p-10 max-w-[1400px] mx-auto pb-24">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">Sozlamalar</h1>
                    <p className="text-gray-400 font-medium">Platforma va admin akkaunti sozlamalari</p>
                </div>
                <button className="adm-btn-yellow">
                    O'zgarishlarni Saqlash <Save className="w-4 h-4 text-[#111111]" />
                </button>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">

                {/* Left Sidebar - simplified */}
                <div className="space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#FFC107] text-[#111111] font-bold transition-all">
                        <User className="w-5 h-5" /> Profil Sozlamalari
                    </button>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-8">

                    {/* Profile Information */}
                    <div className="adm-card p-6 md:p-8">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-8">
                            <User className="w-6 h-6 text-[#FFC107]" /> Profil Ma'lumotlari
                        </h3>

                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Avatar section */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-2xl bg-[#21253A] flex items-center justify-center border-2 border-[#ffffff10] overflow-hidden">
                                        <User className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <button className="absolute -bottom-2 -right-2 p-2 rounded-lg bg-[#FFC107] text-[#111111] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider text-center">Admin surati</p>
                            </div>

                            {/* Info form */}
                            <div className="flex-1 grid sm:grid-cols-2 gap-6">
                                <div className="sm:col-span-1">
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Ism Familiya</label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    />
                                </div>
                                <div className="sm:col-span-1">
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Username</label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={profile.username}
                                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Email</label>
                                    <input
                                        type="email"
                                        className="adm-input"
                                        value={profile.email}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security section - kept as part of profile */}
                    <div className="adm-card p-6 md:p-8">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-8">
                            <Lock className="w-6 h-6 text-[#FFC107]" /> Xavfsizlik va Parol
                        </h3>

                        <div className="space-y-6 max-w-md">
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

                            <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-[#ffffff10] text-sm font-bold text-white hover:bg-white/10 transition-all">
                                Parolni yangilash
                            </button>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}
