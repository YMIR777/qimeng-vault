import './utils/polyfills'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { initDefaultAccounts } from './store/db'
import { fullSync } from './supabase/sync'

// 初始化默认账户 + 启动云端同步
Promise.all([
  initDefaultAccounts().catch(console.error),
  fullSync().then(r => console.log('[sync] initial sync done:', r)),
]).then(() => console.log('[app] ready'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
