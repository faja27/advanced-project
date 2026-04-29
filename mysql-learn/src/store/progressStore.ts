import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ProgressData, ModuleProgress } from '../types';

const safeStorage = createJSONStorage(() => ({
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('[progressStore] localStorage.getItem failed:', e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('[progressStore] localStorage.setItem failed (storage full?):', e);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('[progressStore] localStorage.removeItem failed:', e);
    }
  },
}));

const defaultModuleProgress = (): ModuleProgress => ({
  status: 'not_started',
  topicsRead: [],
  examScore: null,
  examAttempts: 0,
  lastAccessed: null,
  completedAt: null,
});

const defaultProgress = (): Record<string, ModuleProgress> => {
  const p: Record<string, ModuleProgress> = {};
  for (let i = 1; i <= 38; i++) {
    p[`modul_${i}`] = defaultModuleProgress();
  }
  return p;
};

interface ProgressStore extends ProgressData {
  setUserName: (name: string) => void;
  markTopicRead: (modulId: number, topicId: string) => void;
  saveExamScore: (modulId: number, score: number) => void;
  updateLastAccessed: (modulId: number) => void;
  addAchievement: (id: string) => void;
  updateStreak: () => void;
  addStudyMinutes: (minutes: number) => void;
  resetProgress: () => void;
  isModuleUnlocked: (modulId: number) => boolean;
  isLevelUnlocked: (levelId: number) => boolean;
  getLevelProgress: (levelId: number) => { completed: number; total: number };
  getTotalProgress: () => number;
}

const LEVEL_MODULES: Record<number, number[]> = {
  1: [1, 2, 3, 4, 5, 6],
  2: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  3: [19, 20, 21, 22, 23, 24, 25, 26, 27],
  4: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38],
};

function getModuleLevel(modulId: number): number {
  for (const [level, modules] of Object.entries(LEVEL_MODULES)) {
    if (modules.includes(modulId)) return Number(level);
  }
  return 1;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      user: {
        name: '',
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        streak: 0,
        totalStudyMinutes: 0,
      },
      progress: defaultProgress(),
      achievements: [],
      dailyActivity: {},

      setUserName: (name) =>
        set((s) => ({ user: { ...s.user, name } })),

      markTopicRead: (modulId, topicId) =>
        set((s) => {
          const key = `modul_${modulId}`;
          const prev = s.progress[key];
          if (prev.topicsRead.includes(topicId)) return s;
          const topicsRead = [...prev.topicsRead, topicId];
          const status: ModuleProgress['status'] =
            prev.status === 'not_started' ? 'in_progress' : prev.status;
          const today = new Date().toISOString().split('T')[0];
          const prevActivity = s.dailyActivity[today] ?? { modulesStudied: 0, minutesSpent: 0 };
          return {
            progress: {
              ...s.progress,
              [key]: {
                ...prev,
                topicsRead,
                status,
                lastAccessed: new Date().toISOString(),
              },
            },
            dailyActivity: {
              ...s.dailyActivity,
              [today]: { ...prevActivity, modulesStudied: prevActivity.modulesStudied + 1 },
            },
          };
        }),

      saveExamScore: (modulId, score) =>
        set((s) => {
          const key = `modul_${modulId}`;
          const prev = s.progress[key];
          const passed = score >= 70;
          const bestScore = prev.examScore === null ? score : Math.max(prev.examScore, score);
          const wasAlreadyPassed = prev.examScore !== null && prev.examScore >= 70;

          const newProgress = {
            ...s.progress,
            [key]: {
              ...prev,
              examScore: bestScore,
              examAttempts: prev.examAttempts + 1,
              status: passed ? 'completed' as const : prev.status,
              completedAt: passed && !prev.completedAt ? new Date().toISOString() : prev.completedAt,
            },
          };

          const newAchievements = [...s.achievements];
          const addIfMissing = (id: string) => { if (!newAchievements.includes(id)) newAchievements.push(id); };

          if (passed && !wasAlreadyPassed) {
            // Check level completions
            for (const [lvl, mods] of Object.entries(LEVEL_MODULES)) {
              const lvlId = Number(lvl);
              const allLvlDone = mods.every((mid) =>
                mid === modulId ? true : newProgress[`modul_${mid}`]?.status === 'completed'
              );
              if (allLvlDone) {
                if (lvlId === 1) addIfMissing('level1_complete');
                else if (lvlId === 2) addIfMissing('level2_complete');
                else if (lvlId === 3) addIfMissing('level3_complete');
                else if (lvlId === 4) addIfMissing('mysql_master');
              }
            }

            // no_mistake: passed on first attempt for this module
            if (prev.examAttempts === 0) {
              const firstPassCount = Object.values(newProgress).filter(
                (p) => p.examAttempts === 1 && p.examScore !== null && p.examScore >= 70
              ).length;
              if (firstPassCount >= 5) addIfMissing('no_mistake');
            }

            // speed_learner: 3 modules completed today
            const today = new Date().toDateString();
            const completedToday = Object.values(newProgress).filter(
              (p) => p.completedAt && new Date(p.completedAt).toDateString() === today
            ).length;
            if (completedToday >= 3) addIfMissing('speed_learner');
          }

          return { progress: newProgress, achievements: newAchievements };
        }),

      updateLastAccessed: (modulId) =>
        set((s) => {
          const key = `modul_${modulId}`;
          const prev = s.progress[key];
          const status: ModuleProgress['status'] =
            prev.status === 'not_started' ? 'in_progress' : prev.status;
          return {
            progress: {
              ...s.progress,
              [key]: { ...prev, status, lastAccessed: new Date().toISOString() },
            },
          };
        }),

      addAchievement: (id) =>
        set((s) => {
          if (s.achievements.includes(id)) return s;
          return { achievements: [...s.achievements, id] };
        }),

      updateStreak: () =>
        set((s) => {
          const today = new Date().toDateString();
          const lastActive = new Date(s.user.lastActive).toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          let streak = s.user.streak;
          if (lastActive === today) return s;
          if (lastActive === yesterday) {
            streak += 1;
          } else if (lastActive !== today) {
            streak = 1;
          }
          const newAchievements = [...s.achievements];
          if (streak >= 7 && !newAchievements.includes('streak_7')) newAchievements.push('streak_7');
          if (streak >= 30 && !newAchievements.includes('streak_30')) newAchievements.push('streak_30');
          return { user: { ...s.user, streak, lastActive: new Date().toISOString() }, achievements: newAchievements };
        }),

      addStudyMinutes: (minutes) =>
        set((s) => {
          const today = new Date().toISOString().split('T')[0];
          const prev = s.dailyActivity[today] ?? { modulesStudied: 0, minutesSpent: 0 };
          return {
            user: { ...s.user, totalStudyMinutes: s.user.totalStudyMinutes + minutes },
            dailyActivity: {
              ...s.dailyActivity,
              [today]: { ...prev, minutesSpent: prev.minutesSpent + minutes },
            },
          };
        }),

      resetProgress: () =>
        set({
          progress: defaultProgress(),
          achievements: [],
          dailyActivity: {},
        }),

      isModuleUnlocked: (modulId) => {
        const { progress } = get();
        if (modulId === 1) return true;
        const level = getModuleLevel(modulId);
        const levelModules = LEVEL_MODULES[level];
        const firstInLevel = levelModules[0];
        if (modulId === firstInLevel) {
          if (level === 1) return true;
          const prevLevelModules = LEVEL_MODULES[level - 1];
          return prevLevelModules.every(
            (id) => progress[`modul_${id}`]?.status === 'completed'
          );
        }
        const prevModulId = modulId - 1;
        const prevKey = `modul_${prevModulId}`;
        const prevScore = progress[prevKey]?.examScore;
        return prevScore !== null && prevScore !== undefined && prevScore >= 70;
      },

      isLevelUnlocked: (levelId) => {
        const { progress } = get();
        if (levelId === 1) return true;
        const prevLevelModules = LEVEL_MODULES[levelId - 1];
        return prevLevelModules.every(
          (id) => progress[`modul_${id}`]?.status === 'completed'
        );
      },

      getLevelProgress: (levelId) => {
        const { progress } = get();
        const modules = LEVEL_MODULES[levelId] || [];
        const completed = modules.filter(
          (id) => progress[`modul_${id}`]?.status === 'completed'
        ).length;
        return { completed, total: modules.length };
      },

      getTotalProgress: () => {
        const { progress } = get();
        const completed = Object.values(progress).filter(
          (p) => p.status === 'completed'
        ).length;
        return Math.round((completed / 38) * 100);
      },
    }),
    {
      name: 'mysql-learn-progress',
      storage: safeStorage,
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('[progressStore] Rehydration failed, resetting to defaults:', error);
          try {
            localStorage.removeItem('mysql-learn-progress');
          } catch {
            // ignore
          }
          state?.resetProgress();
        }
      },
    }
  )
);
