import { motion } from 'framer-motion';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const BADGES: Badge[] = [
  { id: 'first_step', name: 'Langkah Pertama', description: 'Selesaikan modul pertama', icon: '🚀', color: '#58a6ff' },
  { id: 'level1_complete', name: 'Fondasi Kuat', description: 'Selesaikan Level 1', icon: '🏆', color: '#3fb950' },
  { id: 'level2_complete', name: 'Menengah', description: 'Selesaikan Level 2', icon: '⚡', color: '#e3b341' },
  { id: 'level3_complete', name: 'Lanjutan', description: 'Selesaikan Level 3', icon: '💎', color: '#bc8cff' },
  { id: 'mysql_master', name: 'MySQL Master', description: 'Selesaikan semua 38 modul', icon: '👑', color: '#f78166' },
  { id: 'perfect_score', name: 'Sempurna', description: 'Skor 100% di satu ujian', icon: '🎯', color: '#58a6ff' },
  { id: 'speed_learner', name: 'Belajar Kilat', description: 'Selesaikan 3 modul dalam 1 hari', icon: '⚡', color: '#e3b341' },
  { id: 'streak_7', name: 'Konsisten 7 Hari', description: 'Belajar 7 hari berturut-turut', icon: '🔥', color: '#f78166' },
  { id: 'streak_30', name: 'Dedication', description: 'Belajar 30 hari berturut-turut', icon: '💪', color: '#3fb950' },
  { id: 'no_mistake', name: 'Tanpa Cela', description: 'Lulus ujian pertama kali (5 modul)', icon: '✨', color: '#bc8cff' },
];

interface Props {
  earned: string[];
  showAll?: boolean;
}

export function BadgeDisplay({ earned, showAll = false }: Props) {
  const badges = showAll ? BADGES : BADGES.filter((b) => earned.includes(b.id));

  return (
    <div className="flex flex-wrap gap-3">
      {badges.map((badge) => {
        const unlocked = earned.includes(badge.id);
        return (
          <motion.div
            key={badge.id}
            whileHover={{ scale: 1.1 }}
            title={badge.description}
            className="relative group"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border transition-all"
              style={{
                background: unlocked ? badge.color + '20' : '#21262d',
                borderColor: unlocked ? badge.color : '#30363d',
                opacity: unlocked ? 1 : 0.4,
                filter: unlocked ? 'none' : 'grayscale(1)',
              }}
            >
              {badge.icon}
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div className="rounded-lg p-2 text-xs whitespace-nowrap" style={{ background: '#161b22', border: '1px solid #30363d', color: '#e6edf3' }}>
                <div className="font-bold">{badge.name}</div>
                <div style={{ color: '#8b949e' }}>{badge.description}</div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
