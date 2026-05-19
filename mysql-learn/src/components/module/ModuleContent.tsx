import { motion, AnimatePresence } from 'framer-motion';
import { CodeBlock } from '../ui/CodeBlock';
import type { ModuleData, ModuleProgress } from '../../types';

interface ModuleContentProps {
  modul: ModuleData;
  moduleProgress: ModuleProgress | undefined;
  activeTopicIdx: number;
  onTopicChange: (idx: number) => void;
  onMarkRead: () => void;
  levelColor: string;
}

function renderContent(text: string, levelColor: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-bold font-syne mt-4 mb-1 text-base" style={{ color: '#e8f4fd' }}>{line.slice(2, -2)}</p>;
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
}

export function ModuleContent({ modul, moduleProgress, activeTopicIdx, onTopicChange, onMarkRead, levelColor }: ModuleContentProps) {
  const activeTopic = modul.topics[activeTopicIdx];
  const isRead = moduleProgress?.topicsRead.includes(activeTopic.id);

  return (
    <div className="flex flex-col lg:flex-row gap-0 rounded-2xl overflow-hidden" style={{ border: '1px solid #1e2d4a', minHeight: '40vh' }}>
      {/* Left: Topic List */}
      <div className="w-full lg:w-[260px] flex-shrink-0 overflow-y-auto" style={{ background: '#050810', borderRight: '1px solid #1e2d4a' }}>
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
                onClick={() => onTopicChange(i)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 transition-all"
                style={{ background: active ? levelColor + '12' : 'transparent', borderLeft: `2px solid ${active ? levelColor : 'transparent'}` }}
              >
                <div
                  className="flex-shrink-0 w-4 h-4 rounded border mt-0.5 flex items-center justify-center"
                  style={{ borderColor: read ? '#00ff88' : active ? levelColor : '#1e2d4a', background: read ? '#00ff8815' : 'transparent' }}
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
            className="p-4 sm:p-6 lg:p-8"
          >
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

            <div className="space-y-1 mb-6">
              {renderContent(activeTopic.content, levelColor)}
            </div>

            {activeTopic.tips && activeTopic.tips.length > 0 && (
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="p-4 rounded-xl mb-4"
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

            {activeTopic.commonMistakes && activeTopic.commonMistakes.length > 0 && (
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className="p-4 rounded-xl mb-4"
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

            {activeTopic.codeExamples.map((ex) => (
              <CodeBlock key={ex.title} code={ex.code} title={ex.title} output={ex.output} />
            ))}

            <div className="flex justify-between items-center mt-8 pt-6" style={{ borderTop: '1px solid #1e2d4a' }}>
              <button
                onClick={() => activeTopicIdx > 0 && onTopicChange(activeTopicIdx - 1)}
                disabled={activeTopicIdx === 0}
                className="text-sm px-4 py-2 rounded-xl border font-mono transition-all disabled:opacity-30"
                style={{ borderColor: '#1e2d4a', color: '#7a9cc4' }}
              >
                ← Sebelumnya
              </button>
              <button
                onClick={onMarkRead}
                disabled={!!isRead}
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
  );
}
