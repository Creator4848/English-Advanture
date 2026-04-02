"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen, Mic, Star, Trophy, ArrowRight,
  Play, Zap, CheckCircle, ChevronRight
} from "lucide-react";
import Teachers from "@/components/Teachers";

/* ── Data ──────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <Play className="w-7 h-7 text-[#FFB800]" />,
    title: "Video Darslar",
    desc: "YouTube orqali qiziqarli video darslar. Har bir dars bolaning yoshiga mos tarzda tayyorlangan.",
  },
  {
    icon: <Zap className="w-7 h-7 text-[#FFB800]" />,
    title: "Interaktiv Testlar",
    desc: "Har dars yakunida drag-drop va rasmli testlar. Bola bilimini o'ynoqi tarzda tekshiring.",
  },
  {
    icon: <Mic className="w-7 h-7 text-[#FFB800]" />,
    title: "AI Speaking Club",
    desc: "Alex nomli AI qahramon bilan real vaqtda inglizcha suhbatlashing. Whisper + GPT-4o-mini.",
  },
  {
    icon: <Trophy className="w-7 h-7 text-[#FFB800]" />,
    title: "Progress & Yutuqlar",
    desc: "XP, Level va Badge tizimi. Har bir yutuq bolani rag'batlantiradi.",
  },
];

const TOPICS = [
  "Animals 🐾", "Colors 🎨", "Numbers 🔢", "Alphabet 🔤",
  "Family 👨‍👩‍👧", "Food 🍎", "Weather ☀️", "Body Parts 💪",
];

const HOW_IT_WORKS = [
  { step: "1", title: "Videoni Tomosha Qil", desc: "YouTube darsini platforma ichida ko'r." },
  { step: "2", title: "Testni Bajaring", desc: "Drag-drop va rasmli testlar bilan o'rganilganini mustahkamla." },
  { step: "3", title: "AI bilan Gaplash", desc: "Alex AI bilan inglizcha suhbatni mashq qil." },
  { step: "4", title: "Progress Kuzat", desc: "XP yig'ib, level oshir va badge-larni ochar." },
];

/* ── Page ──────────────────────────────────────────────────────────── */
export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main className="min-h-screen bg-white overflow-x-hidden" id="home-page">

      {/* ── NAV ────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 lg:px-20 py-5 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFB800] flex items-center justify-center shadow-md">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-[#111111] tracking-tight">
            English <span className="text-[#FFB800]">Adventure</span>
          </span>
        </div>

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

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="px-6 lg:px-20 pt-20 pb-24 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left copy */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="badge mb-6 mx-auto lg:mx-0">
              <span className="pulse-dot w-2 h-2 rounded-full bg-[#FFB800] inline-block" />
              Bolalar uchun #1 ingliz tili platformasi
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-[#111111] leading-[1.05] mb-6">
              Ingliz Tilini<br />
              <span className="text-[#FFB800]">O'ynab</span> O'rgan
            </h1>

            <p className="text-lg md:text-xl text-gray-500 font-medium max-w-xl mb-10 mx-auto lg:mx-0">
              Video darslar, interaktiv testlar va AI suhbat sherigi bilan
              boshlang'ich maktab o'quvchilari uchun eng qiziqarli ingliz tili platformasi.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/lessons" id="hero-start-btn" className="btn-yellow text-base">
                Darslarni Boshlash <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/speaking-club" className="btn-outline text-base">
                AI bilan Gaplash <Mic className="w-5 h-5" />
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex gap-10 mt-12 justify-center lg:justify-start">
              {[
                { n: "50+", l: "Video Dars" },
                { n: "100+", l: "Test Savoli" },
                { n: "8", l: "Mavzu" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-3xl font-black text-[#111111]">{s.n}</div>
                  <div className="text-xs font-bold text-gray-400 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right illustration */}
          {mounted && (
            <motion.div
              className="flex-1 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2 }}
            >
              <div className="relative w-80 h-80 md:w-96 md:h-96">
                {/* Background circle */}
                <div className="absolute inset-0 rounded-full bg-[#FFF3CC] floating" />
                {/* Center emoji */}
                <div className="absolute inset-0 flex items-center justify-center text-8xl select-none">
                  📚
                </div>
                {/* Orbiting icons */}
                {[
                  { emoji: "🎵", top: "5%", left: "45%" },
                  { emoji: "⭐", top: "45%", left: "88%" },
                  { emoji: "🎯", top: "80%", left: "50%" },
                  { emoji: "🏆", top: "45%", left: "2%" },
                ].map((o, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-3xl"
                    style={{ top: o.top, left: o.left }}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, delay: i * 0.6 }}
                  >
                    {o.emoji}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── TOPICS STRIP ───────────────────────────────────────── */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-black text-gray-400 uppercase tracking-widest mb-5">
            O'rganilgan mavzular
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {TOPICS.map((t) => (
              <Link
                key={t}
                href={`/lessons?topic=${encodeURIComponent(t.split(" ")[0])}`}
                className="card px-5 py-2.5 text-sm font-black text-[#111111] hover:border-[#FFB800] hover:bg-[#FFF3CC] transition-all cursor-pointer"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEACHERS ───────────────────────────────────────────── */}
      <Teachers />

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-20 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black text-[#111111] text-center mb-3">
          Nima uchun <span className="text-[#FFB800]">English Adventure</span>?
        </h2>
        <p className="text-center text-gray-400 font-medium mb-14 max-w-xl mx-auto">
          Oddiy darslikdan farqli o'laroq, bu real ta'lim ekotizimidir.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="card p-7"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-[#FFF3CC] flex items-center justify-center mb-5">
                {f.icon}
              </div>
              <h3 className="text-lg font-black text-[#111111] mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section className="bg-[#111111] py-24 px-6 lg:px-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-3">
            Qanday Ishlaydi?
          </h2>
          <p className="text-center text-gray-400 font-medium mb-14">
            4 oddiy qadamda ingliz tilini o'rganing
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((h, i) => (
              <motion.div
                key={h.step}
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="w-12 h-12 rounded-full bg-[#FFB800] flex items-center justify-center text-xl font-black text-[#111111] mb-4">
                  {h.step}
                </div>
                <h3 className="text-white font-black text-lg mb-2">{h.title}</h3>
                <p className="text-gray-400 text-sm font-medium">{h.desc}</p>
                {i < 3 && (
                  <ChevronRight className="hidden md:block absolute top-3 -right-4 text-[#FFB800] w-5 h-5" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="badge mx-auto mb-5">🚀 Bepul boshlang</div>
          <h2 className="text-4xl md:text-6xl font-black text-[#111111] mb-6">
            Bugun Boshlang!
          </h2>
          <p className="text-gray-400 text-lg font-medium max-w-lg mx-auto mb-10">
            O'g'lingiz yoki qizingiz uchun eng yaxshi ingliz tili tajribasini yarating.
          </p>
          <Link href="/lessons" id="cta-btn" className="btn-yellow text-lg px-10 py-4">
            Darslarni Ko'rish <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFB800] flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-[#111111]">English Adventure</span>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-xs text-gray-400 font-medium">
              © 2026 English Adventure. Bolalar uchun yaratilgan.
            </p>
            <Link href="/admin" className="text-xs text-gray-400 font-bold hover:text-[#FFB800] transition-colors flex items-center gap-1">
              Admin Panel
            </Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
