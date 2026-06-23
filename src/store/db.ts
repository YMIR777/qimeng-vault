import Dexie from 'dexie';
import type { Table } from 'dexie';

export interface Budget {
  id: string;
  category: string;     // '餐饮' | '交通' | ...
  amount: number;       // 预算金额
  period: 'monthly' | 'weekly' | 'yearly';
  rollover: boolean;      // 未用完是否累积
  createdAt: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'wechat' | 'alipay' | 'cash' | 'other';
  balance: number;
  color: string;
  createdAt: number;
}

export interface Tag {
  id: string;
  name: string;           // "出差"
  color: string;          // "#c9923a"（金色）
  count: number;          // 使用次数（排序用）
  createdAt: number;
}

export interface Debt {
  id: string;
  type: 'lent' | 'borrowed';
  personName: string;
  amount: number;
  reason?: string;
  status: 'active' | 'settled';
  createdAt: number;
  settledAt?: number;
}

export interface RecurringRule {
  id: string;
  name: string;           // "饿了么会员"
  amount: number;          // 金额（正数）
  type: 'expense' | 'income';
  category?: string;       // 支出时必须
  accountId: string;       // 扣款账户
  period: 'monthly' | 'weekly' | 'yearly';
  dayOfMonth?: number;     // 每月几号（1-31）
  dayOfWeek?: number;      // 每周周几（0=周日）
  nextDue: number;         // 下次触发时间戳
  active: boolean;
  lastTriggered: number;   // 上次触发时间戳（防重复）
  autoRecord: boolean;     // true=直接入账，false=弹窗确认
  note?: string;
  createdAt: number;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category?: string;
  platform?: string;
  bossName?: string;
  judgment?: 'worthy' | 'unworthy';
  timeSpent?: number;
  wishId?: string;
  note?: string;
  accountId?: string;       // 收入/支出关联账户
  toAccountId?: string;     // 转账目标账户
  tags?: string[];           // 标签 id 数组
  date: number;
  createdAt: number;
}

export interface Wish {
  id: string;
  name: string;
  targetPrice: number;
  currentBalance: number;
  status: 'building' | 'achieved' | 'withdrawn';
  createdAt: number;
  achievedAt?: number;
}

class VaultDatabase extends Dexie {
  transactions!: Table<Transaction>;
  wishes!: Table<Wish>;
  accounts!: Table<Account>;
  budgets!: Table<Budget>;
  tags!: Table<Tag>;
  debts!: Table<Debt>;
  recurringRules!: Table<RecurringRule>;


  constructor() {
    super('vault');
    this.version(5).stores({
      transactions: '++id, type, date, wishId, accountId, *tags',
      wishes: '++id, status',
      accounts: '++id, type',
      budgets: '++id, category',
      tags: 'id, name',
      debts: '++id, type, status',
      recurringRules: '++id, active, nextDue',
    });
    // v6: add toAccountId index for transfer queries
    this.version(6).stores({
      transactions: '++id, type, date, wishId, accountId, toAccountId, *tags',
      wishes: '++id, status',
      accounts: '++id, type',
      budgets: '++id, category',
      tags: 'id, name',
      debts: '++id, type, status',
      recurringRules: '++id, active, nextDue',
    });
  }
}

export const db = new VaultDatabase();

// 默认账户 — 使用确定性 ID（基于名称哈希），确保跨设备/版本一致
const DEFAULT_ACCOUNTS = [
  { id: 'default-wechat',  name: '微信钱包', type: 'wechat' as const,  balance: 0, color: '#7bb32e' },
  { id: 'default-alipay',  name: '支付宝',   type: 'alipay' as const,  balance: 0, color: '#1677ff' },
  { id: 'default-cash',    name: '现金',     type: 'cash' as const,    balance: 0, color: '#c9923a' },
  { id: 'default-bank',    name: '银行卡',   type: 'bank' as const,    balance: 0, color: '#6b9fcf' },
];

export { DEFAULT_ACCOUNTS };

// 初始化默认账户 — 使用固定 ID，重复调用不会创建重复账户
// 如果账户已存在（按 ID），跳过；如果不存在，创建
export async function initDefaultAccounts(): Promise<void> {
  for (const def of DEFAULT_ACCOUNTS) {
    const existing = await db.accounts.get(def.id);
    if (!existing) {
      await db.accounts.put({ ...def, createdAt: Date.now() });
    }
  }
}

// 根据交易记录重新计算所有账户余额（修复余额错乱）
export async function reconcileAccountBalances(): Promise<void> {
  const accounts = await db.accounts.toArray();
  const transactions = await db.transactions.toArray();
  
  for (const acc of accounts) {
    // 收入：转入此账户
    const income = transactions
      .filter(t => t.type === 'income' && t.accountId === acc.id)
      .reduce((sum, t) => sum + t.amount, 0);
    // 支出：从此账户支出
    const expense = transactions
      .filter(t => t.type === 'expense' && t.accountId === acc.id)
      .reduce((sum, t) => sum + t.amount, 0);
    // 转出：从此账户转出到其他账户
    const transferOut = transactions
      .filter(t => t.type === 'transfer' && t.accountId === acc.id)
      .reduce((sum, t) => sum + t.amount, 0);
    // 转入：从其他账户转入此账户
    const transferIn = transactions
      .filter(t => t.type === 'transfer' && t.toAccountId === acc.id)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const newBalance = income - expense - transferOut + transferIn;
    if (newBalance !== acc.balance) {
      await db.accounts.update(acc.id, { balance: newBalance });
    }
  }
  console.log('[reconcile] account balances rebuilt from transactions (incl. transfers)');
}

// 清理重复账户：固定 ID 账户优先，同名保留 canonical 的
// 并将被删除账户的交易记录迁移到保留的账户
export async function deduplicateAccounts(): Promise<number> {
  const accounts = await db.accounts.toArray();
  const seen = new Map<string, typeof accounts[0]>();
  const toDelete: string[] = [];
  const idMigrations = new Map<string, string>(); // oldId → newId
  
  for (const acc of accounts) {
    const existing = seen.get(acc.name);
    if (existing) {
      // 规则：固定 ID（default-*）优先于随机 UUID
      // 同为固定 ID 或同为随机 UUID → 保留余额高的
      const accIsDefault = acc.id.startsWith('default-');
      const existingIsDefault = existing.id.startsWith('default-');
      let keepAcc: boolean;
      if (accIsDefault !== existingIsDefault) {
        keepAcc = accIsDefault; // 固定 ID 赢
      } else {
        keepAcc = acc.balance > existing.balance; // 余额高赢
      }
      if (keepAcc) {
        idMigrations.set(existing.id, acc.id);
        toDelete.push(existing.id);
        seen.set(acc.name, acc);
      } else {
        idMigrations.set(acc.id, existing.id);
        toDelete.push(acc.id);
      }
    } else {
      seen.set(acc.name, acc);
    }
  }
  
  // 迁移交易记录
  for (const [oldId, newId] of idMigrations) {
    const txs = await db.transactions.where('accountId').equals(oldId).toArray();
    for (const tx of txs) {
      await db.transactions.update(tx.id, { accountId: newId });
    }
    // 也迁移作为转账目标的引用
    const txsAsTarget = await db.transactions.where('toAccountId').equals(oldId).toArray();
    for (const tx of txsAsTarget) {
      await db.transactions.update(tx.id, { toAccountId: newId });
    }
  }
  
  // 删除重复账户
  for (const id of toDelete) {
    await db.accounts.delete(id);
  }
  
  // 同步删除云端的重复账户（防止下次同步又拉回来）
  if (toDelete.length > 0) {
    try {
      const { deleteRemote } = await import('../supabase/sync');
      for (const id of toDelete) {
        await deleteRemote('accounts', id);
      }
    } catch (err) {
      console.error('[dedupe] failed to clean remote duplicates:', err);
    }
  }
  
  console.log(`[dedupe] removed ${toDelete.length} duplicate accounts, migrated ${idMigrations.size} references`);
  return toDelete.length;
}