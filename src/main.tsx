import './utils/polyfills'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { initDefaultAccounts, reconcileAccountBalances, deduplicateAccounts } from './store/db'
import { fullSync } from './supabase/sync'

async function initApp() {
  try {
    // Step 1: 确保默认账户存在（使用固定 ID）
    await initDefaultAccounts();
    
    // Step 2: 先上传本机全部数据到云端（确保云端是最新状态）
    const result = await fullSync();
    console.log('[sync] initial sync done:', result);
    
    // Step 3: 同步后清理重复账户（云端拉回的旧 UUID 账户）
    const removed = await deduplicateAccounts();
    if (removed > 0) console.log(`[init] cleaned ${removed} duplicate accounts`);
    
    // Step 4: 从交易记录重建账户余额（覆盖云端拉回的旧余额）
    await reconcileAccountBalances();
    
    // Step 5: 再次推送修正后的数据到云端
    const result2 = await fullSync();
    console.log('[sync] final sync done:', result2);
    
    // Step 6: 推送后再次去重+对账（防御性）
    await deduplicateAccounts();
    await reconcileAccountBalances();
    
    // 通知 React 组件刷新账户数据
    window.dispatchEvent(new CustomEvent('accounts:reconciled'));
  } catch (err) {
    console.error('[init] startup failed:', err);
  }
  console.log('[app] ready');
}
initApp();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
