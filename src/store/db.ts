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
    const income = transactions
      .filter(t => t.type === 'income' && t.accountId === acc.id && t.type !== 'transfer')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense' && t.accountId === acc.id)
      .reduce((sum, t) => sum + t.amount, 0);
    const newBalance = income - expense;
    if (newBalance !== acc.balance) {
      await db.accounts.update(acc.id, { balance: Math.max(0, newBalance) });
    }
  }
  console.log('[reconcile] account balances rebuilt from transactions');
}

// 清理重复账户：同名账户保留余额较高的那个
// 并将被删除账户的交易记录迁移到保留的账户
export async function deduplicateAccounts(): Promise<number> {
  const accounts = await db.accounts.toArray();
  const seen = new Map<string, typeof accounts[0]>();
  const toDelete: string[] = [];
  const idMigrations = new Map<string, string>(); // oldId → newId
  
  for (const acc of accounts) {
    const existing = seen.get(acc.name);
    if (existing) {
      // 重复：保留余额高的
      if (acc.balance > existing.balance) {
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
  }
  
  // 删除重复账户
  for (const id of toDelete) {
    await db.accounts.delete(id);
  }
  
  console.log(`[dedupe] removed ${toDelete.length} duplicate accounts, migrated ${idMigrations.size} references`);
  return toDelete.length;
}