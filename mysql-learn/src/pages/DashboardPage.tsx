import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PageLayout } from '../components/layout/PageLayout';
import { ProgressBar } from '../components/ui/ProgressBar';
import { BadgeDisplay } from '../components/ui/BadgeDisplay';
import { useProgressStore } from '../store/progressStore';
import { modulesData } from '../data/modules';

const LEVEL_INFO = [
  { id: 1, name: 'Level 1 — Fondasi', color: '#00d4ff', desc: 'DDL, DML, SELECT, Tipe Data', modules: [1,2,3,4,5,6] },
  { id: 2, name: 'Level 2 — Menengah', color: '#4d9fff', desc: 'JOIN, Subquery, Index, Fungsi', modules: [7,8,9,10,11,12,13,14,15,16,17,18] },
  { id: 3, name: 'Level 3 — Lanjutan', color: '#8b5cf6', desc: 'Procedure, Trigger, View, Transaksi', modules: [19,20,21,22,23,24,25,26,27] },
  { id: 4, name: 'Level 4 — Expert', color: '#ff3d9a', desc: 'Performance, Security, Arsitektur', modules: [28,29,30,31,32,33,34,35,36,37,38] },
];

function IconBook() {
  return <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 3.5A1.5 1.5 0 014.5 2h13A1.5 1.5 0 0119 3.5v15a1.5 1.5 0 01-1.5 1.5H4.5A1.5 1.5 0 013 18.5v-15z" stroke="currentColor" strokeWidth="1.3"/><path d="M7 7h8M7 10h8M7 13h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
}
function IconTarget() {
  return <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.3"/><circle cx="11" cy="11" r="5" stroke="currentColor" strokeWidth="1.3"/><circle cx="11" cy="11" r="2" fill="currentColor"/></svg>;
}
function IconFlame() {
  return <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2C8 5 7 8 9 10c-3-1-4-4-3-7C3 6 2 10 5 14c1 3 4 6 6 6s5-3 6-6c1-3 0-6-2-8-1 3-3 4-4 3 2-2 1-5 0-7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>;
}
function IconClock() {
  return <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.3"/><path d="M11 6v5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IconLock() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="6" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 6V4.5a3 3 0 016 0V6" stroke="currentColor" strokeWidth="1.2"/></svg>;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl px-3 py-2 text-xs font-mono" style={{ background: '#151e35', border: '1px solid #1e2d4a', color: '#e8f4fd' }}>
        <div style={{ color: '#7a9cc4' }}>{label}</div>
        <div style={{ color: '#00d4ff' }}>{payload[0].value} menit</div>
      </div>
    );
  }
  return null;
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, progress, dailyActivity, getTotalProgress, getLevelProgress, isModuleUnlocked, isLevelUnlocked, achievements } = useProgressStore();
  const total = getTotalProgress();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const completedCount = Object.values(progress).filter((p) => p.status === 'completed').length;
const scores = Object.values(progress).filter((p) => p.examScore !== null).map((p) => p.examScore as number);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const totalAttempts = Object.values(progress).reduce((s, p) => s + p.examAttempts, 0);

  const lastAccessed = Object.entries(progress)
    .filter(([, p]) => p.lastAccessed)
    .sort(([, a], [, b]) => new Date(b.lastAccessed!).getTime() - new Date(a.lastAccessed!).getTime())
    .slice(0, 3);

  const continueModuleId = lastAccessed.length > 0
    ? parseInt(lastAccessed[0][0].replace('modul_', ''))
    : 1;

  const activityData = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('id-ID', { weekday: 'short' });
      days.push({ date: label, menit: dailyActivity[key]?.minutesSpent ?? 0 });
    }
    return days;
  })();

  const hasActivity = activityData.some((d) => d.menit > 0);

  const timeStr = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
  const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <PageLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">

        {/* HEADER */}
        <motion.div variants={itemVariants} className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs font-mono mb-1" style={{ color: '#3d5a7a' }}>{dateStr} · {timeStr}</div>
            <h1 className="font-syne font-bold text-3xl" style={{ color: '#e8f4fd' }}>
              Selamat datang, <span style={{ color: '#00d4ff' }}>{user.name || 'Pelajar'}</span> 👋
            </h1>
            <p className="text-sm mt-1" style={{ color: '#7a9cc4' }}>
              {completedCount > 0 ? `Kamu sudah menyelesaikan ${completedCount} dari 38 modul. Terus semangat!` : 'Mulai perjalanan belajar MySQL-mu hari ini.'}
            </p>
          </div>
          {lastAccessed.length > 0 && (
            <button
              onClick={() => navigate(`/modul/${continueModuleId}`)}
              className="btn-primary flex-shrink-0"
              style={{ padding: '10px 20px', fontSize: 13 }}
            >
              Lanjutkan Belajar →
            </button>
          )}
        </motion.div>

        {/* STATS CARDS */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <IconBook />, label: 'Modul Selesai', value: completedCount, sub: 'dari 38 modul', color: '#00d4ff' },
            { icon: <IconTarget />, label: 'Rata-rata Skor', value: avgScore ? `${avgScore}%` : '-', sub: `${totalAttempts} ujian dikerjakan`, color: '#00ff88' },
            { icon: <IconFlame />, label: 'Hari Streak', value: user.streak, sub: 'hari berturut-turut', color: '#ff6b35' },
            { icon: <IconClock />, label: 'Total Belajar', value: user.totalStudyMinutes > 60 ? `${Math.floor(user.totalStudyMinutes / 60)}j` : `${user.totalStudyMinutes}m`, sub: `${user.totalStudyMinutes} menit total`, color: '#8b5cf6' },
          ].map((card) => (
            <motion.div
              key={card.label}
              whileHover={{ y: -3, borderColor: card.color + '66' }}
              className="rounded-xl p-5 relative overflow-hidden transition-all"
              style={{ background: '#0f1629', border: `1px solid #1e2d4a`, borderLeft: `3px solid ${card.color}` }}
            >
              <div className="absolute right-4 top-4 opacity-10" style={{ color: card.color }}>{card.icon}</div>
              <div className="text-xs font-mono mb-3 uppercase tracking-widest" style={{ color: '#3d5a7a' }}>{card.label}</div>
              <div className="font-syne font-bold text-3xl mb-1" style={{ color: card.color }}>{card.value}</div>
              <div className="text-xs font-mono" style={{ color: '#3d5a7a' }}>{card.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* PROGRESS OVERALL */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl" style={{ background: '#0f1629', border: '1px solid #1e2d4a' }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="font-syne font-bold" style={{ color: '#e8f4fd' }}>Progress Keseluruhan</div>
              <div className="text-xs font-mono mt-0.5" style={{ color: '#3d5a7a' }}>{completedCount}/38 modul selesai</div>
            </div>
            <div className="font-syne font-bold text-4xl" style={{ color: '#00d4ff' }}>{total}%</div>
          </div>
          <ProgressBar value={total} height={12} gradient showLabel={false} />
        </motion.div>

        {/* ACTIVITY CHART + RECENT */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl" style={{ background: '#0f1629', border: '1px solid #1e2d4a' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="font-syne font-bold" style={{ color: '#e8f4fd' }}>Aktivitas Belajar</div>
                <div className="text-xs font-mono" style={{ color: '#3d5a7a' }}>7 hari terakhir</div>
              </div>
            </div>
            {hasActivity ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={activityData} barSize={24}>
                  <XAxis dataKey="date" tick={{ fill: '#3d5a7a', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#3d5a7a', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} unit="m" width={35} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#00d4ff08' }} />
                  <Bar dataKey="menit" radius={[4, 4, 0, 0]}>
                    {activityData.map((entry, index) => (
                      <Cell key={index} fill={entry.menit > 0 ? '#00d4ff' : '#1e2d4a'} fillOpacity={entry.menit > 0 ? 0.8 : 1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-40" style={{ color: '#3d5a7a' }}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mb-3 opacity-30">
                  <rect x="4" y="20" width="6" height="16" rx="2" fill="currentColor"/>
                  <rect x="14" y="12" width="6" height="24" rx="2" fill="currentColor"/>
                  <rect x="24" y="8" width="6" height="28" rx="2" fill="currentColor"/>
                  <rect x="34" y="16" width="6" height="20" rx="2" fill="currentColor"/>
                </svg>
                <div className="text-sm font-mono">Belum ada aktivitas minggu ini</div>
                <div className="text-xs mt-1">Mulai belajar untuk melihat grafik!</div>
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="p-6 rounded-2xl" style={{ background: '#0f1629', border: '1px solid #1e2d4a' }}>
            <div className="font-syne font-bold mb-4" style={{ color: '#e8f4fd' }}>Terakhir Dibuka</div>
            {lastAccessed.length > 0 ? (
              <div className="space-y-3">
                {lastAccessed.map(([key, p]) => {
                  const mid = parseInt(key.replace('modul_', ''));
                  const mod = modulesData.find((m) => m.id === mid);
                  if (!mod) return null;
                  const statusColor = p.status === 'completed' ? '#00ff88' : '#00d4ff';
                  return (
                    <motion.div
                      key={key}
                      whileHover={{ x: 3 }}
                      onClick={() => navigate(`/modul/${mid}`)}
                      className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all"
                      style={{ background: '#151e35', border: '1px solid #1e2d4a' }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono flex-shrink-0" style={{ background: statusColor + '15', color: statusColor, border: `1px solid ${statusColor}22` }}>
                        {p.status === 'completed' ? '✓' : `${mid}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate" style={{ color: '#e8f4fd' }}>{mod.title}</div>
                        <div className="text-xs font-mono" style={{ color: '#3d5a7a' }}>Modul {mid} · Level {mod.level}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-center py-8" style={{ color: '#3d5a7a' }}>Belum ada modul dibuka</div>
            )}
          </div>
        </motion.div>

        {/* LEVEL CARDS */}
        <motion.div variants={itemVariants}>
          <div className="font-syne font-bold mb-4" style={{ color: '#e8f4fd' }}>Level Pembelajaran</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LEVEL_INFO.map((lvl, i) => {
              const { completed: c, total: t } = getLevelProgress(lvl.id);
              const unlocked = isLevelUnlocked(lvl.id);
              const pct = Math.round((c / t) * 100);
              return (
                <motion.div
                  key={lvl.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={unlocked ? { y: -3, borderColor: lvl.color + '66' } : {}}
                  onClick={() => unlocked && navigate(`/level/${lvl.id}`)}
                  className={`p-5 rounded-2xl relative overflow-hidden transition-all ${unlocked ? 'cursor-pointer' : 'opacity-50'}`}
                  style={{ background: '#0f1629', border: '1px solid #1e2d4a' }}
                >
                  {/* Decorative level number */}
                  <div className="absolute right-4 bottom-2 font-syne font-bold pointer-events-none" style={{ fontSize: 72, color: lvl.color, opacity: 0.05, lineHeight: 1 }}>{lvl.id}</div>
                  {!unlocked && (
                    <div className="absolute top-4 right-4" style={{ color: '#3d5a7a' }}><IconLock /></div>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: lvl.color + '15', color: lvl.color }}>Level {lvl.id}</span>
                      <div className="font-syne font-bold mt-1.5" style={{ color: '#e8f4fd' }}>{lvl.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#7a9cc4' }}>{lvl.desc}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-syne font-bold" style={{ color: lvl.color }}>{c}/{t}</div>
                      <div className="text-xs font-mono" style={{ color: '#3d5a7a' }}>{pct}%</div>
                    </div>
                  </div>
                  <ProgressBar value={c} max={t} color={lvl.color} showLabel={false} height={4} />
                  {!unlocked && <div className="text-xs mt-2 font-mono" style={{ color: '#3d5a7a' }}>🔒 Selesaikan level sebelumnya</div>}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* BADGE SHOWCASE */}
        {achievements.length > 0 && (
          <motion.div variants={itemVariants} className="p-6 rounded-2xl" style={{ background: '#0f1629', border: '1px solid #1e2d4a' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="font-syne font-bold" style={{ color: '#e8f4fd' }}>Badge Diraih</div>
              <button onClick={() => navigate('/profile')} className="text-xs font-mono" style={{ color: '#00d4ff', background: 'none', border: 'none', cursor: 'pointer' }}>Lihat semua →</button>
            </div>
            <BadgeDisplay earned={achievements} />
          </motion.div>
        )}

        {/* QUICK ACCESS MODULES */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div className="font-syne font-bold" style={{ color: '#e8f4fd' }}>Modul Tersedia</div>
            <button onClick={() => navigate('/level/1')} className="text-xs font-mono" style={{ color: '#00d4ff', background: 'none', border: 'none', cursor: 'pointer' }}>Lihat semua →</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {modulesData.slice(0, 9).map((m) => {
              const key = `modul_${m.id}`;
              const p = progress[key];
              const unlocked = isModuleUnlocked(m.id);
              const statusColor = p?.status === 'completed' ? '#00ff88' : p?.status === 'in_progress' ? '#00d4ff' : '#3d5a7a';
              const statusLabel = p?.status === 'completed' ? '✓ Selesai' : p?.status === 'in_progress' ? '▶ Lanjut' : 'Mulai';
              const lvlColor = LEVEL_INFO.find((l) => l.modules.includes(m.id))?.color || '#00d4ff';
              return (
                <motion.div
                  key={m.id}
                  whileHover={unlocked ? { y: -2, borderColor: lvlColor + '44' } : {}}
                  onClick={() => unlocked && navigate(`/modul/${m.id}`)}
                  className={`p-4 rounded-xl flex items-center justify-between transition-all ${unlocked ? 'cursor-pointer' : 'opacity-40'}`}
                  style={{ background: '#0f1629', border: '1px solid #1e2d4a' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono mb-0.5" style={{ color: '#3d5a7a' }}>Modul {m.id}</div>
                    <div className="text-sm font-bold truncate" style={{ color: '#e8f4fd' }}>{m.title}</div>
                    <div className="text-xs mt-0.5 font-mono" style={{ color: '#3d5a7a' }}>~{m.estimatedMinutes} menit</div>
                  </div>
                  <div className="flex-shrink-0 ml-3 text-xs font-bold font-mono" style={{ color: unlocked ? statusColor : '#3d5a7a' }}>
                    {unlocked ? statusLabel : '🔒'}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </motion.div>
    </PageLayout>
  );
}
