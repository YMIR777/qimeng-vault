import { useState, useEffect, useCallback } from 'react';
import { db, type RecurringRule } from './db';
import type { Transaction } from './db';

function getNextDue(period: RecurringRule['period'], dayOfMonth?: number, dayOfWeek?: number, fromDate: Date = new Date()): number {
  const now = fromDate;
  let next: Date;

  if (period === 'monthly') {
    const day = dayOfMonth ?? 1;
    next = new Date(now.getFullYear(), now.getMonth(), day, 0, 0, 0);
    // If already passed this month, move to next month
    if (next.getTime() <= now.getTime()) {
      next = new Date(now.getFullYear(), now.getMonth() + 1, day, 0, 0, 0);
    }
  } else if (period === 'weekly') {
    const dow = dayOfWeek ?? 0; // 0 = Sunday
    const currentDow = now.getDay();
    const daysUntil = (dow - currentDow + 7) % 7 || 7; // 0 means same day → next week
    next = new Date(now);
    next.setDate(now.getDate() + daysUntil);
    next.setHours(0, 0, 0, 0);
  } else if (period === 'yearly') {
    const day = dayOfMonth ?? 1;
    next = new Date(now.getFullYear(), now.getMonth(), day, 0, 0, 0);
    if (next.getTime() <= now.getTime()) {
      next = new Date(now.getFullYear() + 1, now.getMonth(), day, 0, 0, 0);
    }
  } else {
    next = new Date(now.getTime() + 86400000);
  }

  return next.getTime();
}

export function useRecurring() {
  const [rules, setRules] = useState<RecurringRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    const all = await db.recurringRules.toArray();
    // Sort by nextDue ascending
    const sorted = all.sort((a, b) => a.nextDue - b.nextDue);
    setRules(sorted);
    setLoading(false);
  };

  const addRule = useCallback(async (data: Omit<RecurringRule, 'id' | 'createdAt' | 'lastTriggered'>) => {
    const id = crypto.randomUUID();
    await db.recurringRules.add({
      ...data,
      id,
      lastTriggered: 0,
      createdAt: Date.now(),
    });
    await loadRules();
    return id;
  }, []);

  const updateRule = useCallback(async (id: string, patch: Partial<RecurringRule>) => {
    await db.recurringRules.update(id, patch);
    await loadRules();
  }, []);

  const deleteRule = useCallback(async (id: string) => {
    await db.recurringRules.delete(id);
    await loadRules();
  }, []);

  const toggleActive = useCallback(async (id: string) => {
    const rule = rules.find(r => r.id === id);
    if (!rule) return;
    await db.recurringRules.update(id, { active: !rule.active });
    await loadRules();
  }, [rules]);

  const checkAndTrigger = useCallback(async () => {
    const now = Date.now();
    const dueRules = rules.filter(r => r.nextDue <= now && r.active);

    for (const rule of dueRules) {
      // Record transaction
      const txPayload: Omit<Transaction, 'id' | 'createdAt'> = {
        type: rule.type,
        amount: rule.amount,
        category: rule.category,
        accountId: rule.accountId,
        date: now,
        note: rule.note ? `[周期] ${rule.note}` : `[周期] ${rule.name}`,
      };
      await db.transactions.add(txPayload as Transaction);

      // Calculate and set next due
      const newNextDue = getNextDue(rule.period, rule.dayOfMonth, rule.dayOfWeek, new Date(now));

      await db.recurringRules.update(rule.id, {
        lastTriggered: now,
        nextDue: newNextDue,
      });
    }

    await loadRules();
  }, [rules]);

  const activeRules = rules.filter(r => r.active);

  const refresh = useCallback(async () => {
    await loadRules();
  }, []);

  return {
    rules,
    activeRules,
    loading,
    addRule,
    updateRule,
    deleteRule,
    toggleActive,
    checkAndTrigger,
    refresh,
  };
}
