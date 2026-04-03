import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";

export default function Header() {
    return (
        <nav className="flex items-center justify-between px-6 lg:px-20 py-5 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
            <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
                <div className="w-10 h-10 rounded-xl bg-[#FFB800] flex items-center justify-center shadow-md">
                    <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black text-[#111111] tracking-tight">
                    English <span className="text-[#FFB800]">Adventure</span>
                </span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500">
                <Link href="/lessons" className="hover:text-[#111111] transition-colors">Darslar</Link>
                <Link href="/speaking-club" className="hover:text-[#111111] transition-colors">Speaking Club</Link>
                <Link href="/dashboard" className="hover:text-[#111111] transition-colors">Dashboard</Link>
                <div className="flex items-center gap-3">
                    <Link href="/register" className="text-sm font-bold text-gray-500 hover:text-[#111111] transition-colors">
                        Ro'yxatdan o'tish
                    </Link>
                    <Link href="/login" className="btn-yellow text-sm">
                        Kirish <ArrowRight className="w-4 h-4 ml-1 inline-block" />
                    </Link>
                </div>
            </div>

            {/* Mobile CTA */}
            <Link href="/login" className="md:hidden btn-yellow text-sm px-4 py-2">
                Kirish
            </Link>
        </nav>
    );
}
