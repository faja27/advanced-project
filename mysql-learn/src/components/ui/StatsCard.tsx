import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
}

export function StatsCard({ icon, label, value, color = '#00d4ff', sub }: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-xl p-5 relative overflow-hidden"
      style={{
        background: '#0f1629',
        border: '1px solid #1e2d4a',
        borderLeft: `3px solid ${color}`,
      }}
    >
      {/* Subtle bg glow */}
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none" style={{ background: color + '08', filter: 'blur(20px)', transform: 'translate(30%, -30%)' }} />
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#3d5a7a' }}>{label}</span>
        <div className="opacity-20" style={{ color }}>{icon}</div>
      </div>
      <div className="text-3xl font-bold font-syne" style={{ color }}>{value}</div>
      {sub && <div className="text-xs mt-1.5" style={{ color: '#3d5a7a', fontFamily: 'JetBrains Mono' }}>{sub}</div>}
    </motion.div>
  );
}
