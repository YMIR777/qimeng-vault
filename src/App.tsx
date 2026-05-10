import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TabBar } from './components/ui/TabBar';
import { ToastProvider } from './components/ui/Toast';
import { Dashboard } from './pages/Dashboard';
import { Wishes } from './pages/Wishes';
import { Workbench } from './pages/Workbench';
import { Reports } from './pages/Reports';
import { Records } from './pages/Records';
import { Reflection } from './pages/Reflection';
import IntroPage from './pages/IntroPage';
import Settings from './pages/Settings';
import './styles/global.css';

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
          <div style={{ flex: 1, paddingBottom: '80px' }}>
            <Routes>
              <Route path="/" element={<IntroPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/wishes" element={<Wishes />} />
              <Route path="/workbench" element={<Workbench />} />
              <Route path="/reflection" element={<Reflection />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/records" element={<Records />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
          <TabBar />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;