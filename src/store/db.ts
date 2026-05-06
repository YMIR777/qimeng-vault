import Dexie, { Table } from 'dexie';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  platform?: string;
  bossName?: string;
  judgment?: 'worthy' | 'unworthy';
  timeSpent?: number;
  wishId?: string;
  note?: string;
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

  constructor() {
    super('vault');
    this.version(1).stores({
      transactions: '++id, type, date',
      wishes: '++id, status'
    });
  }
}

export const db = new VaultDatabase();