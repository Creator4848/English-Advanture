import { useState, useEffect, type ReactNode } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen relative bg-white overflow-hidden selection:bg-blue-100 italic selection:text-blue-900">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-sky-50/50 rounded-full blur-[120px]" />

        {mounted && [...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-400/10"
            initial={{ y: "110%", x: `${Math.random() * 100}%` }}
            animate={{
              y: "-10%",
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 20 + Math.random() * 15,
              repeat: Infinity,
              delay: i * 3,
              ease: "linear"
            }}
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              filter: "blur(60px)"
            }}
          />
        ))}
      </div>

      {/* Modern Navigation */}
      <nav className="relative z-50 flex justify-between items-center px-8 py-6 lg:px-20">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:rotate-12 transition-transform duration-300">
            <Rocket className="text-white w-7 h-7" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter font-display">
            GRAVITY ZERO
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-10 text-[15px] font-bold text-slate-500">
          <Link href="#" className="hover:text-blue-600 transition-colors uppercase tracking-widest text-xs">Missiyalar</Link>
          <Link href="#" className="hover:text-blue-600 transition-colors uppercase tracking-widest text-xs">Yutuqlar</Link>
          <Link href="/dashboard" className="bg-slate-900 hover:bg-blue-600 text-white px-8 py-3.5 rounded-full transition-all shadow-xl shadow-slate-200 hover:shadow-blue-200 flex items-center gap-2">
            <span>Boshlash</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* High-End Hero Section */}
      <section className="relative z-10 pt-24 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-[12px] font-black text-blue-600 uppercase tracking-[2px]">Yangi Davr Ta'limi</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 leading-[0.95] font-display tracking-tight">
            Ingliz Tilini <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-400">Vaznsizlikda</span> <br />
            O'rganing
          </h1>

          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-14 leading-relaxed font-medium">
            "English Adventure: Gravity Zero" — vaznsizlik muhitida ingliz tilini o'rganishning eng qiziqarli va zamonaviy usuli.
            AI yordamida har bir qadamingizni kuzatamiz.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link href="/dashboard" className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all">
              Sayohatni Boshlash
            </Link>
            <button className="px-10 py-5 bg-white text-slate-900 border-2 border-slate-100 rounded-[2rem] font-black text-lg hover:bg-slate-50 transition-all">
              Video Tanishuv
            </button>
          </div>
        </motion.div>

        {/* Dynamic Visual Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mt-32 w-full">
          <FeatureCard
            icon={<Mic className="w-10 h-10 text-blue-500" />}
            title="AI Nutq Tahlili"
            description="Whisper AI talaffuzingizni real vaqtda tekshiradi va ibratli feedback beradi."
            delay={0.2}
          />
          <FeatureCard
            icon={<Zap className="w-10 h-10 text-amber-500" />}
            title="Adaptiv Ta'lim"
            description="Sizning darajangizga qarab darslar qiyinchiligi avtomatik ravishda o'zgarib boradi."
            delay={0.4}
          />
          <FeatureCard
            icon={<Star className="w-10 h-10 text-purple-500" />}
            title="Premium Gamifikatsiya"
            description="Missiyalarni bajaring, Gravity Coin-larni to'plang va kosmik yutuqlarga ega bo'ling."
            delay={0.6}
          />
        </div>
      </section>

      {/* Subtle Illustration Decor */}
      <motion.div
        className="absolute -bottom-20 -left-20 opacity-20 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
      >
        <Star className="w-96 h-96 text-blue-100" strokeWidth={0.5} />
      </motion.div>
    </main>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8 }}
      whileHover={{ y: -15 }}
      className="p-10 bg-white/70 backdrop-blur-3xl border border-slate-100 rounded-[3rem] shadow-sm hover:shadow-Gravity transition-all text-left relative overflow-hidden group"
    >
      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-8 border border-white group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-4 font-display">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">{description}</p>
    </motion.div>
  );
}
