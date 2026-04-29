import { motion } from 'framer-motion';

interface Props {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  height?: number;
  gradient?: boolean;
}

export function ProgressBar({ value, max = 100, color = '#00d4ff', showLabel = true, height = 6, gradient = false }: Props) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const fill = gradient
    ? 'linear-gradient(90deg, #00d4ff, #8b5cf6)'
    : color;

  return (
    <div className="w-full">
      <div className="relative rounded-full overflow-hidden" style={{ height, background: '#1e2d4a' }}>
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: fill }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <span className="text-xs mt-1 block font-mono" style={{ color: '#3d5a7a' }}>{pct}%</span>
      )}
    </div>
  );
}
