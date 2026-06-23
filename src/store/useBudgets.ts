import { useState, useEffect, useCallback } from 'react';
import { db } from './db';
import type { Budget } from './db';
import { deleteRemote } from '../supabase/sync';

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    const all = await db.budgets.toArray();
    setBudgets(all);
    setLoading(false);
  };

  const addBudget = useCallback(async (data: Omit<Budget, 'id' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    await db.budgets.add({ ...data, id, createdAt: Date.now() });
    await loadBudgets();
    return id;
  }, []);

  const updateBudget = useCallback(async (id: string, patch: Partial<Budget>) => {
    await db.budgets.update(id, patch);
    await loadBudgets();
  }, []);

  const deleteBudget = useCallback(async (id: string) => {
    await db.budgets.delete(id);
    // 同步删除云端
    deleteRemote('budgets', id).catch((err) =>
      console.error('[useBudgets] deleteRemote failed:', err)
    );
    await loadBudgets();
  }, []);

  // 计算某预算在当前周期的已用金额
  const getUsedAmount = useCallback(async (budget: Budget): Promise<number> => {
    const now = new Date();
    let start: number;
    let end: number;

    if (budget.period === 'monthly') {
      start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
    } else if (budget.period === 'weekly') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(now.getFullYear(), now.getMonth(), diff).setHours(0, 0, 0, 0);
      end = start + 7 * 24 * 60 * 60 * 1000;
    } else {
      // yearly
      start = new Date(now.getFullYear(), 0, 1).getTime();
      end = new Date(now.getFullYear() + 1, 0, 1).getTime();
    }

    const txs = await db.transactions
      .where('date')
      .between(start, end)
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .toArray();

    return txs.reduce((sum, t) => sum + t.amount, 0);
  }, []);

  const refresh = useCallback(async () => {
    await loadBudgets();
  }, []);

  return {
    budgets,
    loading,
    addBudget,
    updateBudget,
    deleteBudget,
    getUsedAmount,
    refresh,
  };
}
