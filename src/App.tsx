import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { TabBar } from './components/ui/TabBar';
import { QuickAddFAB } from './components/ui/QuickAddFAB';
import { ToastProvider } from './components/ui/Toast';
import './styles/global.css';

// ── Route-level code splitting ──────────────────────────────────
const IntroPage = lazy(() => import('./pages/IntroPage'));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Wishes = lazy(() => import('./pages/Wishes').then(m => ({ default: m.Wishes })));
const Workbench = lazy(() => import('./pages/Workbench').then(m => ({ default: m.Workbench })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const Records = lazy(() => import('./pages/Records').then(m => ({ default: m.Records })));
const Reflection = lazy(() => import('./pages/Reflection').then(m => ({ default: m.Reflection })));
const Settings = lazy(() => import('./pages/Settings'));
const GoalSettings = lazy(() => import('./components/goals/GoalSettings'));

// ── Page skeleton shimmer — matches neumorphic card style ──────
function PageSkeleton() {
  return (
    <div style={{ padding: '40px 48px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Title skeleton */}
      <div className="skeleton-shimmer" style={{ width: '120px', height: '14px', marginBottom: '32px', borderRadius: '8px' }} />
      {/* Hero card skeleton */}
      <div className="skeleton-shimmer" style={{ width: '100%', height: '140px', marginBottom: '24px', borderRadius: '28px' }} />
      {/* Grid skeletons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="skeleton-shimmer" style={{ height: '100px', borderRadius: '24px' }} />
        <div className="skeleton-shimmer" style={{ height: '100px', borderRadius: '24px' }} />
        <div className="skeleton-shimmer" style={{ height: '100px', borderRadius: '24px' }} />
        <div className="skeleton-shimmer" style={{ height: '100px', borderRadius: '24px' }} />
      </div>
      {/* List skeletons */}
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton-shimmer" style={{ width: '100%', height: '56px', marginBottom: '12px', borderRadius: '14px' }} />
      ))}
    </div>
  );
}

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
            <Suspense fallback={<PageSkeleton />}>
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
            </Suspense>
          </PageContent>
          <QuickAddFAB />
          <TabBar />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
