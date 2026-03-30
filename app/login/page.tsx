"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, Lock, BookOpen, AlertCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
    const router = useRouter();
    const [phone, setPhone] = useState("+998");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Admin login override
        const cleanPhone = phone.replace(/\s+/g, '');
        if (cleanPhone === "+998889884848" && password === "Grant2tatu") {
            setTimeout(() => {
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem("admin_auth", "true");
                }
                router.push("/admin");
            }, 500);
            return;
        }

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: cleanPhone, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Telefon raqam yoki parol noto'g'ri");
            }

            const data = await res.json();
            if (typeof window !== "undefined") {
                localStorage.setItem("user_token", data.access_token);
                localStorage.setItem("user_info", JSON.stringify(data));
            }

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Xatolik yuz berdi");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden">

            {/* Abstract Background Shapes */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#FFF3CC] rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FFB800] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <Link href="/" className="flex justify-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#FFB800] flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                        <BookOpen className="w-7 h-7 text-white" />
                    </div>
                </Link>
                <h2 className="text-center text-3xl font-black text-[#111111] tracking-tight">
                    Xush kelibsiz! 👋
                </h2>
                <p className="mt-2 text-center text-sm font-bold text-gray-500">
                    Akkauntingiz yo'qmi?{' '}
                    <Link href="/register" className="font-black text-[#FFB800] hover:underline">
                        Ro'yxatdan o'tish
                    </Link>
                </p>
            </div>

            <motion.div
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="bg-white py-8 px-6 shadow-xl border border-gray-100 rounded-3xl sm:px-10">

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-bold">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-2">
                                Telefon raqam
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl text-[#111111] font-bold focus:ring-0 focus:border-[#FFB800] transition-colors placeholder:text-gray-400 placeholder:font-medium outline-none bg-gray-50 focus:bg-white"
                                    placeholder="+998 90 123 45 67"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-2">
                                Parol
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl text-[#111111] font-bold focus:ring-0 focus:border-[#FFB800] transition-colors placeholder:text-gray-400 placeholder:font-medium outline-none bg-gray-50 focus:bg-white"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-black text-[#111111] bg-[#FFB800] hover:bg-[#E6A500] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-[#111111]/30 border-t-[#111111] rounded-full animate-spin" />
                                ) : (
                                    <>Kirish <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
