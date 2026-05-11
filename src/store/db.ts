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

// 初始化默认账户
export async function initDefaultAccounts(): Promise<void> {
  const count = await db.accounts.count();
  if (count > 0) return;

  const defaults: Omit<Account, 'id' | 'createdAt'>[] = [
    { name: '微信钱包', type: 'wechat', balance: 0, color: '#7bb32e' },
    { name: '支付宝', type: 'alipay', balance: 0, color: '#1677ff' },
    { name: '现金', type: 'cash', balance: 0, color: '#c9923a' },
    { name: '银行卡', type: 'bank', balance: 0, color: '#6b9fcf' },
  ];

  await db.accounts.bulkAdd(
    defaults.map(d => ({ ...d, id: crypto.randomUUID(), createdAt: Date.now() }))
  );
}