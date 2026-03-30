"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Phone, BookOpen, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
    const router = useRouter();
    const [phone, setPhone] = useState("+998");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Simulate API delay
        setTimeout(() => {
            // Mock validation with specific credentials
            if (phone.replace(/\s+/g, '') === "+998889884848" && password === "Grant2tatu") {
                // Set fake auth cookie/storage just for demo purposes
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem("admin_auth", "true");
                }
                router.push("/admin");
            } else {
                setError("Telefon raqam yoki parol noto'g'ri");
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[#0F1117] flex items-center justify-center p-6 relative overflow-hidden">

            {/* Background decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FFC107] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FFC107] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">

                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#FFC107] flex items-center justify-center shadow-[0_0_30px_rgba(255,193,7,0.3)] mx-auto mb-6">
                        <BookOpen className="w-8 h-8 text-[#111111]" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Xush Kelibsiz</h1>
                    <p className="text-gray-400 font-medium">Boshqaruv paneliga kirish uchun tasdiqlang</p>
                </div>

                <form onSubmit={handleLogin} className="bg-[#1A1D2E]/80 backdrop-blur-xl border border-[#ffffff10] rounded-3xl p-8 shadow-2xl">

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm font-bold">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Telefon raqam</label>
                            <div className="relative">
                                <Phone className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-[#21253A] border border-[#ffffff10] rounded-xl py-3 pl-12 pr-4 text-white font-medium focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 outline-none transition-all placeholder:text-gray-500"
                                    placeholder="+998 00 000 00 00"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Parol</label>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#21253A] border border-[#ffffff10] rounded-xl py-3 pl-12 pr-4 text-white font-medium focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 outline-none transition-all placeholder:text-gray-500"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#FFC107] hover:bg-[#E6AC00] text-[#111111] font-black text-sm py-3.5 rounded-xl transition-all shadow-[0_4px_14px_rgba(255,193,7,0.25)] hover:shadow-[0_6px_20px_rgba(255,193,7,0.35)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-8 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-[#111111]/30 border-t-[#111111] rounded-full animate-spin" />
                            ) : (
                                "Kirish"
                            )}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}
