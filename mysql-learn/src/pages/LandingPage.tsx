import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgressStore } from '../store/progressStore';

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="6" width="22" height="16" rx="2" stroke="#00d4ff" strokeWidth="1.5"/>
        <path d="M7 10l4 4-4 4M13 18h8" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    color: '#00d4ff',
    title: 'SQL Editor Interaktif',
    desc: 'Jalankan query SQL langsung di browser tanpa instalasi. Didukung Monaco Editor yang sama dengan VS Code.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="#8b5cf6" strokeWidth="1.5"/>
        <rect x="16" y="4" width="8" height="8" rx="1.5" stroke="#8b5cf6" strokeWidth="1.5"/>
        <rect x="4" y="16" width="8" height="8" rx="1.5" stroke="#8b5cf6" strokeWidth="1.5"/>
        <rect x="16" y="16" width="8" height="8" rx="1.5" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.4"/>
      </svg>
    ),
    color: '#8b5cf6',
    title: '38 Modul Terstruktur',
    desc: 'Dari konsep dasar hingga teknik expert. Setiap modul dirancang untuk membangun fondasi yang kuat.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="#00ff88" strokeWidth="1.5"/>
        <path d="M9 14l4 4 7-8" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: '#00ff88',
    title: 'Ujian per Modul',
    desc: 'Validasi pemahamanmu dengan 10+ soal ujian per modul. Sistem grading otomatis dengan penjelasan mendalam.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 22V8l10-4 10 4v14" stroke="#ff6b35" strokeWidth="1.5" strokeLinejoin="round"/>
        <rect x="10" y="14" width="8" height="8" rx="1" stroke="#ff6b35" strokeWidth="1.5"/>
      </svg>
    ),
    color: '#ff6b35',
    title: 'Progress Tracker',
    desc: 'Pantau perkembanganmu dengan statistik detail, streak harian, badge pencapaian, dan grafik aktivitas.',
  },
];

const LEVELS = [
  { num: '01', name: 'Level Fondasi', color: '#00d4ff', topics: ['Pengenalan Database & MySQL', 'Tipe Data & Constraints', 'DDL: CREATE, ALTER, DROP', 'DML: INSERT, UPDATE, DELETE', 'SELECT & Filtering Data'], mods: 6 },
  { num: '02', name: 'Level Menengah', color: '#4d9fff', topics: ['Fungsi String & Numerik', 'Agregasi & GROUP BY', 'JOIN (INNER, LEFT, RIGHT)', 'Subquery & Correlated Query', 'Index & Optimasi'], mods: 12 },
  { num: '03', name: 'Level Lanjutan', color: '#8b5cf6', topics: ['Stored Procedure & Function', 'Trigger & Event Scheduler', 'VIEW & Transaksi ACID', 'Full-Text Search', 'EXPLAIN & Query Analysis'], mods: 9 },
  { num: '04', name: 'Level Expert', color: '#ff3d9a', topics: ['Window Functions & CTE', 'JSON di MySQL', 'Performance Tuning', 'Security & Privilege', 'Backup, Replikasi & Monitoring'], mods: 11 },
];

const SQL_KEYWORDS = ['SELECT', 'JOIN', 'INDEX', 'TRIGGER', 'VIEW', 'GROUP BY', 'HAVING', 'UNION', 'WHERE', 'ORDER BY', 'PROCEDURE', 'FUNCTION', 'TRANSACTION', 'PARTITION', 'EXPLAIN'];

export function LandingPage() {
  const navigate = useNavigate();
  const { user, setUserName, updateStreak } = useProgressStore();
  const [inputName, setInputName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleStart = () => {
    if (user.name) { updateStreak(); navigate('/dashboard'); }
    else setShowInput(true);
  };

  const handleSubmit = () => {
    if (inputName.trim()) { setUserName(inputName.trim()); updateStreak(); navigate('/dashboard'); }
  };

  return (
    <div style={{ background: '#050810', color: '#e8f4fd', minHeight: '100vh', fontFamily: 'Syne, sans-serif' }}>

      {/* NAVBAR */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? '#05081099' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid #1e2d4a' : '1px solid transparent',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#00d4ff15', border: '1px solid #00d4ff30' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <ellipse cx="8" cy="4" rx="6" ry="2" stroke="#00d4ff" strokeWidth="1.2"/>
                <path d="M2 4v3c0 1.1 2.69 2 6 2s6-.9 6-2V4" stroke="#00d4ff" strokeWidth="1.2"/>
                <path d="M2 7v3c0 1.1 2.69 2 6 2s6-.9 6-2V7" stroke="#00d4ff" strokeWidth="1.2" opacity="0.5"/>
              </svg>
            </div>
            <span className="font-syne font-bold text-base">
              <span style={{ color: '#00d4ff' }}>MySQL</span>
              <span style={{ color: '#e8f4fd' }}>Master</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm" style={{ color: '#7a9cc4' }}>
            <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Syne', fontSize: 14, color: 'inherit' }}>Dashboard</button>
            <button onClick={() => document.getElementById('kurikulum')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Syne', fontSize: 14, color: 'inherit' }}>Kurikulum</button>
            <button onClick={() => document.getElementById('fitur')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Syne', fontSize: 14, color: 'inherit' }}>Fitur</button>
          </nav>
          {user.name ? (
            <button onClick={() => { updateStreak(); navigate('/dashboard'); }} className="btn-outline text-sm" style={{ padding: '8px 20px', fontSize: 13 }}>
              Lanjutkan →
            </button>
          ) : (
            <button onClick={handleStart} className="btn-primary text-sm" style={{ padding: '8px 20px', fontSize: 13 }}>
              Mulai Belajar
            </button>
          )}
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ paddingTop: 80 }}>
        {/* Decorative circles */}
        <div className="absolute pointer-events-none" style={{ top: '10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, #00d4ff08 0%, transparent 70%)', border: '1px solid #00d4ff08' }} />
        <div className="absolute pointer-events-none" style={{ bottom: '5%', left: '-8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, #8b5cf608 0%, transparent 70%)', border: '1px solid #8b5cf608' }} />
        <div className="absolute pointer-events-none" style={{ top: '30%', left: '10%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, #4d9fff06 0%, transparent 70%)' }} />

        {/* Grid dot pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e2d4a 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.4 }} />

        {/* Floating SQL keywords */}
        {SQL_KEYWORDS.slice(0, 8).map((kw, i) => (
          <div
            key={kw}
            className="absolute pointer-events-none font-mono text-xs select-none"
            style={{
              color: '#00d4ff',
              opacity: 0.04,
              left: `${10 + (i * 11) % 80}%`,
              top: `${15 + (i * 17) % 70}%`,
              animation: `float ${6 + (i % 3)}s ease-in-out infinite ${i * 0.8}s`,
              fontSize: 11 + (i % 3) * 3,
            }}
          >
            {kw}
          </div>
        ))}

        {/* Scan line effect */}
        <div className="absolute inset-x-0 h-px pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, #00d4ff11, transparent)', animation: 'scan-line 8s linear infinite', opacity: 0.5 }} />

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono mb-8"
              style={{ background: '#00d4ff0a', border: '1px solid #00d4ff33', color: '#00d4ff' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Platform Belajar MySQL #1 di Indonesia
            </div>

            {/* H1 */}
            <h1 className="font-syne font-bold leading-tight mb-6" style={{ fontSize: 'clamp(40px, 6vw, 72px)', color: '#e8f4fd' }}>
              Kuasai MySQL<br />
              dari Nol hingga{' '}
              <span className="gradient-text text-glow">Expert</span>
            </h1>

            <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: '#7a9cc4', lineHeight: 1.7, fontSize: 18 }}>
              Platform belajar MySQL interaktif dengan 38 modul terstruktur, SQL editor langsung di browser,
              380+ soal ujian, dan sistem badge pencapaian.
            </p>

            {/* CTA */}
            <AnimatePresence mode="wait">
              {!showInput ? (
                <motion.div key="btns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={handleStart} className="btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
                    {user.name ? `Lanjutkan sebagai ${user.name} →` : 'Mulai Belajar Gratis →'}
                  </button>
                  <button onClick={() => document.getElementById('kurikulum')?.scrollIntoView({ behavior: 'smooth' })} className="btn-outline" style={{ fontSize: 16, padding: '14px 32px' }}>
                    Lihat Kurikulum
                  </button>
                </motion.div>
              ) : (
                <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 justify-center max-w-sm mx-auto">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Masukkan namamu..."
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className="flex-1 px-4 py-3 rounded-xl text-sm outline-none font-syne"
                    style={{ background: '#0f1629', border: '1px solid #00d4ff44', color: '#e8f4fd', caretColor: '#00d4ff' }}
                  />
                  <button onClick={handleSubmit} className="btn-primary" style={{ padding: '12px 20px', flexShrink: 0 }}>
                    Mulai →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats row */}
            <div className="flex items-center justify-center gap-6 mt-12 flex-wrap text-sm">
              {[
                { num: '38', label: 'Modul' },
                { num: '380+', label: 'Soal Ujian' },
                { num: '4', label: 'Level' },
                { num: '100%', label: 'Gratis' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-6">
                  {i > 0 && <span style={{ color: '#1e2d4a' }}>·</span>}
                  <div className="text-center">
                    <div className="font-syne font-bold text-xl" style={{ color: '#00d4ff' }}>{s.num}</div>
                    <div className="text-xs" style={{ color: '#3d5a7a' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1.5" style={{ borderColor: '#1e2d4a' }}>
            <div className="w-1 h-2 rounded-full animate-pulse" style={{ background: '#00d4ff' }} />
          </div>
        </motion.div>
      </section>

      {/* FITUR */}
      <section id="fitur" className="py-24 px-6" style={{ background: '#0a0e1a' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="text-xs font-mono mb-3" style={{ color: '#00d4ff' }}>// FITUR UNGGULAN</div>
            <h2 className="font-syne font-bold text-4xl mb-4" style={{ color: '#e8f4fd' }}>
              Semua yang kamu butuhkan<br />untuk <span className="gradient-text">menguasai MySQL</span>
            </h2>
            <div className="h-px w-24 mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)' }} />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, borderColor: f.color + '88' }}
                className="p-6 rounded-2xl cursor-default transition-all duration-200"
                style={{ background: '#0f1629', border: '1px solid #1e2d4a' }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: f.color + '10', border: `1px solid ${f.color}22` }}>
                    {f.icon}
                  </div>
                  <div>
                    <div className="font-syne font-bold mb-1.5" style={{ color: '#e8f4fd' }}>{f.title}</div>
                    <div className="text-sm leading-relaxed" style={{ color: '#7a9cc4' }}>{f.desc}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* KURIKULUM */}
      <section id="kurikulum" className="py-24 px-6" style={{ background: '#050810' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="text-xs font-mono mb-3" style={{ color: '#8b5cf6' }}>// KURIKULUM</div>
            <h2 className="font-syne font-bold text-4xl mb-4" style={{ color: '#e8f4fd' }}>
              4 Level, 38 Modul,<br /><span className="gradient-text">Satu Journey</span>
            </h2>
            <div className="h-px w-24 mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #8b5cf6, transparent)' }} />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {LEVELS.map((lvl, i) => (
              <motion.div
                key={lvl.num}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -3 }}
                className="p-6 rounded-2xl relative overflow-hidden"
                style={{ background: '#0f1629', border: '1px solid #1e2d4a', borderLeft: `3px solid ${lvl.color}` }}
              >
                {/* Decorative number */}
                <div className="absolute right-5 top-4 font-syne font-bold" style={{ fontSize: 64, color: lvl.color, opacity: 0.05, lineHeight: 1 }}>{lvl.num}</div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: lvl.color + '15', color: lvl.color }}>Level {lvl.num}</span>
                  <span className="font-syne font-bold text-sm" style={{ color: '#e8f4fd' }}>{lvl.name}</span>
                  <span className="ml-auto text-xs font-mono" style={{ color: '#3d5a7a' }}>{lvl.mods} modul</span>
                </div>
                <ul className="space-y-2">
                  {lvl.topics.map((t) => (
                    <li key={t} className="flex items-center gap-2 text-sm" style={{ color: '#7a9cc4' }}>
                      <span style={{ color: lvl.color, fontSize: 10 }}>▶</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ background: '#0a0e1a' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, #00d4ff06 0%, transparent 70%)' }} />
        <div className="absolute pointer-events-none" style={{ top: '20%', right: '10%', width: 300, height: 300, borderRadius: '50%', border: '1px solid #00d4ff08' }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-syne font-bold mb-6" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: '#e8f4fd' }}>
              Siap menjadi<br /><span className="gradient-text text-glow">MySQL Master?</span>
            </h2>
            <p className="mb-10" style={{ color: '#7a9cc4', fontSize: 16 }}>
              Bergabung dan mulai perjalananmu hari ini. Gratis selamanya.
            </p>
            <button onClick={handleStart} className="btn-primary glow-cyan" style={{ fontSize: 18, padding: '16px 40px' }}>
              {user.name ? 'Lanjutkan Belajar →' : 'Mulai Sekarang — Gratis →'}
            </button>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 text-center" style={{ background: '#050810', borderTop: '1px solid #1e2d4a' }}>
        <div className="font-syne text-sm mb-1">
          <span style={{ color: '#00d4ff' }}>MySQL</span>
          <span style={{ color: '#e8f4fd' }}>Master</span>
        </div>
        <div className="text-xs" style={{ color: '#3d5a7a', fontFamily: 'JetBrains Mono' }}>
          Platform Belajar MySQL Interaktif · Open Source · Gratis
        </div>
      </footer>
    </div>
  );
}
