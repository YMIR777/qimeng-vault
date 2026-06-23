import { useState, useEffect } from 'react';
import { db } from './db';
import type { Transaction } from './db';
import { syncRecord, deleteRemote } from '../supabase/sync';

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
    const createdAt = Date.now();
    await db.transactions.add({ ...tx, id, createdAt });
    
    // 更新标签使用次数
    if (tx.tags && tx.tags.length > 0) {
      for (const tagId of tx.tags) {
        const tag = await db.tags.get(tagId);
        if (tag) await db.tags.update(tagId, { count: (tag.count || 0) + 1 });
      }
    }
    
    // 同步更新账户余额
    if (tx.accountId && tx.type !== 'transfer') {
      const acc = await db.accounts.get(tx.accountId);
      if (acc) {
        const delta = tx.type === 'income' ? tx.amount : -tx.amount;
        await db.accounts.update(tx.accountId, { balance: acc.balance + delta });
      }
    }
    
    // 支出时从愿望余额扣除
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
    // 后台同步到云端（不阻塞 UI）
    syncRecord('transactions', { ...tx, id, createdAt }).catch(() => {});
    return id;
  };

  const updateTransaction = async (id: string, patch: Partial<Transaction>) => {
    const old = await db.transactions.get(id);
    await db.transactions.update(id, patch);
    
    // 更新标签使用次数
    if (patch.tags !== undefined && old) {
      const oldTags = old.tags || [];
      const newTags = patch.tags || [];
      const removed = oldTags.filter(t => !newTags.includes(t));
      const added = newTags.filter(t => !oldTags.includes(t));
      for (const tagId of removed) {
        const tag = await db.tags.get(tagId);
        if (tag) await db.tags.update(tagId, { count: Math.max(0, (tag.count || 0) - 1) });
      }
      for (const tagId of added) {
        const tag = await db.tags.get(tagId);
        if (tag) await db.tags.update(tagId, { count: (tag.count || 0) + 1 });
      }
    }
    
    if (old && (patch.amount !== undefined || patch.type !== undefined || patch.accountId !== undefined)) {
      if (old.accountId) {
        const oldAcc = await db.accounts.get(old.accountId);
        if (oldAcc) {
          const oldDelta = old.type === 'income' ? -old.amount : old.amount;
          await db.accounts.update(old.accountId, { balance: oldAcc.balance + oldDelta });
        }
      }
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
    // 后台同步
    const updated = await db.transactions.get(id);
    if (updated) syncRecord('transactions', updated).catch(() => {});
  };

  const deleteTransaction = async (id: string) => {
    const tx = await db.transactions.get(id);
    
    // 减少标签使用次数
    if (tx?.tags && tx.tags.length > 0) {
      for (const tagId of tx.tags) {
        const tag = await db.tags.get(tagId);
        if (tag) await db.tags.update(tagId, { count: Math.max(0, (tag.count || 0) - 1) });
      }
    }
    
    if (tx?.accountId && tx.type !== 'transfer') {
      const acc = await db.accounts.get(tx.accountId);
      if (acc) {
        const delta = tx.type === 'income' ? -tx.amount : tx.amount;
        await db.accounts.update(tx.accountId, { balance: acc.balance + delta });
      }
    }
    
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
    deleteRemote('transactions', id).catch(() => {});
  };

  const getTransactionsByWish = async (wishId: string) => {
    return await db.transactions.where('wishId').equals(wishId).toArray();
  };

  return { transactions, totalAsset, addTransaction, updateTransaction, deleteTransaction, getTransactionsByWish };
}
