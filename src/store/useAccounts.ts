import { useState, useEffect, useCallback } from 'react';
import { db, type Account } from './db';
import { deleteRemote } from '../supabase/sync';



export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const all = await db.accounts.toArray();
    setAccounts(all);
    setLoading(false);
  };

  const addAccount = useCallback(async (data: Omit<Account, 'id' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    await db.accounts.add({ ...data, id, createdAt: Date.now() });
    await loadAccounts();
    return id;
  }, []);

  const updateAccount = useCallback(async (id: string, patch: Partial<Account>) => {
    await db.accounts.update(id, patch);
    await loadAccounts();
  }, []);

  const deleteAccount = useCallback(async (id: string) => {
    await db.accounts.delete(id);
    // 同步删除云端记录，防止下次 fullSync 拉回来
    try {
      await deleteRemote('accounts', id);
    } catch (err) {
      console.error('[useAccounts] deleteRemote failed:', err);
      // 本地已删，远程失败不影响 UI（下次 fullSync 会重试）
    }
    await loadAccounts();
  }, []);

  const adjustBalance = useCallback(async (id: string, delta: number) => {
    const acc = await db.accounts.get(id);
    if (!acc) return;
    const newBalance = acc.balance + delta;
    await db.accounts.update(id, { balance: newBalance });
    await loadAccounts();
  }, []);

  const transfer = useCallback(async (fromId: string, toId: string, amount: number) => {
    const from = await db.accounts.get(fromId);
    const to = await db.accounts.get(toId);
    if (!from || !to || from.balance < amount) return false;

    await db.accounts.update(fromId, { balance: from.balance - amount });
    await db.accounts.update(toId, { balance: to.balance + amount });
    
    // 创建转账记录，确保对账时能正确重建余额
    await db.transactions.add({
      id: crypto.randomUUID(),
      type: 'transfer',
      amount,
      accountId: fromId,
      toAccountId: toId,
      note: `${from.name} → ${to.name}`,
      date: Date.now(),
      createdAt: Date.now(),
    });
    
    await loadAccounts();
    return true;
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const refresh = useCallback(async () => {
    await loadAccounts();
  }, []);

  return {
    accounts,
    loading,
    totalBalance,
    addAccount,
    updateAccount,
    deleteAccount,
    adjustBalance,
    transfer,
    refresh,
  };
}
