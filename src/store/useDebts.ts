import { useState, useEffect } from 'react';
import { db } from './db';
import type { Debt } from './db';

export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>([]);

  useEffect(() => {
    db.debts.toArray().then(setDebts);
  }, []);

  const activeDebts = debts.filter(d => d.status === 'active');
  const lentDebts = debts.filter(d => d.type === 'lent' && d.status === 'active');
  const borrowedDebts = debts.filter(d => d.type === 'borrowed' && d.status === 'active');

  async function addDebt(payload: Omit<Debt, 'id' | 'createdAt' | 'status'>) {
    await db.debts.add({
      ...payload,
      id: crypto.randomUUID(),
      status: 'active',
      createdAt: Date.now(),
    });
    const all = await db.debts.toArray();
    setDebts(all);
  }

  async function settleDebt(id: string) {
    await db.debts.update(id, { status: 'settled', settledAt: Date.now() });
    const all = await db.debts.toArray();
    setDebts(all);
  }

  async function deleteDebt(id: string) {
    await db.debts.delete(id);
    const all = await db.debts.toArray();
    setDebts(all);
  }

  return {
    debts,
    activeDebts,
    lentDebts,
    borrowedDebts,
    addDebt,
    settleDebt,
    deleteDebt,
  };
}
