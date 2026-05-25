import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Sync code management (cross-device identity) ────────────────
const SYNC_CODE_KEY = 'qimeng_sync_code';

export function getSyncCode(): string {
  let code = localStorage.getItem(SYNC_CODE_KEY);
  if (!code) {
    code = crypto.randomUUID?.() ?? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    localStorage.setItem(SYNC_CODE_KEY, code);
  }
  return code;
}

export function setSyncCode(code: string): void {
  localStorage.setItem(SYNC_CODE_KEY, code);
}
