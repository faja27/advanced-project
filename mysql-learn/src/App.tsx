import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LevelPage } from './pages/LevelPage';
import { ModulePage } from './pages/ModulePage';
import { ExamPage } from './pages/ExamPage';
import { ProfilePage } from './pages/ProfilePage';
import { useProgressStore } from './store/progressStore';

function StorageWarningBanner() {
  const storageWarning = useProgressStore((s) => s.storageWarning);
  if (!storageWarning) return null;
  return (
    <div
      style={{ background: '#fef08a', color: '#713f12', borderBottom: '1px solid #fde047' }}
      className="w-full px-4 py-2 text-sm text-center font-medium"
    >
      ⚠ Peringatan: Progress tidak dapat disimpan. Storage browser penuh atau dinonaktifkan.
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <StorageWarningBanner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/level/:levelId" element={<LevelPage />} />
          <Route path="/modul/:modulId" element={<ModulePage />} />
          <Route path="/ujian/:modulId" element={<ExamPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
