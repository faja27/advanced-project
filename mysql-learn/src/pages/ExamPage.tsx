import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { PageLayout } from '../components/layout/PageLayout';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useProgressStore } from '../store/progressStore';
import { examData } from '../data/exam';
import { modulesData } from '../data/modules';
import { validateWriteQuery } from '../utils/sqlRunner';
import type { WriteQueryValidationResult } from '../utils/sqlRunner';
import type { ExamQuestion } from '../types';

const LEVEL_COLORS: Record<number, string> = {
  1: '#00d4ff', 2: '#4d9fff', 3: '#8b5cf6', 4: '#ff3d9a',
};

const EXAM_DURATION = 15 * 60; // 15 minutes in seconds

export function ExamPage() {
  const { modulId } = useParams<{ modulId: string }>();
  const navigate = useNavigate();
  const id = parseInt(modulId || '1');

  const { saveExamScore, addAchievement, progress } = useProgressStore();
  const modul = modulesData.find((m) => m.id === id);
  const exam = examData.find((e) => e.moduleId === id);

  const [phase, setPhase] = useState<'intro' | 'exam' | 'result'>('intro');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [writeQueryResults, setWriteQueryResults] = useState<Record<string, WriteQueryValidationResult>>({});
  const [isValidating, setIsValidating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSubmittingRef = useRef(false);
  const answersRef = useRef<Record<string, string>>({});

  // Keep answersRef in sync so the timer auto-submit captures current answers
  useEffect(() => { answersRef.current = answers; }, [answers]);

  useEffect(() => {
    if (phase === 'exam') {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            // Fire-and-forget async submit using the latest answers via ref
            void handleSubmitWithAnswers(answersRef.current, true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  useEffect(() => {
    if (showConfetti) {
      const t = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(t);
    }
  }, [showConfetti]);

  if (!modul || !exam) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-64 gap-4">
          <div className="text-5xl font-mono" style={{ color: '#1e2d4a' }}>404</div>
          <div style={{ color: '#7a9cc4' }}>Ujian untuk modul ini belum tersedia.</div>
          <button onClick={() => navigate(`/modul/${id}`)} className="text-sm font-mono px-4 py-2 rounded-lg border" style={{ borderColor: '#1e2d4a', color: '#00d4ff' }}>
            ← Kembali ke Modul
          </button>
        </div>
      </PageLayout>
    );
  }

  const questions = exam.questions;
  const totalPoints = questions.reduce((s, q) => s + q.points, 0);
  const current: ExamQuestion = questions[currentIdx];
  const levelColor = LEVEL_COLORS[modul.level] || '#00d4ff';
  const prevScore = progress[`modul_${id}`]?.examScore;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const timerColor = timeLeft <= 30 ? '#ff3d3d' : timeLeft <= 120 ? '#ff9500' : '#00d4ff';
  const timerPulse = timeLeft <= 30;

  const handleAnswer = (qId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  // Core submit logic — accepts snapshot of answers to avoid stale closure in timer
  const handleSubmitWithAnswers = async (currentAnswers: Record<string, string>, auto = false) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsValidating(true);

    // Validate write_query questions via sql.js
    const wqResults: Record<string, WriteQueryValidationResult> = {};
    await Promise.all(
      questions
        .filter((q) => q.type === 'write_query')
        .map(async (q) => {
          const userQ = (currentAnswers[q.id] || '').trim();
          const expected = Array.isArray(q.correctAnswer)
            ? q.correctAnswer[0]
            : String(q.correctAnswer);
          wqResults[q.id] = await validateWriteQuery(userQ, expected, modul.database);
        }),
    );

    setWriteQueryResults(wqResults);
    setIsValidating(false);

    let earned = 0;
    questions.forEach((q) => {
      if (q.type === 'write_query') {
        if (wqResults[q.id]?.isCorrect) earned += q.points;
      } else {
        const ans = currentAnswers[q.id] || '';
        const correct = Array.isArray(q.correctAnswer)
          ? q.correctAnswer.includes(ans)
          : ans.trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
        if (correct) earned += q.points;
      }
    });

    const pct = Math.round((earned / totalPoints) * 100);
    setScore(pct);
    setPhase('result');
    saveExamScore(id, pct);
    if (pct === 100) { addAchievement('perfect_score'); setShowConfetti(true); }
    if (pct >= 70) {
      if (id === 1) addAchievement('first_step');
      if (!auto) setShowConfetti(true);
    }
  };

  const handleSubmit = (auto = false) => {
    void handleSubmitWithAnswers(answers, auto);
  };

  const isCorrect = (q: ExamQuestion) => {
    if (q.type === 'write_query') {
      return writeQueryResults[q.id]?.isCorrect ?? false;
    }
    const ans = answers[q.id] || '';
    return Array.isArray(q.correctAnswer)
      ? q.correctAnswer.includes(ans)
      : ans.trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
  };

  const allAnswered = questions.every((q) => answers[q.id]);
  const answeredCount = Object.keys(answers).length;

  // ── INTRO ─────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    const easyQ = questions.filter((q) => q.difficulty === 'easy').length;
    const medQ = questions.filter((q) => q.difficulty === 'medium').length;
    const hardQ = questions.filter((q) => q.difficulty === 'hard').length;

    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl"
            style={{ background: '#0f1629', border: `1px solid #1e2d4a`, borderTop: `3px solid ${levelColor}` }}
          >
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: levelColor + '15', border: `1px solid ${levelColor}33` }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 3L25 8.5V14C25 19.8 20.1 24.9 14 26C7.9 24.9 3 19.8 3 14V8.5L14 3Z" stroke={levelColor} strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M9 14l3.5 3.5L19 10" stroke={levelColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div className="text-center mb-8">
              <div className="text-xs font-mono mb-1" style={{ color: '#3d5a7a' }}>Ujian Modul {id}</div>
              <h1 className="font-syne font-bold text-2xl mb-2" style={{ color: '#e8f4fd' }}>{modul.title}</h1>
              {prevScore !== null && prevScore !== undefined && (
                <div className="text-sm font-mono" style={{ color: prevScore >= 70 ? '#00ff88' : '#ff6b35' }}>
                  Skor terakhir: {prevScore}%
                </div>
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Soal', value: questions.length, color: levelColor },
                { label: 'Total Poin', value: totalPoints, color: '#8b5cf6' },
                { label: 'Lulus', value: '≥70%', color: '#00ff88' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl text-center" style={{ background: '#050810', border: '1px solid #1e2d4a' }}>
                  <div className="font-syne font-bold text-xl" style={{ color: item.color }}>{item.value}</div>
                  <div className="text-xs font-mono" style={{ color: '#3d5a7a' }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* Difficulty breakdown */}
            <div className="p-4 rounded-xl mb-6" style={{ background: '#050810', border: '1px solid #1e2d4a' }}>
              <div className="text-xs font-mono mb-3" style={{ color: '#3d5a7a' }}>DISTRIBUSI SOAL</div>
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
                      <span className="font-mono font-bold" style={{ color: '#7a9cc4' }}>{d.count}x</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timer info */}
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
              onClick={() => setPhase('exam')}
              className="w-full py-3.5 rounded-xl font-syne font-bold text-lg transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${levelColor}, ${levelColor}99)`, color: '#050810' }}
            >
              Mulai Ujian →
            </button>
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const passed = score >= 70;
    const correctCount = questions.filter(isCorrect).length;

    return (
      <PageLayout>
        {showConfetti && <ReactConfetti recycle={false} numberOfPieces={350} colors={['#00d4ff', '#8b5cf6', '#00ff88', '#ff3d9a']} />}
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Score card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-8 rounded-2xl text-center"
            style={{ background: '#0f1629', border: `1px solid ${passed ? '#00ff8833' : '#ff6b3533'}`, borderTop: `3px solid ${passed ? '#00ff88' : '#ff6b35'}` }}
          >
            {/* Circular score */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg width="128" height="128" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="54" fill="none" stroke="#1e2d4a" strokeWidth="10" />
                <circle
                  cx="64" cy="64" r="54" fill="none"
                  stroke={passed ? '#00ff88' : '#ff6b35'} strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - score / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 64 64)"
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
            <div className="text-sm mb-2" style={{ color: '#7a9cc4' }}>Modul {id}: {modul.title}</div>
            <div className="text-sm font-mono" style={{ color: '#3d5a7a' }}>
              {correctCount}/{questions.length} benar · {totalPoints} poin total
            </div>

            <div className="flex gap-3 justify-center mt-6 flex-wrap">
              {!passed && (
                <button
                  onClick={() => {
                    setPhase('exam');
                    setAnswers({});
                    setCurrentIdx(0);
                    setTimeLeft(EXAM_DURATION);
                    setWriteQueryResults({});
                    isSubmittingRef.current = false;
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm font-mono"
                  style={{ background: levelColor, color: '#050810' }}
                >
                  Coba Lagi
                </button>
              )}
              <button
                onClick={() => navigate(`/modul/${id}`)}
                className="px-5 py-2.5 rounded-xl text-sm font-mono border"
                style={{ borderColor: '#1e2d4a', color: '#7a9cc4' }}
              >
                Kembali ke Modul
              </button>
              {passed && id < 38 && (
                <button
                  onClick={() => navigate(`/modul/${id + 1}`)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm font-mono"
                  style={{ background: '#00ff8820', color: '#00ff88', border: '1px solid #00ff8833' }}
                >
                  Modul Berikutnya →
                </button>
              )}
            </div>
          </motion.div>

          {/* Review */}
          <div className="space-y-4">
            <div className="text-xs font-mono uppercase tracking-widest" style={{ color: '#3d5a7a' }}>Review Jawaban</div>
            {questions.map((q, i) => {
              const correct = isCorrect(q);
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-5 rounded-2xl"
                  style={{
                    background: '#0f1629',
                    border: `1px solid ${correct ? '#00ff8820' : '#ff6b3520'}`,
                    borderLeft: `3px solid ${correct ? '#00ff88' : '#ff6b35'}`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                      style={{ background: correct ? '#00ff8815' : '#ff6b3515', color: correct ? '#00ff88' : '#ff6b35' }}
                    >
                      {correct ? '✓' : '✗'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-mono" style={{ color: '#3d5a7a' }}>#{i + 1}</span>
                        <span
                          className="text-xs font-mono px-1.5 py-0.5 rounded"
                          style={{
                            background: q.difficulty === 'easy' ? '#00ff8815' : q.difficulty === 'medium' ? '#00d4ff15' : '#8b5cf615',
                            color: q.difficulty === 'easy' ? '#00ff88' : q.difficulty === 'medium' ? '#00d4ff' : '#8b5cf6',
                          }}
                        >
                          {q.difficulty}
                        </span>
                        <span className="text-xs font-mono" style={{ color: '#3d5a7a' }}>{q.points}pt</span>
                      </div>
                      <div className="text-sm font-bold mb-2" style={{ color: '#e8f4fd' }}>{q.question}</div>
                      <div className="text-xs mb-1" style={{ color: '#3d5a7a' }}>
                        Jawaban kamu:{' '}
                        <span style={{ color: correct ? '#00ff88' : '#ff6b35' }}>
                          {answers[q.id] || '(tidak dijawab)'}
                        </span>
                      </div>
                      {!correct && q.type !== 'write_query' && (
                        <div className="text-xs mb-2" style={{ color: '#00ff88' }}>
                          Jawaban benar: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                        </div>
                      )}

                      {/* Write query feedback */}
                      {q.type === 'write_query' && writeQueryResults[q.id] && (() => {
                        const wqr = writeQueryResults[q.id];
                        if (wqr.error === 'empty') {
                          return (
                            <div className="text-xs p-2 rounded-lg mb-2" style={{ background: '#ff6b3510', color: '#ff6b35', borderLeft: '2px solid #ff6b35' }}>
                              Kamu belum menulis query.
                            </div>
                          );
                        }
                        if (wqr.error === 'timeout') {
                          return (
                            <div className="text-xs p-2 rounded-lg mb-2" style={{ background: '#ff950010', color: '#ff9500', borderLeft: '2px solid #ff9500' }}>
                              Query terlalu lama dieksekusi (timeout 5 detik).
                            </div>
                          );
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
                          return (
                            <div className="text-xs p-2 rounded-lg mb-2" style={{ background: '#00ff8810', color: '#00ff88', borderLeft: '2px solid #00ff88' }}>
                              Query kamu menghasilkan output yang benar!
                            </div>
                          );
                        }
                        if (wqr.error && !wqr.isCorrect && !wqr.userResult) {
                          return (
                            <div className="text-xs p-2 rounded-lg mb-2" style={{ background: '#ff6b3510', color: '#ff6b35', borderLeft: '2px solid #ff6b35' }}>
                              Query kamu mengandung error: {wqr.error}
                            </div>
                          );
                        }
                        if (wqr.userResult && wqr.expectedResult) {
                          return (
                            <div className="mb-2 space-y-1.5">
                              <div className="text-xs" style={{ color: '#3d5a7a' }}>Perbandingan hasil query:</div>
                              <div className="grid grid-cols-2 gap-2">
                                {/* User result */}
                                <div>
                                  <div className="text-xs font-mono mb-1" style={{ color: '#ff6b35' }}>Hasil query kamu</div>
                                  <div className="overflow-auto rounded-lg" style={{ background: '#050810', border: '1px solid #ff6b3520', maxHeight: 110 }}>
                                    <table style={{ fontSize: 10, borderCollapse: 'collapse', width: '100%' }}>
                                      <thead>
                                        <tr>{wqr.userResult.columns.map((col) => (
                                          <th key={col} style={{ padding: '3px 5px', color: '#ff6b35', textAlign: 'left', borderBottom: '1px solid #ff6b3520', whiteSpace: 'nowrap' }}>{col}</th>
                                        ))}</tr>
                                      </thead>
                                      <tbody>
                                        {wqr.userResult.rows.slice(0, 5).map((row, ri) => (
                                          <tr key={ri}>{row.map((cell, ci) => (
                                            <td key={ci} style={{ padding: '2px 5px', color: '#7a9cc4', borderBottom: '1px solid #1e2d4a' }}>{String(cell ?? 'NULL')}</td>
                                          ))}</tr>
                                        ))}
                                      </tbody>
                                    </table>
                                    {wqr.userResult.rows.length > 5 && (
                                      <div style={{ padding: '2px 5px', color: '#3d5a7a', fontSize: 9 }}>+{wqr.userResult.rows.length - 5} baris</div>
                                    )}
                                  </div>
                                </div>
                                {/* Expected result */}
                                <div>
                                  <div className="text-xs font-mono mb-1" style={{ color: '#00ff88' }}>Hasil yang diharapkan</div>
                                  <div className="overflow-auto rounded-lg" style={{ background: '#050810', border: '1px solid #00ff8820', maxHeight: 110 }}>
                                    <table style={{ fontSize: 10, borderCollapse: 'collapse', width: '100%' }}>
                                      <thead>
                                        <tr>{wqr.expectedResult.columns.map((col) => (
                                          <th key={col} style={{ padding: '3px 5px', color: '#00ff88', textAlign: 'left', borderBottom: '1px solid #00ff8820', whiteSpace: 'nowrap' }}>{col}</th>
                                        ))}</tr>
                                      </thead>
                                      <tbody>
                                        {wqr.expectedResult.rows.slice(0, 5).map((row, ri) => (
                                          <tr key={ri}>{row.map((cell, ci) => (
                                            <td key={ci} style={{ padding: '2px 5px', color: '#7a9cc4', borderBottom: '1px solid #1e2d4a' }}>{String(cell ?? 'NULL')}</td>
                                          ))}</tr>
                                        ))}
                                      </tbody>
                                    </table>
                                    {wqr.expectedResult.rows.length > 5 && (
                                      <div style={{ padding: '2px 5px', color: '#3d5a7a', fontSize: 9 }}>+{wqr.expectedResult.rows.length - 5} baris</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

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
      </PageLayout>
    );
  }

  // ── EXAM ──────────────────────────────────────────────────────────────────
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Exam header bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: '#0f1629', border: '1px solid #1e2d4a' }}>
          <div>
            <div className="text-xs font-mono mb-0.5" style={{ color: '#3d5a7a' }}>Ujian · Modul {id}</div>
            <div className="font-syne font-bold text-sm" style={{ color: '#e8f4fd' }}>{modul.title}</div>
          </div>
          {/* Timer */}
          <motion.div
            animate={timerPulse ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: timerPulse ? Infinity : 0, duration: 0.8 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg"
            style={{
              background: timerColor + '15',
              border: `1px solid ${timerColor}33`,
              color: timerColor,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M7 4v3l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {formatTime(timeLeft)}
          </motion.div>
        </div>

        {/* Progress + dot navigation */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono mb-2" style={{ color: '#3d5a7a' }}>
            <span>Soal {currentIdx + 1} / {questions.length}</span>
            <span>{answeredCount}/{questions.length} dijawab</span>
          </div>
          <ProgressBar value={answeredCount} max={questions.length} color={levelColor} showLabel={false} height={3} />

          {/* Dot navigation */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(i)}
                title={`Soal ${i + 1}`}
                className="w-7 h-7 rounded-lg text-xs font-bold font-mono transition-all"
                style={{
                  background: i === currentIdx ? levelColor : answers[q.id] ? '#00ff8820' : '#1e2d4a',
                  color: i === currentIdx ? '#050810' : answers[q.id] ? '#00ff88' : '#3d5a7a',
                  border: i === currentIdx ? 'none' : `1px solid ${answers[q.id] ? '#00ff8833' : 'transparent'}`,
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6 rounded-2xl space-y-4" style={{ background: '#0f1629', border: '1px solid #1e2d4a' }}>
              {/* Difficulty + points */}
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{
                    background: current.difficulty === 'easy' ? '#00ff8815' : current.difficulty === 'medium' ? '#00d4ff15' : '#8b5cf615',
                    color: current.difficulty === 'easy' ? '#00ff88' : current.difficulty === 'medium' ? '#00d4ff' : '#8b5cf6',
                  }}
                >
                  {current.difficulty}
                </span>
                <span className="text-xs font-mono" style={{ color: '#3d5a7a' }}>{current.points} poin</span>
                {answers[current.id] && (
                  <span className="text-xs font-mono" style={{ color: '#00ff88' }}>✓ Dijawab</span>
                )}
              </div>

              <p className="font-syne font-bold text-base leading-relaxed" style={{ color: '#e8f4fd' }}>{current.question}</p>

              {current.context && (
                <div className="p-3 rounded-xl font-mono text-xs leading-relaxed" style={{ background: '#050810', color: '#7a9cc4', border: '1px solid #1e2d4a' }}>
                  {current.context}
                </div>
              )}

              {/* Multiple choice */}
              {current.type === 'multiple_choice' && current.options && (
                <div className="space-y-2">
                  {current.options.map((opt, oi) => {
                    const selected = answers[current.id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(current.id, opt)}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3"
                        style={{
                          background: selected ? levelColor + '15' : '#050810',
                          border: `1px solid ${selected ? levelColor : '#1e2d4a'}`,
                          color: selected ? '#e8f4fd' : '#7a9cc4',
                        }}
                      >
                        <span
                          className="flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono font-bold"
                          style={{
                            borderColor: selected ? levelColor : '#1e2d4a',
                            background: selected ? levelColor : 'transparent',
                            color: selected ? '#050810' : '#3d5a7a',
                          }}
                        >
                          {String.fromCharCode(65 + oi)}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Fill blank / write query */}
              {(current.type === 'fill_blank' || current.type === 'write_query' || current.type === 'identify_error' || current.type === 'predict_output') && (
                <textarea
                  value={answers[current.id] || ''}
                  onChange={(e) => handleAnswer(current.id, e.target.value)}
                  placeholder={current.type === 'write_query' ? 'Tulis query SQL di sini...' : 'Tulis jawaban kamu...'}
                  rows={current.type === 'write_query' ? 5 : 2}
                  className="w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none resize-none transition-all"
                  style={{
                    background: '#050810',
                    borderColor: answers[current.id] ? levelColor + '44' : '#1e2d4a',
                    color: '#e8f4fd',
                  }}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
            disabled={currentIdx === 0}
            className="px-4 py-2 rounded-xl border text-sm font-mono disabled:opacity-30 transition-all"
            style={{ borderColor: '#1e2d4a', color: '#7a9cc4' }}
          >
            ← Sebelumnya
          </button>

          {currentIdx < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx(currentIdx + 1)}
              className="px-5 py-2 rounded-xl text-sm font-bold font-mono transition-all"
              style={{ background: '#1e2d4a', color: '#e8f4fd' }}
            >
              Berikutnya →
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(false)}
              disabled={!allAnswered || isValidating}
              className="px-6 py-2.5 rounded-xl text-sm font-bold font-mono transition-all disabled:opacity-40 flex items-center gap-2"
              style={{
                background: allAnswered && !isValidating ? levelColor : '#1e2d4a',
                color: allAnswered && !isValidating ? '#050810' : '#3d5a7a',
              }}
            >
              {isValidating ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
                  Memvalidasi query...
                </>
              ) : (
                'Kumpulkan Ujian ✓'
              )}
            </button>
          )}
        </div>

        {!allAnswered && currentIdx === questions.length - 1 && (
          <p className="text-xs text-center font-mono" style={{ color: '#3d5a7a' }}>
            {questions.length - answeredCount} soal belum dijawab
          </p>
        )}
      </div>
    </PageLayout>
  );
}
