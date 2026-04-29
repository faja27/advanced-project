import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LevelPage } from './pages/LevelPage';
import { ModulePage } from './pages/ModulePage';
import { ExamPage } from './pages/ExamPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  return (
    <ErrorBoundary>
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
