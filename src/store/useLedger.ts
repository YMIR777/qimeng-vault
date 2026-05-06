import { useState, useEffect } from 'react';
import { db, Transaction } from './db';

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

  return { transactions, totalAsset, addTransaction };
}