import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { TabBar } from './components/ui/TabBar';
import { QuickAddFAB } from './components/ui/QuickAddFAB';
import { ToastProvider } from './components/ui/Toast';
import { Dashboard } from './pages/Dashboard';
import { Wishes } from './pages/Wishes';
import { Workbench } from './pages/Workbench';
import { Reports } from './pages/Reports';
import { Records } from './pages/Records';
import { Reflection } from './pages/Reflection';
import IntroPage from './pages/IntroPage';
import Settings from './pages/Settings';
import GoalSettings from './components/goals/GoalSettings';
import './styles/global.css';

// Page transition wrapper — applies fade-slide animation on route change
function PageContent({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setAnimating(true);
    const t = setTimeout(() => setAnimating(false), 300);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div
      className={animating ? 'page-fade-in' : ''}
      style={{ flex: 1, paddingBottom: '80px' }}
    >
      {children}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div
          data-theme="dark"
          style={{
            position: 'relative',
            minHeight: '100dvh',
            background: 'var(--bg-primary)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <PageContent>
            <Routes>
              <Route path="/" element={<IntroPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/wishes" element={<Wishes />} />
              <Route path="/workbench" element={<Workbench />} />
              <Route path="/reflection" element={<Reflection />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/records" element={<Records />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/goals" element={<GoalSettings />} />
            </Routes>
          </PageContent>
          <QuickAddFAB />
          <TabBar />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;