import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TabBar } from './components/ui/TabBar';
import { Dashboard } from './pages/Dashboard';
import { Wishes } from './pages/Wishes';
import { Workbench } from './pages/Workbench';
import { Reports } from './pages/Reports';
import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <div
        data-theme="dark"
        style={{
          position: 'relative',
          minHeight: '100dvh',
          background: 'var(--bg-primary)',
          transition: 'background 0.6s var(--ease-in-out)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ flex: 1, paddingBottom: '80px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/wishes" element={<Wishes />} />
            <Route path="/workbench" element={<Workbench />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>
        <TabBar />
      </div>
    </BrowserRouter>
  );
}

export default App;
