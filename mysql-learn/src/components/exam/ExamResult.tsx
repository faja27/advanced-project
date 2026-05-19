import { motion } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import type { ExamQuestion } from '../../types';
import type { WriteQueryValidationResult } from '../../utils/sqlRunner';

interface ExamResultProps {
  score: number;
  moduleId: number;
  moduleName: string;
  levelColor: string;
  questions: ExamQuestion[];
  answers: Record<string, string>;
  writeQueryResults: Record<string, WriteQueryValidationResult>;
  showConfetti: boolean;
  onRetry: () => void;
  onBack: () => void;
  onNext?: () => void;
}

function checkCorrect(
  q: ExamQuestion,
  answers: Record<string, string>,
  writeQueryResults: Record<string, WriteQueryValidationResult>,
): boolean {
  if (q.type === 'write_query') return writeQueryResults[q.id]?.isCorrect ?? false;
  const ans = answers[q.id] || '';
  return Array.isArray(q.correctAnswer)
    ? q.correctAnswer.includes(ans)
    : ans.trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
}

function WriteQueryFeedback({ q, wqr }: { q: ExamQuestion; wqr: WriteQueryValidationResult | undefined }) {
  if (!wqr || q.type !== 'write_query') return null;

  if (wqr.error === 'empty') {
    return <div className="text-xs p-2 rounded-lg mb-2" style={{ background: '#ff6b3510', color: '#ff6b35', borderLeft: '2px solid #ff6b35' }}>Kamu belum menulis query.</div>;
  }
  if (wqr.error === 'timeout') {
    return <div className="text-xs p-2 rounded-lg mb-2" style={{ background: '#ff950010', color: '#ff9500', borderLeft: '2px solid #ff9500' }}>Query terlalu lama dieksekusi (timeout 5 detik).</div>;
  }
  if (wqr.error === 'expected_error') {
    return (
      <div className="text-xs p-2 rounded-lg mb-2" style={{ background: '#00d4ff08', color: '#7a9cc4', borderLeft: '2px solid #00d4ff40' }}>
        Divalidasi via perbandingan teks (soal mengandung fungsi MySQL spesifik yang tidak bisa dieksekusi di sandbox).
        {!wqr.isCorrect && (
          <div className="mt-1" style={{ color: '#00ff88' }}>
            Jawaban benar: <code>{Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : String(q.correctAnswer)}</code>
          </div>
        )}
      </div>
    );
  }
  if (wqr.isCorrect) {
    return <div className="text-xs p-2 rounded-lg mb-2" style={{ background: '#00ff8810', color: '#00ff88', borderLeft: '2px solid #00ff88' }}>Query kamu menghasilkan output yang benar!</div>;
  }
  if (wqr.error && !wqr.isCorrect && !wqr.userResult) {
    return <div className="text-xs p-2 rounded-lg mb-2" style={{ background: '#ff6b3510', color: '#ff6b35', borderLeft: '2px solid #ff6b35' }}>Query kamu mengandung error: {wqr.error}</div>;
  }
  if (wqr.userResult && wqr.expectedResult) {
    return (
      <div className="mb-2 space-y-1.5">
        <div className="text-xs" style={{ color: '#3d5a7a' }}>Perbandingan hasil query:</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs font-mono mb-1" style={{ color: '#ff6b35' }}>Hasil query kamu</div>
            <div className="overflow-auto rounded-lg" style={{ background: '#050810', border: '1px solid #ff6b3520', maxHeight: 110 }}>
              <table style={{ fontSize: 10, borderCollapse: 'collapse', width: '100%' }}>
                <thead><tr>{wqr.userResult.columns.map((col) => (
                  <th key={col} style={{ padding: '3px 5px', color: '#ff6b35', textAlign: 'left', borderBottom: '1px solid #ff6b3520', whiteSpace: 'nowrap' }}>{col}</th>
                ))}</tr></thead>
                <tbody>{wqr.userResult.rows.slice(0, 5).map((row, ri) => (
                  <tr key={ri}>{row.map((cell, ci) => (
                    <td key={ci} style={{ padding: '2px 5px', color: '#7a9cc4', borderBottom: '1px solid #1e2d4a' }}>{String(cell ?? 'NULL')}</td>
                  ))}</tr>
                ))}</tbody>
              </table>
              {wqr.userResult.rows.length > 5 && <div style={{ padding: '2px 5px', color: '#3d5a7a', fontSize: 9 }}>+{wqr.userResult.rows.length - 5} baris</div>}
            </div>
          </div>
          <div>
            <div className="text-xs font-mono mb-1" style={{ color: '#00ff88' }}>Hasil yang diharapkan</div>
            <div className="overflow-auto rounded-lg" style={{ background: '#050810', border: '1px solid #00ff8820', maxHeight: 110 }}>
              <table style={{ fontSize: 10, borderCollapse: 'collapse', width: '100%' }}>
                <thead><tr>{wqr.expectedResult.columns.map((col) => (
                  <th key={col} style={{ padding: '3px 5px', color: '#00ff88', textAlign: 'left', borderBottom: '1px solid #00ff8820', whiteSpace: 'nowrap' }}>{col}</th>
                ))}</tr></thead>
                <tbody>{wqr.expectedResult.rows.slice(0, 5).map((row, ri) => (
                  <tr key={ri}>{row.map((cell, ci) => (
                    <td key={ci} style={{ padding: '2px 5px', color: '#7a9cc4', borderBottom: '1px solid #1e2d4a' }}>{String(cell ?? 'NULL')}</td>
                  ))}</tr>
                ))}</tbody>
              </table>
              {wqr.expectedResult.rows.length > 5 && <div style={{ padding: '2px 5px', color: '#3d5a7a', fontSize: 9 }}>+{wqr.expectedResult.rows.length - 5} baris</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function ExamResult({
  score, moduleId, moduleName, levelColor, questions, answers,
  writeQueryResults, showConfetti, onRetry, onBack, onNext,
}: ExamResultProps) {
  const passed = score >= 70;
  const totalPoints = questions.reduce((s, q) => s + q.points, 0);
  const correctCount = questions.filter((q) => checkCorrect(q, answers, writeQueryResults)).length;

  return (
    <>
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={350} colors={['#00d4ff', '#8b5cf6', '#00ff88', '#ff3d9a']} />}
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 rounded-2xl text-center"
          style={{ background: '#0f1629', border: `1px solid ${passed ? '#00ff8833' : '#ff6b3533'}`, borderTop: `3px solid ${passed ? '#00ff88' : '#ff6b35'}` }}
        >
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg width="128" height="128" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="54" fill="none" stroke="#1e2d4a" strokeWidth="10" />
              <circle cx="64" cy="64" r="54" fill="none" stroke={passed ? '#00ff88' : '#ff6b35'} strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - score / 100)}`}
                strokeLinecap="round" transform="rotate(-90 64 64)"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-syne font-bold text-3xl" style={{ color: passed ? '#00ff88' : '#ff6b35' }}>{score}%</div>
            </div>
          </div>

          <div className="font-syne font-bold text-xl mb-1" style={{ color: '#e8f4fd' }}>
            {passed ? 'Selamat! Kamu Lulus!' : 'Belum Lulus — Coba Lagi'}
          </div>
          <div className="text-sm mb-2" style={{ color: '#7a9cc4' }}>Modul {moduleId}: {moduleName}</div>
          <div className="text-sm font-mono" style={{ color: '#3d5a7a' }}>
            {correctCount}/{questions.length} benar · {totalPoints} poin total
          </div>

          <div className="flex gap-3 justify-center mt-6 flex-wrap">
            {!passed && (
              <button onClick={onRetry} className="px-5 py-2.5 rounded-xl font-bold text-sm font-mono" style={{ background: levelColor, color: '#050810' }}>
                Coba Lagi
              </button>
            )}
            <button onClick={onBack} className="px-5 py-2.5 rounded-xl text-sm font-mono border" style={{ borderColor: '#1e2d4a', color: '#7a9cc4' }}>
              Kembali ke Modul
            </button>
            {passed && onNext && (
              <button onClick={onNext} className="px-5 py-2.5 rounded-xl font-bold text-sm font-mono" style={{ background: '#00ff8820', color: '#00ff88', border: '1px solid #00ff8833' }}>
                Modul Berikutnya →
              </button>
            )}
          </div>
        </motion.div>

        <div className="space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest" style={{ color: '#3d5a7a' }}>Review Jawaban</div>
          {questions.map((q, i) => {
            const correct = checkCorrect(q, answers, writeQueryResults);
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-5 rounded-2xl"
                style={{ background: '#0f1629', border: `1px solid ${correct ? '#00ff8820' : '#ff6b3520'}`, borderLeft: `3px solid ${correct ? '#00ff88' : '#ff6b35'}` }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: correct ? '#00ff8815' : '#ff6b3515', color: correct ? '#00ff88' : '#ff6b35' }}>
                    {correct ? '✓' : '✗'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-mono" style={{ color: '#3d5a7a' }}>#{i + 1}</span>
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{
                        background: q.difficulty === 'easy' ? '#00ff8815' : q.difficulty === 'medium' ? '#00d4ff15' : '#8b5cf615',
                        color: q.difficulty === 'easy' ? '#00ff88' : q.difficulty === 'medium' ? '#00d4ff' : '#8b5cf6',
                      }}>
                        {q.difficulty}
                      </span>
                      <span className="text-xs font-mono" style={{ color: '#3d5a7a' }}>{q.points}pt</span>
                    </div>
                    <div className="text-sm font-bold mb-2" style={{ color: '#e8f4fd' }}>{q.question}</div>
                    <div className="text-xs mb-1" style={{ color: '#3d5a7a' }}>
                      Jawaban kamu:{' '}
                      <span style={{ color: correct ? '#00ff88' : '#ff6b35' }}>{answers[q.id] || '(tidak dijawab)'}</span>
                    </div>
                    {!correct && q.type !== 'write_query' && (
                      <div className="text-xs mb-2" style={{ color: '#00ff88' }}>
                        Jawaban benar: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                      </div>
                    )}
                    <WriteQueryFeedback q={q} wqr={writeQueryResults[q.id]} />
                    <div className="text-xs p-3 rounded-xl" style={{ background: '#050810', color: '#7a9cc4', borderLeft: '2px solid #1e2d4a' }}>
                      {q.explanation}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}
