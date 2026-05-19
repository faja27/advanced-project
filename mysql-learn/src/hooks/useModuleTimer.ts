import { useRef, useEffect } from 'react';

export function useModuleTimer(
  id: number,
  isActive: boolean,
  onLastAccessed: (id: number) => void,
  onStudyTime: (minutes: number) => void,
) {
  const startRef = useRef(Date.now());
  const onLastAccessedRef = useRef(onLastAccessed);
  const onStudyTimeRef = useRef(onStudyTime);

  onLastAccessedRef.current = onLastAccessed;
  onStudyTimeRef.current = onStudyTime;

  useEffect(() => {
    if (!isActive) return;
    startRef.current = Date.now();
    onLastAccessedRef.current(id);
    return () => {
      const mins = Math.floor((Date.now() - startRef.current) / 60000);
      if (mins > 0) onStudyTimeRef.current(mins);
    };
  }, [id, isActive]);
}
