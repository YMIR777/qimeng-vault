import './utils/polyfills'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { initDefaultAccounts, reconcileAccountBalances, deduplicateAccounts } from './store/db'
import { fullSync } from './supabase/sync'

async function initApp() {
  try {
    // Step 1: 确保默认账户存在（使用固定 ID，不会重复）
    await initDefaultAccounts();
    
    // Step 2: 清理历史遗留的重复账户 + 迁移交易引用
    const removed = await deduplicateAccounts();
    if (removed > 0) console.log(`[init] cleaned ${removed} duplicate accounts`);
    
    // Step 3: 从交易记录重建账户余额（修复余额归零 bug）
    await reconcileAccountBalances();
    
    // Step 4: 先上传本机数据到云端，再拉取其他设备数据
    const result = await fullSync();
    console.log('[sync] initial sync done:', result);
    
    // Step 5: 同步后再次对账（确保拉取的数据一致）
    await reconcileAccountBalances();
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
