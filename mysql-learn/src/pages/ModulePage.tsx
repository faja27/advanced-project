import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout } from '../components/layout/PageLayout';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SQLEditor } from '../components/editor/SQLEditor';
import { SQLEditorErrorBoundary } from '../components/SQLEditorErrorBoundary';
import { VisualPlaceholder } from '../components/visuals/ModuleVisuals';
import { ModuleContent } from '../components/module/ModuleContent';
import { useProgressStore } from '../store/progressStore';
import { useModuleTimer } from '../hooks/useModuleTimer';
import { modulesData } from '../data/modules';

const LEVEL_COLORS: Record<number, string> = {
  1: '#00d4ff', 2: '#4d9fff', 3: '#8b5cf6', 4: '#ff3d9a',
};

export function ModulePage() {
  const { modulId } = useParams<{ modulId: string }>();
  const navigate = useNavigate();
  const id = parseInt(modulId || '1');

  const { markTopicRead, updateLastAccessed, addStudyMinutes, progress } = useProgressStore();
  const modul = modulesData.find((m) => m.id === id);
  const [activeTopicIdx, setActiveTopicIdx] = useState(0);

  useModuleTimer(id, !!modul, updateLastAccessed, addStudyMinutes);

  if (!modul) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-64 gap-4">
          <div className="text-6xl font-mono" style={{ color: '#1e2d4a' }}>404</div>
          <div style={{ color: '#7a9cc4' }}>Modul tidak ditemukan</div>
          <button onClick={() => navigate('/dashboard')} className="text-sm font-mono px-4 py-2 rounded-lg border" style={{ borderColor: '#1e2d4a', color: '#00d4ff' }}>
            ← Kembali ke Dashboard
          </button>
        </div>
      </PageLayout>
    );
  }

  const moduleProgress = progress[`modul_${id}`];
  const levelColor = LEVEL_COLORS[modul.level] || '#00d4ff';
  const allRead = modul.topics.every((t) => moduleProgress?.topicsRead.includes(t.id));
  const readCount = modul.topics.filter((t) => moduleProgress?.topicsRead.includes(t.id)).length;

  const handleMarkRead = () => {
    markTopicRead(id, modul.topics[activeTopicIdx].id);
    if (activeTopicIdx < modul.topics.length - 1) setActiveTopicIdx(activeTopicIdx + 1);
  };

  return (
    <PageLayout>
      {/* Module Header */}
      <div className="mb-4 p-5 rounded-2xl" style={{ background: '#0f1629', border: `1px solid #1e2d4a`, borderLeft: `4px solid ${levelColor}` }}>
        <div className="flex items-center gap-2 text-xs font-mono mb-3" style={{ color: '#3d5a7a' }}>
          <button onClick={() => navigate('/dashboard')} className="transition-colors hover:text-cyan-400" style={{ color: '#00d4ff' }}>Dashboard</button>
          <span>/</span>
          <button onClick={() => navigate(`/level/${modul.level}`)} className="transition-colors hover:text-cyan-400" style={{ color: '#00d4ff' }}>Level {modul.level}</button>
          <span>/</span>
          <span>Modul {id}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: levelColor + '15', color: levelColor }}>Level {modul.level}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: '#1e2d4a', color: '#7a9cc4' }}>~{modul.estimatedMinutes}m</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: '#1e2d4a', color: '#7a9cc4' }}>{modul.topics.length} topik</span>
              {moduleProgress?.status === 'completed' && (
                <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: '#00ff8815', color: '#00ff88' }}>✓ Selesai</span>
              )}
            </div>
            <h1 className="font-syne font-bold text-2xl mb-1" style={{ color: '#e8f4fd' }}>{modul.title}</h1>
            <p className="text-sm" style={{ color: '#7a9cc4' }}>{modul.description}</p>
          </div>
          <button
            onClick={() => allRead ? navigate(`/ujian/${id}`) : undefined}
            disabled={!allRead || moduleProgress?.status === 'completed'}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold font-mono transition-all"
            style={{
              background: allRead && moduleProgress?.status !== 'completed' ? levelColor : '#1e2d4a',
              color: allRead && moduleProgress?.status !== 'completed' ? '#050810' : '#3d5a7a',
              cursor: allRead && moduleProgress?.status !== 'completed' ? 'pointer' : 'not-allowed',
            }}
          >
            {moduleProgress?.status === 'completed' ? '✓ Lulus' : 'Mulai Ujian →'}
          </button>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs font-mono mb-1.5" style={{ color: '#3d5a7a' }}>
            <span>Topik terbaca</span><span>{readCount}/{modul.topics.length}</span>
          </div>
          <ProgressBar value={readCount} max={modul.topics.length} color={levelColor} showLabel={false} height={4} />
        </div>
      </div>

      {/* Split Panel */}
      <ModuleContent
        modul={modul}
        moduleProgress={moduleProgress}
        activeTopicIdx={activeTopicIdx}
        onTopicChange={setActiveTopicIdx}
        onMarkRead={handleMarkRead}
        levelColor={levelColor}
      />

      {/* Visual Interactive */}
      <div className="mt-4"><VisualPlaceholder moduleId={id} /></div>

      {/* SQL Editor */}
      <div className="mt-4 rounded-2xl overflow-hidden" style={{ border: '1px solid #1e2d4a' }}>
        <div className="px-5 py-3 flex items-center gap-3" style={{ background: '#0f1629', borderBottom: '1px solid #1e2d4a' }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
          </div>
          <span className="text-xs font-mono" style={{ color: '#3d5a7a' }}>playground.sql — Coba Sendiri</span>
        </div>
        <SQLEditorErrorBoundary>
          <SQLEditor dbType={modul.database} />
        </SQLEditorErrorBoundary>
      </div>

      {/* Summary */}
      <AnimatePresence>
        {allRead && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-6 rounded-2xl"
            style={{ background: '#0f1629', border: `1px solid #00ff8833`, borderLeft: `4px solid #00ff88` }}
          >
            <div className="flex items-center gap-2 mb-4">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="8" stroke="#00ff88" strokeWidth="1.2"/>
                <path d="M5.5 9l2.5 2.5L12.5 6" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3 className="font-syne font-bold" style={{ color: '#00ff88' }}>Ringkasan Modul</h3>
            </div>
            <ul className="space-y-2 mb-4">
              {modul.summary.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0" style={{ color: '#00ff88' }}>✓</span>
                  <span style={{ color: '#7a9cc4' }}>{s}</span>
                </li>
              ))}
            </ul>
            {modul.funFact && (
              <div className="p-3 rounded-xl mb-4" style={{ background: '#00d4ff08', borderLeft: '3px solid #00d4ff' }}>
                <div className="text-xs" style={{ color: '#7a9cc4' }}><span style={{ color: '#00d4ff' }}>Fun Fact: </span>{modul.funFact}</div>
              </div>
            )}
            <div className="flex gap-3 flex-wrap">
              {moduleProgress?.status !== 'completed' && (
                <button onClick={() => navigate(`/ujian/${id}`)} className="px-5 py-2.5 rounded-xl font-bold text-sm font-mono transition-all" style={{ background: levelColor, color: '#050810' }}>
                  Ambil Ujian →
                </button>
              )}
              {moduleProgress?.status === 'completed' && id < 38 && (
                <button onClick={() => navigate(`/modul/${id + 1}`)} className="px-5 py-2.5 rounded-xl font-bold text-sm font-mono" style={{ background: '#00ff8820', color: '#00ff88', border: '1px solid #00ff8833' }}>
                  Modul Berikutnya →
                </button>
              )}
              <button onClick={() => navigate(`/level/${modul.level}`)} className="px-5 py-2.5 rounded-xl text-sm font-mono border" style={{ borderColor: '#1e2d4a', color: '#7a9cc4' }}>
                ← Kembali ke Level
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
