import { useState, useRef, useEffect, useCallback } from 'react';

interface UseExamTimerOptions {
  duration: number;
  onTimeUp: () => void;
}

export function useExamTimer({ duration, onTimeUp }: UseExamTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => { onTimeUpRef.current = onTimeUp; }, [onTimeUp]);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(duration);
    setIsRunning(true);
  }, [duration]);

  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setIsRunning(false);
          onTimeUpRef.current();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  return { timeLeft, isRunning, startTimer, stopTimer };
}
