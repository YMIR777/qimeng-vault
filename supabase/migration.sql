-- 绮梦帐间 Supabase 迁移
-- 在 Supabase SQL Editor 中运行此脚本
-- 打开 https://jybcmnwknzvyilaiyfse.supabase.co → SQL Editor → 粘贴 → Run

-- ── 1. 交易记录 ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT,
  platform TEXT,
  boss_name TEXT,
  judgment TEXT,
  time_spent REAL,
  wish_id TEXT,
  note TEXT,
  account_id TEXT,
  to_account_id TEXT,
  tags TEXT[],
  date BIGINT NOT NULL,
  created_at BIGINT NOT NULL,
  sync_code TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tx_sync ON transactions(sync_code, updated_at);

-- ── 2. 愿望星体 ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_price REAL NOT NULL,
  current_balance REAL DEFAULT 0,
  status TEXT DEFAULT 'building',
  created_at BIGINT NOT NULL,
  achieved_at BIGINT,
  sync_code TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wishes_sync ON wishes(sync_code, updated_at);

-- ── 3. 账户 ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance REAL DEFAULT 0,
  color TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  sync_code TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_accounts_sync ON accounts(sync_code, updated_at);

-- ── 4. 预算 ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  period TEXT DEFAULT 'monthly',
  rollover BOOLEAN DEFAULT false,
  created_at BIGINT NOT NULL,
  sync_code TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_budgets_sync ON budgets(sync_code, updated_at);

-- ── 5. 标签 ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  count INT DEFAULT 0,
  created_at BIGINT NOT NULL,
  sync_code TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tags_sync ON tags(sync_code, updated_at);

-- ── 6. 债务 ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS debts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  person_name TEXT NOT NULL,
  amount REAL NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'active',
  created_at BIGINT NOT NULL,
  settled_at BIGINT,
  sync_code TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_debts_sync ON debts(sync_code, updated_at);

-- ── 7. 周期性规则 ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS recurring_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  account_id TEXT NOT NULL,
  period TEXT NOT NULL,
  day_of_month INT,
  day_of_week INT,
  next_due BIGINT NOT NULL,
  active BOOLEAN DEFAULT true,
  last_triggered BIGINT DEFAULT 0,
  auto_record BOOLEAN DEFAULT true,
  note TEXT,
  created_at BIGINT NOT NULL,
  sync_code TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rules_sync ON recurring_rules(sync_code, updated_at);

-- ── 8. 财务目标 ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  monthly_income REAL DEFAULT 0,
  monthly_expense REAL DEFAULT 0,
  monthly_saving_rate REAL DEFAULT 0,
  emergency_fund_months INT DEFAULT 3,
  financial_freedom_target REAL DEFAULT 0,
  created_at BIGINT NOT NULL,
  sync_code TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_goals_sync ON goals(sync_code, updated_at);
