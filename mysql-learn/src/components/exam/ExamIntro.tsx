import { motion } from 'framer-motion';
import type { ExamQuestion } from '../../types';

interface ExamIntroProps {
  moduleId: number;
  moduleName: string;
  levelColor: string;
  questions: ExamQuestion[];
  totalPoints: number;
  prevScore: number | null | undefined;
  onStart: () => void;
}

export function ExamIntro({ moduleId, moduleName, levelColor, questions, totalPoints, prevScore, onStart }: ExamIntroProps) {
  const easyQ = questions.filter((q) => q.difficulty === 'easy').length;
  const medQ = questions.filter((q) => q.difficulty === 'medium').length;
  const hardQ = questions.filter((q) => q.difficulty === 'hard').length;

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl"
        style={{ background: '#0f1629', border: `1px solid #1e2d4a`, borderTop: `3px solid ${levelColor}` }}
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: levelColor + '15', border: `1px solid ${levelColor}33` }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 3L25 8.5V14C25 19.8 20.1 24.9 14 26C7.9 24.9 3 19.8 3 14V8.5L14 3Z" stroke={levelColor} strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M9 14l3.5 3.5L19 10" stroke={levelColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="text-center mb-8">
          <div className="text-xs font-sans mb-1" style={{ color: '#3d5a7a' }}>Ujian Modul {moduleId}</div>
          <h1 className="font-syne font-bold text-2xl mb-2" style={{ color: '#e8f4fd' }}>{moduleName}</h1>
          {prevScore !== null && prevScore !== undefined && (
            <div className="text-sm font-sans" style={{ color: prevScore >= 70 ? '#00ff88' : '#ff6b35' }}>
              Skor terakhir: {prevScore}%
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Soal', value: questions.length, color: levelColor },
            { label: 'Total Poin', value: totalPoints, color: '#8b5cf6' },
            { label: 'Lulus', value: '≥70%', color: '#00ff88' },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-xl text-center" style={{ background: '#050810', border: '1px solid #1e2d4a' }}>
              <div className="font-syne font-bold text-xl" style={{ color: item.color }}>{item.value}</div>
              <div className="text-xs font-sans" style={{ color: '#3d5a7a' }}>{item.label}</div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl mb-6" style={{ background: '#050810', border: '1px solid #1e2d4a' }}>
          <div className="text-xs font-sans mb-3" style={{ color: '#3d5a7a' }}>DISTRIBUSI SOAL</div>
          <div className="space-y-2">
            {[
              { label: 'Easy', count: easyQ, pts: '1 poin', color: '#00ff88' },
              { label: 'Medium', count: medQ, pts: '2 poin', color: '#00d4ff' },
              { label: 'Hard', count: hardQ, pts: '3 poin', color: '#8b5cf6' },
            ].map((d) => (
              <div key={d.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span style={{ color: d.color }}>{d.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ color: '#3d5a7a' }}>{d.pts}</span>
                  <span className="font-sans font-bold" style={{ color: '#7a9cc4' }}>{d.count}x</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl mb-6" style={{ background: '#00d4ff08', border: '1px solid #00d4ff20' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="#00d4ff" strokeWidth="1.2"/>
            <path d="M8 4.5V8l2.5 1.5" stroke="#00d4ff" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span className="text-xs" style={{ color: '#7a9cc4' }}>
            Waktu pengerjaan: <span style={{ color: '#00d4ff' }}>15 menit</span>. Ujian akan otomatis dikumpulkan saat waktu habis.
          </span>
        </div>

        <button
          onClick={onStart}
          className="w-full py-3.5 rounded-xl font-syne font-bold text-lg transition-all hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${levelColor}, ${levelColor}99)`, color: '#050810' }}
        >
          Mulai Ujian →
        </button>
      </motion.div>
    </div>
  );
}
