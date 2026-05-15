import { useMemo } from 'react';
import type { Transaction } from './db';
import { getStoredGoals } from './useGoals';

export interface DailyReport {
  type: 'daily';
  date: string; // YYYY-MM-DD
  dateLabel: string; // "5月15日 周四"
  income: number;
  expense: number;
  net: number;
  txCount: number;
  incomeTxCount: number;
  expenseTxCount: number;
  topIncome: Transaction | null;
  topExpense: Transaction | null;
  avgIncomePerTx: number;
  goalProgress: {
    monthlyIncomePct: number; // 当月收入完成度
    monthlyExpensePct: number; // 当月支出占上限比例
  };
  status: 'surplus' | 'deficit' | 'break_even';
  summary: string; // 一句话总结
}

export interface WeeklyReport {
  type: 'weekly';
  weekLabel: string; // "5月第3周"
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  income: number;
  expense: number;
  net: number;
  txCount: number;
  dailyAvgIncome: number;
  dailyAvgExpense: number;
  bestDay: { date: string; income: number } | null;
  worstDay: { date: string; expense: number } | null;
  topIncome: Transaction | null;
  topExpense: Transaction | null;
  vsLastWeek: {
    incomeChange: number; // +15% 格式
    expenseChange: number;
    netChange: number;
  };
  goalProgress: {
    monthlyIncomePct: number;
    monthlyExpensePct: number;
  };
  status: 'surplus' | 'deficit' | 'break_even';
  summary: string;
}

function getDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekStart(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getWeekEnd(d: Date): Date {
  const start = getWeekStart(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function getDayOfWeekLabel(d: Date): string {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[d.getDay()];
}

function formatDateLabel(d: Date): string {
  return `${d.getMonth() + 1}月${d.getDate()}日 ${getDayOfWeekLabel(d)}`;
}

function calcGoalProgress(transactions: Transaction[]): { monthlyIncomePct: number; monthlyExpensePct: number } {
  const goals = getStoredGoals();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();

  const monthIncome = transactions
    .filter(t => t.type === 'income' && t.date >= monthStart && t.date < monthEnd)
    .reduce((s, t) => s + t.amount, 0);
  const monthExpense = transactions
    .filter(t => t.type === 'expense' && t.date >= monthStart && t.date < monthEnd)
    .reduce((s, t) => s + t.amount, 0);

  return {
    monthlyIncomePct: goals.monthlyIncome > 0 ? Math.min((monthIncome / goals.monthlyIncome) * 100, 100) : 0,
    monthlyExpensePct: goals.monthlyExpenseLimit > 0 ? Math.min((monthExpense / goals.monthlyExpenseLimit) * 100, 100) : 0,
  };
}

function generateDailyReport(transactions: Transaction[], date: Date): DailyReport {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const dayTx = transactions.filter(t => t.date >= start.getTime() && t.date <= end.getTime());
  const incomeTx = dayTx.filter(t => t.type === 'income');
  const expenseTx = dayTx.filter(t => t.type === 'expense');

  const income = incomeTx.reduce((s, t) => s + t.amount, 0);
  const expense = expenseTx.reduce((s, t) => s + t.amount, 0);
  const net = income - expense;

  const topIncome = incomeTx.length > 0
    ? incomeTx.reduce((max, t) => t.amount > max.amount ? t : max, incomeTx[0])
    : null;
  const topExpense = expenseTx.length > 0
    ? expenseTx.reduce((max, t) => t.amount > max.amount ? t : max, expenseTx[0])
    : null;

  let status: DailyReport['status'] = 'break_even';
  let summary = '';
  if (net > 0) {
    status = 'surplus';
    if (incomeTx.length >= 3) summary = `💰 今天火力全开，${incomeTx.length}笔收入入账`;
    else if (topIncome && topIncome.amount >= 500) summary = `🌟 今天有一笔高光收入 ¥${topIncome.amount.toFixed(0)}`;
    else summary = `✅ 今天有盈余，继续保持`;
  } else if (net < 0) {
    status = 'deficit';
    if (expense > income * 2) summary = `⚠️ 今天支出较大，注意控制`;
    else summary = `📉 今天略有亏损`;
  } else {
    summary = `➖ 今天收支平衡`;
  }

  return {
    type: 'daily',
    date: getDateKey(date),
    dateLabel: formatDateLabel(date),
    income,
    expense,
    net,
    txCount: dayTx.length,
    incomeTxCount: incomeTx.length,
    expenseTxCount: expenseTx.length,
    topIncome,
    topExpense,
    avgIncomePerTx: incomeTx.length > 0 ? income / incomeTx.length : 0,
    goalProgress: calcGoalProgress(transactions),
    status,
    summary,
  };
}

function generateWeeklyReport(transactions: Transaction[], weekDate: Date): WeeklyReport {
  const weekStart = getWeekStart(weekDate);
  const weekEnd = getWeekEnd(weekDate);

  const weekTx = transactions.filter(t => t.date >= weekStart.getTime() && t.date <= weekEnd.getTime());
  const incomeTx = weekTx.filter(t => t.type === 'income');
  const expenseTx = weekTx.filter(t => t.type === 'expense');

  const income = incomeTx.reduce((s, t) => s + t.amount, 0);
  const expense = expenseTx.reduce((s, t) => s + t.amount, 0);
  const net = income - expense;

  // Daily breakdown
  const dailyMap: Record<string, { income: number; expense: number }> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    dailyMap[getDateKey(d)] = { income: 0, expense: 0 };
  }
  for (const t of weekTx) {
    const d = new Date(t.date);
    const key = getDateKey(d);
    if (dailyMap[key]) {
      if (t.type === 'income') dailyMap[key].income += t.amount;
      else dailyMap[key].expense += t.amount;
    }
  }

  let bestDay: { date: string; income: number } | null = null;
  let worstDay: { date: string; expense: number } | null = null;
  for (const [date, data] of Object.entries(dailyMap)) {
    if (!bestDay || data.income > bestDay.income) bestDay = { date, income: data.income };
    if (!worstDay || data.expense > worstDay.expense) worstDay = { date, expense: data.expense };
  }

  const topIncome = incomeTx.length > 0
    ? incomeTx.reduce((max, t) => t.amount > max.amount ? t : max, incomeTx[0])
    : null;
  const topExpense = expenseTx.length > 0
    ? expenseTx.reduce((max, t) => t.amount > max.amount ? t : max, expenseTx[0])
    : null;

  // Compare with last week
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(weekEnd);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

  const lastWeekTx = transactions.filter(t => t.date >= lastWeekStart.getTime() && t.date <= lastWeekEnd.getTime());
  const lastIncome = lastWeekTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const lastExpense = lastWeekTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const lastNet = lastIncome - lastExpense;

  const vsLastWeek = {
    incomeChange: lastIncome > 0 ? ((income - lastIncome) / lastIncome) * 100 : 0,
    expenseChange: lastExpense > 0 ? ((expense - lastExpense) / lastExpense) * 100 : 0,
    netChange: lastNet !== 0 ? ((net - lastNet) / Math.abs(lastNet)) * 100 : 0,
  };

  const weekOfMonth = Math.ceil((weekStart.getDate()) / 7);

  let status: WeeklyReport['status'] = 'break_even';
  let summary = '';
  if (net > 0) {
    status = 'surplus';
    if (vsLastWeek.incomeChange > 20) summary = `🚀 本周收入环比增长${vsLastWeek.incomeChange.toFixed(0)}%，势头强劲`;
    else if (bestDay && bestDay.income >= 1000) summary = `💎 本周${bestDay.date.slice(5)}有一笔大单 ¥${bestDay.income.toFixed(0)}`;
    else summary = `📈 本周有盈余，稳扎稳打`;
  } else if (net < 0) {
    status = 'deficit';
    summary = `📉 本周入不敷出，下周调整`;
  } else {
    summary = `➖ 本周收支平衡`;
  }

  return {
    type: 'weekly',
    weekLabel: `${weekStart.getMonth() + 1}月第${weekOfMonth}周`,
    weekStart: getDateKey(weekStart),
    weekEnd: getDateKey(weekEnd),
    income,
    expense,
    net,
    txCount: weekTx.length,
    dailyAvgIncome: income / 7,
    dailyAvgExpense: expense / 7,
    bestDay,
    worstDay,
    topIncome,
    topExpense,
    vsLastWeek,
    goalProgress: calcGoalProgress(transactions),
    status,
    summary,
  };
}

export function useReports(transactions: Transaction[]) {
  const today = new Date();
  const todayReport = useMemo(() => generateDailyReport(transactions, today), [transactions]);

  const weeklyReport = useMemo(() => generateWeeklyReport(transactions, today), [transactions]);

  // Generate last 7 days of daily reports for history view
  const recentDailyReports = useMemo(() => {
    const reports: DailyReport[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      reports.push(generateDailyReport(transactions, d));
    }
    return reports;
  }, [transactions]);

  return {
    todayReport,
    weeklyReport,
    recentDailyReports,
  };
}
