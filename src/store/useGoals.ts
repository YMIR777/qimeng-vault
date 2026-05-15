import { useState, useEffect, useMemo } from 'react';
import { useLedger } from './useLedger';

export interface GoalSettings {
  monthlyIncome: number;       // 月收入目标
  monthlyExpenseLimit: number;  // 月支出上限
  emergencyFund: number;        // 应急储备目标（总额）
  savingsRate: number;          // 储蓄率目标（%，0-100）
}

const STORAGE_KEY = 'vault:goals';

const DEFAULT_GOALS: GoalSettings = {
  monthlyIncome: 0,
  monthlyExpenseLimit: 0,
  emergencyFund: 0,
  savingsRate: 0,
};

export interface GoalProgress {
  key: keyof GoalSettings;
  label: string;
  current: number;
  target: number;
  unit: string;          // '¥' | '%'
  higherIsBetter: boolean; // true = 越高越好（如收入），false = 越低越好（如支出）
  description: string;
}

// Standalone function to build progress list from data
export function getGoalProgress(
  transactions: { type: string; date: number; amount: number }[],
  totalAssets: number
): GoalProgress[] {
  const goals = getStoredGoals();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();

  const monthlyIncome = transactions
    .filter((t) => t.type === 'income' && t.date >= monthStart && t.date < monthEnd)
    .reduce((s, t) => s + t.amount, 0);

  const monthlyExpense = transactions
    .filter((t) => t.type === 'expense' && t.date >= monthStart && t.date < monthEnd)
    .reduce((s, t) => s + t.amount, 0);

  const currentSavingsRate =
    monthlyIncome > 0
      ? Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100)
      : 0;

  const list: GoalProgress[] = [];

  if (goals.monthlyIncome > 0) {
    list.push({
      key: 'monthlyIncome',
      label: '月收入目标',
      current: monthlyIncome,
      target: goals.monthlyIncome,
      unit: '¥',
      higherIsBetter: true,
      description: '本月已收入',
    });
  }

  if (goals.monthlyExpenseLimit > 0) {
    list.push({
      key: 'monthlyExpenseLimit',
      label: '月支出上限',
      current: monthlyExpense,
      target: goals.monthlyExpenseLimit,
      unit: '¥',
      higherIsBetter: false,
      description: '本月已支出',
    });
  }

  if (goals.emergencyFund > 0) {
    list.push({
      key: 'emergencyFund',
      label: '应急储备目标',
      current: totalAssets,
      target: goals.emergencyFund,
      unit: '¥',
      higherIsBetter: true,
      description: '当前总资产',
    });
  }

  if (goals.savingsRate > 0) {
    list.push({
      key: 'savingsRate',
      label: '储蓄率目标',
      current: currentSavingsRate,
      target: goals.savingsRate,
      unit: '%',
      higherIsBetter: true,
      description: '当前储蓄率',
    });
  }

  return list;
}

export function useGoals() {
  const { transactions, totalAsset } = useLedger();
  const [goals, setGoals] = useState<GoalSettings>(DEFAULT_GOALS);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setGoals({ ...DEFAULT_GOALS, ...JSON.parse(stored) });
      } catch {}
    }
  }, []);

  const saveGoals = (newGoals: GoalSettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newGoals));
    setGoals(newGoals);
  };

  const goalProgressList = useMemo(
    () => getGoalProgress(transactions, totalAsset),
    [transactions, totalAsset]
  );

  return {
    goals,
    goalProgressList,
    saveGoals,
  };
}

// Standalone function to get goals from localStorage (no hook deps needed)
export function getStoredGoals(): GoalSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_GOALS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_GOALS;
}