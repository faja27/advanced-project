import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PageLayout } from '../components/layout/PageLayout';
import { ProgressBar } from '../components/ui/ProgressBar';
import { BadgeDisplay } from '../components/ui/BadgeDisplay';
import { useProgressStore } from '../store/progressStore';
import { modulesData } from '../data/modules';

const LEVEL_META: Record<number, { name: string; color: string; short: string }> = {
  1: { name: 'Level Fondasi', color: '#00d4ff', short: 'L1' },
  2: { name: 'Level Menengah', color: '#4d9fff', short: 'L2' },
  3: { name: 'Level Lanjutan', color: '#8b5cf6', short: 'L3' },
  4: { name: 'Level Expert', color: '#ff3d9a', short: 'L4' },
};

export function ProfilePage() {
  const { user, progress, achievements, dailyActivity, getLevelProgress, getTotalProgress, resetProgress, setUserName } = useProgressStore();
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [confirmReset, setConfirmReset] = useState(false);

  const total = getTotalProgress();
  const completed = Object.values(progress).filter((p) => p.status === 'completed').length;
  const avgScore = (() => {
    const scores = Object.values(progress).filter((p) => p.examScore !== null).map((p) => p.examScore as number);
    return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  })();
  const totalAttempts = Object.values(progress).reduce((s, p) => s + p.examAttempts, 0);
  const joinDate = new Date(user.joinDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  const completedModules = modulesData.filter((m) => progress[`modul_${m.id}`]?.status === 'completed');

  const activityChartData = (() => {
    const days: { date: string; menit: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('id-ID', { weekday: 'short' });
      days.push({ date: label, menit: dailyActivity[key]?.minutesSpent ?? 0 });
    }
    return days;
  })();

  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
  const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

  return (
    <PageLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto space-y-6">

        {/* Hero / Profile Card */}
        <motion.div variants={itemVariants} className="p-8 rounded-2xl relative overflow-hidden" style={{ background: '#0f1629', border: '1px solid #1e2d4a' }}>
          {/* Decorative bg glow */}
          <div className="absolute right-0 top-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, #00d4ff08 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

          <div className="flex items-center gap-6 relative">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center font-syne font-bold text-3xl"
                style={{ background: 'linear-gradient(135deg, #00d4ff15, #8b5cf615)', border: '1px solid #00d4ff33', color: '#00d4ff' }}
              >
                {user.name ? user.name[0]?.toUpperCase() : '?'}
              </div>
              {user.streak >= 7 && (
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm" style={{ background: '#ff9500', border: '2px solid #050810' }}>
                  🔥
                </div>
              )}
            </div>

            <div className="flex-1">
              {editName ? (
                <div className="flex gap-2 mb-1">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { setUserName(newName); setEditName(false); } }}
                    className="px-3 py-1.5 rounded-xl border text-sm outline-none font-mono"
                    style={{ background: '#050810', borderColor: '#00d4ff44', color: '#e8f4fd' }}
                  />
                  <button onClick={() => { setUserName(newName); setEditName(false); }} className="px-3 py-1.5 rounded-xl text-xs font-bold font-mono" style={{ background: '#00d4ff', color: '#050810' }}>
                    Simpan
                  </button>
                  <button onClick={() => setEditName(false)} className="px-3 py-1.5 rounded-xl text-xs border font-mono" style={{ borderColor: '#1e2d4a', color: '#7a9cc4' }}>
                    Batal
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-syne font-bold text-2xl" style={{ color: '#e8f4fd' }}>{user.name || 'User'}</span>
                  <button
                    onClick={() => setEditName(true)}
                    className="text-xs px-2 py-0.5 rounded font-mono transition-all"
                    style={{ color: '#3d5a7a', border: '1px solid #1e2d4a' }}
                  >
                    Edit
                  </button>
                </div>
              )}
              <div className="text-xs font-mono mb-2" style={{ color: '#3d5a7a' }}>Bergabung sejak {joinDate}</div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span>🔥</span>
                  <span className="font-mono font-bold text-sm" style={{ color: '#ff9500' }}>{user.streak}</span>
                  <span className="text-xs font-mono" style={{ color: '#3d5a7a' }}>hari streak</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono" style={{ color: '#3d5a7a' }}>Belajar:</span>
                  <span className="font-mono font-bold text-sm" style={{ color: '#8b5cf6' }}>{user.totalStudyMinutes}m</span>
                </div>
              </div>
            </div>

            {/* Overall progress circle */}
            <div className="flex-shrink-0 relative w-20 h-20">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#1e2d4a" strokeWidth="7" />
                <circle
                  cx="40" cy="40" r="32" fill="none"
                  stroke="url(#profileGrad)" strokeWidth="7"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - total / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                />
                <defs>
                  <linearGradient id="profileGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="font-syne font-bold text-lg" style={{ color: '#00d4ff' }}>{total}%</div>
                <div className="text-xs font-mono" style={{ color: '#3d5a7a', fontSize: 9 }}>progress</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Modul Selesai', value: completed, sub: 'dari 38', color: '#00ff88', icon: '📚' },
            { label: 'Rata-rata Skor', value: `${avgScore}%`, sub: 'ujian', color: '#00d4ff', icon: '🎯' },
            { label: 'Total Ujian', value: totalAttempts, sub: 'percobaan', color: '#ff9500', icon: '📝' },
            { label: 'Waktu Belajar', value: `${user.totalStudyMinutes}`, sub: 'menit', color: '#8b5cf6', icon: '⏱️' },
          ].map((s) => (
            <div key={s.label} className="p-5 rounded-2xl" style={{ background: '#0f1629', border: '1px solid #1e2d4a', borderLeft: `3px solid ${s.color}` }}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-syne font-bold text-2xl" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-mono mt-0.5" style={{ color: '#3d5a7a' }}>{s.label}</div>
              {s.sub && <div className="text-xs font-mono" style={{ color: '#3d5a7a' }}>{s.sub}</div>}
            </div>
          ))}
        </motion.div>

        {/* Level breakdown */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl" style={{ background: '#0f1629', border: '1px solid #1e2d4a' }}>
          <div className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: '#3d5a7a' }}>Progress per Level</div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((lvl) => {
              const { completed: lvlCompleted, total: lvlTotal } = getLevelProgress(lvl);
              const meta = LEVEL_META[lvl];
              const pct = lvlTotal > 0 ? Math.round((lvlCompleted / lvlTotal) * 100) : 0;
              return (
                <div key={lvl}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: meta.color + '15', color: meta.color }}>{meta.short}</span>
                      <span className="text-sm" style={{ color: '#7a9cc4' }}>{meta.name}</span>
                    </div>
                    <span className="text-xs font-mono" style={{ color: '#3d5a7a' }}>{lvlCompleted}/{lvlTotal} · {pct}%</span>
                  </div>
                  <ProgressBar value={lvlCompleted} max={lvlTotal} color={meta.color} showLabel={false} height={5} />
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Activity chart */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl" style={{ background: '#0f1629', border: '1px solid #1e2d4a' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-mono uppercase tracking-widest" style={{ color: '#3d5a7a' }}>Aktivitas 7 Hari Terakhir</div>
            <div className="text-xs font-mono" style={{ color: '#00d4ff' }}>
              {activityChartData.reduce((s, d) => s + d.menit, 0)}m total
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={activityChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="actGradProfile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#3d5a7a', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#3d5a7a', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} unit="m" />
              <Tooltip
                contentStyle={{ background: '#0f1629', border: '1px solid #1e2d4a', borderRadius: 12, color: '#e8f4fd', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                formatter={(v) => [`${v} menit`, 'Waktu Belajar']}
              />
              <Area type="monotone" dataKey="menit" stroke="#00d4ff" strokeWidth={2} fill="url(#actGradProfile)" dot={{ fill: '#00d4ff', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#00d4ff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Badges */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl" style={{ background: '#0f1629', border: '1px solid #1e2d4a' }}>
          <div className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: '#3d5a7a' }}>
            Badge & Pencapaian
            {achievements.length > 0 && <span className="ml-2 font-bold" style={{ color: '#00ff88' }}>{achievements.length} diraih</span>}
          </div>
          <BadgeDisplay earned={achievements} showAll />
          {achievements.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: '#3d5a7a' }}>
              Belum ada badge. Selesaikan modul pertama untuk mendapatkan badge pertamamu!
            </p>
          )}
        </motion.div>

        {/* Completed modules */}
        {completedModules.length > 0 && (
          <motion.div variants={itemVariants} className="p-6 rounded-2xl" style={{ background: '#0f1629', border: '1px solid #1e2d4a' }}>
            <div className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: '#3d5a7a' }}>
              Modul Selesai <span style={{ color: '#00ff88' }}>({completedModules.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {completedModules.map((m) => {
                const p = progress[`modul_${m.id}`];
                const lvlColor = LEVEL_META[m.level]?.color || '#00d4ff';
                return (
                  <div key={m.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ background: '#050810', border: '1px solid #1e2d4a' }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono flex-shrink-0" style={{ color: lvlColor }}>#{m.id}</span>
                      <span className="text-sm truncate" style={{ color: '#7a9cc4' }}>{m.title}</span>
                    </div>
                    <span className="text-xs font-mono flex-shrink-0 ml-2" style={{ color: p?.examScore !== undefined && p.examScore !== null && p.examScore >= 70 ? '#00ff88' : '#3d5a7a' }}>
                      {p?.examScore ?? '-'}%
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Danger zone */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl" style={{ background: '#0f1629', border: '1px solid #ff6b3520' }}>
          <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: '#ff6b35' }}>Zona Bahaya</div>
          <p className="text-sm mb-4" style={{ color: '#3d5a7a' }}>
            Reset semua progress, badge, dan statistik. Tindakan ini <strong style={{ color: '#ff6b35' }}>tidak dapat dibatalkan</strong>.
          </p>
          <AnimatePresence mode="wait">
            {!confirmReset ? (
              <motion.button
                key="btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmReset(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold font-mono border transition-all"
                style={{ borderColor: '#ff6b3544', color: '#ff6b35' }}
              >
                Reset Semua Progress
              </motion.button>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-xl"
                style={{ background: '#ff6b3510', border: '1px solid #ff6b3530' }}
              >
                <p className="text-sm font-bold mb-3" style={{ color: '#ff6b35' }}>Yakin ingin mereset semua progress?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { resetProgress(); setConfirmReset(false); }}
                    className="px-4 py-2 rounded-xl text-xs font-bold font-mono"
                    style={{ background: '#ff6b35', color: '#050810' }}
                  >
                    Ya, Reset Sekarang
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-4 py-2 rounded-xl text-xs font-mono border"
                    style={{ borderColor: '#1e2d4a', color: '#7a9cc4' }}
                  >
                    Batal
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </motion.div>
    </PageLayout>
  );
}
