import { useState, useEffect } from 'react';
import { db } from './db';
import type { Transaction } from './db';

export function useLedger() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalAsset, setTotalAsset] = useState(0);

  useEffect(() => {
    db.transactions.toArray().then(setTransactions);
  }, []);

  useEffect(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    setTotalAsset(income - expense);
  }, [transactions]);

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    await db.transactions.add({ ...tx, id, createdAt: Date.now() });
    const all = await db.transactions.toArray();
    setTransactions(all);
  };

  const getTransactionsByWish = async (wishId: string) => {
    return await db.transactions.where('wishId').equals(wishId).toArray();
  };

  return { transactions, totalAsset, addTransaction, getTransactionsByWish };
}