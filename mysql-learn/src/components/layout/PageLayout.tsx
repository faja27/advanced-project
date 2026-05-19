import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  title?: string;
}

export function PageLayout({ children, title }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: '#050810' }}>
      <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Mobile overlay backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(5, 8, 16, 0.7)' }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="flex-1 min-h-screen w-0 lg:ml-[240px]">
        {/* Mobile top bar */}
        <div
          className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3"
          style={{ background: '#050810', borderBottom: '1px solid #1e2d4a' }}
        >
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex-shrink-0 p-2 rounded-lg transition-colors"
            style={{ color: '#7a9cc4', background: '#0f1629', border: '1px solid #1e2d4a' }}
            aria-label="Buka menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="font-syne font-bold text-sm">
            <span style={{ color: '#00d4ff' }}>MySQL</span>
            <span style={{ color: '#e8f4fd' }}>Master</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
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
