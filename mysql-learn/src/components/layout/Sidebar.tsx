import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProgressStore } from '../../store/progressStore';

const LEVEL_COLORS = ['#00d4ff', '#4d9fff', '#8b5cf6', '#ff3d9a'];
const LEVEL_NAMES = ['Fondasi', 'Menengah', 'Lanjutan', 'Expert'];
const LEVEL_MODS = [[1,6],[7,18],[19,27],[28,38]];

function IconDashboard() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.8"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.8"/>
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 2.5A1.5 1.5 0 013.5 1h9A1.5 1.5 0 0114 2.5v10a1.5 1.5 0 01-1.5 1.5H3.5A1.5 1.5 0 012 12.5v-10z" stroke="currentColor" strokeWidth="1.2" opacity="0.8"/>
      <path d="M5 5h6M5 7.5h6M5 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}
function IconProfile() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.2" opacity="0.8"/>
      <path d="M2.5 13.5C2.5 11 5 9 8 9s5.5 2 5.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}


const MENU = [
  { to: '/dashboard', label: 'Dashboard', Icon: IconDashboard },
  { to: '/level/1', label: 'Level 1 — Fondasi', Icon: IconBook, color: '#00d4ff' },
  { to: '/level/2', label: 'Level 2 — Menengah', Icon: IconBook, color: '#4d9fff' },
  { to: '/level/3', label: 'Level 3 — Lanjutan', Icon: IconBook, color: '#8b5cf6' },
  { to: '/level/4', label: 'Level 4 — Expert', Icon: IconBook, color: '#ff3d9a' },
  { to: '/profile', label: 'Profil & Statistik', Icon: IconProfile },
];

export function Sidebar() {
  const { user, getTotalProgress, progress, getLevelProgress } = useProgressStore();
  const navigate = useNavigate();
  const total = getTotalProgress();
  const completed = Object.values(progress).filter((p) => p.status === 'completed').length;

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-screen flex flex-col z-40"
      style={{ width: 240, background: '#050810', borderRight: '1px solid #1e2d4a' }}
    >
      {/* Logo */}
      <div
        className="px-5 py-5 cursor-pointer flex items-center gap-3"
        style={{ borderBottom: '1px solid #1e2d4a' }}
        onClick={() => navigate('/')}
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#00d4ff15', border: '1px solid #00d4ff30' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <ellipse cx="9" cy="5" rx="7" ry="2.5" stroke="#00d4ff" strokeWidth="1.4"/>
            <path d="M2 5v4c0 1.38 3.13 2.5 7 2.5S16 10.38 16 9V5" stroke="#00d4ff" strokeWidth="1.4"/>
            <path d="M2 9v4c0 1.38 3.13 2.5 7 2.5S16 14.38 16 13V9" stroke="#00d4ff" strokeWidth="1.4" opacity="0.5"/>
          </svg>
        </div>
        <div>
          <div className="font-syne font-bold text-sm leading-tight">
            <span style={{ color: '#00d4ff' }}>MySQL</span>
            <span style={{ color: '#e8f4fd' }}>Master</span>
          </div>
          <div className="text-xs" style={{ color: '#3d5a7a', fontFamily: 'JetBrains Mono' }}>v1.0 · 38 Modul</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {MENU.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-150 ${isActive ? 'font-semibold' : ''}`
            }
            style={({ isActive }) => ({
              background: isActive ? '#00d4ff11' : 'transparent',
              color: isActive ? (item.color || '#00d4ff') : '#7a9cc4',
              borderLeft: isActive ? `2px solid ${item.color || '#00d4ff'}` : '2px solid transparent',
              paddingLeft: isActive ? '10px' : '12px',
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ color: isActive ? (item.color || '#00d4ff') : '#3d5a7a', flexShrink: 0 }}>
                  <item.Icon />
                </span>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '12px' }}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Level mini-progress */}
        <div className="mt-4 px-1">
          <div className="text-xs font-mono mb-2" style={{ color: '#3d5a7a' }}>LEVEL PROGRESS</div>
          {[1,2,3,4].map((lvl) => {
            const { completed: c, total: t } = getLevelProgress(lvl);
            const pct = Math.round((c / t) * 100);
            const color = LEVEL_COLORS[lvl - 1];
            return (
              <div key={lvl} className="mb-2">
                <div className="flex justify-between text-xs mb-1" style={{ color: '#3d5a7a' }}>
                  <span style={{ fontFamily: 'JetBrains Mono' }}>Lv.{lvl} {LEVEL_NAMES[lvl-1]}</span>
                  <span style={{ color }}>{c}/{LEVEL_MODS[lvl-1][1]-LEVEL_MODS[lvl-1][0]+1}</span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: 3, background: '#1e2d4a' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* User Footer */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid #1e2d4a' }}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: '#00d4ff15', border: '1.5px solid #00d4ff44', color: '#00d4ff' }}
          >
            {user.name ? user.name[0]?.toUpperCase() : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold truncate" style={{ color: '#e8f4fd' }}>{user.name || 'Guest'}</div>
            <div className="flex items-center gap-1 text-xs" style={{ color: '#ff6b35', fontFamily: 'JetBrains Mono' }}>
              <span>🔥</span>
              <span>{user.streak} hari</span>
            </div>
          </div>
          <div className="text-xs font-bold" style={{ color: '#00d4ff', fontFamily: 'JetBrains Mono' }}>
            {completed}<span style={{ color: '#3d5a7a' }}>/38</span>
          </div>
        </div>
        {/* Overall progress */}
        <div className="mb-1 flex justify-between text-xs" style={{ color: '#3d5a7a' }}>
          <span>Overall</span>
          <span style={{ color: '#00d4ff' }}>{total}%</span>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: 4, background: '#1e2d4a' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #00d4ff, #8b5cf6)' }}
            initial={{ width: 0 }}
            animate={{ width: `${total}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.aside>
  );
}
