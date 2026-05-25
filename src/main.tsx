import './utils/polyfills'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { initDefaultAccounts } from './store/db'
import { fullSync } from './supabase/sync'

// 先同步云端数据，再初始化默认账户
async function initApp() {
  try {
    const result = await fullSync();
    console.log('[sync] initial sync done:', result);
  } catch (err) {
    console.error('[sync] initial sync failed:', err);
  }
  // 只有在云端也没有数据时才创建默认账户
  await initDefaultAccounts();
  console.log('[app] ready');
}
initApp();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
