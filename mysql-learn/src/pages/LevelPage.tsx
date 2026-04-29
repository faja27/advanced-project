import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageLayout } from '../components/layout/PageLayout';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useProgressStore } from '../store/progressStore';
import { modulesData } from '../data/modules';

const LEVEL_META: Record<number, { name: string; color: string; desc: string; bg: string }> = {
  1: { name: 'Level Fondasi', color: '#00d4ff', bg: '#00d4ff', desc: 'Dasar-dasar MySQL: tipe data, DDL, DML, dan SELECT dasar.' },
  2: { name: 'Level Menengah', color: '#4d9fff', bg: '#4d9fff', desc: 'JOIN, subquery, fungsi agregat, index, dan optimasi query.' },
  3: { name: 'Level Lanjutan', color: '#8b5cf6', bg: '#8b5cf6', desc: 'Stored procedure, trigger, view, event, dan transaksi.' },
  4: { name: 'Level Expert', color: '#ff3d9a', bg: '#ff3d9a', desc: 'Performance tuning, security, replikasi, dan arsitektur.' },
};

function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="7" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

export function LevelPage() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { progress, getLevelProgress, isModuleUnlocked } = useProgressStore();

  const id = parseInt(levelId || '1');
  const meta = LEVEL_META[id];
  const modules = modulesData.filter((m) => m.level === id);
  const { completed, total } = getLevelProgress(id);

  if (!meta) return null;

  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
  const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

  return (
    <PageLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">

        {/* HEADER */}
        <motion.div variants={itemVariants} className="p-8 rounded-2xl relative overflow-hidden" style={{ background: '#0f1629', border: `1px solid #1e2d4a`, borderLeft: `4px solid ${meta.color}` }}>
          <div className="absolute right-6 top-4 font-syne font-bold pointer-events-none" style={{ fontSize: 96, color: meta.color, opacity: 0.05, lineHeight: 1 }}>{id.toString().padStart(2, '0')}</div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-syne font-bold text-2xl" style={{ background: meta.color + '15', color: meta.color, border: `1px solid ${meta.color}33` }}>
              {id}
            </div>
            <div className="flex-1">
              <div className="text-xs font-mono mb-1" style={{ color: '#3d5a7a' }}>Level {id.toString().padStart(2, '0')}</div>
              <h1 className="font-syne font-bold text-2xl mb-1" style={{ color: '#e8f4fd' }}>{meta.name}</h1>
              <p className="text-sm" style={{ color: '#7a9cc4' }}>{meta.desc}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-syne font-bold text-3xl" style={{ color: meta.color }}>{completed}/{total}</div>
              <div className="text-xs font-mono" style={{ color: '#3d5a7a' }}>modul selesai</div>
            </div>
          </div>
          <div className="mt-5">
            <ProgressBar value={completed} max={total} color={meta.color} showLabel={false} height={8} />
            <div className="text-xs font-mono mt-1.5" style={{ color: '#3d5a7a' }}>{Math.round((completed / total) * 100)}% progress level</div>
          </div>
        </motion.div>

        {/* MODULE GRID */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((m, idx) => {
            const key = `modul_${m.id}`;
            const p = progress[key];
            const unlocked = isModuleUnlocked(m.id);
            const statusColor = p?.status === 'completed' ? '#00ff88' : p?.status === 'in_progress' ? '#00d4ff' : meta.color;
            const statusLabel = p?.status === 'completed' ? '✓ Selesai' : p?.status === 'in_progress' ? '▶ Lanjutkan' : 'Mulai →';

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={unlocked ? { y: -3, borderColor: meta.color + '55' } : {}}
                whileTap={unlocked ? { scale: 0.99 } : {}}
                onClick={() => unlocked && navigate(`/modul/${m.id}`)}
                className={`p-5 rounded-2xl relative overflow-hidden transition-all ${unlocked ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
                style={{
                  background: '#0f1629',
                  border: `1px solid ${p?.status === 'completed' ? meta.color + '44' : '#1e2d4a'}`,
                }}
              >
                {/* Lock overlay */}
                {!unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl" style={{ background: '#0a0e1a80', backdropFilter: 'blur(2px)', zIndex: 1 }}>
                    <div className="flex flex-col items-center gap-2">
                      <div style={{ color: '#3d5a7a' }}><IconLock /></div>
                      <div className="text-xs font-mono" style={{ color: '#3d5a7a' }}>Terkunci</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: meta.color + '15', color: meta.color }}>#{m.id}</span>
                      <span className="text-xs font-mono" style={{ color: '#3d5a7a' }}>~{m.estimatedMinutes}m</span>
                      {p?.status === 'completed' && (
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: '#00ff8815', color: '#00ff88' }}>✓</span>
                      )}
                    </div>
                    <div className="font-syne font-bold mb-1" style={{ color: '#e8f4fd' }}>{m.title}</div>
                    <div className="text-xs line-clamp-2" style={{ color: '#7a9cc4' }}>{m.description}</div>
                    <div className="text-xs mt-2 font-mono" style={{ color: '#3d5a7a' }}>{m.topics.length} topik</div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-xs font-bold font-mono" style={{ color: unlocked ? statusColor : '#3d5a7a' }}>
                      {unlocked ? statusLabel : '🔒'}
                    </span>
                    {p?.examScore !== null && p?.examScore !== undefined && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: p.examScore >= 70 ? '#00ff8815' : '#ff6b3515', color: p.examScore >= 70 ? '#00ff88' : '#ff6b35' }}>
                        {p.examScore}%
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </motion.div>
    </PageLayout>
  );
}
