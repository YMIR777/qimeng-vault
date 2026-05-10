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
    
    // 同步更新账户余额
    if (tx.accountId && tx.type !== 'transfer') {
      const acc = await db.accounts.get(tx.accountId);
      if (acc) {
        const delta = tx.type === 'income' ? tx.amount : -tx.amount;
        await db.accounts.update(tx.accountId, { balance: acc.balance + delta });
      }
    }
    
    // 支出时从愿望余额扣除（按存款从大到小扣）
    if (tx.type === 'expense') {
      const buildingWishes = await db.wishes.where('status').equals('building').toArray();
      if (buildingWishes.length > 0) {
        let remaining = tx.amount;
        const sorted = [...buildingWishes].sort((a, b) => b.currentBalance - a.currentBalance);
        for (const wish of sorted) {
          if (remaining <= 0) break;
          const deduct = Math.min(wish.currentBalance, remaining);
          if (deduct > 0) {
            const newBalance = wish.currentBalance - deduct;
            await db.wishes.update(wish.id, {
              currentBalance: newBalance,
              status: newBalance >= wish.targetPrice ? 'achieved' : 'building',
              achievedAt: newBalance >= wish.targetPrice ? Date.now() : undefined,
            });
            remaining -= deduct;
          }
        }
      }
    }
    
    const all = await db.transactions.toArray();
    setTransactions(all);
    return id;
  };

  const updateTransaction = async (id: string, patch: Partial<Transaction>) => {
    const old = await db.transactions.get(id);
    await db.transactions.update(id, patch);
    
    // 如果金额或类型变化，重新计算账户余额
    if (old && (patch.amount !== undefined || patch.type !== undefined || patch.accountId !== undefined)) {
      // 恢复旧账户余额
      if (old.accountId) {
        const oldAcc = await db.accounts.get(old.accountId);
        if (oldAcc) {
          const oldDelta = old.type === 'income' ? -old.amount : old.amount;
          await db.accounts.update(old.accountId, { balance: oldAcc.balance + oldDelta });
        }
      }
      // 应用新账户余额
      const newTx = await db.transactions.get(id);
      if (newTx?.accountId && newTx.type !== 'transfer') {
        const newAcc = await db.accounts.get(newTx.accountId);
        if (newAcc) {
          const newDelta = newTx.type === 'income' ? newTx.amount : -newTx.amount;
          await db.accounts.update(newTx.accountId, { balance: newAcc.balance + newDelta });
        }
      }
    }
    
    const all = await db.transactions.toArray();
    setTransactions(all);
  };

  const deleteTransaction = async (id: string) => {
    const tx = await db.transactions.get(id);
    if (tx?.accountId && tx.type !== 'transfer') {
      const acc = await db.accounts.get(tx.accountId);
      if (acc) {
        const delta = tx.type === 'income' ? -tx.amount : tx.amount;
        await db.accounts.update(tx.accountId, { balance: acc.balance + delta });
      }
    }
    
    // 删除支出时，恢复愿望余额到存款最多的 building 愿望
    if (tx?.type === 'expense') {
      const buildingWishes = await db.wishes.where('status').equals('building').toArray();
      if (buildingWishes.length > 0) {
        const target = buildingWishes.sort((a, b) => b.currentBalance - a.currentBalance)[0];
        const newBalance = target.currentBalance + tx.amount;
        await db.wishes.update(target.id, {
          currentBalance: newBalance,
          status: newBalance >= target.targetPrice ? 'achieved' : 'building',
          achievedAt: newBalance >= target.targetPrice ? Date.now() : undefined,
        });
      }
    }
    
    await db.transactions.delete(id);
    const all = await db.transactions.toArray();
    setTransactions(all);
  };

  const getTransactionsByWish = async (wishId: string) => {
    return await db.transactions.where('wishId').equals(wishId).toArray();
  };

  return { transactions, totalAsset, addTransaction, updateTransaction, deleteTransaction, getTransactionsByWish };
}
