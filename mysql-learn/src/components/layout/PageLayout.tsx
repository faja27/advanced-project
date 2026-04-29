import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  title?: string;
}

export function PageLayout({ children, title }: Props) {
  return (
    <div className="flex min-h-screen" style={{ background: '#050810' }}>
      <Sidebar />
      <main className="flex-1 min-h-screen" style={{ marginLeft: 240 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="p-8 max-w-7xl mx-auto"
        >
          {title && (
            <h1 className="text-2xl font-bold font-syne mb-6" style={{ color: '#e8f4fd' }}>{title}</h1>
          )}
          {children}
        </motion.div>
      </main>
    </div>
  );
}
