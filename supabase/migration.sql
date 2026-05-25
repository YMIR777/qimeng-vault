-- 绮梦帐间 Supabase 迁移 (v2 — camelCase columns)
-- https://jybcmnwknzvyilaiyfse.supabase.co → SQL Editor

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY, type TEXT NOT NULL, amount REAL NOT NULL,
  category TEXT, platform TEXT, bossName TEXT, judgment TEXT,
  timeSpent REAL, wishId TEXT, note TEXT, accountId TEXT, toAccountId TEXT,
  tags TEXT[], date BIGINT NOT NULL, createdAt BIGINT NOT NULL,
  sync_code TEXT NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS wishes (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, targetPrice REAL NOT NULL,
  currentBalance REAL DEFAULT 0, status TEXT DEFAULT 'building',
  createdAt BIGINT NOT NULL, achievedAt BIGINT,
  sync_code TEXT NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL,
  balance REAL DEFAULT 0, color TEXT NOT NULL, createdAt BIGINT NOT NULL,
  sync_code TEXT NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY, category TEXT NOT NULL, amount REAL NOT NULL,
  period TEXT DEFAULT 'monthly', rollover BOOLEAN DEFAULT false,
  createdAt BIGINT NOT NULL, sync_code TEXT NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, color TEXT NOT NULL,
  count INT DEFAULT 0, createdAt BIGINT NOT NULL,
  sync_code TEXT NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS debts (
  id TEXT PRIMARY KEY, type TEXT NOT NULL, personName TEXT NOT NULL,
  amount REAL NOT NULL, reason TEXT, status TEXT DEFAULT 'active',
  createdAt BIGINT NOT NULL, settledAt BIGINT,
  sync_code TEXT NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS recurring_rules (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, amount REAL NOT NULL,
  type TEXT NOT NULL, category TEXT, accountId TEXT NOT NULL,
  period TEXT NOT NULL, dayOfMonth INT, dayOfWeek INT,
  nextDue BIGINT NOT NULL, active BOOLEAN DEFAULT true,
  lastTriggered BIGINT DEFAULT 0, autoRecord BOOLEAN DEFAULT true,
  note TEXT, createdAt BIGINT NOT NULL,
  sync_code TEXT NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY, monthlyIncome REAL DEFAULT 0,
  monthlyExpense REAL DEFAULT 0, monthlySavingRate REAL DEFAULT 0,
  emergencyFundMonths INT DEFAULT 3, financialFreedomTarget REAL DEFAULT 0,
  createdAt BIGINT NOT NULL, sync_code TEXT NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW()
);
