import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout } from '../components/layout/PageLayout';
import { CodeBlock } from '../components/ui/CodeBlock';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SQLEditor } from '../components/editor/SQLEditor';
import { SQLEditorErrorBoundary } from '../components/SQLEditorErrorBoundary';
import { VisualPlaceholder } from '../components/visuals/ModuleVisuals';
import { useProgressStore } from '../store/progressStore';
import { modulesData } from '../data/modules';
import type { TopicContent } from '../types';

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
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!modul) return;
    updateLastAccessed(id);
    return () => {
      const mins = Math.floor((Date.now() - startTime) / 60000);
      if (mins > 0) addStudyMinutes(mins);
    };
  }, [id]);

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
  const activeTopic: TopicContent = modul.topics[activeTopicIdx];
  const isRead = moduleProgress?.topicsRead.includes(activeTopic.id);
  const allRead = modul.topics.every((t) => moduleProgress?.topicsRead.includes(t.id));
  const readCount = modul.topics.filter((t) => moduleProgress?.topicsRead.includes(t.id)).length;
  const levelColor = LEVEL_COLORS[modul.level] || '#00d4ff';

  const handleMarkRead = () => {
    markTopicRead(id, activeTopic.id);
    if (activeTopicIdx < modul.topics.length - 1) {
      setActiveTopicIdx(activeTopicIdx + 1);
    }
  };

  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={i} className="font-bold font-syne mt-4 mb-1 text-base" style={{ color: '#e8f4fd' }}>
            {line.slice(2, -2)}
          </p>
        );
      }
      if (line.startsWith('- **')) {
        const match = line.match(/^- \*\*(.+?)\*\*:? ?(.*)$/);
        if (match) {
          return (
            <div key={i} className="flex gap-2 items-start my-1.5 ml-2">
              <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: levelColor }} />
              <span className="text-sm" style={{ color: '#e8f4fd' }}>
                <strong style={{ color: levelColor }}>{match[1]}</strong>
                {match[2] ? <span style={{ color: '#7a9cc4' }}> — {match[2]}</span> : ''}
              </span>
            </div>
          );
        }
      }
      if (line.startsWith('- ')) {
        return (
          <div key={i} className="flex gap-2 items-start my-1.5 ml-2">
            <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: '#3d5a7a' }} />
            <span className="text-sm leading-relaxed" style={{ color: '#7a9cc4' }}>{line.slice(2)}</span>
          </div>
        );
      }
      if (/^\d+\. /.test(line)) {
        return <p key={i} className="text-sm my-1.5" style={{ color: '#e8f4fd' }}>{line}</p>;
      }
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return <p key={i} className="text-sm leading-relaxed" style={{ color: '#7a9cc4' }}>{line}</p>;
    });
  };

  return (
    <PageLayout>
      {/* Module Header */}
      <div className="mb-4 p-5 rounded-2xl" style={{ background: '#0f1629', border: `1px solid #1e2d4a`, borderLeft: `4px solid ${levelColor}` }}>
        {/* Breadcrumb */}
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
              <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: levelColor + '15', color: levelColor }}>
                Level {modul.level}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: '#1e2d4a', color: '#7a9cc4' }}>
                ~{modul.estimatedMinutes}m
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: '#1e2d4a', color: '#7a9cc4' }}>
                {modul.topics.length} topik
              </span>
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
            <span>Topik terbaca</span>
            <span>{readCount}/{modul.topics.length}</span>
          </div>
          <ProgressBar value={readCount} max={modul.topics.length} color={levelColor} showLabel={false} height={4} />
        </div>
      </div>

      {/* Split Panel */}
      <div className="flex gap-0 rounded-2xl overflow-hidden" style={{ border: '1px solid #1e2d4a', minHeight: '70vh' }}>
        {/* Left: Topic List */}
        <div className="flex-shrink-0 overflow-y-auto" style={{ width: 260, background: '#050810', borderRight: '1px solid #1e2d4a' }}>
          <div className="p-3 border-b" style={{ borderColor: '#1e2d4a' }}>
            <div className="text-xs font-mono uppercase tracking-widest" style={{ color: '#3d5a7a' }}>Topik</div>
          </div>
          <div className="py-2">
            {modul.topics.map((t, i) => {
              const read = moduleProgress?.topicsRead.includes(t.id);
              const active = activeTopicIdx === i;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTopicIdx(i)}
                  className="w-full text-left px-4 py-3 flex items-start gap-3 transition-all"
                  style={{
                    background: active ? levelColor + '12' : 'transparent',
                    borderLeft: `2px solid ${active ? levelColor : 'transparent'}`,
                  }}
                >
                  {/* Checkbox */}
                  <div
                    className="flex-shrink-0 w-4 h-4 rounded border mt-0.5 flex items-center justify-center"
                    style={{
                      borderColor: read ? '#00ff88' : active ? levelColor : '#1e2d4a',
                      background: read ? '#00ff8815' : 'transparent',
                    }}
                  >
                    {read && <span style={{ color: '#00ff88', fontSize: 9, lineHeight: 1 }}>✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono mb-0.5" style={{ color: active ? levelColor : read ? '#00ff88' : '#3d5a7a' }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="text-xs leading-snug" style={{ color: active ? '#e8f4fd' : read ? '#7a9cc4' : '#4a6a8a' }}>
                      {t.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Content */}
        <div className="flex-1 overflow-y-auto" style={{ background: '#0a0e1a' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTopic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-8"
            >
              {/* Topic title */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono" style={{ color: '#3d5a7a' }}>
                    {String(activeTopicIdx + 1).padStart(2, '0')} / {String(modul.topics.length).padStart(2, '0')}
                  </span>
                  {isRead && (
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: '#00ff8815', color: '#00ff88' }}>✓ Dibaca</span>
                  )}
                </div>
                <h2 className="font-syne font-bold text-2xl" style={{ color: '#e8f4fd' }}>{activeTopic.title}</h2>
              </div>

              {/* Main content */}
              <div className="space-y-1 mb-6">
                {renderContent(activeTopic.content)}
              </div>

              {/* Tips box */}
              {activeTopic.tips && activeTopic.tips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-xl mb-4"
                  style={{ background: '#00d4ff08', border: '1px solid #00d4ff20', borderLeft: '3px solid #00d4ff' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="#00d4ff" strokeWidth="1.2"/>
                      <path d="M7 6v4M7 4.5v.5" stroke="#00d4ff" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    <span className="text-xs font-bold font-mono uppercase tracking-widest" style={{ color: '#00d4ff' }}>Tips</span>
                  </div>
                  <div className="space-y-1.5">
                    {activeTopic.tips.map((tip, i) => (
                      <div key={i} className="flex gap-2 items-start text-xs" style={{ color: '#7a9cc4' }}>
                        <span className="flex-shrink-0 mt-0.5" style={{ color: '#00d4ff' }}>→</span>
                        {tip}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Common mistakes box */}
              {activeTopic.commonMistakes && activeTopic.commonMistakes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  className="p-4 rounded-xl mb-4"
                  style={{ background: '#ff6b3508', border: '1px solid #ff6b3520', borderLeft: '3px solid #ff6b35' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 2L12.5 12H1.5L7 2Z" stroke="#ff6b35" strokeWidth="1.2" strokeLinejoin="round"/>
                      <path d="M7 6v3M7 10.5v.5" stroke="#ff6b35" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    <span className="text-xs font-bold font-mono uppercase tracking-widest" style={{ color: '#ff6b35' }}>Kesalahan Umum</span>
                  </div>
                  <div className="space-y-1.5">
                    {activeTopic.commonMistakes.map((m, i) => (
                      <div key={i} className="flex gap-2 items-start text-xs" style={{ color: '#7a9cc4' }}>
                        <span className="flex-shrink-0 mt-0.5" style={{ color: '#ff6b35' }}>✗</span>
                        {m}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Code examples */}
              {activeTopic.codeExamples.map((ex) => (
                <CodeBlock key={ex.title} code={ex.code} title={ex.title} output={ex.output} />
              ))}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6" style={{ borderTop: '1px solid #1e2d4a' }}>
                <button
                  onClick={() => activeTopicIdx > 0 && setActiveTopicIdx(activeTopicIdx - 1)}
                  disabled={activeTopicIdx === 0}
                  className="text-sm px-4 py-2 rounded-xl border font-mono transition-all disabled:opacity-30"
                  style={{ borderColor: '#1e2d4a', color: '#7a9cc4' }}
                >
                  ← Sebelumnya
                </button>

                <button
                  onClick={handleMarkRead}
                  disabled={isRead}
                  className="text-sm px-5 py-2 rounded-xl font-bold font-mono transition-all"
                  style={{
                    background: isRead ? '#00ff8815' : levelColor,
                    color: isRead ? '#00ff88' : '#050810',
                    border: isRead ? '1px solid #00ff8833' : 'none',
                    opacity: isRead ? 0.8 : 1,
                    cursor: isRead ? 'default' : 'pointer',
                  }}
                >
                  {isRead ? '✓ Sudah Dibaca' : activeTopicIdx < modul.topics.length - 1 ? 'Tandai & Lanjut →' : 'Selesai ✓'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Visual Interactive */}
      <div className="mt-4">
        <VisualPlaceholder moduleId={id} />
      </div>

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

      {/* Summary (shown when all topics read) */}
      <AnimatePresence>
        {allRead && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-6 rounded-2xl"
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
                <div className="text-xs" style={{ color: '#7a9cc4' }}>
                  <span style={{ color: '#00d4ff' }}>Fun Fact: </span>{modul.funFact}
                </div>
              </div>
            )}
            <div className="flex gap-3 flex-wrap">
              {moduleProgress?.status !== 'completed' && (
                <button
                  onClick={() => navigate(`/ujian/${id}`)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm font-mono transition-all"
                  style={{ background: levelColor, color: '#050810' }}
                >
                  Ambil Ujian →
                </button>
              )}
              {moduleProgress?.status === 'completed' && id < 38 && (
                <button
                  onClick={() => navigate(`/modul/${id + 1}`)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm font-mono"
                  style={{ background: '#00ff8820', color: '#00ff88', border: '1px solid #00ff8833' }}
                >
                  Modul Berikutnya →
                </button>
              )}
              <button
                onClick={() => navigate(`/level/${modul.level}`)}
                className="px-5 py-2.5 rounded-xl text-sm font-mono border"
                style={{ borderColor: '#1e2d4a', color: '#7a9cc4' }}
              >
                ← Kembali ke Level
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
