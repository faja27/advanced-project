import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout } from '../components/layout/PageLayout';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useProgressStore } from '../store/progressStore';
import { examData } from '../data/exam';
import { modulesData } from '../data/modules';
import { validateWriteQuery } from '../utils/sqlRunner';
import type { WriteQueryValidationResult } from '../utils/sqlRunner';
import { useExamTimer } from '../hooks/useExamTimer';
import { ExamIntro } from '../components/exam/ExamIntro';
import { ExamResult } from '../components/exam/ExamResult';
import type { ExamQuestion } from '../types';

const LEVEL_COLORS: Record<number, string> = {
  1: '#00d4ff', 2: '#4d9fff', 3: '#8b5cf6', 4: '#ff3d9a',
};

const EXAM_DURATION = 15 * 60;

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
  const [writeQueryResults, setWriteQueryResults] = useState<Record<string, WriteQueryValidationResult>>({});
  const [isValidating, setIsValidating] = useState(false);
  const isSubmittingRef = useRef(false);
  const answersRef = useRef<Record<string, string>>({});
  const onTimeUpRef = useRef<() => void>(() => {});

  const { timeLeft, startTimer, stopTimer } = useExamTimer({
    duration: EXAM_DURATION,
    onTimeUp: () => onTimeUpRef.current(),
  });

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { if (phase === 'exam') startTimer(); }, [phase]);
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
          <div className="text-5xl font-sans" style={{ color: '#1e2d4a' }}>404</div>
          <div style={{ color: '#7a9cc4' }}>Ujian untuk modul ini belum tersedia.</div>
          <button onClick={() => navigate(`/modul/${id}`)} className="text-sm font-sans px-4 py-2 rounded-lg border" style={{ borderColor: '#1e2d4a', color: '#00d4ff' }}>
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
  const allAnswered = questions.every((q) => answers[q.id]);
  const answeredCount = Object.keys(answers).length;

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const timerColor = timeLeft <= 30 ? '#ff3d3d' : timeLeft <= 120 ? '#ff9500' : '#00d4ff';
  const timerPulse = timeLeft <= 30;

  const handleSubmitWithAnswers = async (currentAnswers: Record<string, string>, auto = false) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    stopTimer();
    setIsValidating(true);

    const wqResults: Record<string, WriteQueryValidationResult> = {};
    await Promise.all(
      questions.filter((q) => q.type === 'write_query').map(async (q) => {
        const userQ = (currentAnswers[q.id] || '').trim();
        const expected = Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : String(q.correctAnswer);
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
        const correct = Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(ans) : ans.trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
        if (correct) earned += q.points;
      }
    });

    const pct = Math.round((earned / totalPoints) * 100);
    setScore(pct);
    setPhase('result');
    saveExamScore(id, pct);
    if (pct === 100) { addAchievement('perfect_score'); setShowConfetti(true); }
    if (pct >= 70) { if (id === 1) addAchievement('first_step'); if (!auto) setShowConfetti(true); }
  };

  onTimeUpRef.current = () => void handleSubmitWithAnswers(answersRef.current, true);

  // ── INTRO
  if (phase === 'intro') {
    return (
      <PageLayout>
        <ExamIntro
          moduleId={id} moduleName={modul.title} levelColor={levelColor}
          questions={questions} totalPoints={totalPoints} prevScore={prevScore}
          onStart={() => setPhase('exam')}
        />
      </PageLayout>
    );
  }

  // ── RESULT
  if (phase === 'result') {
    return (
      <PageLayout>
        <ExamResult
          score={score} moduleId={id} moduleName={modul.title} levelColor={levelColor}
          questions={questions} answers={answers} writeQueryResults={writeQueryResults}
          showConfetti={showConfetti}
          onRetry={() => { setPhase('exam'); setAnswers({}); setCurrentIdx(0); setWriteQueryResults({}); isSubmittingRef.current = false; }}
          onBack={() => navigate(`/modul/${id}`)}
          onNext={id < 38 ? () => navigate(`/modul/${id + 1}`) : undefined}
        />
      </PageLayout>
    );
  }

  // ── EXAM
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: '#0f1629', border: '1px solid #1e2d4a' }}>
          <div>
            <div className="text-xs font-sans mb-0.5" style={{ color: '#3d5a7a' }}>Ujian · Modul {id}</div>
            <div className="font-syne font-bold text-sm" style={{ color: '#e8f4fd' }}>{modul.title}</div>
          </div>
          <motion.div
            animate={timerPulse ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: timerPulse ? Infinity : 0, duration: 0.8 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-sans font-bold text-lg"
            style={{ background: timerColor + '15', border: `1px solid ${timerColor}33`, color: timerColor }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M7 4v3l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {formatTime(timeLeft)}
          </motion.div>
        </div>

        {/* Progress + dot nav */}
        <div>
          <div className="flex items-center justify-between text-xs font-sans mb-2" style={{ color: '#3d5a7a' }}>
            <span>Soal {currentIdx + 1} / {questions.length}</span>
            <span>{answeredCount}/{questions.length} dijawab</span>
          </div>
          <ProgressBar value={answeredCount} max={questions.length} color={levelColor} showLabel={false} height={3} />
          <div className="flex flex-wrap gap-1.5 mt-3">
            {questions.map((q, i) => (
              <button key={q.id} onClick={() => setCurrentIdx(i)} title={`Soal ${i + 1}`}
                className="w-7 h-7 rounded-lg text-xs font-bold font-sans transition-all"
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
          <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <div className="p-6 rounded-2xl space-y-4" style={{ background: '#0f1629', border: '1px solid #1e2d4a' }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans px-2 py-0.5 rounded" style={{
                  background: current.difficulty === 'easy' ? '#00ff8815' : current.difficulty === 'medium' ? '#00d4ff15' : '#8b5cf615',
                  color: current.difficulty === 'easy' ? '#00ff88' : current.difficulty === 'medium' ? '#00d4ff' : '#8b5cf6',
                }}>{current.difficulty}</span>
                <span className="text-xs font-sans" style={{ color: '#3d5a7a' }}>{current.points} poin</span>
                {answers[current.id] && <span className="text-xs font-sans" style={{ color: '#00ff88' }}>✓ Dijawab</span>}
              </div>
              <p className="font-syne font-bold text-base leading-relaxed" style={{ color: '#e8f4fd' }}>{current.question}</p>
              {current.context && (
                <div className="p-3 rounded-xl font-mono text-xs leading-relaxed" style={{ background: '#050810', color: '#7a9cc4', border: '1px solid #1e2d4a' }}>
                  {current.context}
                </div>
              )}
              {current.type === 'multiple_choice' && current.options && (
                <div className="space-y-2">
                  {current.options.map((opt, oi) => {
                    const selected = answers[current.id] === opt;
                    return (
                      <button key={opt} onClick={() => setAnswers((prev) => ({ ...prev, [current.id]: opt }))}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3"
                        style={{ background: selected ? levelColor + '15' : '#050810', border: `1px solid ${selected ? levelColor : '#1e2d4a'}`, color: selected ? '#e8f4fd' : '#7a9cc4' }}
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-sans font-bold"
                          style={{ borderColor: selected ? levelColor : '#1e2d4a', background: selected ? levelColor : 'transparent', color: selected ? '#050810' : '#3d5a7a' }}
                        >{String.fromCharCode(65 + oi)}</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}
              {(current.type === 'fill_blank' || current.type === 'write_query' || current.type === 'identify_error' || current.type === 'predict_output') && (
                <textarea
                  value={answers[current.id] || ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [current.id]: e.target.value }))}
                  placeholder={current.type === 'write_query' ? 'Tulis query SQL di sini...' : 'Tulis jawaban kamu...'}
                  rows={current.type === 'write_query' ? 5 : 2}
                  className="w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none resize-none transition-all"
                  style={{ background: '#050810', borderColor: answers[current.id] ? levelColor + '44' : '#1e2d4a', color: '#e8f4fd' }}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}
            className="px-4 py-2 rounded-xl border text-sm font-sans disabled:opacity-30 transition-all"
            style={{ borderColor: '#1e2d4a', color: '#7a9cc4' }}
          >← Sebelumnya</button>
          {currentIdx < questions.length - 1 ? (
            <button onClick={() => setCurrentIdx(currentIdx + 1)} className="px-5 py-2 rounded-xl text-sm font-bold font-sans transition-all" style={{ background: '#1e2d4a', color: '#e8f4fd' }}>
              Berikutnya →
            </button>
          ) : (
            <button onClick={() => void handleSubmitWithAnswers(answers, false)} disabled={!allAnswered || isValidating}
              className="px-6 py-2.5 rounded-xl text-sm font-bold font-sans transition-all disabled:opacity-40 flex items-center gap-2"
              style={{ background: allAnswered && !isValidating ? levelColor : '#1e2d4a', color: allAnswered && !isValidating ? '#050810' : '#3d5a7a' }}
            >
              {isValidating ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span> Memvalidasi query...</> : 'Kumpulkan Ujian ✓'}
            </button>
          )}
        </div>
        {!allAnswered && currentIdx === questions.length - 1 && (
          <p className="text-xs text-center font-sans" style={{ color: '#3d5a7a' }}>{questions.length - answeredCount} soal belum dijawab</p>
        )}
      </div>
    </PageLayout>
  );
}
